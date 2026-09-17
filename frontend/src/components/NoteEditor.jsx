import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Bot, 
  Eye, 
  Edit3, 
  Pin, 
  Tag, 
  Check, 
  Loader2,
  X,
  BookOpen,
  Lightbulb,
  FileDown
} from 'lucide-react';

export default function NoteEditor({ 
  note, 
  onSave, 
  onClose, 
  onSummarize, 
  onGenerateFlashcards, 
  onGenerateQuiz, 
  onOpenTutor 
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [subject, setSubject] = useState(note?.subject || 'General');
  const [tagsInput, setTagsInput] = useState(note?.tags ? note.tags.join(', ') : '');
  const [content, setContent] = useState(note?.content || '');
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview', 'summary'
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setSubject(note.subject || 'General');
      setTagsInput(note.tags ? note.tags.join(', ') : '');
      setContent(note.content || '');
      setIsPinned(note.is_pinned || false);
    }
  }, [note]);

  const handleSave = async () => {
    setIsSaving(true);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: title.trim() || 'Untitled Study Note',
      subject: subject.trim() || 'General',
      tags: parsedTags,
      content: content,
      is_pinned: isPinned,
      summary: note?.summary,
      key_takeaways: note?.key_takeaways || []
    };

    try {
      await onSave(note?.id, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      alert(`Error saving note: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiSummarize = async () => {
    setIsAiLoading(true);
    try {
      await onSummarize(note?.id, content);
      setActiveTab('summary');
    } catch (err) {
      alert(`Failed to summarize: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Simple clean markdown parser to avoid huge heavy external dependencies
  const renderMarkdown = (text) => {
    if (!text) return '<p style="color: var(--text-muted);">No content to preview.</p>';
    
    // Convert headers
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Unordered lists
      .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
      // Line breaks into paragraphs
      .replace(/\n\n+/g, '</p><p>');

    return `<p>${html}</p>`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 65px)',
      background: 'var(--bg-base)',
      overflow: 'hidden'
    }}>
      {/* Top Header Controls */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Title and Pin */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setIsPinned(!isPinned)}
            style={{
              background: isPinned ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              border: '1px solid ' + (isPinned ? 'var(--accent-amber)' : 'var(--border-subtle)'),
              borderRadius: 'var(--radius-sm)',
              padding: 8,
              color: isPinned ? 'var(--accent-amber)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isPinned ? 'Unpin Note' : 'Pin Note to Top'}
          >
            <Pin size={16} fill={isPinned ? 'var(--accent-amber)' : 'none'} />
          </button>

          <input
            type="text"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Note Title..."
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              background: 'transparent',
              border: '1px solid transparent',
              padding: '6px 10px',
              fontFamily: 'var(--font-heading)'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-violet)')}
            onBlur={(e) => (e.target.style.borderColor = 'transparent')}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={16} color="var(--accent-emerald)" />
            ) : (
              <Save size={16} />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save Note'}</span>
          </button>

          <button
            className="btn-icon"
            onClick={onClose}
            title="Close Editor"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Metadata Bar (Subject & Tags) */}
      <div style={{
        padding: '10px 24px',
        background: 'rgba(17, 22, 34, 0.5)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Subject:</span>
          <input
            type="text"
            className="input-field"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Computer Science"
            style={{ width: 170, padding: '5px 10px', fontSize: '0.82rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <Tag size={14} color="var(--text-muted)" />
          <input
            type="text"
            className="input-field"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags separated by commas (e.g. AI, Calculus, Week 2)"
            style={{ padding: '5px 10px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* AI Superpowers Toolbar */}
      <div style={{
        padding: '10px 24px',
        background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.1) 100%)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#c4b5fd',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Sparkles size={14} color="var(--accent-violet)" /> AI STUDY ACCELERATOR:
          </span>

          <button
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={handleAiSummarize}
            disabled={isAiLoading || !content.trim()}
          >
            {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
            <span>Summarize & Takeaways</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onGenerateFlashcards(note?.id, content)}
            disabled={!content.trim()}
          >
            <Layers size={14} color="var(--accent-violet)" />
            <span>Generate Flashcards</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onGenerateQuiz(note?.id, content)}
            disabled={!content.trim()}
          >
            <HelpCircle size={14} color="var(--accent-cyan)" />
            <span>Practice Quiz</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onOpenTutor(note)}
          >
            <Bot size={14} color="#a78bfa" />
            <span>Ask Tutor</span>
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'edit' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: activeTab === 'edit' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Edit3 size={13} /> Edit
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'preview' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: activeTab === 'preview' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Eye size={13} /> Preview
          </button>

          {note?.summary && (
            <button
              onClick={() => setActiveTab('summary')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'summary' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: activeTab === 'summary' ? 'var(--accent-violet)' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Lightbulb size={13} /> AI Summary
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {activeTab === 'edit' && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your study notes here using Markdown...&#10;&#10;# Chapter 1: Introduction&#10;- Core definitions&#10;- Important formulas&#10;&#10;Click 'Summarize & Takeaways' or 'Generate Flashcards' above to let AI synthesize your notes!"
            style={{
              width: '100%',
              height: '100%',
              minHeight: 450,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.94rem',
              lineHeight: 1.7,
              resize: 'none'
            }}
          />
        )}

        {activeTab === 'preview' && (
          <div 
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} 
            style={{ maxWidth: 900, margin: '0 auto' }}
          />
        )}

        {activeTab === 'summary' && note?.summary && (
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Executive Summary Card */}
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-violet)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.15rem', marginBottom: 12 }}>
                <Sparkles size={18} color="var(--accent-violet)" /> AI Executive Summary
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {note.summary}
              </p>
            </div>

            {/* Key Takeaways */}
            {note.key_takeaways && note.key_takeaways.length > 0 && (
              <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-cyan)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.15rem', marginBottom: 16 }}>
                  <Lightbulb size={18} color="var(--accent-cyan)" /> High-Yield Key Takeaways
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {note.key_takeaways.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: 'var(--accent-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
