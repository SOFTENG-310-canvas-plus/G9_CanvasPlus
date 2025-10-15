// =============================
// File: app.jsx
// =============================

import React, { useState, useCallback, useEffect } from "react";
import WidgetGrid, { Widget } from "./components/WidgetGrid.jsx";
import useGoogleCalendarEvents from "./hooks/useGoogleCalendarEvents";

import WeatherWidget from "./components/WeatherWidget.jsx"
import GptWrapper from "./components/GptWrapper.jsx"
import ClockWidget from "./components/ClockWidget.jsx";
import SearchWidget from "./components/SearchWidget.jsx"
import DailyScheduleWidget from "./components/DailyScheduleWidget.jsx";
import TodoWidget from "./components/TodoWidget.jsx";
import NotesWidget from './components/NotesWidget';
import CanvasWidget from "./components/CanvasWidget.jsx";

export default function App() {
  const [viewport, setViewport] = useState('desktop');
  
  // Determine viewport
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
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Responsive widget configurations
  const getResponsiveWidgets = () => {
    // Mobile (xs, sm): Single column, stacked
    if (viewport === 'xs' || viewport === 'sm') {
      return [
        { id: "weather", title: "Weather", col: 0, row: 0, w: 2, h: 2 },
        { id: "clock", title: "Clock", col: 0, row: 2, w: 2, h: 2 },
        { id: "search", title: "Search", col: 0, row: 4, w: 2, h: 1 },
        { id: "calendar", title: "Calendar", col: 0, row: 5, w: 2, h: 3 },
        { id: "todo", title: "TODO List", col: 0, row: 8, w: 2, h: 4 },
        { id: "notes", title: "Notes", col: 0, row: 12, w: 2, h: 3 },
        { id: "schedule", title: "Daily Schedule", col: 0, row: 15, w: 2, h: 4 },
        { id: "canvas", title: "Canvas Tasks", col: 0, row: 19, w: 2, h: 4 },
        { id: "gptWrapper", title: "ChatGPT", col: 0, row: 23, w: 2, h: 3 },
      ];
    }
    
    // Tablet (md, lg): Two columns
    if (viewport === 'md' || viewport === 'lg') {
      return [
        { id: "weather", title: "Weather", col: 0, row: 0, w: 2, h: 2 },
        { id: "clock", title: "Clock", col: 2, row: 0, w: 2, h: 2 },
        { id: "search", title: "Search", col: 0, row: 2, w: 4, h: 1 },
        { id: "calendar", title: "Calendar", col: 0, row: 3, w: 3, h: 3 },
        { id: "todo", title: "TODO List", col: 3, row: 3, w: 3, h: 4 },
        { id: "notes", title: "Notes", col: 0, row: 6, w: 3, h: 3 },
        { id: "schedule", title: "Daily Schedule", col: 3, row: 7, w: 3, h: 4 },
        { id: "canvas", title: "Canvas Tasks", col: 0, row: 9, w: 3, h: 4 },
        { id: "gptWrapper", title: "ChatGPT", col: 3, row: 11, w: 3, h: 3 },
      ];
    }
    
    // Desktop (xl, 2xl): Full grid
    return [
      { id: "weather", title: "Weather", col: 0, row: 0, w: 2, h: 2 },
      { id: "clock", title: "Clock", col: 0, row: 5, w: 5, h: 2 },
      { id: "calendar", title: "Calendar", col: 3, row: 0, w: 4, h: 3 },
      { id: "todo", title: "TODO List", col: 7, row: 0, w: 3, h: 4 },
      { id: "schedule", title: "Daily Schedule", col: 10, row: 0, w: 4, h: 4.2 },
      { id: "notes", title: "Notes", col: 0, row: 2, w: 3, h: 3 },
      { id: "gptWrapper", title: "ChatGPT", col: 3, row: 4, w: 6, h: 3 },
      { id: "search", title: "Search", col: 7, row: 0, w: 4, h: 1 },
      { id: "canvas", title: "Canvas Tasks", col: 9, row: 3, w: 3, h: 4 },
    ];
  };

  const [widgets, setWidgets] = useState(getResponsiveWidgets());

  // Update widgets when viewport changes
  useEffect(() => {
    setWidgets(getResponsiveWidgets());
  }, [viewport]);

  const handleMove = useCallback((id, pos) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, col: pos.col, row: pos.row } : w))
    );
  }, []);

  const { events, loading, error, needsAuth, signIn } = useGoogleCalendarEvents();

  return (
    <WidgetGrid cols={17} rows={8} cellW={96} rowH={96} gap={16} showGrid>
      {widgets.map((w) => (
        <Widget
          key={w.id}
          id={w.id}
          title={w.title}
          col={w.col}
          row={w.row}
          w={w.w}
          h={w.h}
          color={w.color}
          onMove={handleMove}
        >
          {w.id === "weather" && <WeatherWidget />}
          {w.id === "search" && <SearchWidget />}
          {w.id === "clock" && <ClockWidget />}
          {w.id === "gptWrapper" && <GptWrapper />}
          {w.id === "calendar" && (
            loading ? (
              <div>Loading events...</div>
            ) : needsAuth ? (
              <div style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <button onClick={signIn} style={{
                  background: '#6366f1', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: 'var(--space-3) var(--space-4)', 
                  fontWeight: 600, 
                  fontSize: 'var(--font-sm)', 
                  cursor: 'pointer',
                  minHeight: 'var(--touch-target-min)',
                  width: '100%'
                }}>Sign in to Google Calendar</button>
              </div>
            ) : error ? (
              <div style={{ color: 'salmon', padding: 'var(--space-4)' }}>Error: {error}</div>
            ) : (!events || events.length === 0) ? (
              <div style={{ padding: 'var(--space-4)' }}>No upcoming events</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--font-sm)' }}>
                {events.map(ev => (
                  <li key={ev.id} style={{ marginBottom: 'var(--space-2)' }}>
                    {ev.summary || '(no title)'} ({ev.start?.dateTime?.slice(11, 16) || ev.start?.date})
                  </li>
                ))}
              </ul>
            )
          )}

          {w.id === "todo" && <TodoWidget />}
          {w.id === "canvas" && <CanvasWidget />}
          {w.id === "schedule" && <DailyScheduleWidget />}
          {w.id === "notes" && <NotesWidget />}
        </Widget>
      ))}
    </WidgetGrid>
  );
}