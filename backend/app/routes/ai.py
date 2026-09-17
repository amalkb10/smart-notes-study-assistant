from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field
from bson import ObjectId

from app.database import get_db
from app.services.ai_service import ai_service
from app.models.flashcard import (
    FlashcardItem,
    FlashcardReviewUpdate,
    GenerateFlashcardsRequest
)
from app.models.quiz import (
    GenerateQuizRequest,
    QuizSubmitRequest,
    QuizEvaluationResult
)

router = APIRouter(prefix="/api", tags=["AI & Study Tools"])

class SummarizeRequest(BaseModel):
    note_id: Optional[str] = None
    content: Optional[str] = None
    save_to_note: bool = True

class SummarizeResponse(BaseModel):
    summary: str
    key_takeaways: List[str]
    source: str
    note_id: Optional[str] = None

# ================= 1. SUMMARIZATION & KEY TAKEAWAYS =================
@router.post("/ai/summarize", response_model=SummarizeResponse)
def summarize_note(payload: SummarizeRequest):
    db = get_db()
    content = payload.content or ""
    note_id = payload.note_id

    # If note_id provided, fetch content from MongoDB
    if note_id:
        try:
            oid = ObjectId(note_id)
            doc = db.notes.find_one({"_id": oid})
            if doc:
                if not content:
                    content = doc.get("content", "")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Note ID format")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty to summarize")

    result = ai_service.summarize(content)

    # Save to note in MongoDB if requested and note_id exists
    if note_id and payload.save_to_note:
        try:
            db.notes.update_one(
                {"_id": ObjectId(note_id)},
                {
                    "$set": {
                        "summary": result["summary"],
                        "key_takeaways": result["key_takeaways"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        except Exception as e:
            pass

    return {
        "summary": result["summary"],
        "key_takeaways": result["key_takeaways"],
        "source": result.get("source", "unknown"),
        "note_id": note_id
    }

# ================= 2. FLASHCARDS =================
@router.post("/ai/flashcards", response_model=List[FlashcardItem])
def generate_flashcards(payload: GenerateFlashcardsRequest):
    db = get_db()
    content = payload.content or ""
    note_id = payload.note_id

    if note_id:
        try:
            oid = ObjectId(note_id)
            doc = db.notes.find_one({"_id": oid})
            if doc and not content:
                content = doc.get("content", "")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Note ID format")

    if not content.strip():
        raise HTTPException(status_code=400, detail="No content provided to generate flashcards")

    cards_data = ai_service.generate_flashcards(content, count=payload.count)
    saved_cards = []
    now = datetime.utcnow()

    for item in cards_data:
        card_doc = {
            "note_id": note_id,
            "question": item.get("question", ""),
            "answer": item.get("answer", ""),
            "hint": item.get("hint", ""),
            "mastered": False,
            "review_count": 0,
            "created_at": now
        }
        res = db.flashcards.insert_one(card_doc)
        card_doc["id"] = str(res.inserted_id)
        saved_cards.append(FlashcardItem(**card_doc))

    return saved_cards

@router.get("/flashcards", response_model=List[FlashcardItem])
def get_flashcards(
    note_id: Optional[str] = Query(None),
    mastered: Optional[bool] = Query(None)
):
    db = get_db()
    query = {}
    if note_id and note_id.strip():
        query["note_id"] = note_id.strip()
    if mastered is not None:
        query["mastered"] = mastered

    cursor = db.flashcards.find(query).sort("created_at", -1)
    cards = []
    for doc in cursor:
        cards.append(FlashcardItem(
            id=str(doc["_id"]),
            note_id=doc.get("note_id"),
            question=doc.get("question", ""),
            answer=doc.get("answer", ""),
            hint=doc.get("hint"),
            mastered=doc.get("mastered", False),
            review_count=doc.get("review_count", 0),
            created_at=doc.get("created_at")
        ))
    return cards

@router.put("/flashcards/{card_id}/review", response_model=FlashcardItem)
def review_flashcard(card_id: str, payload: FlashcardReviewUpdate):
    db = get_db()
    try:
        oid = ObjectId(card_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Flashcard ID format")

    doc = db.flashcards.find_one_and_update(
        {"_id": oid},
        {
            "$set": {"mastered": payload.mastered},
            "$inc": {"review_count": 1}
        },
        return_document=True
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    return FlashcardItem(
        id=str(doc["_id"]),
        note_id=doc.get("note_id"),
        question=doc.get("question", ""),
        answer=doc.get("answer", ""),
        hint=doc.get("hint"),
        mastered=doc.get("mastered", False),
        review_count=doc.get("review_count", 0),
        created_at=doc.get("created_at")
    )

@router.delete("/flashcards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flashcard(card_id: str):
    db = get_db()
    try:
        oid = ObjectId(card_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Flashcard ID format")

    res = db.flashcards.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return None

# ================= 3. QUIZ ARENA =================
@router.post("/ai/quiz")
def generate_quiz(payload: GenerateQuizRequest):
    db = get_db()
    content = payload.content or ""
    note_id = payload.note_id

    if note_id:
        try:
            oid = ObjectId(note_id)
            doc = db.notes.find_one({"_id": oid})
            if doc and not content:
                content = doc.get("content", "")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Note ID format")

    if not content.strip():
        raise HTTPException(status_code=400, detail="No content provided to generate quiz")

    questions = ai_service.generate_quiz(
        content=content,
        num_questions=payload.num_questions,
        difficulty=payload.difficulty
    )
    return {"questions": questions, "note_id": note_id}

@router.post("/ai/quiz/submit", response_model=QuizEvaluationResult)
def submit_quiz(payload: QuizSubmitRequest):
    db = get_db()
    questions = payload.questions
    answers = {a.question_index: a.selected_option.upper() for a in payload.answers}

    correct_count = 0
    total = len(questions)
    details = []

    for i, q in enumerate(questions):
        user_choice = answers.get(i, None)
        is_correct = (user_choice == q.correct_option.upper()) if user_choice else False
        if is_correct:
            correct_count += 1

        details.append({
            "question_index": i,
            "question": q.question,
            "user_choice": user_choice,
            "correct_option": q.correct_option,
            "is_correct": is_correct,
            "explanation": q.explanation
        })

    pct = round((correct_count / total * 100) if total > 0 else 0, 1)

    if pct >= 80:
        feedback = "Outstanding! You have thoroughly mastered this study material!"
    elif pct >= 60:
        feedback = "Solid effort! A brief review of the explanations will solidify your understanding."
    else:
        feedback = "Keep going! Review the flashcards and practice active recall on key concepts."

    # Store quiz session in MongoDB
    quiz_record = {
        "note_id": payload.note_id,
        "total_questions": total,
        "correct_count": correct_count,
        "score_percentage": pct,
        "feedback": feedback,
        "details": details,
        "created_at": datetime.utcnow()
    }
    db.quizzes.insert_one(quiz_record)

    return QuizEvaluationResult(
        total_questions=total,
        correct_count=correct_count,
        score_percentage=pct,
        feedback=feedback,
        details=details
    )

@router.get("/quizzes")
def get_quiz_history(note_id: Optional[str] = Query(None)):
    db = get_db()
    query = {}
    if note_id and note_id.strip():
        query["note_id"] = note_id.strip()

    cursor = db.quizzes.find(query).sort("created_at", -1).limit(20)
    history = []
    for doc in cursor:
        history.append({
            "id": str(doc["_id"]),
            "note_id": doc.get("note_id"),
            "total_questions": doc.get("total_questions", 0),
            "correct_count": doc.get("correct_count", 0),
            "score_percentage": doc.get("score_percentage", 0),
            "feedback": doc.get("feedback", ""),
            "created_at": doc.get("created_at")
        })
    return history
