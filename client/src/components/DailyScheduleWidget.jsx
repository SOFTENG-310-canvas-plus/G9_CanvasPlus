import React, { useEffect, useState } from "react";
import { supabase } from "../auth/supabaseClient";


function DailyScheduleWidget() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to view your schedule");
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error: fetchError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", today.toISOString())
        .lt("start_time", tomorrow.toISOString())
        .order("start_time", { ascending: true });

      if (fetchError) throw fetchError;

      setEvents(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeUntil = (dateString) => {
    const eventTime = new Date(dateString);
    const now = new Date();
    const diffMs = eventTime - now;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return "In progress";
    if (diffMins < 60) return `In ${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    return `In ${hours}h ${diffMins % 60}m`;
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 'var(--space-4)', 
        textAlign: 'center',
        fontSize: 'var(--font-sm)',
        color: 'rgba(255,255,255,0.7)',
      }}>
        Loading schedule...
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
      }}>
        Today's Schedule
      </div>

      {events.length === 0 ? (
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
          <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>📅</div>
          <div>No events scheduled for today</div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}>
          {events.map((event) => {
            const isUpcoming = new Date(event.start_time) > new Date();
            return (
              <div
                key={event.id}
                style={{
                  background: isUpcoming 
                    ? 'rgba(99,102,241,0.1)' 
                    : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${isUpcoming 
                    ? 'rgba(99,102,241,0.3)' 
                    : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12,
                  padding: 'var(--space-3)',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = isUpcoming
                    ? 'rgba(99,102,241,0.15)'
                    : 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = isUpcoming
                    ? 'rgba(99,102,241,0.1)'
                    : 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Time */}
                <div style={{
                  fontSize: 'var(--font-base)',
                  fontWeight: 700,
                  color: isUpcoming ? '#818cf8' : '#fff',
                  marginBottom: 'var(--space-1)',
                }}>
                  {formatTime(event.start_time)}
                </div>

                {/* Title */}
                <div style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: 'var(--space-2)',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}>
                  {event.title}
                </div>

                {/* Description */}
                {event.description && (
                  <div style={{
                    fontSize: 'var(--font-xs)',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 'var(--space-2)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: 'var(--leading-relaxed)',
                  }}>
                    {event.description}
                  </div>
                )}

                {/* Location */}
                {event.location && (
                  <div style={{
                    fontSize: 'var(--font-xs)',
                    color: 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    marginBottom: 'var(--space-2)',
                  }}>
                    📍 {event.location}
                  </div>
                )}

                {/* Time until event */}
                {isUpcoming && (
                  <div style={{
                    fontSize: 'var(--font-xs)',
                    color: '#818cf8',
                    fontWeight: 600,
                    display: 'inline-block',
                    background: 'rgba(99,102,241,0.1)',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 6,
                  }}>
                    {getTimeUntil(event.start_time)}
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

export default DailyScheduleWidget;
