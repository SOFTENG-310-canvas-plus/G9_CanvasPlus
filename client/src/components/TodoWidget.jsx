import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getTodos, createTodo, updateTodo, deleteTodo } from '../api/todos';

function TodoWidget() {
  const [fadingIds, setFadingIds] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDue, setModalDue] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalClass, setModalClass] = useState("");

  // Fetch todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getTodos();
    
    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }
    
    setTodos(data || []);
    setLoading(false);
  };

  // Filtering logic
  let filtered = [...todos];
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
      filtered = filtered.filter(t => {
        const d = t.due_date;
        return d && new Date(d) >= minDate && new Date(d) < maxDate;
      });
    }
  }

  const toggleTodo = async (id) => {
    // If already fading, ignore
    if (fadingIds.includes(id)) return;
    
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    const newDoneState = !todo.done;
    
    if (newDoneState) {
      // If marking as done, fade out first
      setFadingIds(f => [...f, id]);
      setTimeout(async () => {
        setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: true } : t));
        setFadingIds(f => f.filter(fid => fid !== id));
        
        // Update in database
        const { error: updateError } = await updateTodo(id, { done: true });
        if (updateError) {
          // Revert on error
          setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: false } : t));
          setError('Failed to update todo');
        }
      }, 350);
    } else {
      // If unchecking, update immediately
      setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: false } : t));
      
      const { error: updateError } = await updateTodo(id, { done: false });
      if (updateError) {
        // Revert on error
        setTodos((prev) => prev.map(t => t.id === id ? { ...t, done: true } : t));
        setError('Failed to update todo');
      }
    }
  };

  const handleDeleteTodo = async (id) => {
    // Optimistic update
    setTodos(prev => prev.filter(t => t.id !== id));
    
    const { error: deleteError } = await deleteTodo(id);
    if (deleteError) {
      // Reload on error
      setError('Failed to delete todo');
      await loadTodos();
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    setShowModal(false);
    
    // Create todo in database
    const { data: newTodo, error: createError } = await createTodo({
      title: modalTitle.trim(),
      description: modalDescription.trim(),
      due_date: modalDue || null,
      class: modalClass.trim(),
    });

    if (createError) {
      setError('Failed to create todo');
      return;
    }

    // Add to local state
    setTodos(prev => [newTodo, ...prev]);
    
    // Reset form
    setModalTitle("");
    setModalDescription("");
    setModalDue("");
    setModalClass("");
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 'clamp(12px, 3vw, 16px)',
        fontSize: 'clamp(13px, 2.5vw, 14px)',
        color: 'rgba(0,0,0,0.6)',
      }}>
        Loading tasks...
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ 
        color: 'salmon', 
        padding: 'clamp(12px, 3vw, 16px)',
        fontSize: 'clamp(13px, 2.5vw, 14px)',
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%',
      maxWidth: 800, 
      margin: '0 auto', 
      padding: '0 clamp(12px, 3vw, 16px)',
      boxSizing: 'border-box',
    }}>
      <style>
        {`
          @keyframes check-pop {
            0% { transform: scale(0.6); opacity: 0; }
            60% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'clamp(4px, 1vw, 6px)', 
        marginBottom: 'clamp(8px, 2vw, 10px)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={() => setShowModal(true)} style={{
            background: '#22223b',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
            fontWeight: 600,
            fontSize: 'clamp(12px, 2.5vw, 13px)',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            minHeight: 44,
            minWidth: 44,
            transition: 'background 0.2s',
            boxSizing: 'border-box',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#2d2d4a'}
          onMouseOut={e => e.currentTarget.style.background = '#22223b'}
          >Add</button>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 10px)', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
            style={{
              fontSize: 'clamp(12px, 2.5vw, 13px)',
              minWidth: 110,
              maxWidth: 180,
              padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 10px)',
              borderRadius: 5,
              border: '1.5px solid #e5e7eb',
              appearance: 'auto',
              WebkitAppearance: 'auto',
              MozAppearance: 'auto',
              background: '#f9fafb',
              color: '#22223b',
              outline: 'none',
              cursor: 'pointer',
              transition: 'border 0.2s, box-shadow 0.2s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: 44,
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
            onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="7days">Next 7 Days</option>
            <option value="14days">Next 14 Days</option>
          </select>
        </div>
      </div>

      {/* Modal for adding a new todo */}
      {showModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add new task"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 5000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(16px, 4vw, 24px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 'clamp(20px, 5vw, 28px)',
              width: 'min(560px,100%)',
              boxShadow: '0 12px 48px -8px rgba(0,0,0,0.25)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 'clamp(8px, 2vw, 12px)',
                right: 'clamp(12px, 3vw, 16px)',
                background: 'none',
                border: 'none',
                fontSize: 'clamp(18px, 4vw, 22px)',
                color: '#888',
                cursor: 'pointer',
                minWidth: 44,
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close"
            >✕</button>
            <h3 style={{ 
              margin: 0, 
              marginBottom: 'clamp(14px, 3.5vw, 18px)', 
              fontWeight: 700, 
              fontSize: 'clamp(16px, 4vw, 20px)', 
              color: '#22223b',
              wordWrap: 'break-word',
            }}>
              Add New Task
            </h3>
            <form onSubmit={handleAddTodo}>
              <div style={{ marginBottom: 'clamp(10px, 2.5vw, 14px)' }}>
                <label htmlFor="todo-title" style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  fontWeight: 500, 
                  color: '#22223b', 
                  marginBottom: 'clamp(3px, 0.75vw, 4px)', 
                  display: 'block' 
                }}>Title</label>
                <input 
                  id="todo-title" 
                  value={modalTitle} 
                  onChange={e => setModalTitle(e.target.value)} 
                  required 
                  placeholder="Task title..." 
                  style={{ 
                    width: '100%', 
                    padding: 'clamp(8px, 2vw, 10px)', 
                    borderRadius: 7, 
                    border: '1.5px solid #e5e7eb', 
                    fontSize: 'clamp(13px, 2.5vw, 15px)', 
                    outline: 'none',
                    minHeight: 44,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }} 
                  onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                  onBlur={e => e.target.style.border = '1.5px solid #e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: 'clamp(10px, 2.5vw, 14px)' }}>
                <label htmlFor="todo-description" style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  fontWeight: 500, 
                  color: '#22223b', 
                  marginBottom: 'clamp(3px, 0.75vw, 4px)', 
                  display: 'block' 
                }}>Description</label>
                <textarea 
                  id="todo-description" 
                  value={modalDescription} 
                  onChange={e => setModalDescription(e.target.value)} 
                  placeholder="Optional details..." 
                  rows={3} 
                  style={{ 
                    width: '100%', 
                    padding: 'clamp(8px, 2vw, 10px)', 
                    borderRadius: 7, 
                    border: '1.5px solid #e5e7eb', 
                    fontSize: 'clamp(13px, 2.5vw, 15px)', 
                    outline: 'none', 
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                  }} 
                  onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                  onBlur={e => e.target.style.border = '1.5px solid #e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: 'clamp(10px, 2.5vw, 14px)' }}>
                <label htmlFor="todo-due-date" style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  fontWeight: 500, 
                  color: '#22223b', 
                  marginBottom: 'clamp(3px, 0.75vw, 4px)', 
                  display: 'block' 
                }}>Due Date</label>
                <input 
                  id="todo-due-date" 
                  type="datetime-local" 
                  value={modalDue} 
                  onChange={e => setModalDue(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: 'clamp(8px, 2vw, 10px)', 
                    borderRadius: 7, 
                    border: '1.5px solid #e5e7eb', 
                    fontSize: 'clamp(13px, 2.5vw, 15px)', 
                    outline: 'none',
                    minHeight: 44,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }} 
                  onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                  onBlur={e => e.target.style.border = '1.5px solid #e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: 'clamp(14px, 3.5vw, 18px)' }}>
                <label htmlFor="todo-class" style={{ 
                  fontSize: 'clamp(12px, 2.5vw, 14px)', 
                  fontWeight: 500, 
                  color: '#22223b', 
                  marginBottom: 'clamp(3px, 0.75vw, 4px)', 
                  display: 'block' 
                }}>Class</label>
                <input 
                  id="todo-class" 
                  value={modalClass} 
                  onChange={e => setModalClass(e.target.value)} 
                  placeholder="Class (optional)..." 
                  style={{ 
                    width: '100%', 
                    padding: 'clamp(8px, 2vw, 10px)', 
                    borderRadius: 7, 
                    border: '1.5px solid #e5e7eb', 
                    fontSize: 'clamp(13px, 2.5vw, 15px)', 
                    outline: 'none',
                    minHeight: 44,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }} 
                  onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                  onBlur={e => e.target.style.border = '1.5px solid #e5e7eb'}
                />
              </div>

              <button type="submit" style={{ 
                width: '100%', 
                padding: 'clamp(8px, 2vw, 10px) 0', 
                borderRadius: 8, 
                background: '#22223b', 
                color: '#fff', 
                border: 'none', 
                fontWeight: 600, 
                fontSize: 'clamp(14px, 3vw, 16px)', 
                cursor: 'pointer',
                minHeight: 44,
                transition: 'background 0.2s',
                boxSizing: 'border-box',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#2d2d4a'}
              onMouseOut={e => e.currentTarget.style.background = '#22223b'}
              >Add Task</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div style={{
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        paddingRight: 'clamp(6px, 1.5vw, 8px)',
        scrollbarWidth: 'thin',
        position: 'relative',
        WebkitOverflowScrolling: 'touch',
      }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {filtered
            .sort((a, b) => {
              const ad = a.due_date;
              const bd = b.due_date;
              if (!ad && !bd) return 0;
              if (!ad) return 1;
              if (!bd) return -1;
              return new Date(ad) - new Date(bd);
            })
            .map(todo => {
              return (
                <li
                  key={todo.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: 'clamp(10px, 2.5vw, 12px)',
                    background: "#fff",
                    color: todo.done ? "#888" : "#222",
                    borderRadius: 10,
                    padding: 'clamp(10px, 2.5vw, 12px)',
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    position: "relative",
                    transition: "opacity 0.35s, transform 0.35s",
                    opacity: fadingIds.includes(todo.id) ? 0 : 1,
                    transform: fadingIds.includes(todo.id) ? 'translateY(30px)' : 'translateY(0)',
                    pointerEvents: fadingIds.includes(todo.id) ? 'none' : 'auto',
                    boxSizing: 'border-box',
                    gap: 'clamp(8px, 2vw, 12px)',
                  }}
                >
                  <button
                    type="button"
                    role="checkbox"                       
                    aria-checked={todo.done}              
                    aria-label={todo.done ? "Mark as undone" : "Mark as done"}
                    onClick={() => toggleTodo(todo.id)}
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
                      cursor: 'pointer',
                      position: 'relative',
                      outline: 'none',
                      transition: 'transform 120ms ease, background 0.2s, border 0.2s, box-shadow 0.2s',
                      padding: 0,
                      overflow: 'visible',
                      transform: todo.done ? 'scale(0.98)' : 'scale(1)',
                      boxShadow: todo.done
                        ? '0 0 0 3px rgba(34,197,94,0.25), 0 4px 10px rgba(0,0,0,0.08)'
                        : '0 0 0 0 rgba(0,0,0,0)',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke={todo.done ? '#fff' : '#94a3b8'}  
                      strokeWidth={todo.done ? 2.8 : 2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        display: 'block',
                        opacity: todo.done ? 1 : 0.55,       
                        filter: todo.done ? 'drop-shadow(0 1px 0 rgba(0,0,0,0.25))' : 'none',
                        animation: todo.done ? 'check-pop 180ms ease-out' : 'none'
                      }}
                      aria-hidden="true"
                    >
                      <polyline points="5 11 9 15 15 7" />
                    </svg>
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: 'clamp(14px, 3vw, 16px)',
                      marginBottom: 'clamp(1px, 0.25vw, 2px)',
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: todo.done ? "line-through" : "none",
                      transition: 'text-decoration 0.2s',
                    }} title={todo.title}>
                      {todo.title}
                    </div>
                    {todo.class && (
                      <div style={{ 
                        fontSize: 'clamp(12px, 2.5vw, 13px)', 
                        opacity: 0.8, 
                        marginBottom: 'clamp(1px, 0.25vw, 2px)',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        {todo.class}
                      </div>
                    )}
                    {todo.due_date && (
                      <div style={{ 
                        fontSize: 'clamp(11px, 2vw, 12px)', 
                        opacity: 0.7,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        Due: {new Date(todo.due_date).toLocaleString()}
                      </div>
                    )}
                    {todo.description && (
                      <div style={{ 
                        fontSize: 'clamp(12px, 2.5vw, 13px)', 
                        opacity: todo.done ? 0.6 : 0.9, 
                        marginBottom: 'clamp(3px, 0.75vw, 4px)', 
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>
                        {todo.description}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDeleteTodo(todo.id)} style={{
                    background: "#fff",
                    border: "1.5px solid #f87171",
                    color: "#f87171",
                    borderRadius: 8,
                    fontSize: 'clamp(14px, 3vw, 16px)',
                    fontWeight: 600,
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    minHeight: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "background 0.2s, color 0.2s, border 0.2s",
                    flexShrink: 0,
                    padding: 0,
                  }} 
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#f87171';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = '#f87171';
                  }}
                  title="Delete task">✕</button>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}

export default TodoWidget;
