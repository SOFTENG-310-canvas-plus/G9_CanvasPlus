// =============================
// File: app.jsx
// =============================
import React, { useState, useCallback } from "react";
import WidgetGrid, { Widget } from "./components/WidgetGrid.jsx";
import useGoogleCalendarEvents from "./hooks/useGoogleCalendarEvents";
import WeatherWidget from "./components/WeatherWidget.jsx"
import CalendarWidget from "./components/CalendarWidget.jsx";

export default function App() {
  const [widgets, setWidgets] = useState([
    { id: "weather", title: "Weather", col: 0, row: 0, w: 2, h: 2, color: "#1f2937" },
    { id: "calendar", title: "Calendar", col: 3, row: 0, w: 4, h: 3, color: "#0d9488" },
    { id: "notes", title: "Notes", col: 0, row: 2, w: 3, h: 3, color: "#7c3aed" },
  ]);

  const handleMove = useCallback((id, pos) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, col: pos.col, row: pos.row } : w))
    );
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0e14",
        display: "grid",
        placeItems: "center",
        padding: 24,
        color: "white",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
      }}
    >


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

              {w.id === "calendar" && <CalendarWidget /* maxResults={5} timeMin={new Date()} */ />}

              {w.id === "notes" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                    Quick note
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type here…"
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "white",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              )}
            </Widget>
          ))}
        </WidgetGrid>
      </div>
  );
}
