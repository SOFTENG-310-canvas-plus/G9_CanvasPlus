import React from "react";

function DailyScheduleWidget() {
  const timelineRef = React.useRef(null);
  const [activities, setActivities] = React.useState([
    { id: 2, title: 'Wake up', start: 420, end: 435, done: false }, // 07:00 - 07:15
    { id: 3, title: 'Gym', start: 450, end: 510, done: false }, // 07:30 - 08:30
    { id: 4, title: 'Cook', start: 540, end: 570, done: false }, // 09:00 - 09:30
    { id: 5, title: 'Read', start: 600, end: 660, done: false }, // 10:00 - 11:00
    { id: 6, title: 'Lunch', start: 720, end: 750, done: false }, // 12:00 - 12:30
    { id: 7, title: 'Study', start: 780, end: 1020, done: false }, // 13:00 - 17:00
    { id: 8, title: 'Dinner', start: 1080, end: 1110, done: false }, // 18:00 - 18:30
    { id: 9, title: 'Relax', start: 1140, end: 1260, done: false }, // 19:00 - 21:00
    { id: 10, title: 'Sleep', start: 1380, end: 1410, done: false }, // 23:00 - 23:30
  ]);
  const [showModal, setShowModal] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState('');
  const [modalTime, setModalTime] = React.useState('');
  const [modalDuration, setModalDuration] = React.useState(30);
  const [holdId, setHoldId] = React.useState(null);
  const [holdProgress, setHoldProgress] = React.useState(0);
  const holdInterval = React.useRef(null);
  const holdTimeout = React.useRef(null);

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
  // Timeline height for 24 hours, window height for 4 hours
  // Make each hour slot bigger: 1.8px per minute (108px per hour)
  const pxPerMinute = 1.8;
  const timelineHeight = 24 * 60 * pxPerMinute; // 2592px
  const windowMinutes = 3 * 60;
  const windowHeight = windowMinutes * pxPerMinute; // 324px
  const timelineWidth = 320;
  const totalMinutes = timelineEnd - timelineStart;
  function timeToY(minutes) {
    return (minutes - timelineStart) * pxPerMinute;
  }

  const handleTickActivity = (id) => {
    setActivities((acts) => acts.map(act => {
      if (act.id === id) {
        return { ...act, done: !act.done };
      }
      return act;
    }));
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    const startTime = modalTime.split(':');
    const start = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    const end = start + parseInt(modalDuration);
    const newActivity = {
      id: Math.random(), // temporary ID, replace with proper ID generation
      title: modalTitle,
      start,
      end,
      done: false
    };
    setActivities(acts => [...acts, newActivity]);
    setShowModal(false);
    setModalTitle('');
    setModalTime('');
    setModalDuration(30);
  };

  return (
    <div style={{ position: 'relative', height: windowHeight + 60, width: timelineWidth + 60, padding: 0, background: '#f9fafb', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1.5px solid #e0e7ef' }}>
      {/* Add Activity Button */}
      <div style={{ padding: '12px 14px 10px 14px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowModal(true)} style={{ background: '#22223b', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>Add Activity</button>
      </div>
      {/* Timeline container with grid, scrollable, flex layout for time labels */}
      <div ref={timelineRef} style={{ display: 'flex', flexDirection: 'row', margin: '0px 14px 14px 0', height: windowHeight, width: timelineWidth + 80, borderRadius: 7, overflowY: 'auto', background: '#fff' }}>
        {/* Time label column */}
        <div style={{ width: 70, position: 'relative', height: timelineHeight, background: 'linear-gradient(to right, #f3f4f6 90%, transparent)' }}>
          {timelineLabels.map(({ hour, y }, idx) => (
            <div key={hour + '-' + y} style={{
              position: 'absolute',
              left: 0,
              top: idx === 0 ? timeToY(y) : timeToY(y) - 18, // for 0:00, align top to grid line
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
          {activities.map(act => {
            const isLate = !act.done && nowMinutes > act.start + 10;
            if (!(act.start >= timelineStart && act.start < timelineEnd)) return null;
            return (
              <div key={act.id} style={{
                position: 'absolute',
                left: 28,
                top: timeToY(act.start),
                height: Math.max(44, timeToY(act.end) - timeToY(act.start)),
                width: timelineWidth - 80,
                background: act.done ? '#e0f2fe' : isLate ? '#fecaca' : '#fbbf24',
                color: act.done ? '#888' : isLate ? '#b91c1c' : '#222',
                borderRadius: 7,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                fontWeight: 500,
                fontSize: 13,
                zIndex: 2,
                border: isLate ? '2px solid #ef4444' : undefined
              }} title={act.title}>
                <button
                  type="button"
                  aria-label={act.done ? "Completed" : "Mark as done"}
                  onMouseDown={() => {
                    if (act.done) return;
                    setHoldId(act.id);
                    setHoldProgress(0);
                    let progress = 0;
                    holdInterval.current = setInterval(() => {
                      progress += 100 / 9;
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
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={act.done ? '#fff' : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: act.done ? 1 : 0.8, display: 'block' }}>
                    <polyline points="5 11 9 15 15 7" />
                  </svg>
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
                  {isLate && (
                    <span style={{
                      color: '#b91c1c',
                      background: '#fee2e2',
                      borderRadius: 5,
                      fontWeight: 800,
                      fontSize: 11,
                      marginLeft: 8,
                      padding: '2px 7px',
                      letterSpacing: 0.5,
                      verticalAlign: 'middle',
                    }}>Late</span>
                  )}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.8 }}>
                  {`${String(Math.floor(act.start / 60)).padStart(2, '0')}:${String(act.start % 60).padStart(2, '0')}`} - {`${String(Math.floor(act.end / 60)).padStart(2, '0')}:${String(act.end % 60).padStart(2, '0')}`}
                </span>
              </div>
            );
          })}
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

export default DailyScheduleWidget;
