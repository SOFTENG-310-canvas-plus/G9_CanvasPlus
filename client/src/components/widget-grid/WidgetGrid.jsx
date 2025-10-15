// client/src/components/WidgetGrid.jsx
import React, {
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import "../../css/widget-grid.css";
import {
  getUserPreferences,
  saveUserPreferences,
} from "../../api/preferences.js";
import { supabase } from "../../auth/supabaseClient.js";

const GridCtx = React.createContext(null);

// simple debounce helper
const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

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
  const containerRef = useRef(null);
  const clipRef = useRef(null);
  const wallpaperRef = useRef(null);

  const [widgetColor, setWidgetColor] = useState("#007AFF");
  const [wallpaper, setWallpaper] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);

  // Responsive state
  const [viewport, setViewport] = useState('desktop');
  const [cw, setCw] = useState(cellW);
  const [rh, setRh] = useState(rowH);
  const [responsiveCols, setResponsiveCols] = useState(cols);
  const [responsiveGap, setResponsiveGap] = useState(gap);

  // gate saving until DB has hydrated
  const hydratedRef = useRef(false);

  // Determine viewport size
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      if (width < 480) setViewport('xs');
      else if (width < 640) setViewport('sm');
      else if (width < 768) setViewport('md');
      else if (width < 1024) setViewport('lg');
      else if (width < 1280) setViewport('xl');
      else setViewport('2xl');
    };

    updateViewport();
    const debouncedUpdate = debounce(updateViewport, 150);
    window.addEventListener('resize', debouncedUpdate);
    return () => window.removeEventListener('resize', debouncedUpdate);
  }, []);

  // Adjust cols and gap based on viewport
  useEffect(() => {
    switch (viewport) {
      case 'xs':
        setResponsiveCols(2);
        setResponsiveGap(8);
        break;
      case 'sm':
        setResponsiveCols(4);
        setResponsiveGap(12);
        break;
      case 'md':
        setResponsiveCols(6);
        setResponsiveGap(12);
        break;
      case 'lg':
        setResponsiveCols(8);
        setResponsiveGap(16);
        break;
      case 'xl':
        setResponsiveCols(12);
        setResponsiveGap(16);
        break;
      default:
        setResponsiveCols(cols);
        setResponsiveGap(gap);
    }
  }, [viewport, cols, gap]);

  // auth
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // load preferences once
  useEffect(() => {
    if (!user) return;
    (async () => {
      const prefs = await getUserPreferences(user.id);
      if (prefs) {
        if (prefs.theme_color) setWidgetColor(prefs.theme_color);
        if (prefs.background_type === "image" && prefs.background_value) {
          setWallpaper(prefs.background_value);
        }
      }
      hydratedRef.current = true;
    })();
  }, [user]);

  // auto-save when prefs change
  useEffect(() => {
    if (!user || !hydratedRef.current) return;
    saveUserPreferences({
      userId: user.id,
      themeColor: widgetColor,
      backgroundType: wallpaper ? "image" : "color",
      backgroundValue: wallpaper || widgetColor,
    }).catch(console.error);
  }, [user, widgetColor, wallpaper]);

  // debounced explicit save from handlers
  const debouncedSave = useRef(
    debounce((payload) => saveUserPreferences(payload).catch(console.error), 300)
  ).current;

  // Recompute cell sizes responsively
  useLayoutEffect(() => {
    const el = clipRef.current;
    if (!el) return;

    const recompute = () => {
      const rect = el.getBoundingClientRect();
      const availW = rect.width;
      const availH = rect.height;

      const nextCw = (availW - (responsiveCols - 1) * responsiveGap) / responsiveCols;
      const nextRh = (availH - (rows - 1) * responsiveGap) / rows;

      setCw(Math.max(nextCw, 40)); // Minimum cell width
      setRh(Math.max(nextRh, 40)); // Minimum cell height
    };

    // Run now
    recompute();

    // Watch size changes
    const ro = new ResizeObserver(recompute);
    ro.observe(el);

    // Track viewport changes
    const onVV = () => recompute();
    window.addEventListener("resize", onVV);
    window.visualViewport?.addEventListener("resize", onVV);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onVV);
      window.visualViewport?.removeEventListener?.("resize", onVV);
    };
  }, [responsiveCols, rows, responsiveGap]);

  const gridW = responsiveCols * cw + (responsiveCols - 1) * responsiveGap;
  const gridH = rows * rh + (rows - 1) * responsiveGap;

  // Parallax wallpaper with reduced motion check
  useEffect(() => {
    if (!wallpaperRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handlePointerMove = (e) => {
      const rect = wallpaperRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const moveX = ((e.clientX - rect.left - centerX) / centerX) * 6;
      const moveY = ((e.clientY - rect.top - centerY) / centerY) * 6;
      wallpaperRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };

    const handlePointerLeave = () => {
      wallpaperRef.current.style.transform = "translate3d(0, 0, 0)";
    };

    const el = wallpaperRef.current;
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  const handleWallpaperUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.match("image.*")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = ev.target.result;
        setWallpaper(img);
        if (user && hydratedRef.current) {
          debouncedSave({
            userId: user.id,
            themeColor: widgetColor,
            backgroundType: "image",
            backgroundValue: img,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (e) => {
    const next = e.target.value;
    setWidgetColor(next);
    if (user && hydratedRef.current) {
      debouncedSave({
        userId: user.id,
        themeColor: next,
        backgroundType: wallpaper ? "image" : "color",
        backgroundValue: wallpaper || next,
      });
    }
  };

  const ctxValue = useMemo(() => {
    const spanX = cw + responsiveGap;
    const spanY = rh + responsiveGap;

    const cellToPxRect = (c, r, w, h) => ({
      x: c * spanX,
      y: r * spanY,
      w: w * cw + (w - 1) * responsiveGap,
      h: h * rh + (h - 1) * responsiveGap,
    });

    const clampToBounds = (c, r, w, h) => {
      const maxC = Math.max(0, responsiveCols - w);
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
      cols: responsiveCols,
      rows,
      cellW: cw,
      rowH: rh,
      gap: responsiveGap,
      gridW,
      gridH,
      spanX,
      spanY,
      gridRef: containerRef,
      widgetColor,
      cellToPxRect,
      clampToBounds,
      deltaPxToDeltaCells,
      viewport,
    };
  }, [responsiveCols, rows, cw, rh, responsiveGap, gridW, gridH, widgetColor, viewport]);

  return (
    <GridCtx.Provider value={ctxValue}>
      <div className="ios-widget-grid-container" ref={containerRef}>
        <button
          className="ios-settings-button"
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Open settings"
        >
          ⚙️
        </button>

        {showSettings && (
          <div className="ios-settings-panel">
            <h3>Customize Widgets</h3>

            <div className="ios-setting-group">
              <label htmlFor="wg-color">Widget Color</label>
              <input
                id="wg-color"
                type="color"
                value={widgetColor}
                onChange={handleColorChange}
                className="ios-color-picker"
              />
              <div
                className="color-preview"
                style={{ backgroundColor: widgetColor }}
              >
                Current Color: {widgetColor}
              </div>
            </div>

            <div className="ios-setting-group">
              <label htmlFor="wg-wallpaper">Wallpaper</label>
              <input
                id="wg-wallpaper"
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

        <div className="ios-grid-clip" ref={clipRef}>
          <div
            className="ios-wallpaper"
            ref={wallpaperRef}
            style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : {}}
          />

          <div
            role="grid"
            aria-rowcount={rows}
            aria-colcount={responsiveCols}
            className={`ios-widget-grid ${className} ${
              showGrid ? "show-grid" : ""
            }`}
            style={{
              width: gridW,
              height: gridH,
              "--cell-width": `${cw}px`,
              "--cell-height": `${rh}px`,
              "--grid-gap": `${responsiveGap}px`,
              ...style,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </GridCtx.Provider>
  );
}

export { GridCtx };
