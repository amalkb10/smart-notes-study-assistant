import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  AlertCircle,
  Loader2,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function QuizArena({ 
  note, 
  onGenerateQuiz, 
  onSubmitQuiz 
}) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIndex]: optionId }
  const [quizResult, setQuizResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(4);

  const handleStartQuiz = async () => {
    setIsLoading(true);
    setQuizResult(null);
    setUserAnswers({});
    try {
      const data = await onGenerateQuiz(note?.id, note?.content, questionCount, difficulty);
      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        alert('Could not generate quiz questions. Please check note content.');
      }
    } catch (err) {
      alert(`Error generating quiz: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectOption = (qIndex, optionId) => {
    if (quizResult) return; // Prevent changing after submission
    setUserAnswers((prev) => ({
      ...prev,
      [qIndex]: optionId
    }));
  };

  const handleSubmit = async () => {
    // Check if at least one question answered
    if (Object.keys(userAnswers).length === 0) {
      alert('Please answer at least one question before submitting!');
      return;
    }

    const answersPayload = Object.entries(userAnswers).map(([idx, opt]) => ({
      question_index: parseInt(idx, 10),
      selected_option: opt
    }));

    setIsLoading(true);
    try {
      const result = await onSubmitQuiz(note?.id, answersPayload, questions);
      setQuizResult(result);
      if (result.score_percentage >= 70) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      alert(`Error submitting quiz: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // If no questions generated yet: Setup Screen
  if (questions.length === 0) {
    return (
      <div style={{
        maxWidth: 640,
        margin: '40px auto',
        padding: '36px',
        textAlign: 'center',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(6, 182, 212, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px'
        }}>
          <HelpCircle size={32} color="var(--accent-cyan)" />
        </div>

        <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>AI Practice Quiz Arena</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 28 }}>
          Test your mastery of <strong style={{ color: '#ffffff' }}>{note?.title || 'this study topic'}</strong> with interactive multiple-choice practice exams and detailed academic feedback.
        </p>

        {/* Options */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 32,
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Questions
            </label>
            <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-md)' }}>
              {[3, 4, 6].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: questionCount === cnt ? 'var(--accent-violet)' : 'transparent',
                    color: questionCount === cnt ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Difficulty
            </label>
            <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-md)' }}>
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    textTransform: 'capitalize',
                    background: difficulty === diff ? 'var(--accent-cyan)' : 'transparent',
                    color: difficulty === diff ? '#042f2e' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ padding: '12px 28px', fontSize: '1rem' }}
          onClick={handleStartQuiz}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          <span>Generate AI Quiz Questions</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 820,
      margin: '0 auto',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }}>
      {/* Quiz Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 16
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <HelpCircle size={22} color="var(--accent-cyan)" /> Practice Exam: {note?.title}
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {questions.length} Questions • {difficulty.toUpperCase()} Mode
          </span>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => {
            setQuestions([]);
            setQuizResult(null);
          }}
        >
          <RotateCcw size={14} /> New Exam
        </button>
      </div>

      {/* Result Card Banner if Submitted */}
      {quizResult && (
        <div className="glass-panel" style={{
          padding: '24px',
          background: quizResult.score_percentage >= 70 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(244, 63, 94, 0.08) 100%)',
          border: `1px solid ${quizResult.score_percentage >= 70 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: quizResult.score_percentage >= 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: quizResult.score_percentage >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
              }}>
                {quizResult.score_percentage}%
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>
                  {quizResult.correct_count} of {quizResult.total_questions} Questions Correct
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {quizResult.feedback}
                </p>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleStartQuiz}
            >
              <RotateCcw size={16} /> Retake Test
            </button>
          </div>
        </div>
      )}

      {/* Questions Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {questions.map((q, qIdx) => {
          const selectedOption = userAnswers[qIdx];
          const resultDetail = quizResult?.details?.[qIdx];

          return (
            <div
              key={qIdx}
              className="glass-panel"
              style={{
                padding: '24px',
                border: resultDetail 
                  ? resultDetail.is_correct 
                    ? '1px solid rgba(16, 185, 129, 0.4)' 
                    : '1px solid rgba(244, 63, 94, 0.4)'
                  : '1px solid var(--border-subtle)'
              }}
            >
              {/* Question Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <h4 style={{ fontSize: '1.05rem', lineHeight: 1.5, color: '#f1f5f9' }}>
                  <span style={{ color: 'var(--accent-violet)', marginRight: 8 }}>{qIdx + 1}.</span>
                  {q.question}
                </h4>
                {resultDetail && (
                  resultDetail.is_correct ? (
                    <span className="badge badge-success" style={{ flexShrink: 0 }}>
                      <CheckCircle2 size={13} /> Correct
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185', flexShrink: 0 }}>
                      <XCircle size={13} /> Incorrect
                    </span>
                  )
                )}
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                {q.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isCorrectAnswer = resultDetail && opt.id === resultDetail.correct_option;
                  const isWrongSelected = resultDetail && isSelected && !resultDetail.is_correct;

                  let optBg = 'var(--bg-surface)';
                  let optBorder = 'var(--border-subtle)';
                  let textColor = 'var(--text-primary)';

                  if (quizResult) {
                    if (isCorrectAnswer) {
                      optBg = 'rgba(16, 185, 129, 0.15)';
                      optBorder = 'rgba(16, 185, 129, 0.5)';
                      textColor = '#6ee7b7';
                    } else if (isWrongSelected) {
                      optBg = 'rgba(244, 63, 94, 0.15)';
                      optBorder = 'rgba(244, 63, 94, 0.5)';
                      textColor = '#fda4af';
                    }
                  } else if (isSelected) {
                    optBg = 'rgba(139, 92, 246, 0.18)';
                    optBorder = 'var(--accent-violet)';
                    textColor = '#ffffff';
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => selectOption(qIdx, opt.id)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: optBg,
                        border: `1px solid ${optBorder}`,
                        cursor: quizResult ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'var(--transition)'
                      }}
                    >
                      <span style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: isSelected ? 'var(--accent-violet)' : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {opt.id}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: textColor, lineHeight: 1.4 }}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Academic Explanation after submission */}
              {resultDetail && (
                <div style={{
                  marginTop: 14,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `3px solid ${resultDetail.is_correct ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`,
                  fontSize: '0.86rem',
                  color: '#cbd5e1',
                  lineHeight: 1.5
                }}>
                  <strong style={{ color: resultDetail.is_correct ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    Explanation:
                  </strong> {resultDetail.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Footer */}
      {!quizResult && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Answered {Object.keys(userAnswers).length} of {questions.length} questions
          </span>

          <button
            className="btn btn-primary"
            style={{ padding: '10px 24px' }}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
            <span>Submit Exam & Get Grade</span>
          </button>
        </div>
      )}
    </div>
  );
}
