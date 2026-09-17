import React from 'react';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Code2, 
  Sparkles, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Navbar({ 
  onNewNote, 
  onOpenUpload, 
  onOpenThunder, 
  searchQuery, 
  setSearchQuery,
  health
}) {
  const isHealthy = health?.status === 'healthy';
  const aiMode = health?.ai_provider?.mode || 'Ready';

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: 1600,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)'
          }}>
            <BookOpen size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                SmartNotes <span style={{ color: 'var(--accent-violet)' }}>AI</span>
              </h1>
              <span className="badge" style={{
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#c4b5fd',
                fontSize: '0.68rem',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                <Sparkles size={10} /> STUDY ASSISTANT
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              AI Synthesis • Flashcards • Quizzes • MongoDB
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ flex: 1, maxWidth: 440, position: 'relative' }}>
          <Search 
            size={16} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input
            type="text"
            className="input-field"
            placeholder="Search notes, tags, or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38, fontSize: '0.88rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Buttons & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status Indicator */}
          <div 
            title={`Database: ${health?.database?.connected ? 'Connected' : 'Disconnected'} | AI: ${aiMode}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}
          >
            {isHealthy ? (
              <CheckCircle2 size={13} color="var(--accent-emerald)" />
            ) : (
              <AlertCircle size={13} color="var(--accent-amber)" />
            )}
            <span>{aiMode.includes('Live') ? 'Gemini Live' : 'AI Assistant'}</span>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenThunder}
            title="View Thunder Client API Collection & Instructions"
          >
            <Code2 size={16} color="var(--accent-cyan)" />
            <span>Thunder Client</span>
          </button>

          <button 
            className="btn btn-secondary" 
            onClick={onOpenUpload}
            title="Upload PDF or Text Study Material"
          >
            <Upload size={16} color="#c4b5fd" />
            <span>Import PDF</span>
          </button>

          <button 
            className="btn btn-primary" 
            onClick={onNewNote}
          >
            <Plus size={16} />
            <span>New Note</span>
          </button>
        </div>
      </div>
    </header>
  );
}
