import React from 'react';
import { 
  Pin, 
  Layers, 
  HelpCircle, 
  Bot, 
  Trash2, 
  Clock, 
  Sparkles,
  Plus,
  BookOpen,
  ArrowRight,
  Upload
} from 'lucide-react';

export default function NoteList({ 
  notes = [], 
  onSelectNote, 
  onDeleteNote, 
  onOpenFlashcards, 
  onOpenQuiz, 
  onOpenTutor,
  onNewNote,
  onOpenUpload,
  selectedNoteId 
}) {
  if (notes.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        textAlign: 'center',
        padding: '40px 20px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-strong)',
        margin: '24px'
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <BookOpen size={28} color="var(--accent-violet)" />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No Study Notes Found</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 420, fontSize: '0.9rem', marginBottom: 20 }}>
          Create your first smart note or upload a lecture PDF to unlock AI study summaries, flashcards, and quizzes.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={onNewNote}>
            <Plus size={16} /> Create Note
          </button>
          <button className="btn btn-secondary" onClick={onOpenUpload}>
            <Upload size={16} /> Upload PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
      gap: 18,
      padding: '24px'
    }}>
      {notes.map((note) => {
        const isSelected = selectedNoteId === note.id;
        const formattedDate = new Date(note.updated_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric'
        });

        return (
          <div
            key={note.id}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: isSelected 
                ? '1px solid var(--accent-violet)' 
                : note.is_pinned 
                  ? '1px solid rgba(245, 158, 11, 0.35)' 
                  : '1px solid var(--border-subtle)',
              background: isSelected 
                ? 'rgba(22, 28, 44, 0.95)' 
                : 'var(--bg-card)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={() => onSelectNote(note)}
          >
            {/* Top Bar: Subject & Pin */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge badge-subject">
                  {note.subject || 'General'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {note.is_pinned && (
                    <span title="Pinned Note" style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center' }}>
                      <Pin size={14} fill="var(--accent-amber)" />
                    </span>
                  )}
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {formattedDate}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '1.08rem',
                fontWeight: 700,
                lineHeight: 1.4,
                marginBottom: 8,
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
              }}>
                {note.title}
              </h3>

              {/* Snippet / Summary */}
              <p style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: 14
              }}>
                {note.summary ? note.summary : note.content.replace(/[#*`_]/g, '')}
              </p>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                  {note.tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="badge badge-tag" style={{ fontSize: '0.7rem' }}>
                      #{t}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="badge badge-tag" style={{ fontSize: '0.7rem' }}>
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions & Metrics */}
            <div style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 12,
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {/* Feature Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <span title="Flashcards in this note" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Layers size={13} color="var(--accent-violet)" />
                  {note.flashcard_count || 0}
                </span>
                <span title="Quizzes taken" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <HelpCircle size={13} color="var(--accent-cyan)" />
                  {note.quiz_count || 0}
                </span>
              </div>

              {/* Quick Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-icon"
                  title="Study Flashcards"
                  onClick={() => onOpenFlashcards(note)}
                >
                  <Layers size={15} color="var(--accent-violet)" />
                </button>
                <button
                  className="btn-icon"
                  title="Take AI Quiz"
                  onClick={() => onOpenQuiz(note)}
                >
                  <HelpCircle size={15} color="var(--accent-cyan)" />
                </button>
                <button
                  className="btn-icon"
                  title="Ask AI Tutor"
                  onClick={() => onOpenTutor(note)}
                >
                  <Bot size={15} color="#c4b5fd" />
                </button>
                <button
                  className="btn-icon"
                  title="Delete Note"
                  onClick={() => onDeleteNote(note.id)}
                  style={{ color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
