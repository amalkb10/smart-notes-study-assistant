import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import db_instance, get_db
from app.routes import notes, ai, chat, upload, stats

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("smart_notes")

def seed_initial_data_if_empty():
    try:
        db = get_db()
        if db.notes.count_documents({}) == 0:
            logger.info("Empty database detected. Seeding sample study notes...")
            now = datetime.utcnow()
            sample_notes = [
                {
                    "title": "Machine Learning Fundamentals & Architectures",
                    "subject": "Computer Science",
                    "tags": ["AI", "Machine Learning", "Core Concepts"],
                    "content": """# Machine Learning Fundamentals

Machine Learning (ML) is a branch of artificial intelligence focused on building systems that learn from data rather than following explicitly programmed rules.

## Core Paradigms
1. **Supervised Learning**: Algorithms train on labeled datasets (e.g., linear regression, random forests, neural networks).
2. **Unsupervised Learning**: Uncovers hidden patterns or clusters in unlabeled data (e.g., K-Means, PCA).
3. **Reinforcement Learning**: Agents optimize behavior via reward signals in an interactive environment (e.g., Q-Learning, PPO).

## Key Equations & Concepts
- **Gradient Descent**: Parameter update rule: $\\theta = \\theta - \\alpha \\nabla J(\\theta)$ where $\\alpha$ is the learning rate.
- **Overfitting**: High variance where the model memorizes noise. Mitigated using L1/L2 regularization, dropout, and cross-validation.
- **Bias-Variance Tradeoff**: Balancing underfitting (high bias) versus overfitting (high variance).""",
                    "summary": "Comprehensive overview of core Machine Learning paradigms (supervised, unsupervised, reinforcement learning), optimization via gradient descent, and critical pitfalls like overfitting and the bias-variance tradeoff.",
                    "key_takeaways": [
                        "Supervised learning requires labeled inputs, whereas unsupervised identifies hidden data patterns.",
                        "Gradient descent iteratively shifts parameters toward minimum cost via learning rate alpha.",
                        "Overfitting is mitigated using regularization (L1/L2), dropout, and cross-validation.",
                        "Balancing bias and variance is the central challenge in predictive modeling."
                    ],
                    "is_pinned": True,
                    "created_at": now,
                    "updated_at": now
                },
                {
                    "title": "Data Structures: Trees, Graphs & Traversal",
                    "subject": "Computer Science",
                    "tags": ["Algorithms", "Data Structures", "Interview Prep"],
                    "content": """# Data Structures: Trees & Graphs

Non-linear data structures model hierarchical relationships and complex networks.

## Binary Search Trees (BST)
- Invariant: For every node $N$, values in $N.left < N.val < N.right$.
- Time Complexity: Search, Insert, and Delete average $O(\\log n)$, worst case $O(n)$ if unbalanced.
- Balanced Variants: AVL Trees, Red-Black Trees guarantee $O(\\log n)$.

## Graph Representations
1. **Adjacency Matrix**: $V \\times V$ 2D array. Fast edge lookup $O(1)$, but space $O(V^2)$.
2. **Adjacency List**: Array of linked lists/vectors. Space efficient $O(V + E)$, ideal for sparse graphs.

## Traversal Algorithms
- **Breadth-First Search (BFS)**: Uses a Queue. Finds the shortest path in unweighted graphs.
- **Depth-First Search (DFS)**: Uses a Stack (or recursion). Ideal for topological sorting, cycle detection, and maze solving.""",
                    "summary": "Detailed exploration of Binary Search Trees (BST), balanced variants (AVL/Red-Black), graph representations (Adjacency Matrix vs List), and foundational traversal algorithms (BFS and DFS).",
                    "key_takeaways": [
                        "BST operations run in O(log n) average time, but degrade to O(n) without self-balancing mechanisms.",
                        "Adjacency lists are space-efficient O(V + E) and preferred for sparse graphs.",
                        "BFS utilizes a FIFO queue and finds the shortest path in unweighted graphs.",
                        "DFS utilizes recursion or a LIFO stack for cycle detection and topological sorting."
                    ],
                    "is_pinned": False,
                    "created_at": now,
                    "updated_at": now
                }
            ]
            
            insert_result = db.notes.insert_many(sample_notes)
            first_note_id = str(insert_result.inserted_ids[0])
            
            # Seed flashcards for first note
            sample_cards = [
                {
                    "note_id": first_note_id,
                    "question": "What is the primary difference between Supervised and Unsupervised Learning?",
                    "answer": "Supervised learning uses labeled training datasets with ground truth targets, while unsupervised learning discovers intrinsic structures from unlabeled data.",
                    "hint": "Think about labels and ground truth.",
                    "mastered": False,
                    "review_count": 0,
                    "created_at": now
                },
                {
                    "note_id": first_note_id,
                    "question": "What does the learning rate (alpha) control in Gradient Descent?",
                    "answer": "It determines the step size taken towards the minimum of the loss function during each parameter iteration.",
                    "hint": "Step size along the gradient slope.",
                    "mastered": True,
                    "review_count": 2,
                    "created_at": now
                },
                {
                    "note_id": first_note_id,
                    "question": "How do L1 and L2 regularization prevent overfitting?",
                    "answer": "They add a penalty term to the loss function based on model weights (L1 penalizes absolute weights leading to sparsity, L2 penalizes squared weights).",
                    "hint": "Penalizing model complexity.",
                    "mastered": False,
                    "review_count": 1,
                    "created_at": now
                }
            ]
            db.flashcards.insert_many(sample_cards)
            logger.info("Sample notes and flashcards successfully seeded!")
    except Exception as e:
        logger.warning(f"Could not run initial seed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up Smart Notes Study Assistant backend...")
    db_instance.connect()
    seed_initial_data_if_empty()
    yield
    # Shutdown
    logger.info("Shutting down backend...")
    db_instance.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Smart Notes & Study Assistant Backend with MongoDB and LLM integration.",
    lifespan=lifespan
)

# Enable CORS for frontend & tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(notes.router)
app.include_router(ai.router)
app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(stats.router)

@app.get("/", tags=["Root"])
def root():
    mongo_ok = db_instance.is_connected()
    return {
        "message": "AI-Powered Smart Notes & Study Assistant Backend is running successfully!",
        "status": "online",
        "docs_url": "http://localhost:8000/docs",
        "frontend_url": "http://localhost:5173",
        "health_check": "http://localhost:8000/api/health",
        "database": {
            "name": settings.DB_NAME,
            "status": "connected" if mongo_ok else "disconnected"
        }
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    mongo_ok = db_instance.is_connected()
    ai_status = "Gemini Live" if bool(settings.GEMINI_API_KEY) else "Offline Heuristic Mode (Ready)"
    return {
        "status": "healthy" if mongo_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "connected": mongo_ok,
            "database_name": settings.DB_NAME,
            "uri": settings.MONGO_URI
        },
        "ai_provider": {
            "mode": ai_status,
            "configured_key": bool(settings.GEMINI_API_KEY),
            "model": settings.GEMINI_MODEL
        },
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
