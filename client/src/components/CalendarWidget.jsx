// components/CalendarWidget.jsx
import React from "react";
import useGoogleCalendarEvents from "../hooks/useGoogleCalendarEvents";

export default function CalendarWidget({ maxResults = 10, timeMin = new Date() }) {
  const { events, loading, error, needsAuth, signIn } =
    useGoogleCalendarEvents({ maxResults, timeMin });

  if (loading) return <div>Loading events...</div>;

  if (needsAuth) {
    return (
      <div>
        <div style={{ marginBottom: 8 }}>Sign in to view your calendar events.</div>
        <button onClick={signIn} style={{ padding: "8px 12px", borderRadius: 6 }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (error) return <div style={{ color: "salmon" }}>Error: {error}</div>;
  if (!events || events.length === 0) return <div>No upcoming events</div>;

  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {events.map((ev) => (
        <li key={ev.id}>
          {ev.summary || "(no title)"} (
          {ev.start?.dateTime?.slice(11, 16) || ev.start?.date})
        </li>
      ))}
    </ul>
  );
}