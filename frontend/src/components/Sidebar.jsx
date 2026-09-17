import React from 'react';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  Bot, 
  BarChart3, 
  Folder, 
  Tag as TagIcon,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  subjects = [], 
  selectedSubject, 
  setSelectedSubject,
  tags = [],
  selectedTag,
  setSelectedTag,
  stats = {}
}) {
  const navItems = [
    { id: 'notes', label: 'All Smart Notes', icon: FileText, badge: stats.total_notes },
    { id: 'flashcards', label: 'Flashcards Deck', icon: Layers, badge: stats.total_flashcards },
    { id: 'quiz', label: 'Quiz Arena', icon: HelpCircle, badge: stats.total_quizzes },
    { id: 'tutor', label: 'AI Study Tutor', icon: Bot, highlight: true },
    { id: 'analytics', label: 'Study Analytics', icon: BarChart3 },
  ];

  return (
    <aside style={{
      width: 260,
      minWidth: 260,
      borderRight: '1px solid var(--border-subtle)',
      background: 'rgba(12, 16, 26, 0.65)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 65px)',
      position: 'sticky',
      top: 65,
      padding: '20px 14px',
      overflowY: 'auto'
    }}>
      {/* Primary Navigation Views */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
        <div style={{ 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          padding: '0 8px 8px' 
        }}>
          Study Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'var(--transition)',
                width: '100%',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-surface)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon 
                  size={17} 
                  color={isActive ? 'var(--accent-violet)' : item.highlight ? 'var(--accent-cyan)' : 'var(--text-muted)'} 
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: isActive ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#c4b5fd' : 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subject Filter */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          fontSize: '0.72rem', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.08em',
          padding: '0 8px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Subjects</span>
          {selectedSubject && (
            <button 
              onClick={() => setSelectedSubject(null)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', cursor: 'pointer' }}
            >
              Reset
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <button
            onClick={() => setSelectedSubject(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              background: !selectedSubject ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              color: !selectedSubject ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Folder size={14} color="var(--accent-amber)" />
            <span>All Subjects</span>
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub === selectedSubject ? null : sub)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                background: selectedSubject === sub ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: selectedSubject === sub ? '#c4b5fd' : 'var(--text-secondary)',
                border: 'none',
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Folder size={14} color={selectedSubject === sub ? 'var(--accent-violet)' : 'var(--text-muted)'} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Cloud */}
      {tags.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ 
            fontSize: '0.72rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            padding: '0 8px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Tags</span>
            {selectedTag && (
              <button 
                onClick={() => setSelectedTag(null)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 4px' }}>
            {tags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`badge ${selectedTag === tag ? 'badge-subject' : 'badge-tag'}`}
                style={{ cursor: 'pointer', border: 'none', fontSize: '0.72rem' }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Study Progress Card */}
      <div style={{
        marginTop: 'auto',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={15} color="var(--accent-amber)" /> Mastery Rate
          </span>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {stats.mastery_rate || 0}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: 6,
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, stats.mastery_rate || 0))}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #8b5cf6, #10b981)',
            borderRadius: 999,
            transition: 'width 0.5s ease'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>{stats.mastered_flashcards || 0} cards mastered</span>
          <span>{stats.total_flashcards || 0} total</span>
        </div>
      </div>
    </aside>
  );
}
