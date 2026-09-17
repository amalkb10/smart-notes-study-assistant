import React, { useState } from 'react';
import { 
  Code2, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  FolderDown, 
  Send,
  Terminal
} from 'lucide-react';

export default function ThunderClientGuide({ isOpen, onClose }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const endpoints = [
    {
      method: 'GET',
      path: '/api/health',
      desc: 'System health & MongoDB connection status',
      curl: 'curl http://localhost:8000/api/health'
    },
    {
      method: 'GET',
      path: '/api/notes',
      desc: 'List notes with optional search & subject filter',
      curl: 'curl "http://localhost:8000/api/notes?search=neural&subject=Computer%20Science"'
    },
    {
      method: 'POST',
      path: '/api/notes',
      desc: 'Create a new smart note with markdown content',
      curl: `curl -X POST http://localhost:8000/api/notes \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Quantum Superposition","subject":"Physics","content":"# Quantum Superposition\\nQubits exist in linear combinations."}'`
    },
    {
      method: 'POST',
      path: '/api/ai/summarize',
      desc: 'AI summarization & high-yield key takeaways extraction',
      curl: `curl -X POST http://localhost:8000/api/ai/summarize \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Supervised learning uses labeled datasets. Unsupervised learning identifies patterns without labels."}'`
    },
    {
      method: 'POST',
      path: '/api/ai/flashcards',
      desc: 'Generate active recall flashcards from study text',
      curl: `curl -X POST http://localhost:8000/api/ai/flashcards \\
  -H "Content-Type: application/json" \\
  -d '{"content":"Gradient descent updates theta with learning rate alpha.","count":3}'`
    },
    {
      method: 'POST',
      path: '/api/ai/quiz',
      desc: 'Generate self-grading multiple choice practice exams',
      curl: `curl -X POST http://localhost:8000/api/ai/quiz \\
  -H "Content-Type: application/json" \\
  -d '{"content":"BFS uses a FIFO queue. DFS uses a LIFO stack.","num_questions":3}'`
    },
    {
      method: 'POST',
      path: '/api/chat',
      desc: 'Ask contextual AI Study Tutor questions with memory tricks',
      curl: `curl -X POST http://localhost:8000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Give me a mnemonic to remember BFS vs DFS"}'`
    },
    {
      method: 'GET',
      path: '/api/stats',
      desc: 'Study analytics, mastery rate, and subject distributions',
      curl: 'curl http://localhost:8000/api/stats'
    }
  ];

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 820,
        height: '85vh',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Thunder Client API Testing Guide</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Pre-configured collection & environment for VS Code Thunder Client
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Import Steps */}
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-cyan)' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderDown size={18} color="var(--accent-cyan)" /> How to Import into Thunder Client (VS Code)
            </h4>
            <ol style={{ marginLeft: 20, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.8 }}>
              <li>Install the <strong>Thunder Client</strong> extension in VS Code.</li>
              <li>Click the Thunder Client lightning icon in the VS Code sidebar.</li>
              <li>Under <strong>Collections</strong>, click the <strong>...</strong> menu &gt; <strong>Import</strong>.</li>
              <li>
                Select: <code style={{ color: 'var(--accent-cyan)' }}>thunderclient/thunder-collection_smartnotes.json</code>
              </li>
              <li>
                Under <strong>Env</strong>, import: <code style={{ color: 'var(--accent-cyan)' }}>thunderclient/thunder-environment_smartnotes.json</code>
              </li>
              <li>Select the <strong>Smart Notes Local</strong> environment and run requests!</li>
            </ol>
          </div>

          {/* Endpoints Reference */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={18} color="var(--accent-violet)" /> Available API Endpoints & cURL
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {endpoints.map((ep, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="badge" style={{
                        background: ep.method === 'GET' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                        color: ep.method === 'GET' ? '#6ee7b7' : '#c4b5fd',
                        border: `1px solid ${ep.method === 'GET' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700
                      }}>
                        {ep.method}
                      </span>
                      <code style={{ fontSize: '0.88rem', color: '#f1f5f9' }}>{ep.path}</code>
                    </div>

                    <button
                      className="btn-icon"
                      onClick={() => handleCopy(ep.curl, idx)}
                      title="Copy cURL Command"
                      style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {copiedIdx === idx ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy cURL'}</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {ep.desc}
                  </p>

                  <pre style={{
                    background: '#0a0d14',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    overflowX: 'auto',
                    margin: 0,
                    color: '#94a3b8'
                  }}>
                    <code>{ep.curl}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
