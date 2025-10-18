import React, { useState, useCallback, useEffect } from "react";
import WidgetGrid, { Widget } from "./components/WidgetGrid.jsx";
import useGoogleCalendarEvents from "./hooks/useGoogleCalendarEvents";
import { supabase } from "./auth/supabaseClient.js";

import WeatherWidget from "./components/WeatherWidget.jsx";
import GptWrapper from "./components/GptWrapper.jsx";
import ClockWidget from "./components/ClockWidget.jsx";
import SearchWidget from "./components/SearchWidget.jsx";
import DailyScheduleWidget from "./components/DailyScheduleWidget.jsx";
import TodoWidget from "./components/TodoWidget.jsx";
import NotesWidget from './components/NotesWidget';
import CanvasWidget from "./components/CanvasWidget.jsx";
import { WIDGETS } from './config/widgets';
import { DEFAULT_LAYOUTS, GRID_CONFIG } from './config/widgetLayoutDefaults';
import { validateLayout } from './lib/layoutUtils';

export default function App() {
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  
  // Get authenticated user FIRST
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      setUserLoaded(true);
      console.log('User authenticated:', session?.user?.id); // ADD THIS
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setUserLoaded(true);
      console.log('User fetched:', data?.user?.id); // ADD THIS
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // THEN initialize layout hook with the user
  const { layout, isLoading, saveLayout } = useWidgetLayout(user, 'lg');
  
  // ADD THIS LOG
  console.log('Hook state:', { 
    userLoaded, 
    isLoading, 
    hasLayout: !!layout, 
    layoutLength: layout?.length 
  });

  const [widgets, setWidgets] = useState(() => {
    const defaultLayout = DEFAULT_LAYOUTS.lg;
    if (import.meta.env.DEV) {
      validateLayout(defaultLayout, GRID_CONFIG.lg.cols);
    }
    return defaultLayout.map(layoutItem => ({
      id: layoutItem.i,
      title: WIDGETS[layoutItem.i]?.title || layoutItem.i,
      col: layoutItem.col,
      row: layoutItem.row,
      w: layoutItem.w,
      h: layoutItem.h,
    }));
  });

  // Load saved layout when available
  useEffect(() => {
    console.log('Layout effect triggered:', { isLoading, layout }); // ADD THIS
    if (!isLoading && layout && layout.length > 0) {
      console.log('Loading saved layout:', layout);
      const loadedWidgets = layout.map(layoutItem => ({
        id: layoutItem.i,
        title: WIDGETS[layoutItem.i]?.title || layoutItem.i,
        col: layoutItem.col,
        row: layoutItem.row,
        w: layoutItem.w,
        h: layoutItem.h,
      }));
      setWidgets(loadedWidgets);
    }
  }, [layout, isLoading]);

  const handleMove = useCallback((id, pos) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => 
        w.id === id ? { ...w, col: pos.col, row: pos.row } : w
      );
      
      // Save to database
      if (user) {
        const layoutToSave = updated.map(w => ({
          i: w.id,
          col: w.col,
          row: w.row,
          w: w.w,
          h: w.h,
        }));
        console.log('Saving layout:', layoutToSave); // Debug log
        saveLayout(layoutToSave);
      }
      
      return updated;
    });
  }, [user, saveLayout]);

  // Show loading screen while fetching layout from Supabase
  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading dashboard...</div>;
  }

  // Get columns based on breakpoint
  let cols;
  if (currentBreakpoint === 'lg') {
    cols = 17;
  } else if (currentBreakpoint === 'md') {
    cols = 10;
  } else if (currentBreakpoint === 'sm') {
    cols = 6;
  } else {
    cols = 4;
  }

  // Wait for both user and layout to load
  if (!userLoaded || isLoading) {
    return <div>Loading layout...</div>;
  }

  return (
    <>
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
                <div>
                  <button onClick={signIn} style={{
                    background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8
                  }}>Sign in to Google Calendar</button>
                </div>
              ) : error ? (
                <div style={{ color: 'salmon' }}>Error: {error}</div>
              ) : (!events || events.length === 0) ? (
                <div>No upcoming events</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {events.map(ev => (
                    <li key={ev.id}>{ev.summary || '(no title)'} ({ev.start?.dateTime?.slice(11, 16) || ev.start?.date})</li>
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
    </>
  );
}