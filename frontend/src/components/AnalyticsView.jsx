import React from 'react';
import { 
  BarChart3, 
  Award, 
  Layers, 
  FileText, 
  HelpCircle, 
  Bot, 
  CheckCircle2, 
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export default function AnalyticsView({ stats = {} }) {
  const cards = [
    {
      title: 'Total Smart Notes',
      value: stats.total_notes || 0,
      icon: FileText,
      color: 'var(--accent-violet)',
      bg: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Flashcards in Decks',
      value: stats.total_flashcards || 0,
      subtitle: `${stats.mastered_flashcards || 0} mastered`,
      icon: Layers,
      color: 'var(--accent-cyan)',
      bg: 'rgba(6, 182, 212, 0.1)'
    },
    {
      title: 'Flashcard Mastery Rate',
      value: `${stats.mastery_rate || 0}%`,
      icon: Award,
      color: 'var(--accent-emerald)',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Practice Quizzes Completed',
      value: stats.total_quizzes || 0,
      subtitle: `Avg Score: ${stats.average_quiz_score || 0}%`,
      icon: HelpCircle,
      color: 'var(--accent-amber)',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'AI Tutor Interactions',
      value: stats.total_chats || 0,
      icon: Bot,
      color: '#c4b5fd',
      bg: 'rgba(196, 181, 253, 0.1)'
    }
  ];

  const subjects = Object.entries(stats.subject_breakdown || {});

  return (
    <div style={{
      maxWidth: 960,
      margin: '0 auto',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 28
    }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={24} color="var(--accent-cyan)" /> Study Mastery Analytics
        </h2>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Track your retention metrics, active recall progress, and subject coverage.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 16
      }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="glass-panel"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.title}</span>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--radius-sm)',
                  background: c.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} color={c.color} />
                </div>
              </div>

              <div>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                  {c.value}
                </span>
                {c.subtitle && (
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {c.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subject Distribution & Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Subject Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Notes by Subject</h3>
          {subjects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No notes yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {subjects.map(([subj, count], idx) => {
                const pct = stats.total_notes ? Math.round((count / stats.total_notes) * 100) : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{subj}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{count} notes ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(255, 255, 255, 0.08)' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, var(--accent-violet), var(--accent-cyan))'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Study Science Best Practices */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={18} color="var(--accent-violet)" /> Cognitive Retention Protocol
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none' }}>
            <li style={{ display: 'flex', gap: 10, fontSize: '0.86rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 3 }} />
              <span><strong>Active Recall:</strong> Flipping flashcards before looking at the answer increases memory retrieval strength by 50%.</span>
            </li>
            <li style={{ display: 'flex', gap: 10, fontSize: '0.86rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 3 }} />
              <span><strong>Spaced Repetition:</strong> Review cards marked "Review Again" within 24 hours, then again in 3 days.</span>
            </li>
            <li style={{ display: 'flex', gap: 10, fontSize: '0.86rem', color: '#cbd5e1' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 3 }} />
              <span><strong>Formative Testing:</strong> Take the AI Practice Quiz immediately after reading your smart notes to lock in concepts.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
