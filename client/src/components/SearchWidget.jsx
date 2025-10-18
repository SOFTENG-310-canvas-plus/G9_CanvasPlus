import React, { useState } from 'react';

// engine list to map the enginer name to the search url for a query
const ENGINES = {
    google: { label: "Google", url: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}` },
    baidu: { label: "Baidu", url: (query) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}` },
    bing: { label: "Bing", url: (query) => `https://www.bing.com/search?q=${encodeURIComponent(query)}` },
    ddg: { label: "DuckDuckGo", url: (query) => `https://www.duckduckgo.com/?q=${encodeURIComponent(query)}` },
    yahoo: { label: "Yahoo!", url: (query) => `https://search.yahoo.com/search?p=${encodeURIComponent(query)}` },
    wikipedia: { label: "Wiki", url: (query) => `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}` },
}

export default function SearchWidget() {
    const [query, setQuery] = useState('');

    // sets the first engine as the default engine
    const FIRST_ENGINE = Object.keys(ENGINES)[0];
    const [engine, setEngine] = useState(FIRST_ENGINE);

    /**
     * Handle form submit:
     *  - Prevent the form from reloading the page
     *  - Trim whitespace and no-op on empty input
     *  - Open the chosen engine's URL in a new tab
     *  - Clear the input afterward
     */
    const onSearch = (e) => {
        e.preventDefault();
        const queryText = query.trim();
        if (!queryText) return;
        window.open(ENGINES[engine].url(query), "_blank");
        setQuery("");
    }

    return (
        // Form wrapper so "Enter" submits the search.
        <form
            onSubmit={onSearch}
            style={{
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
                display: "flex",
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(8px, 2vw, 12px)',
            }}
        >
            <div style={{ 
                display: "flex", 
                width: "100%", 
                gap: 'clamp(6px, 1.5vw, 8px)',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}>
                <select
                    aria-label="Search engine"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                    style={{
                        border: "none",
                        background: "rgba(255,255,255,0.1)",
                        color: "white",
                        outline: "none",
                        padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px)',
                        borderRadius: 6,
                        fontSize: 'clamp(12px, 2.5vw, 13px)',
                        cursor: 'pointer',
                        minHeight: 44,
                        minWidth: 44,
                        fontWeight: 500,
                        transition: 'background 0.2s',
                        boxSizing: 'border-box',
                        appearance: 'auto',
                        WebkitAppearance: 'auto',
                        MozAppearance: 'auto',
                    }}
                    onFocus={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                    onBlur={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                    {Object.entries(ENGINES).map(([key, { label }]) => (
                        <option key={key} value={key} style={{ color: "black" }}>
                            {label}
                        </option>
                    ))}
                </select>
                <div style={{ 
                    position: "relative", 
                    flex: 1,
                    minWidth: 0,
                }}>
                    <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={"Type here to Search"}
                        aria-label={"search"}
                        autoComplete="off"
                        spellCheck={false}
                        style={{
                            border: "1.5px solid rgba(255,255,255,0.15)",
                            outline: "none",
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            color: "white",
                            padding: 'clamp(8px, 2vw, 10px) clamp(10px, 2.5vw, 12px)',
                            borderRadius: 8,
                            fontSize: 'clamp(13px, 2.5vw, 14px)',
                            minHeight: 44,
                            boxSizing: 'border-box',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                            e.target.style.background = 'rgba(255,255,255,0.12)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                            e.target.style.background = 'rgba(255,255,255,0.08)';
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        background: 'rgba(99,102,241,0.9)',
                        border: 'none',
                        borderRadius: 8,
                        padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 'clamp(12px, 2.5vw, 13px)',
                        fontWeight: 600,
                        transition: 'background 0.2s',
                        minHeight: 44,
                        minWidth: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        whiteSpace: 'nowrap',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.9)'}
                    aria-label="Submit search"
                >
                    🔍 Search
                </button>
            </div>
        </form>
    )
}