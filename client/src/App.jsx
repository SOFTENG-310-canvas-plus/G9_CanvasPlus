// --- Daily Schedule Widget ---
function DailyScheduleWidget() {
  // Tick hold state for schedule
  const [holdId, setHoldId] = React.useState(null);
  const [holdProgress, setHoldProgress] = React.useState(0);
  const holdTimeout = React.useRef();
  const holdInterval = React.useRef();
  // Handle tick (complete) for activity
  function handleTickActivity(id) {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));
  }

  // --- Full 24-hour timeline, scrollable, with 4-hour window centered on now ---
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const timelineStart = 0;
  const timelineEnd = 24 * 60;
  const timelineStep = 60; // 1 hour
  const timelineLabels = [];
  for (let t = timelineStart; t <= timelineEnd; t += timelineStep) {
    let h = Math.floor((t + 24 * 60) % (24 * 60) / 60);
    timelineLabels.push({
      hour: h.toString().padStart(2, '0') + ':00',
      y: t
    });
  }

  // Activities: { id, title, start (minutes), end (minutes), done }
  const [activities, setActivities] = React.useState([
    { id: 1, title: 'Sleep', start: 0, end: 420, done: false }, // 00:00 - 07:00
    { id: 2, title: 'Wake up', start: 420, end: 435, done: false }, // 07:00 - 07:15
    { id: 3, title: 'Gym', start: 450, end: 510, done: false }, // 07:30 - 08:30
    { id: 4, title: 'Cook', start: 540, end: 570, done: false }, // 09:00 - 09:30
    { id: 5, title: 'Read', start: 600, end: 660, done: false }, // 10:00 - 11:00
    { id: 6, title: 'Lunch', start: 720, end: 750, done: false }, // 12:00 - 12:30
    { id: 7, title: 'Study', start: 780, end: 1020, done: false }, // 13:00 - 17:00
    { id: 8, title: 'Dinner', start: 1080, end: 1110, done: false }, // 18:00 - 18:30
    { id: 9, title: 'Relax', start: 1140, end: 1260, done: false }, // 19:00 - 21:00
    { id: 10, title: 'Sleep', start: 1320, end: 1440, done: false }, // 22:00 - 24:00
  ]);
  const [showModal, setShowModal] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState('');
  const [modalTime, setModalTime] = React.useState('08:00');
  const [modalDuration, setModalDuration] = React.useState(30);

  // Add activity handler
  function handleAddActivity(e) {
    e.preventDefault();
    const [h, m] = modalTime.split(':').map(Number);
    const start = h * 60 + m;
    setActivities(prev => [
      ...prev,
      {
        id: Date.now(),
        title: modalTitle,
        start,
        end: start + Number(modalDuration),
        done: false
      }
    ]);
    setShowModal(false);
    setModalTitle('');
    setModalTime('08:00');
    setModalDuration(30);
  }

  // Timeline height for 24 hours, window height for 4 hours
  // Make each hour slot bigger: 1.8px per minute (108px per hour)
  const pxPerMinute = 1.8;
  const timelineHeight = 24 * 60 * pxPerMinute; // 2592px
  const windowMinutes = 5 * 60;
  const windowHeight = windowMinutes * pxPerMinute; // 540px
  const timelineWidth = 320;
  const totalMinutes = timelineEnd - timelineStart;
  function timeToY(minutes) {
    return (minutes - timelineStart) * pxPerMinute;
  }
  // Ref for scrolling
  const timelineRef = React.useRef(null);
  React.useEffect(() => {
    if (timelineRef.current) {
      // Scroll so that 'now' is centered in the window
      const scrollTo = timeToY(nowMinutes) - windowHeight / 2;
      timelineRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

  return (
    <div style={{ position: 'relative', height: windowHeight + 60, width: timelineWidth + 60, padding: 0, background: '#f9fafb', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1.5px solid #e0e7ef' }}>
      {/* Add Activity Button */}
      <div style={{ padding: '12px 14px 0 14px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowModal(true)} style={{ background: '#22223b', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>Add Activity</button>
      </div>
      {/* Timeline container with grid, scrollable, flex layout for time labels */}
      <div ref={timelineRef} style={{ display: 'flex', flexDirection: 'row', margin: '0 14px 14px 0', height: windowHeight, width: timelineWidth + 80, borderRadius: 7, overflowY: 'auto', background: '#fff' }}>
        {/* Time label column */}
        <div style={{ width: 70, position: 'relative', height: timelineHeight, background: 'linear-gradient(to right, #f3f4f6 90%, transparent)' }}>
          {timelineLabels.map(({ hour, y }) => (
            <div key={hour + '-' + y} style={{
              position: 'absolute',
              left: 0,
              top: timeToY(y) - 18,
              width: 70,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              color: '#22223b',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 1,
              background: 'none',
              zIndex: 2,
              textShadow: '0 2px 8px #fff, 0 1px 0 #f3f4f6'
            }}>{hour}</div>
          ))}
        </div>
        {/* Timeline and grid */}
        <div style={{ position: 'relative', height: timelineHeight, width: timelineWidth }}>
          {/* Grid lines */}
          {timelineLabels.map(({ hour, y }) => (
            <div key={'grid-' + hour + '-' + y} style={{
              position: 'absolute',
              left: 0,
              top: timeToY(y),
              width: '100%',
              height: 1,
              background: '#e5e7eb',
              zIndex: 0
            }} />
          ))}
          {/* Timeline vertical line (full height) */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: 2, height: '100%', background: '#6366f1', zIndex: 1 }} />
          {/* Now line */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: timeToY(nowMinutes), height: 2, background: '#f87171', zIndex: 2, opacity: 0.7 }} />
          {/* Activities as blocks */}
          {activities.map(act => (
            act.start >= timelineStart && act.start < timelineEnd && (
              <div key={act.id} style={{
                position: 'absolute',
                left: 28,
                top: timeToY(act.start),
                height: Math.max(18, timeToY(act.end) - timeToY(act.start)),
                width: timelineWidth - 80,
                background: act.done ? '#e0f2fe' : '#fbbf24',
                color: act.done ? '#888' : '#222',
                borderRadius: 7,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontWeight: 500,
                fontSize: 13,
                zIndex: 2
              }} title={act.title}>
                {/* Tick button */}
                <button
                  type="button"
                  aria-label={act.done ? "Completed" : "Mark as done"}
                  onMouseDown={() => {
                    if (act.done) return;
                    setHoldId(act.id);
                    setHoldProgress(0);
                    let progress = 0;
                    holdInterval.current = setInterval(() => {
                      progress += 100 / 9; // 1s, 9 steps
                      setHoldProgress(progress);
                    }, 100);
                    holdTimeout.current = setTimeout(() => {
                      clearInterval(holdInterval.current);
                      setHoldProgress(100);
                      handleTickActivity(act.id);
                      setHoldId(null);
                    }, 1000);
                  }}
                  onMouseUp={() => {
                    clearTimeout(holdTimeout.current);
                    clearInterval(holdInterval.current);
                    setHoldProgress(0);
                    setHoldId(null);
                  }}
                  onMouseLeave={() => {
                    clearTimeout(holdTimeout.current);
                    clearInterval(holdInterval.current);
                    setHoldProgress(0);
                    setHoldId(null);
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    minHeight: 36,
                    borderRadius: '50%',
                    border: act.done ? '2.5px solid #22c55e' : '2.5px solid #cbd5e1',
                    background: act.done ? '#22c55e' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: act.done ? 'default' : 'pointer',
                    marginRight: 10,
                    position: 'relative',
                    outline: 'none',
                    transition: 'background 0.2s, border 0.2s',
                    boxShadow: undefined,
                    padding: 0,
                    overflow: 'visible',
                  }}
                  disabled={act.done}
                >
                  {/* Green Tick icon SVG */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={act.done ? '#fff' : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: act.done ? 1 : 0.8, display: 'block' }}>
                    <polyline points="5 11 9 15 15 7" />
                  </svg>
                  {/* Progress ring */}
                  {holdId === act.id && !act.done && (
                    <svg width="40" height="40" style={{ position: 'absolute', top: -4, left: -4, pointerEvents: 'none', zIndex: 1 }}>
                      <circle
                        cx="20" cy="20" r="17"
                        stroke="#22c55e"
                        strokeWidth="3.5"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 17}
                        strokeDashoffset={2 * Math.PI * 17 * (1 - holdProgress / 100)}
                        style={{
                          transition: 'stroke-dashoffset 0.1s linear',
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%'
                        }}
                      />
                    </svg>
                  )}
                </button>
                <span style={{ fontWeight: 700, marginRight: 8 }}>
                  {act.title}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.8 }}>
                  {`${String(Math.floor(act.start/60)).padStart(2,'0')}:${String(act.start%60).padStart(2,'0')}`} - {`${String(Math.floor(act.end/60)).padStart(2,'0')}:${String(act.end%60).padStart(2,'0')}`}
                </span>
              </div>
            )
          ))}
        </div>
      </div>
      {/* Modal for adding activity */}
      {showModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 18, minWidth: 220, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 18, color: '#888', cursor: 'pointer' }} title="Close">✕</button>
            <h3 style={{ margin: 0, marginBottom: 12, fontWeight: 700, fontSize: 15, color: '#22223b' }}>Add Activity</h3>
            <form onSubmit={handleAddActivity}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#22223b', marginBottom: 3, display: 'block' }}>Title</label>
                <input value={modalTitle} onChange={e => setModalTitle(e.target.value)} required placeholder="Activity title..." style={{ width: '100%', padding: '6px 8px', borderRadius: 5, border: '1.5px solid #e5e7eb', fontSize: 12, outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#22223b', marginBottom: 3, display: 'block' }}>Start Time</label>
                <input type="time" value={modalTime} onChange={e => setModalTime(e.target.value)} required style={{ width: '100%', padding: '6px 8px', borderRadius: 5, border: '1.5px solid #e5e7eb', fontSize: 12, outline: 'none' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#22223b', marginBottom: 3, display: 'block' }}>Duration (minutes)</label>
                <input type="number" min={5} max={180} step={5} value={modalDuration} onChange={e => setModalDuration(e.target.value)} required style={{ width: '100%', padding: '6px 8px', borderRadius: 5, border: '1.5px solid #e5e7eb', fontSize: 12, outline: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '8px 0', borderRadius: 7, background: '#22223b', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, letterSpacing: 0.2, cursor: 'pointer', transition: 'background 0.2s' }}>Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
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
    { id: "schedule", title: "Daily Schedule", col: 10, row: 0, w: 4, h: 7, color: "#fbbf24" },
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
            {w.id === "schedule" && <DailyScheduleWidget />}

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
  // For hold-to-complete
  const [holdId, setHoldId] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimeout = React.useRef();
  const holdInterval = React.useRef();
  const [fadingIds, setFadingIds] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDue, setModalDue] = useState("");
  const [modalCategory, setModalCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  // No daily schedule state here

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
  // Only show incomplete todos
  filtered = filtered.filter(t => !t.done);

  // Unique course list for filter dropdown and add modal
  const customCategories = ["daily", "reading", "sports"];
  const courseList = ["all", ...Array.from(new Set(todos.map(t => t.course).concat(customCategories)))];
  const addCategoryList = Array.from(new Set(todos.map(t => t.course).concat(customCategories)));

  const toggleTodo = (id) => {
    // If already fading, ignore
    if (fadingIds.includes(id)) return;
    // If marking as done, fade out first
    const todo = todos.find(t => t.id === id);
    if (todo && !todo.done) {
      setFadingIds(f => [...f, id]);
      setTimeout(() => {
        setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: true } : t));
        setFadingIds(f => f.filter(fid => fid !== id));
      }, 350); // match CSS transition duration
    } else {
      // If unchecking, just update immediately
      setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: false } : t));
    }
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
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
          .map(todo => {
            return (
              <li
                key={todo.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: 12,
                  background: todo.done ? "#e0f2fe" : courseColors[todo.course] || "#fff",
                  color: todo.done ? "#888" : "#222",
                  borderRadius: 10,
                  padding: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  position: "relative",
                  transition: "background 0.2s, opacity 0.35s, transform 0.35s",
                  opacity: fadingIds.includes(todo.id) ? 0 : 1,
                  transform: fadingIds.includes(todo.id) ? 'translateY(30px)' : 'translateY(0)',
                  pointerEvents: fadingIds.includes(todo.id) ? 'none' : 'auto',
                }}
              >
                <button
                  type="button"
                  aria-label={todo.done ? "Completed" : "Mark as done"}
                  onMouseDown={() => {
                    if (todo.done) return;
                    setHoldId(todo.id);
                    setHoldProgress(0);
                    let progress = 0;
                    holdInterval.current = setInterval(() => {
                      progress += 100 / 9; // 1s, 9 steps
                      setHoldProgress(progress);
                    }, 100);
                    holdTimeout.current = setTimeout(() => {
                      clearInterval(holdInterval.current);
                      setHoldProgress(100);
                      toggleTodo(todo.id);
                      setHoldId(null);
                    }, 1000);
                  }}
                  onMouseUp={() => {
                    clearTimeout(holdTimeout.current);
                    clearInterval(holdInterval.current);
                    setHoldProgress(0);
                    setHoldId(null);
                  }}
                  onMouseLeave={() => {
                    clearTimeout(holdTimeout.current);
                    clearInterval(holdInterval.current);
                    setHoldProgress(0);
                    setHoldId(null);
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    minHeight: 36,
                    borderRadius: '50%',
                    border: todo.done ? '2.5px solid #22c55e' : '2.5px solid #cbd5e1',
                    background: todo.done ? '#22c55e' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: todo.done ? 'default' : 'pointer',
                    marginTop: 2,
                    marginRight: 12,
                    position: 'relative',
                    outline: 'none',
                    transition: 'background 0.2s, border 0.2s',
                    boxShadow: undefined,
                    padding: 0,
                    overflow: 'visible',
                  }}
                  disabled={todo.done}
                >
                  {/* Green Tick icon SVG */}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={todo.done ? '#fff' : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: todo.done ? 1 : 0.8, display: 'block' }}>
                    <polyline points="5 11 9 15 15 7" />
                  </svg>
                  {/* Progress ring */}
                  {holdId === todo.id && !todo.done && (
                    <svg width="40" height="40" style={{ position: 'absolute', top: -4, left: -4, pointerEvents: 'none', zIndex: 1 }}>
                      <circle
                        cx="20" cy="20" r="17"
                        stroke="#22c55e"
                        strokeWidth="3.5"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 17}
                        strokeDashoffset={2 * Math.PI * 17 * (1 - holdProgress / 100)}
                        style={{
                          transition: 'stroke-dashoffset 0.1s linear',
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%'
                        }}
                      />
                    </svg>
                  )}
                </button>
                <div style={{ marginLeft: 4, flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textDecoration: todo.done ? "line-through" : "none",
                    transition: 'text-decoration 0.2s',
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
            );
          })}
      </ul>
    </div>
  );
}
