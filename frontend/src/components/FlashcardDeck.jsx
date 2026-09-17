import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  Plus, 
  HelpCircle, 
  Trash2,
  Trophy,
  Shuffle
} from 'lucide-react';

export default function FlashcardDeck({ 
  cards = [], 
  onReviewCard, 
  onDeleteCard, 
  onGenerateMore, 
  activeNote 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'unmastered', 'mastered'
  const [cardDeck, setCardDeck] = useState(cards);

  useEffect(() => {
    let filtered = [...cards];
    if (filterMode === 'unmastered') {
      filtered = filtered.filter((c) => !c.mastered);
    } else if (filterMode === 'mastered') {
      filtered = filtered.filter((c) => c.mastered);
    }
    setCardDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards, filterMode]);

  const currentCard = cardDeck[currentIndex];
  const total = cardDeck.length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMarkMastered = async (status) => {
    if (!currentCard) return;
    try {
      await onReviewCard(currentCard.id, status);
      if (status) {
        // Trigger subtle confetti on mastering a card
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#06B6D4', '#8B5CF6']
        });
      }
      handleNext();
    } catch (err) {
      console.error(err);
    }
  };

  const shuffleDeck = () => {
    const shuffled = [...cardDeck].sort(() => Math.random() - 0.5);
    setCardDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (cards.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 450,
        textAlign: 'center',
        padding: '40px 20px',
        margin: '24px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-strong)'
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}>
          <Layers size={28} color="var(--accent-violet)" />
        </div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>No Flashcards in this Deck</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 440, fontSize: '0.9rem', marginBottom: 24 }}>
          Generate AI-powered active recall flashcards from your study notes to practice spaced repetition!
        </p>
        <button 
          className="btn btn-primary"
          onClick={() => onGenerateMore(activeNote?.id, activeNote?.content)}
        >
          <Sparkles size={16} /> Generate Flashcards with AI
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 800,
      margin: '0 auto',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24
    }}>
      {/* Deck Controls Header */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={22} color="var(--accent-violet)" /> 
            {activeNote ? activeNote.title : 'Study Flashcards'}
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Card {total > 0 ? currentIndex + 1 : 0} of {total} • Click card to flip
          </span>
        </div>

        {/* Filter Pills & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex' }}>
            <button
              onClick={() => setFilterMode('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: filterMode === 'all' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: filterMode === 'all' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              All ({cards.length})
            </button>
            <button
              onClick={() => setFilterMode('unmastered')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: filterMode === 'unmastered' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: filterMode === 'unmastered' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              To Learn ({cards.filter(c => !c.mastered).length})
            </button>
            <button
              onClick={() => setFilterMode('mastered')}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: filterMode === 'mastered' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: filterMode === 'mastered' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              Mastered ({cards.filter(c => c.mastered).length})
            </button>
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
            onClick={shuffleDeck}
            title="Shuffle Deck"
          >
            <Shuffle size={15} />
          </button>

          <button
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onGenerateMore(activeNote?.id, activeNote?.content)}
          >
            <Sparkles size={14} /> Add AI Cards
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 6, borderRadius: 999, background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
        <div style={{
          width: `${total > 0 ? ((currentIndex + 1) / total) * 100 : 0}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
          borderRadius: 999,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Interactive 3D Flip Flashcard */}
      {currentCard && (
        <div className="flashcard-stage" onClick={handleFlip}>
          <div className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
            {/* Front of Card (Question) */}
            <div className="flashcard-front">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-subject" style={{ fontSize: '0.75rem' }}>
                  QUESTION
                </span>
                {currentCard.mastered && (
                  <span className="badge badge-success">
                    <Trophy size={12} /> Mastered
                  </span>
                )}
              </div>

              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px'
              }}>
                <h3 style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  lineHeight: 1.5,
                  color: '#ffffff'
                }}>
                  {currentCard.question}
                </h3>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                <RotateCw size={13} /> Click to flip and reveal answer
              </div>
            </div>

            {/* Back of Card (Answer & Hint) */}
            <div className="flashcard-back">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge" style={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  fontSize: '0.75rem'
                }}>
                  ANSWER
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Reviewed {currentCard.review_count || 0} times
                </span>
              </div>

              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                gap: 12
              }}>
                <p style={{
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  lineHeight: 1.6,
                  color: '#f8fafc'
                }}>
                  {currentCard.answer}
                </p>

                {currentCard.hint && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.84rem',
                    color: 'var(--accent-amber)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    💡 Hint: {currentCard.hint}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: '0.8rem',
                color: 'var(--accent-cyan)'
              }}>
                <RotateCw size={13} /> Click to flip back
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons: Mastery & Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 580,
        marginTop: 6
      }}>
        {/* Navigation buttons */}
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        {/* Mastery Evaluation */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-danger"
            onClick={() => handleMarkMastered(false)}
            title="Need to review this card again"
          >
            <XCircle size={17} />
            <span>Review Again</span>
          </button>

          <button
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
            onClick={() => handleMarkMastered(true)}
            title="Mark this card as mastered"
          >
            <CheckCircle2 size={17} />
            <span>Mastered!</span>
          </button>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleNext}
          disabled={currentIndex === total - 1}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Delete Card */}
      {currentCard && (
        <button
          onClick={() => onDeleteCard(currentCard.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 8
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-rose)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Trash2 size={12} /> Remove this card from deck
        </button>
      )}
    </div>
  );
}
