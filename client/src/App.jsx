// =============================
// File: app.jsx
// =============================
import React, { useState, useCallback } from "react";
import WidgetGrid, { Widget } from "./components/WidgetGrid.jsx";
import useGoogleCalendarEvents from "./hooks/useGoogleCalendarEvents";
import WeatherWidget from "./components/WeatherWidget.jsx"

export default function App() {
  const [widgets, setWidgets] = useState([
    { id: "weather", title: "Weather", col: 0, row: 0, w: 2, h: 2, color: "#1f2937" },
    { id: "calendar", title: "Calendar", col: 3, row: 0, w: 4, h: 3, color: "#0d9488" },
    { id: "todo", title: "TODO List", col: 7, row: 0, w: 3, h: 4, color: "#f59e42" },
    { id: "notes", title: "Notes", col: 0, row: 2, w: 3, h: 3, color: "#7c3aed" },
  ]);

  const handleMove = useCallback((id, pos) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, col: pos.col, row: pos.row } : w))
    );
  }, []);

  // Hook must be called at component top-level
  const { events, loading, error, needsAuth, signIn } = useGoogleCalendarEvents();

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

            {w.id === "calendar" && (
              (loading)
                ? <div>Loading events...</div>
                : needsAuth
                  ? (
                    <div>
                      <div style={{ marginBottom: 8 }}>Sign in to view your calendar events.</div>
                      <button onClick={signIn} style={{ padding: '8px 12px', borderRadius: 6 }}>Sign in with Google</button>
                    </div>
                  )
                  : error
                    ? <div style={{ color: 'salmon' }}>Error: {error}</div>
                    : (!events || events.length === 0)
                      ? <div>No upcoming events</div>
                      : (
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {events.map(ev => (
                            <li key={ev.id}>{ev.summary || '(no title)'} ({ev.start?.dateTime?.slice(11, 16) || ev.start?.date})</li>
                          ))}
                        </ul>
                      )
            )}

            {w.id === "todo" && <TodoWidget />}

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

// --- Basic TODO List Widget ---
import { useEffect } from "react";
function TodoWidget() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("./src/mock_canvas_todos.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load todos");
        return res.json();
      })
      .then((data) => {
        setTodos(data.map(t => ({ ...t, done: false })));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), title: input.trim(), course: "(Custom)", dueDate: null, done: false },
    ]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter(t => t.id !== id));
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: 'salmon' }}>Error: {error}</div>;

  return (
    <div>
      <form onSubmit={addTodo} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a task..."
          style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #eee" }}
        />
        <button type="submit" style={{ padding: "6px 12px", borderRadius: 6, background: "#f59e42", color: "#222", border: "none" }}>Add</button>
      </form>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {[...todos]
          .sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          })
          .map(todo => (
            <li key={todo.id} style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: 10,
              background: todo.done ? "#d1fae5" : "#fff",
              color: todo.done ? "#888" : "#222",
              borderRadius: 8,
              padding: 10,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              position: "relative"
            }}>
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} style={{ marginTop: 4 }} />
              <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: todo.done ? "line-through" : "none"
                }} title={todo.title}>
                  {todo.title}
                </div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 2 }}>{todo.course}</div>
                {todo.dueDate && (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Due: {new Date(todo.dueDate).toLocaleString()}
                  </div>
                )}
              </div>
              <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: 8, background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
            </li>
          ))}
      </ul>
    </div>
  );
}
