import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as todosApi from '../api/todos';

function TodoWidget() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalDue, setModalDue] = useState("");
  const [modalClass, setModalClass] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setLoading(true);
    const { data, error: fetchError } = await todosApi.getTodos();
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const handleToggle = async (id, currentDone) => {
    const prevTodos = [...todos];
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !currentDone } : t));
    
    const { error: updateError } = await todosApi.updateTodo(id, { done: !currentDone });
    
    if (updateError) {
      setTodos(prevTodos);
      setError('Failed to update todo');
    }
  };

  const handleDelete = async (id) => {
    const { error: deleteError } = await todosApi.deleteTodo(id);
    
    if (deleteError) {
      setError('Failed to delete todo');
      await loadTodos();
    } else {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    setShowModal(false);
    
    const { data: newTodo, error: createError } = await todosApi.createTodo({
      title: modalTitle.trim(),
      description: modalDescription.trim(),
      due_date: modalDue || null,
      class: modalClass.trim(),
    });

    if (createError) {
      setError('Failed to create todo');
      return;
    }

    setTodos(prev => [newTodo, ...prev]);
    
    setModalTitle("");
    setModalDescription("");
    setModalDue("");
    setModalClass("");
  };

  if (loading) return <div style={{ padding: 'var(--space-4)' }}>Loading tasks...</div>;
  if (error) return <div style={{ color: 'salmon', padding: 'var(--space-4)' }}>Error: {error}</div>;

  const filterByTime = (todos) => {
    if (timeFilter === "all") return todos;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return todos.filter(todo => {
      if (!todo.due_date) return true;
      const dueDate = new Date(todo.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (timeFilter === "today") return diffDays === 0;
      if (timeFilter === "7days") return diffDays >= 0 && diffDays <= 7;
      if (timeFilter === "14days") return diffDays >= 0 && diffDays <= 14;
      return true;
    });
  };

  const filteredTodos = filterByTime(todos);
  const completedTodos = filteredTodos.filter(t => t.done);
  const incompleteTodos = filteredTodos.filter(t => !t.done);

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: '0 var(--space-2)',
      fontSize: 'var(--font-sm)'
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
        gap: 'var(--space-2)', 
        marginBottom: 'var(--space-3)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={() => setShowModal(true)} style={{
            background: '#22223b',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: 'var(--space-2) var(--space-4)',
            fontWeight: 600,
            fontSize: 'var(--font-sm)',
            cursor: 'pointer',
            minHeight: 'var(--touch-target-min)',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#2d2d4a'}
          onMouseOut={e => e.currentTarget.style.background = '#22223b'}
          >Add</button>
        </div>
        <div>
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            style={{
              fontSize: 'var(--font-sm)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 5,
              border: '1.5px solid #cbd5e1',
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
              minHeight: 'var(--touch-target-min)',
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
            padding: 'var(--space-4)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 'var(--space-6)',
              width: 'min(560px,100%)',
              maxWidth: '100%',
              boxShadow: '0 12px 48px -8px rgba(0,0,0,0.25)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 'var(--space-3)',
                right: 'var(--space-4)',
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#888',
                cursor: 'pointer',
                minWidth: 'var(--touch-target-min)',
                minHeight: 'var(--touch-target-min)',
              }}
              title="Close"
            >✕</button>
            <h3 style={{ 
              margin: 0, 
              marginBottom: 'var(--space-4)', 
              fontWeight: 700, 
              fontSize: 'var(--font-lg)', 
              color: '#22223b' 
            }}>
              Add New Task
            </h3>
            <form onSubmit={handleAddTodo} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <input
                type="text"
                placeholder="Task title..."
                value={modalTitle}
                onChange={e => setModalTitle(e.target.value)}
                required
                autoFocus
                style={{
                  padding: 'var(--space-3)',
                  fontSize: 'var(--font-base)',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  outline: 'none',
                  minHeight: 'var(--touch-target-min)',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
              />
              <textarea
                placeholder="Optional details..."
                value={modalDescription}
                onChange={e => setModalDescription(e.target.value)}
                rows={3}
                style={{
                  padding: 'var(--space-3)',
                  fontSize: 'var(--font-base)',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
              />
              <input
                type="datetime-local"
                value={modalDue}
                onChange={e => setModalDue(e.target.value)}
                style={{
                  padding: 'var(--space-3)',
                  fontSize: 'var(--font-base)',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  outline: 'none',
                  minHeight: 'var(--touch-target-min)',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
              />
              <input
                type="text"
                placeholder="Class (optional)..."
                value={modalClass}
                onChange={e => setModalClass(e.target.value)}
                style={{
                  padding: 'var(--space-3)',
                  fontSize: 'var(--font-base)',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: 8,
                  outline: 'none',
                  minHeight: 'var(--touch-target-min)',
                }}
                onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                onBlur={e => e.target.style.border = '1.5px solid #cbd5e1'}
              />
              <button type="submit" style={{
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: 'var(--space-3)',
                fontWeight: 600,
                fontSize: 'var(--font-base)',
                cursor: 'pointer',
                minHeight: 'var(--touch-target-min)',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = '#5558e3'}
              onMouseOut={e => e.currentTarget.style.background = '#6366f1'}
              >Add Task</button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Incomplete tasks */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        {incompleteTodos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-4)', 
            color: '#888',
            fontSize: 'var(--font-sm)'
          }}>No tasks yet</div>
        ) : (
          <ul style={{ 
            listStyle: 'none', 
            margin: 0, 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-2)' 
          }}>
            {incompleteTodos.map(todo => {
              const isOverdue = todo.due_date && new Date(todo.due_date) < new Date();
              return (
                <li key={todo.id} style={{
                  background: '#f9fafb',
                  borderRadius: 10,
                  padding: 'var(--space-3)',
                  border: '1.5px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <button
                    onClick={() => handleToggle(todo.id, todo.done)}
                    style={{
                      width: 24,
                      height: 24,
                      minWidth: 24,
                      borderRadius: '50%',
                      border: '2.5px solid #cbd5e1',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.background = '#f0f0ff';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.background = 'transparent';
                    }}
                    aria-label="Mark as complete"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: 'var(--font-base)',
                      marginBottom: 'var(--space-1)',
                      color: '#22223b',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}>{todo.title}</div>
                    {todo.description && (
                      <div style={{
                        fontSize: 'var(--font-sm)',
                        color: '#64748b',
                        marginBottom: 'var(--space-1)',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                      }}>{todo.description}</div>
                    )}
                    {todo.class && (
                      <div style={{
                        fontSize: 'var(--font-xs)',
                        color: '#6366f1',
                        fontWeight: 500,
                      }}>{todo.class}</div>
                    )}
                    {todo.due_date && (
                      <div style={{
                        fontSize: 'var(--font-xs)',
                        color: isOverdue ? '#ef4444' : '#64748b',
                        fontWeight: isOverdue ? 600 : 400,
                        marginTop: 'var(--space-1)',
                      }}>
                        Due: {new Date(todo.due_date).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: 18,
                      padding: 'var(--space-1)',
                      minWidth: 'var(--touch-target-min)',
                      minHeight: 'var(--touch-target-min)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#fee'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    title="Delete task"
                  >×</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Completed tasks */}
      {completedTodos.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: 'var(--font-sm)', 
            color: '#888', 
            marginTop: 'var(--space-4)', 
            marginBottom: 'var(--space-2)' 
          }}>Completed</h4>
          <ul style={{ 
            listStyle: 'none', 
            margin: 0, 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 'var(--space-2)' 
          }}>
            {completedTodos.map(todo => (
              <li key={todo.id} style={{
                background: '#f0fdf4',
                borderRadius: 10,
                padding: 'var(--space-3)',
                border: '1.5px solid #bbf7d0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)',
                opacity: 0.7,
              }}>
                <button
                  onClick={() => handleToggle(todo.id, todo.done)}
                  style={{
                    width: 24,
                    height: 24,
                    minWidth: 24,
                    borderRadius: '50%',
                    border: '2.5px solid #22c55e',
                    background: '#22c55e',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    flexShrink: 0,
                  }}
                  aria-label="Mark as incomplete"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'check-pop 0.3s ease-out' }}>
                    <polyline points="2 7 5 10 12 3" />
                  </svg>
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 'var(--font-base)',
                    color: '#22223b',
                    textDecoration: 'line-through',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}>{todo.title}</div>
                  {todo.class && (
                    <div style={{
                      fontSize: 'var(--font-xs)',
                      color: '#6366f1',
                      fontWeight: 500,
                      marginTop: 'var(--space-1)',
                    }}>{todo.class}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(todo.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 18,
                    padding: 'var(--space-1)',
                    minWidth: 'var(--touch-target-min)',
                    minHeight: 'var(--touch-target-min)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#fee'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  title="Delete task"
                >×</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TodoWidget;
