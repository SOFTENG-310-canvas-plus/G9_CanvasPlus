import React, { useState, useEffect } from 'react';

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: 'var(--space-4)',
      textAlign: 'center',
      gap: 'var(--space-2)',
    }}>
      {/* Time Display */}
      <div style={{
        fontSize: 'clamp(2rem, 8vw, 4rem)',
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        textShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        {String(displayHours).padStart(2, '0')}
        <span style={{ 
          animation: 'blink 1s infinite',
          display: 'inline-block',
          width: 'clamp(0.5rem, 2vw, 1rem)',
        }}>:</span>
        {String(minutes).padStart(2, '0')}
        <span style={{ 
          animation: 'blink 1s infinite',
          display: 'inline-block',
          width: 'clamp(0.5rem, 2vw, 1rem)',
        }}>:</span>
        {String(seconds).padStart(2, '0')}
      </div>

      {/* AM/PM Indicator */}
      <div style={{
        fontSize: 'var(--font-lg)',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: '0.1em',
      }}>
        {ampm}
      </div>

      {/* Date Display */}
      <div style={{
        marginTop: 'var(--space-3)',
        fontSize: 'var(--font-base)',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 500,
      }}>
        {dayNames[time.getDay()]}
      </div>

      <div style={{
        fontSize: 'var(--font-sm)',
        color: 'rgba(255,255,255,0.7)',
      }}>
        {monthNames[time.getMonth()]} {time.getDate()}, {time.getFullYear()}
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0.3; }
          }

          @media (prefers-reduced-motion: reduce) {
            @keyframes blink {
              0%, 100% { opacity: 1; }
            }
          }
        `}
      </style>
    </div>
  );
}