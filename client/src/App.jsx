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
    { id: "todo", title: "TODO List", col: 7, row: 0, w: 3, h: 4, color: "#4e4e4eff" },
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDue, setModalDue] = useState("");
  const [modalCategory, setModalCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Assign a color to each course
  const courseColors = {
    "SOFTENG 310": "#f59e42",
    "SOFTENG 306": "#60a5fa",
    "SOFTENG 325": "#34d399",
    "COMPSCI 367": "#a78bfa",
    "(Custom)": "#e5e7eb"
  };

  useEffect(() => {
    fetch("./src/mock_canvas_todos.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load todos");
        return res.json();
      })
      .then((data) => {
        setTodos(data.map(t => ({ ...t, done: false, source: "canvas" })));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filtering logic
  let filtered = [...todos];
  if (courseFilter !== "all") {
    filtered = filtered.filter(t => t.course === courseFilter);
  }
  if (timeFilter !== "all") {
    const now = new Date();
    let minDate = null, maxDate = null;
    if (timeFilter === "today") {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (timeFilter === "7days") {
      minDate = now;
      maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "14days") {
      minDate = now;
      maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    if (minDate && maxDate) {
      filtered = filtered.filter(t => t.dueDate && new Date(t.dueDate) >= minDate && new Date(t.dueDate) < maxDate);
    }
  }
  if (showCompleted) {
    filtered = filtered.filter(t => t.done);
  } else {
    filtered = filtered.filter(t => !t.done);
  }

  // Unique course list for filter dropdown and add modal
  const customCategories = ["daily", "reading", "sports"];
  const courseList = ["all", ...Array.from(new Set(todos.map(t => t.course).concat(customCategories)))];
  const addCategoryList = Array.from(new Set(todos.map(t => t.course).concat(customCategories)));

  const toggleTodo = (id) => {
    setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  // Only allow deleting custom todos (source !== 'canvas')
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter(t => {
      const todo = prev.find(t2 => t2.id === id);
      return todo && todo.source === "canvas" ? true : t.id !== id;
    }));
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div style={{ color: 'salmon' }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 18 }}>
        <label style={{ fontSize: 15, color: '#22223b', fontWeight: 500, display: 'flex', alignItems: 'center', margin: 0, paddingLeft: 4 }}>
          <input type="checkbox" checked={showCompleted} onChange={e => setShowCompleted(e.target.checked)} style={{ marginRight: 8, verticalAlign: 'middle', width: 18, height: 18 }} />
          Show Completed
        </label>
        <button onClick={() => setShowModal(true)} style={{
          padding: '10px 18px',
          borderRadius: 8,
          background: '#22223b',
          color: '#fff',
          border: 'none',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: 0.2,
          cursor: 'pointer',
          transition: 'background 0.2s',
          minWidth: 80,
        }}>Add</button>
      </div>
      <div style={{
        display: 'flex',
        gap: 28,
        marginBottom: 18,
        background: '#f3f4f6',
        borderRadius: 10,
        padding: '6px 18px 6px 14px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'thin',
        maxWidth: '100%',
        alignItems: 'center',
        minHeight: 36,
      }}>
        <div style={{ position: 'relative', display: 'inline-block', minWidth: 140, maxWidth: 260, verticalAlign: 'middle', marginRight: 0 }}>
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
            style={{
              minWidth: 140,
              maxWidth: 260,
              width: 'auto',
              padding: '12px 38px 12px 18px',
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              background: '#f9fafb',
              fontSize: 15,
              color: '#22223b',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'border 0.2s, box-shadow 0.2s',
              whiteSpace: 'normal',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
            onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
          >
            {courseList.map(c => (
              <option key={c} value={c}>{c === "all" ? "All Courses" : c}</option>
            ))}
          </select>
          <span style={{
            pointerEvents: 'none',
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
            fontSize: 15
          }}>▼</span>
        </div>
        <div style={{ position: 'relative', display: 'inline-block', minWidth: 140, maxWidth: 260, verticalAlign: 'middle', marginRight: 0 }}>
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
            style={{
              minWidth: 140,
              maxWidth: 260,
              width: 'auto',
              padding: '12px 38px 12px 18px',
              borderRadius: 8,
              border: '1.5px solid #cbd5e1',
              background: '#f9fafb',
              fontSize: 15,
              color: '#22223b',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'border 0.2s, box-shadow 0.2s',
              whiteSpace: 'normal',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
            onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Next 7 Days</option>
            <option value="14days">Next 14 Days</option>
          </select>
          <span style={{
            pointerEvents: 'none',
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
            fontSize: 15
          }}>▼</span>
        </div>
        {/* Show Completed checkbox moved to top bar */}
      </div>

      {/* Modal for adding a new todo */}
      {showModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, minWidth: 320, boxShadow: '0 4px 32px rgba(0,0,0,0.13)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} title="Close">✕</button>
            <h3 style={{ margin: 0, marginBottom: 18, fontWeight: 700, fontSize: 18, color: '#22223b' }}>Add New Task</h3>
            <form onSubmit={e => {
              e.preventDefault();
              if (!modalTitle.trim()) return;
              setTodos(prev => [
                ...prev,
                {
                  id: Date.now(),
                  title: modalTitle.trim(),
                  dueDate: modalDue || null,
                  course: modalCategory === '__new__' ? newCategory.trim() : modalCategory,
                  done: false
                }
              ]);
              setShowModal(false);
              setModalTitle("");
              setModalDue("");
              setModalCategory("");
              setNewCategory("");
            }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#22223b', marginBottom: 4, display: 'block' }}>Title</label>
                <input value={modalTitle} onChange={e => setModalTitle(e.target.value)} required placeholder="Task title..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#22223b', marginBottom: 4, display: 'block' }}>Due Date</label>
                <input type="datetime-local" value={modalDue} onChange={e => setModalDue(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: '#22223b', marginBottom: 4, display: 'block' }}>Category</label>
                <select value={modalCategory} onChange={e => setModalCategory(e.target.value)} required style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', marginBottom: 8 }}>
                  <option value="" disabled>Select category...</option>
                  {addCategoryList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__new__">+ Create new category</option>
                </select>
                {modalCategory === '__new__' && (
                  <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name..." style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', marginTop: 6 }} />
                )}
              </div>
              <button type="submit" style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: '#22223b', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, letterSpacing: 0.2, cursor: 'pointer', transition: 'background 0.2s' }}>Add Task</button>
            </form>
          </div>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filtered
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
              marginBottom: 12,
              background: todo.done ? "#e0f2fe" : courseColors[todo.course] || "#fff",
              color: todo.done ? "#888" : "#222",
              borderRadius: 10,
              padding: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              position: "relative",
              transition: "background 0.2s"
            }}>
              <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} style={{
                marginTop: 4,
                accentColor: todo.done ? "#38bdf8" : courseColors[todo.course] || "#22223b",
                width: 18,
                height: 18,
                borderRadius: 6,
                border: "1.5px solid #cbd5e1",
                cursor: "pointer"
              }} />
              <div style={{ marginLeft: 14, flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: 16,
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
              {todo.source !== 'canvas' && (
                <button onClick={() => deleteTodo(todo.id)} style={{
                  marginLeft: 10,
                  background: "#fff",
                  border: "1.5px solid #f87171",
                  color: "#f87171",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s, border 0.2s"
                }} title="Delete task">✕</button>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
