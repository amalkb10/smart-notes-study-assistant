import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import FlashcardDeck from './components/FlashcardDeck';
import QuizArena from './components/QuizArena';
import AITutorModal from './components/AITutorModal';
import UploadModal from './components/UploadModal';
import ThunderClientGuide from './components/ThunderClientGuide';
import AnalyticsView from './components/AnalyticsView';
import { api } from './services/api';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [currentView, setCurrentView] = useState('notes'); // 'notes', 'editor', 'flashcards', 'quiz', 'analytics'
  const [deckCards, setDeckCards] = useState([]);
  const [stats, setStats] = useState({});
  const [health, setHealth] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isThunderOpen, setIsThunderOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [tutorNote, setTutorNote] = useState(null);

  useEffect(() => {
    fetchHealth();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [searchQuery, selectedSubject, selectedTag]);

  const fetchHealth = async () => {
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch (e) {
      console.warn('Backend offline or health check failed:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await api.getNotes({
        search: searchQuery,
        subject: selectedSubject,
        tag: selectedTag
      });
      setNotes(data.notes || []);
      setSubjects(data.subjects || []);
      setTags(data.all_tags || []);
    } catch (e) {
      console.error('Error fetching notes:', e);
    }
  };

  // Note Handlers
  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setCurrentView('editor');
  };

  const handleNewNote = () => {
    const newEmptyNote = {
      title: 'New Study Note',
      subject: selectedSubject || 'General',
      tags: [],
      content: '# New Study Session\n\n- Key concept 1:\n- Key concept 2:\n',
      is_pinned: false
    };
    setSelectedNote(newEmptyNote);
    setCurrentView('editor');
  };

  const handleSaveNote = async (id, payload) => {
    let savedNote;
    if (id) {
      savedNote = await api.updateNote(id, payload);
    } else {
      savedNote = await api.createNote(payload);
    }
    setSelectedNote(savedNote);
    await fetchNotes();
    await fetchStats();
    return savedNote;
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note and its associated flashcards & quizzes?')) {
      try {
        await api.deleteNote(id);
        if (selectedNote?.id === id) {
          setSelectedNote(null);
          setCurrentView('notes');
        }
        await fetchNotes();
        await fetchStats();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  // AI Summarize
  const handleSummarize = async (noteId, content) => {
    const res = await api.summarizeNote(noteId, content, true);
    if (selectedNote) {
      setSelectedNote({
        ...selectedNote,
        summary: res.summary,
        key_takeaways: res.key_takeaways
      });
    }
    await fetchNotes();
    await fetchStats();
    return res;
  };

  // Flashcards Flow
  const handleOpenFlashcards = async (note) => {
    setSelectedNote(note);
    try {
      const cards = await api.getFlashcards(note?.id);
      setDeckCards(cards);
      setCurrentView('flashcards');
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateFlashcards = async (noteId, content) => {
    try {
      const newCards = await api.generateFlashcards(noteId, content, 5);
      setDeckCards(newCards);
      setCurrentView('flashcards');
      await fetchNotes();
      await fetchStats();
    } catch (e) {
      alert(`Error generating flashcards: ${e.message}`);
    }
  };

  const handleReviewCard = async (cardId, status) => {
    const updated = await api.reviewFlashcard(cardId, status);
    setDeckCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)));
    await fetchStats();
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Delete this flashcard?')) {
      await api.deleteFlashcard(cardId);
      setDeckCards((prev) => prev.filter((c) => c.id !== cardId));
      await fetchNotes();
      await fetchStats();
    }
  };

  // Quiz Flow
  const handleOpenQuiz = (note) => {
    setSelectedNote(note);
    setCurrentView('quiz');
  };

  const handleGenerateQuiz = async (noteId, content, numQuestions, difficulty) => {
    return await api.generateQuiz(noteId, content, numQuestions, difficulty);
  };

  const handleSubmitQuiz = async (noteId, answers, questions) => {
    const result = await api.submitQuiz(noteId, answers, questions);
    await fetchNotes();
    await fetchStats();
    return result;
  };

  // Tutor Flow
  const handleOpenTutor = (note) => {
    setTutorNote(note || selectedNote);
    setIsTutorOpen(true);
  };

  // Upload Flow
  const handleUploadSuccess = async (file, subject) => {
    const res = await api.uploadDocument(file, subject, true);
    if (res.note) {
      setSelectedNote(res.note);
      setCurrentView('editor');
    }
    await fetchNotes();
    await fetchStats();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        onNewNote={handleNewNote}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenThunder={() => setIsThunderOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        health={health}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Sidebar */}
        <Sidebar
          currentView={currentView}
          setCurrentView={(view) => {
            if (view === 'flashcards' && selectedNote) {
              handleOpenFlashcards(selectedNote);
            } else if (view === 'tutor') {
              handleOpenTutor(selectedNote);
            } else {
              setCurrentView(view);
            }
          }}
          subjects={subjects}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          tags={tags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          stats={stats}
        />

        {/* Center View Area */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {currentView === 'notes' && (
            <div>
              {/* Header inside Notes View */}
              <div style={{
                padding: '24px 24px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                    {selectedSubject ? `${selectedSubject} Notes` : selectedTag ? `#${selectedTag} Notes` : 'All Study Notes'}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'} available in database
                  </p>
                </div>
              </div>

              <NoteList
                notes={notes}
                onSelectNote={handleSelectNote}
                onDeleteNote={handleDeleteNote}
                onOpenFlashcards={handleOpenFlashcards}
                onOpenQuiz={handleOpenQuiz}
                onOpenTutor={handleOpenTutor}
                onNewNote={handleNewNote}
                onOpenUpload={() => setIsUploadOpen(true)}
                selectedNoteId={selectedNote?.id}
              />
            </div>
          )}

          {currentView === 'editor' && (
            <NoteEditor
              note={selectedNote}
              onSave={handleSaveNote}
              onClose={() => setCurrentView('notes')}
              onSummarize={handleSummarize}
              onGenerateFlashcards={handleGenerateFlashcards}
              onGenerateQuiz={(noteId, content) => {
                setSelectedNote(selectedNote);
                setCurrentView('quiz');
              }}
              onOpenTutor={handleOpenTutor}
            />
          )}

          {currentView === 'flashcards' && (
            <FlashcardDeck
              cards={deckCards}
              onReviewCard={handleReviewCard}
              onDeleteCard={handleDeleteCard}
              onGenerateMore={handleGenerateFlashcards}
              activeNote={selectedNote}
            />
          )}

          {currentView === 'quiz' && (
            <QuizArena
              note={selectedNote || notes[0]}
              onGenerateQuiz={handleGenerateQuiz}
              onSubmitQuiz={handleSubmitQuiz}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView stats={stats} />
          )}
        </main>
      </div>

      {/* AI Tutor Chat Drawer/Modal */}
      <AITutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        note={tutorNote}
        onSendMessage={api.askTutor}
        onGetHistory={api.getChatHistory}
        onClearHistory={api.clearChatHistory}
      />

      {/* Upload Document Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        subjects={subjects}
      />

      {/* Thunder Client Guide Modal */}
      <ThunderClientGuide
        isOpen={isThunderOpen}
        onClose={() => setIsThunderOpen(false)}
      />
    </div>
  );
}
