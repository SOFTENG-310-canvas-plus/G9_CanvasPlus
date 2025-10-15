import React, { useState, useEffect } from 'react';
import { supabase } from '../auth/supabaseClient';

export default function NotesWidget() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchNotes(user.id);
      }
    };
    checkUser();
  }, []);

  const fetchNotes = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("Notes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notes:", error);
      } else {
        setNotes(data || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const saveNote = async () => {
    if (!newNote.trim() || !user || saving) return;

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("Notes")
        .insert([{
          user_id: user.id,
          content: newNote.trim()
        }])
        .select();

      if (error) {
        console.error("Error saving note:", error);
      } else {
        setNotes([data[0], ...notes]);
        setNewNote("");
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      const { error } = await supabase
        .from("Notes")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting note:", error);
      } else {
        setNotes(notes.filter(note => note.id !== id));
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      saveNote();
    }
  };

  if (!user) {
    return (
      <div style={{ padding: 'var(--space-4)' }}>
        <label style={{ 
          display: "block", 
          fontSize: 'var(--font-xs)', 
          opacity: 0.7, 
          marginBottom: 'var(--space-2)' 
        }}>
          Quick note
        </label>
        <div style={{ 
          color: "white", 
          opacity: 0.7, 
          padding: 'var(--space-3)',
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          fontSize: 'var(--font-sm)',
        }}>
          Please log in to use notes
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-2)' }}>
      <label style={{ 
        display: "block", 
        fontSize: 'var(--font-xs)', 
        opacity: 0.7, 
        marginBottom: 'var(--space-2)' 
      }}>
        Quick note
      </label>
      
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={6}
        placeholder="Type here… (Ctrl+Enter to save)"
        disabled={saving}
        style={{
          width: "100%",
          padding: 'var(--space-3)',
          fontSize: 'var(--font-sm)',
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          resize: "vertical",
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color 0.2s, background 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.25)";
          e.target.style.background = "rgba(255,255,255,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.15)";
          e.target.style.background = "rgba(255,255,255,0.08)";
        }}
      />
      
      <button
        onClick={saveNote}
        disabled={!newNote.trim() || saving}
        style={{
          marginTop: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          borderRadius: 6,
          border: "none",
          background: saving ? "#555" : "#6366f1",
          color: "#fff",
          cursor: saving || !newNote.trim() ? "not-allowed" : "pointer",
          opacity: saving || !newNote.trim() ? 0.5 : 1,
          transition: "all 0.2s",
          width: "100%",
          minHeight: 'var(--touch-target-min)',
        }}
      >
        {saving ? "Saving..." : "Save Note"}
      </button>

      {notes.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <h4 style={{ 
            fontSize: 'var(--font-sm)', 
            opacity: 0.8, 
            marginBottom: 'var(--space-2)',
            color: '#fff',
          }}>
            Recent Notes
          </h4>
          <ul style={{ 
            listStyle: "none", 
            margin: 0, 
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}>
            {notes.map(note => (
              <li
                key={note.id}
                style={{
                  padding: 'var(--space-3)',
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 'var(--font-sm)',
                  color: '#fff',
                  position: 'relative',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                <div style={{ 
                  marginBottom: 'var(--space-2)',
                  paddingRight: 'var(--space-8)',
                  lineHeight: 'var(--leading-relaxed)',
                }}>
                  {note.content}
                </div>
                <div style={{ 
                  fontSize: 'var(--font-xs)', 
                  opacity: 0.6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>
                    {new Date(note.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: 16,
                      padding: 'var(--space-1)',
                      borderRadius: 4,
                      transition: "background 0.2s",
                      minWidth: 'var(--touch-target-min)',
                      minHeight: 'var(--touch-target-min)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                    title="Delete note"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}