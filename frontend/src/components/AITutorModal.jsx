import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Trash2, 
  Loader2, 
  User, 
  Lightbulb, 
  HelpCircle,
  Brain
} from 'lucide-react';

export default function AITutorModal({ 
  isOpen, 
  onClose, 
  note, 
  onSendMessage, 
  onGetHistory, 
  onClearHistory 
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    "Explain the core concept in simple terms",
    "Give me a catchy mnemonic to memorize this",
    "What are common exam mistakes on this topic?",
    "Give me a real-world analogy"
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && note?.id) {
      loadHistory(note.id);
    }
  }, [isOpen, note?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async (noteId) => {
    try {
      const history = await onGetHistory(noteId);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: `Hello! I'm your AI Academic Tutor. I've reviewed your note on **${note?.title || 'this topic'}**. Ask me anything—from simplified analogies to exam tricks and mnemonics!`
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await onSendMessage(note?.id, query, messages);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedPrompts(res.suggested_questions);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${err.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (note?.id) {
      await onClearHistory(note.id);
      setMessages([
        {
          role: 'assistant',
          content: `Chat history cleared. How can I help you master **${note?.title}** today?`
        }
      ]);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 720,
        height: '85vh',
        maxHeight: 780,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
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
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                AI Academic Tutor
                <span className="badge badge-subject" style={{ fontSize: '0.68rem' }}>
                  Athena AI
                </span>
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Studying: {note?.title || 'General Notes'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn-icon"
              title="Clear Conversation"
              onClick={handleClear}
            >
              <Trash2 size={16} />
            </button>
            <button
              className="btn-icon"
              title="Close"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isUser ? 'var(--accent-violet)' : 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isUser ? <User size={16} color="#ffffff" /> : <Bot size={16} color="var(--accent-cyan)" />}
                </div>

                {/* Message Bubble */}
                <div style={{
                  maxWidth: '82%',
                  padding: '12px 16px',
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: isUser 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' 
                    : 'var(--bg-surface-elevated)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--bg-surface-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={16} color="var(--accent-cyan)" />
              </div>
              <div style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <Loader2 size={14} className="animate-spin" color="var(--accent-violet)" />
                <span>Athena is analyzing your notes and drafting an explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div style={{
          padding: '8px 16px',
          background: 'rgba(12, 16, 26, 0.4)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {suggestedPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              style={{
                padding: '5px 11px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#cbd5e1',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-violet)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <Sparkles size={11} color="var(--accent-violet)" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 20px',
          background: 'var(--bg-surface-elevated)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <input
            type="text"
            className="input-field"
            placeholder="Ask a question or request a study trick..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            style={{ fontSize: '0.9rem' }}
          />

          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={isLoading || !inputMessage.trim()}
            style={{ padding: '10px 16px' }}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
