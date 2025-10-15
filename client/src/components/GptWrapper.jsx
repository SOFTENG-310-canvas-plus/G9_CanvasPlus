import React, { useState, useRef, useEffect } from "react";
import "../css/GptWrapper.css";

export default function GptWrapper() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="gpt-wrapper">
      <div className="gpt-messages">
        {messages.length === 0 ? (
          <div className="gpt-empty-state">
            <div className="gpt-empty-icon">💬</div>
            <div className="gpt-empty-text">Start a conversation</div>
            <div className="gpt-empty-subtext">Ask me anything!</div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`gpt-message ${
                  msg.role === "user" ? "gpt-message-user" : "gpt-message-assistant"
                }`}
              >
                <div className="gpt-message-avatar">
                  {msg.role === "user" ? "👤" : "🤖"}
                </div>
                <div className="gpt-message-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="gpt-message gpt-message-assistant">
                <div className="gpt-message-avatar">🤖</div>
                <div className="gpt-message-content gpt-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="gpt-input-form">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          disabled={loading}
          rows={1}
          className="gpt-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="gpt-submit"
          aria-label="Send message"
        >
          {loading ? "⏳" : "📤"}
        </button>
      </form>
    </div>
  );
}
