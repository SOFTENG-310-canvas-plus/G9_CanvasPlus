import React, { createContext, useContext, useMemo, useRef, useEffect, useState } from "react";
import "../css/widget-grid.css";
const GridCtx = createContext(null);

export default function WidgetGrid({
  cols = 12,
  rows = 8,
  cellW = 96,
  rowH = 96,
  gap = 16,
  showGrid = true,
  className = "",
  style = {},
  children,
}) {
  const gridRef = useRef(null);
  const wallpaperRef = useRef(null);
  const [widgetColor, setWidgetColor] = useState("#007AFF");
  const [wallpaper, setWallpaper] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const gridW = cols * cellW + (cols - 1) * gap;
  const gridH = rows * rowH + (rows - 1) * gap;

  useEffect(() => {
    if (!wallpaperRef.current) return;
    
    const handlePointerMove = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      const rect = wallpaperRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (e.clientX - rect.left - centerX) / centerX * 6;
      const moveY = (e.clientY - rect.top - centerY) / centerY * 6;
      
      wallpaperRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };
    
    const handlePointerLeave = () => {
      wallpaperRef.current.style.transform = 'translate3d(0, 0, 0)';
    };
    
    const element = wallpaperRef.current;
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerleave', handlePointerLeave);
    
    return () => {
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  const handleWallpaperUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setWallpaper(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (e) => {
    setWidgetColor(e.target.value);
  };

  const ctxValue = useMemo(() => {
    const spanX = cellW + gap;
    const spanY = rowH + gap;

    const cellToPxRect = (c, r, w, h) => ({
      x: c * spanX,
      y: r * spanY,
      w: w * cellW + (w - 1) * gap,
      h: h * rowH + (h - 1) * gap,
    });

    const clampToBounds = (c, r, w, h) => {
      const maxC = Math.max(0, cols - w);
      const maxR = Math.max(0, rows - h);
      return {
        c: Math.min(Math.max(0, c), maxC),
        r: Math.min(Math.max(0, r), maxR),
      };
    };

    const deltaPxToDeltaCells = (dx, dy) => ({
      dc: Math.round(dx / spanX),
      dr: Math.round(dy / spanY),
    });

    return {
      cols,
      rows,
      cellW,
      rowH,
      gap,
      gridW,
      gridH,
      spanX,
      spanY,
      gridRef,
      widgetColor,
      cellToPxRect,
      clampToBounds,
      deltaPxToDeltaCells,
    };
  }, [cols, rows, cellW, rowH, gap, gridW, gridH, widgetColor]);

  return (
    <GridCtx.Provider value={ctxValue}>
      <div className="ios-widget-grid-container" ref={gridRef}>
        <button 
          className="ios-settings-button"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Open settings"
        >
          ⚙️
        </button>
        
        {showSettings && (
          <div className="ios-settings-panel">
            <h3>Customize Widgets</h3>
            
            <div className="ios-setting-group">
              <label>Widget Color</label>
              <input 
                type="color" 
                value={widgetColor} 
                onChange={handleColorChange}
                className="ios-color-picker"
              />
              <div className="color-preview" style={{backgroundColor: widgetColor}}>
                Current Color: {widgetColor}
              </div>
            </div>
            
            <div className="ios-setting-group">
              <label>Wallpaper</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleWallpaperUpload}
                className="ios-wallpaper-upload"
              />
            </div>
            
            <button 
              className="ios-close-settings"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        )}
        
        {/* New clipping wrapper */}
        <div className="ios-grid-clip">
          <div 
            className="ios-wallpaper" 
            ref={wallpaperRef}
            style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : {}}
          ></div>

          <div
            role="grid"
            aria-rowcount={rows}
            aria-colcount={cols}
            className={`ios-widget-grid ${className} ${showGrid ? 'show-grid' : ''}`}
            style={{
              width: gridW,
              height: gridH,
              '--cell-width': `${cellW}px`,
              '--cell-height': `${rowH}px`,
              '--grid-gap': `${gap}px`,
              ...style,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </GridCtx.Provider>
  );}

export function Widget({
  id,
  col,
  row,
  w = 2,
  h = 2,
  color,
  className = "",
  style = {},
  onMove,
  children,
  title = "Widget",
}) {
  const ctx = useContext(GridCtx);
  if (!ctx) throw new Error("Widget must be used inside <WidgetGrid>.");

  const {
    spanX,
    spanY,
    widgetColor,
    cellToPxRect,
    clampToBounds,
    deltaPxToDeltaCells,
  } = ctx;

  const [dragging, setDragging] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [ghost, setGhost] = useState({ c: col, r: row });
  const originRef = useRef({ c: col, r: row, x: 0, y: 0, pointerId: null });

  const accentColor = color || widgetColor;

  useEffect(() => {
    if (!dragging && !grabbed) setGhost({ c: col, r: row });
  }, [col, row, dragging, grabbed]);

  const px = cellToPxRect(col, row, w, h);

  const applyBodyDragStyles = (on) => {
    const body = document.body;
    if (!body) return;
    if (on) {
      body.style.userSelect = "none";
      body.style.cursor = "grabbing";
    } else {
      body.style.userSelect = "";
      body.style.cursor = "";
    }
  };

  const onPointerDown = (e) => {
    if (e.button != null && e.button !== 0) return;

    const handle = e.currentTarget;
    handle.setPointerCapture?.(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    originRef.current = { c: col, r: row, x: startX, y: startY, pointerId: e.pointerId };

    setDragging(true);
    setGhost({ c: col, r: row });
    applyBodyDragStyles(true);
    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    const { x, y, c, r } = originRef.current;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const { dc, dr } = deltaPxToDeltaCells(dx, dy);

    const next = clampToBounds(c + dc, r + dr, w, h);
    setGhost({ c: next.c, r: next.r });
  };

  const endDrag = (commit) => {
    if (!dragging) return;
    setDragging(false);
    applyBodyDragStyles(false);
    if (commit && (ghost.c !== col || ghost.r !== row)) {
      onMove?.(id, { col: ghost.c, row: ghost.r });
    } else {
      setGhost({ c: col, r: row });
    }
  };

  const onPointerUp = () => endDrag(true);
  const onPointerCancel = () => endDrag(false);

  const onKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!grabbed) {
        setGrabbed(true);
        setGhost({ c: col, r: row });
      } else {
        setGrabbed(false);
        if (ghost.c !== col || ghost.r !== row) {
          onMove?.(id, { col: ghost.c, row: ghost.r });
        }
      }
      return;
    }
    if (e.key === "Escape") {
      if (grabbed) {
        setGrabbed(false);
        setGhost({ c: col, r: row });
        e.preventDefault();
      }
      return;
    }
    if (grabbed) {
      let { c, r } = ghost;
      if (e.key === "ArrowLeft") c -= 1;
      if (e.key === "ArrowRight") c += 1;
      if (e.key === "ArrowUp") r -= 1;
      if (e.key === "ArrowDown") r += 1;
      const clamped = clampToBounds(c, r, w, h);
      setGhost(clamped);
      e.preventDefault();
    }
  };

  const rect = cellToPxRect(col, row, w, h);
  const ghostRect = cellToPxRect(ghost.c, ghost.r, w, h);

  const handleProps = {
    role: "button",
    tabIndex: 0,
    "aria-label": `${title} drag handle`,
    "aria-grabbed": dragging || grabbed ? "true" : "false",
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    className: "ios-widget-handle",
  };

  return (
    <>
      {(dragging || grabbed) && (
        <div
          aria-hidden
          className="ios-widget-ghost"
          style={{
            left: ghostRect.x,
            top: ghostRect.y,
            width: ghostRect.w,
            height: ghostRect.h,
            borderColor: accentColor,
          }}
        />
      )}

      <div
        role="gridcell"
        aria-colindex={col + 1}
        aria-rowindex={row + 1}
        className={`ios-widget ${dragging || grabbed ? 'dragging' : ''} ${className}`}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          '--accent-color': accentColor,
          ...style,
        }}
      >
        <div
          {...handleProps}
          title="Drag to move"
          
        >
          <div className="ios-widget-grabber">

          </div>
          <div className="ios-widget-title" style={{ color: accentColor }}>
            {title}
          </div>
          <div className="ios-widget-hint">
            {dragging || grabbed ? "Release to drop" : "Drag to move"}
          </div>
        </div>

        <div className="ios-widget-content">{children}</div>
      </div>
    </>
  );
}