import { useEffect, useState } from "react";

/**
 * useGoogleCalendarEvents
 * -----------------------
 * Custom React hook that fetches a user's Google Calendar events (read-only)
 * using Google Identity Services (GIS) for OAuth and the Calendar REST API.
 *
 * Returns:
 *   { events, loading, error, needsAuth, signIn }
 *     - events:   array of calendar event objects
 *     - loading:  true while authenticating/fetching
 *     - error:    string message if something went wrong
 *     - needsAuth:true if user must click "Sign in" (silent auth failed)
 *     - signIn(): triggers interactive OAuth popup and refetches events
 */

// Google OAuth Client ID (configure in Google Cloud Console → OAuth client (Web))
const CLIENT_ID = "732897444427-h0p9benc1pvhg587fsmjjkco85kh4dkn.apps.googleusercontent.com";
// Read-only Calendar scope (no write access)
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

/**
 * Dynamically load an external <script> and resolve when it's ready.
 * Used to load the GIS SDK: https://accounts.google.com/gsi/client
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // If tag already present, don't add a second tag
    if (document.querySelector(`script[src="${src}"]`)) return resolve();

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();      // script loaded successfully
    s.onerror = (e) => reject(new Error('Failed to load ' + src));  // network/blocked/etc.
    document.head.appendChild(s);
  });
}

export default function useGoogleCalendarEvents({ maxResults = 10, timeMin = new Date() } = {}) {
    // UI state managed by the hook
    const [events, setEvents] = useState([]);   // fetched event list
    const [loading, setLoading] = useState(true);   // true while auth/fetch in flight
    const [error, setError] = useState(null);   // human-readable error message
    const [needsAuth, setNeedsAuth] = useState(false);  // show "Sign in" if silent auth fails

// Where we cache the access token in this browser tab
    const TOKEN_KEY = 'gcal_access_token';

    useEffect(() => {
        let mounted = true; // Prevent setState after unmount (avoids React warnings)

        // One-time initialization:
        // 1) load GIS script
        // 2) try cached token → else try silent auth
        // 3) fetch events
        async function init() {
            try {
            // 1) Ensure GIS SDK is loaded (defines window.google.accounts.oauth2)
            await loadScript('https://accounts.google.com/gsi/client');

            // Check if library is available
            if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
                throw new Error('Google Identity Services not available');
            }

            // Create a token client for requesting OAuth access tokens
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
            });

        // Wrap token requests in a Promise for async/await use
        const requestToken = (opts = {}) =>
            new Promise((resolve, reject) => {
            try {
                tokenClient.callback = (resp) => {
                    if (resp && resp.access_token) resolve(resp); // success path
                    else reject(resp || new Error('No token received'));
                };
                tokenClient.requestAccessToken(opts); // triggers silent or interactive flow
            } catch (e) {
                reject(e);
            }
            });

        // 2) Try to reuse a cached token if not expired (sessionStorage = per-tab)
        const saved = sessionStorage.getItem(TOKEN_KEY);
        let tokenResp = null;
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.access_token && parsed.expires_at && parsed.expires_at > Date.now()) {
                    tokenResp = parsed; // reuse existing token
                }
            } catch (e) {
                /* ignore parse errors */
            }
        }

        // If we don't have a valid token yet, attempt a silent token request (no popup).
        // This works if the user previously consented on this origin.
        if (!tokenResp) {
            try {
                tokenResp = await requestToken({ prompt: 'none' });
            } catch (e) {
                // Silent auth failed (first visit, blocked cookies, no prior consent, etc.)
                // Tell the UI to show the "Sign in" button and bail out early.
                setNeedsAuth(true);
                setLoading(false);
                return;
            }
        }

        // 3) With a token, call the Calendar API for upcoming events
        if (!mounted) return;
        const accessToken = tokenResp.access_token;
        if (!accessToken) throw new Error('No access token returned');

        // Build query parameters (expand recurring instances; sort by start time)
        const params = new URLSearchParams({
            timeMin: new Date(timeMin).toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: String(maxResults),
        });

        // Fetch events from the Google Calendar API
        const res = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Bubble up API errors with body text for easier debugging
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Calendar API error ${res.status}: ${body}`);
        }

        // Update UI with events (or [] if none)
        const data = await res.json();
        if (!mounted) return;
        setEvents(data.items || []);

        // Refresh cache with (approximate) expiry time so future runs can reuse
        try {
            const expiresIn = tokenResp.expires_in || tokenResp.expiresAt || null;
            const expiresAt = expiresIn ? Date.now() + (expiresIn * 1000) : Date.now() + (60 * 60 * 1000);
            sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
                access_token: accessToken,
                expires_at: expiresAt
            }));
        } catch (e) {
            /* ignore storage errors */
        }
      } catch (e) {
        if (!mounted) return;
        // Normalize error into readable string
        let msg;
        try {
            if (e instanceof Error) msg = e.message;
            else if (typeof e === 'string') msg = e;
            else msg = JSON.stringify(e);
        } catch (err) {
            msg = String(e);
        }
        setError(msg || 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // start init on mount (and when inputs change)
    init();

    // Cleanup on unmount — stops any late setState
    return () => {
        mounted = false;
    };
  }, [maxResults, timeMin]);    // re-fetch if query window/limit changes

  /**
     * Trigger an interactive sign-in (popup). Use when needsAuth === true.
     * On success, caches the token and immediately refetches events.
     */
  const signIn = async () => {
    // setLoading(true);
    // setError(null);
    try {
        // Ensure the GIS SDK is available (in case user clicked quickly)
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
            await loadScript('https://accounts.google.com/gsi/client');
        }

        // Interactive token client (allows Google UI)
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES
        });

        // Same Promise adapter as above
        const requestToken = (opts = {}) =>
            new Promise((resolve, reject) => {
                try {
                    tokenClient.callback = (resp) => {
                    if (resp && resp.access_token) resolve(resp);
                    else reject(resp || new Error('No token'));
                };
                tokenClient.requestAccessToken(opts);   // with prompt → popup allowed
            } catch (e) {
                reject(e);
            }
        });

        // Allow prompting by passing empty prompt string
        const tokenResp = await requestToken({ prompt: '' });
        if (!tokenResp || !tokenResp.access_token) throw new Error('Sign-in failed');

        // Persist token so subsequent API calls (this tab) don't reprompt
        const expiresIn = tokenResp.expires_in || null;
        const expiresAt = expiresIn ? Date.now() + (expiresIn * 1000) : Date.now() + (60*60*1000);
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
            access_token: tokenResp.access_token,
            expires_at: expiresAt
        }));

        setNeedsAuth(false);
        setLoading(true);

        // Immediately fetch events again
        try {
        const params = new URLSearchParams({
            timeMin: new Date(timeMin).toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: String(maxResults)
        });

        const res = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
            { headers: { Authorization: `Bearer ${tokenResp.access_token}` } }
        );
        if (!res.ok) throw new Error('Calendar fetch failed: ' + res.status);

        const data = await res.json();
        setEvents(data.items || []);
        } catch (e) {
            setError(e.message || String(e));
        }
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    };

    // Expose hook values & actions to the component using it
    return { events, loading, error, needsAuth, signIn };
}
