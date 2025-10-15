import React, { useState } from 'react';

export default function SearchWidget() {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  return (
    <div style={{ 
      padding: 'var(--space-3)', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    }}>
      <form onSubmit={handleSearch} style={{ width: '100%' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Google..."
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-12) var(--space-3) var(--space-4)',
              fontSize: 'var(--font-base)',
              borderRadius: 12,
              border: '1.5px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              outline: 'none',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              minHeight: 'var(--touch-target-min)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              e.target.style.background = 'rgba(255,255,255,0.12)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.15)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: 'var(--space-2)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(99,102,241,0.9)',
              border: 'none',
              borderRadius: 8,
              padding: 'var(--space-2) var(--space-3)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              transition: 'background 0.2s',
              minHeight: 'var(--touch-target-min)',
              minWidth: 'var(--touch-target-min)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.9)'}
          >
            🔍
          </button>
        </div>
      </form>
    </div>
  );
}