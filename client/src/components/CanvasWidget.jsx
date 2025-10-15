import React, { useState, useEffect } from "react";
import { supabase } from "../auth/supabaseClient";

function CanvasWidget() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCanvasAssignments();
  }, []);

  const fetchCanvasAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to view Canvas assignments");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("canvas_assignments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_at", { ascending: true })
        .limit(10);

      if (fetchError) throw fetchError;

      setAssignments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (daysUntil) => {
    if (daysUntil < 0) return "#ef4444"; // Red - overdue
    if (daysUntil <= 1) return "#f59e0b"; // Orange - due soon
    if (daysUntil <= 7) return "#10b981"; // Green - upcoming
    return "rgba(255,255,255,0.7)"; // Default
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "No due date";
    return new Date(dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 'var(--space-4)', 
        textAlign: 'center',
        fontSize: 'var(--font-sm)',
        color: 'rgba(255,255,255,0.7)',
      }}>
        Loading assignments...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: 'var(--space-4)', 
        color: '#ef4444',
        fontSize: 'var(--font-sm)',
        textAlign: 'center',
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'var(--space-3)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        fontSize: 'var(--font-lg)',
        fontWeight: 700,
        marginBottom: 'var(--space-4)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}>
        <span>📚</span> Canvas Tasks
      </div>

      {assignments.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 'var(--font-sm)',
          textAlign: 'center',
          gap: 'var(--space-2)',
        }}>
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>✅</div>
          <div>No assignments found</div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}>
          {assignments.map((assignment) => {
            const daysUntil = getDaysUntilDue(assignment.due_at);
            const dueDateColor = getDueDateColor(daysUntil);

            return (
              <div
                key={assignment.id}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: 'var(--space-3)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => assignment.html_url && window.open(assignment.html_url, '_blank')}
              >
                {/* Course name */}
                {assignment.course_name && (
                  <div style={{
                    fontSize: 'var(--font-xs)',
                    color: '#818cf8',
                    fontWeight: 600,
                    marginBottom: 'var(--space-1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {assignment.course_name}
                  </div>
                )}

                {/* Assignment name */}
                <div style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: 'var(--space-2)',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  lineHeight: 'var(--leading-normal)',
                }}>
                  {assignment.name}
                </div>

                {/* Due date */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)',
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    fontSize: 'var(--font-xs)',
                    color: dueDateColor,
                    fontWeight: 600,
                  }}>
                    Due: {formatDueDate(assignment.due_at)}
                  </div>

                  {daysUntil !== null && (
                    <div style={{
                      fontSize: 'var(--font-xs)',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 6,
                      background: `${dueDateColor}20`,
                      color: dueDateColor,
                      fontWeight: 600,
                    }}>
                      {daysUntil < 0
                        ? `${Math.abs(daysUntil)}d overdue`
                        : daysUntil === 0
                        ? "Due today"
                        : daysUntil === 1
                        ? "Due tomorrow"
                        : `${daysUntil}d left`}
                    </div>
                  )}
                </div>

                {/* Points */}
                {assignment.points_possible && (
                  <div style={{
                    fontSize: 'var(--font-xs)',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: 'var(--space-1)',
                  }}>
                    {assignment.points_possible} points
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CanvasWidget;