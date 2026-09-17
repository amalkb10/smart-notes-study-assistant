const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // If body is FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const res = await fetch(url, config);
  if (!res.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  if (res.status === 204) return null;
  return await res.json();
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Notes
  getNotes: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.subject) query.set('subject', params.subject);
    if (params.tag) query.set('tag', params.tag);
    const qs = query.toString();
    return request(`/notes${qs ? '?' + qs : ''}`);
  },
  getNote: (id) => request(`/notes/${id}`),
  createNote: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  updateNote: (id, data) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  // AI Summarization
  summarizeNote: (noteId, content = '', saveToNote = true) =>
    request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ note_id: noteId, content, save_to_note: saveToNote }),
    }),

  // Flashcards
  generateFlashcards: (noteId, content = '', count = 5) =>
    request('/ai/flashcards', {
      method: 'POST',
      body: JSON.stringify({ note_id: noteId, content, count }),
    }),
  getFlashcards: (noteId = null, mastered = null) => {
    const query = new URLSearchParams();
    if (noteId) query.set('note_id', noteId);
    if (mastered !== null) query.set('mastered', mastered);
    const qs = query.toString();
    return request(`/flashcards${qs ? '?' + qs : ''}`);
  },
  reviewFlashcard: (cardId, mastered) =>
    request(`/flashcards/${cardId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ mastered }),
    }),
  deleteFlashcard: (cardId) => request(`/flashcards/${cardId}`, { method: 'DELETE' }),

  // Quiz
  generateQuiz: (noteId, content = '', numQuestions = 5, difficulty = 'medium') =>
    request('/ai/quiz', {
      method: 'POST',
      body: JSON.stringify({
        note_id: noteId,
        content,
        num_questions: numQuestions,
        difficulty,
      }),
    }),
  submitQuiz: (noteId, answers, questions) =>
    request('/ai/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ note_id: noteId, answers, questions }),
    }),
  getQuizHistory: (noteId = null) => {
    const qs = noteId ? `?note_id=${noteId}` : '';
    return request(`/quizzes${qs}`);
  },

  // AI Chat Tutor
  askTutor: (noteId, message, history = []) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ note_id: noteId, message, history }),
    }),
  getChatHistory: (noteId) => {
    const qs = noteId ? `?note_id=${noteId}` : '';
    return request(`/chat/history${qs}`);
  },
  clearChatHistory: (noteId) => request(`/chat/history/${noteId}`, { method: 'DELETE' }),

  // Stats
  getStats: () => request('/stats'),

  // Upload
  uploadDocument: (file, subject = 'General', createNote = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('create_note', createNote);
    return request('/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
