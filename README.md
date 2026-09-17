# 🎓 AI-Powered Smart Notes & Study Assistant

A modern, full-stack study platform that transforms raw notes and lecture slides into high-yield summaries, active-recall flashcard decks, auto-grading practice quizzes, and an interactive AI academic tutor.

Built with **React**, **Vanilla CSS**, **JavaScript**, **FastAPI (Python)**, **MongoDB**, and pre-configured for **Thunder Client** API testing.

---

## 🚀 Key Features

- 📝 **Smart Notes Management**:
  - Full CRUD operations stored in **MongoDB** (`smart_notes_db`).
  - Real-time Markdown live preview with math & code syntax.
  - Pinning, subject categories, and auto-tagging.
  - Full-text search across titles, contents, and AI summaries.

- ✨ **AI Study Superpowers**:
  - **Executive Summarizer & Key Takeaways**: Distills lengthy documents and complex chapters into bulleted high-yield points.
  - **3D Flip-Card Flashcard Decks**: Spaced repetition study mode with 3D card flips, "Mastered" vs "Need Review" tracking, and celebratory confetti.
  - **AI Practice Quiz Arena**: Multiple-choice exams (Easy / Medium / Hard) with instant grading, score percentages, and in-depth academic explanations for every answer.
  - **Athena AI Study Tutor**: Contextual study chat grounded in your active notes. Ask for simple analogies, catchy mnemonics, or common exam traps.
  - **Document Import (PDF / TXT)**: Upload slides, syllabi, or textbook pages to automatically extract text and generate smart notes.

- ⚡ **Thunder Client Ready**:
  - Complete pre-packaged Thunder Client collection and environment in `thunderclient/` for one-click testing in VS Code.

- 🎨 **Visual Aesthetics**:
  - Sleek dark glassmorphic design system (`#0a0d14`), glowing neon accents (violet `#8b5cf6`, cyan `#06b6d4`, emerald `#10b981`), and modern typography (Outfit + Plus Jakarta Sans).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Lucide React, Canvas-Confetti |
| **Styling** | Vanilla CSS (Glassmorphism, 3D Flip Perspective, Responsive Grid) |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | MongoDB (`localhost:27017`), PyMongo |
| **AI Providers** | Google Gemini (`google-genai`), Groq, + Zero-Config Offline Heuristic Fallback |
| **Document Processing**| PyPDF |
| **API Testing** | Thunder Client (VS Code) |

---

## 📁 Directory Structure

```
c:\Project\Study meterial\
├── backend\
│   ├── app\
│   │   ├── config.py              # Environment configuration
│   │   ├── database.py            # MongoDB connection & index setup
│   │   ├── main.py                # FastAPI entry, CORS, lifespan & auto-seeding
│   │   ├── models\                # Pydantic schemas (Note, Flashcard, Quiz, Chat)
│   │   ├── routes\                # API routes (notes, ai, chat, upload, stats)
│   │   └── services\              # AI service (Gemini + fallback) & PDF parser
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Template environment configuration
│   ├── .env                       # Active backend environment
│   └── run_backend.bat            # Backend runner script
│
├── frontend\
│   ├── index.html                 # App shell with typography imports
│   ├── package.json               # Frontend dependencies & scripts
│   ├── vite.config.js             # Vite config with /api proxy
│   ├── src\
│   │   ├── main.jsx               # React DOM entry
│   │   ├── App.jsx                # Main application controller
│   │   ├── index.css              # Design system & tokens
│   │   ├── components\
│   │   │   ├── Navbar.jsx         # Header & search bar
│   │   │   ├── Sidebar.jsx        # Navigation, subjects & tags
│   │   │   ├── NoteEditor.jsx     # Markdown editor & AI study toolbar
│   │   │   ├── NoteList.jsx       # Note cards grid
│   │   │   ├── FlashcardDeck.jsx  # 3D interactive flip-card study deck
│   │   │   ├── QuizArena.jsx      # MCQ practice quiz runner & scoring
│   │   │   ├── AITutorModal.jsx   # Contextual study tutor chat
│   │   │   ├── UploadModal.jsx    # PDF & TXT document importer
│   │   │   ├── ThunderClientGuide.jsx # In-app API reference & cURL guide
│   │   │   └── AnalyticsView.jsx  # Mastery analytics & cognitive study tips
│   │   └── services\
│   │       └── api.js             # Frontend API client
│   └── run_frontend.bat           # Frontend runner script
│
├── thunderclient\
│   ├── thunder-collection_smartnotes.json   # Thunder Client collection
│   └── thunder-environment_smartnotes.json  # Thunder Client environment
│
├── run_all.bat                    # 1-click startup for both backend & frontend
└── README.md                      # Documentation
```

---

## ⚡ Quick Start

### 1. Prerequisite: MongoDB
Make sure your local MongoDB service is running (default port `27017`):
```bash
# Check MongoDB
mongod --dbpath <your-db-path>
```

### 2. Option A: One-Click Startup
Double click or run:
```bat
run_all.bat
```
This automatically starts both the FastAPI backend on `http://localhost:8000` and the React frontend on `http://localhost:5173`.

### 3. Option B: Manual Startup

**Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Health: `http://localhost:8000/api/health`
- Swagger Docs: `http://localhost:8000/docs`

**Frontend:**
```bash
cd frontend
npm.cmd run dev
```
- Frontend UI: `http://localhost:5173`

---

## ⚡ Thunder Client API Testing

1. Open **VS Code** with the **Thunder Client** extension installed.
2. In the Thunder Client sidebar tab, click **Collections** > Menu (`...`) > **Import**.
3. Choose:
   ```
   Study meterial/thunderclient/thunder-collection_smartnotes.json
   ```
4. Under **Env** (Environments), click **Import** and choose:
   ```
   Study meterial/thunderclient/thunder-environment_smartnotes.json
   ```
5. Select the **Smart Notes Local** environment.
6. Test any of the 16+ pre-configured requests:
   - `GET /api/health`
   - `GET /api/notes`
   - `POST /api/notes`
   - `POST /api/ai/summarize`
   - `POST /api/ai/flashcards`
   - `POST /api/ai/quiz`
   - `POST /api/ai/quiz/submit`
   - `POST /api/chat`
   - `GET /api/stats`

---

## 🔑 AI Configuration (Optional Live AI Mode)

The application works **immediately out-of-the-box** using an intelligent educational fallback generator.

To enable live generative responses with **Google Gemini**:
1. Get a free API key at [https://aistudio.google.com/](https://aistudio.google.com/).
2. Add your key to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```
3. Restart the backend server.
