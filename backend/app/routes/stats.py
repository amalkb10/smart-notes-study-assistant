from fastapi import APIRouter
from app.database import get_db

router = APIRouter(prefix="/api/stats", tags=["Analytics & Stats"])

@router.get("")
def get_study_stats():
    db = get_db()
    
    total_notes = db.notes.count_documents({})
    total_flashcards = db.flashcards.count_documents({})
    mastered_flashcards = db.flashcards.count_documents({"mastered": True})
    total_quizzes = db.quizzes.count_documents({})
    total_chats = db.chats.count_documents({})

    # Calculate average quiz score
    avg_score = 0.0
    if total_quizzes > 0:
        pipeline = [
            {"$group": {"_id": None, "avg_score": {"$avg": "$score_percentage"}}}
        ]
        agg = list(db.quizzes.aggregate(pipeline))
        if agg and agg[0].get("avg_score") is not None:
            avg_score = round(agg[0]["avg_score"], 1)

    # Subject distribution
    subject_pipeline = [
        {"$group": {"_id": "$subject", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    subjects_agg = list(db.notes.aggregate(subject_pipeline))
    subject_breakdown = {item["_id"] or "General": item["count"] for item in subjects_agg}

    # Mastery percentage
    mastery_rate = round((mastered_flashcards / total_flashcards * 100) if total_flashcards > 0 else 0, 1)

    return {
        "total_notes": total_notes,
        "total_flashcards": total_flashcards,
        "mastered_flashcards": mastered_flashcards,
        "mastery_rate": mastery_rate,
        "total_quizzes": total_quizzes,
        "average_quiz_score": avg_score,
        "total_chats": total_chats,
        "subject_breakdown": subject_breakdown
    }
