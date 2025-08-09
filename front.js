import React, { useState } from 'react';

const SEVERITY_COLORS = {
  mild: '#28a745',         // green
  'mild-moderate': '#28a745',
  moderate: '#ffc107',     // orange
  critical: '#dc3545',     // red
  unknown: '#6c757d'       // gray
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm MediAid, your caring health companion. Please describe your symptoms.",
      severity: 'unknown'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: input })
      });

      const data = await res.json();

      let botText = data.reassurance || data.message || "Sorry, I didn't understand.";
      if (data.first_aid && data.first_aid.length > 0) {
        botText += '\n\nFirst Aid Steps:\n' + data.first_aid.map((s, i) => `${i+1}. ${s}`).join('\n');
      }
      if (data.classification === 'critical') {
        botText += "\n\n🚨 If you feel it's an emergency, please call emergency services immediately.";
      }

      const botMsg = {
        from: 'bot',
        text: botText,
        severity: data.classification || 'unknown'
      };

      setMessages((msgs) => [...msgs, botMsg]);
      setInput('');

    } catch (err) {
      setMessages((msgs) => [...msgs, { from: 'bot', text: "Error communicating with server. Please try again." }]);
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>MediAid</h1>

      <div style={{
        border: '1px solid #ddd', borderRadius: 8, padding: 16, height: '60vh',
        overflowY: 'auto', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.from === 'user' ? '#0d6efd' : SEVERITY_COLORS[msg.severity] || '#eee',
              color: msg.from === 'user' ? 'white' : 'black',
              borderRadius: 16,
              padding: '8px 12px',
              marginBottom: 8,
              whiteSpace: 'pre-wrap',
              maxWidth: '80%'
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div style={{ fontStyle: 'italic', color: '#666' }}>MediAid is typing...</div>}
      </div>

      <textarea
        rows={2}
        value={input}
        disabled={loading}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe your symptoms..."
        style={{
          width: '100%',
          marginTop: 12,
          padding: 8,
          fontSize: 16,
          borderRadius: 8,
          border: '1px solid #ccc',
          resize: 'none'
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          marginTop: 8, width: '100%', padding: 12,
          backgroundColor: '#0d6efd',
          color: 'white',
          fontSize: 16,
          border: 'none',
          borderRadius: 8,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
