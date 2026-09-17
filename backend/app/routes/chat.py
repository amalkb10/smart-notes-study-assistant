from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, status
from bson import ObjectId

from app.database import get_db
from app.services.ai_service import ai_service
from app.models.chat import ChatRequest, ChatResponse, ChatMessage

router = APIRouter(prefix="/api/chat", tags=["AI Study Tutor"])

@router.post("", response_model=ChatResponse)
def ask_tutor(payload: ChatRequest):
    db = get_db()
    note_id = payload.note_id
    note_context = payload.note_context or ""

    if note_id:
        try:
            oid = ObjectId(note_id)
            doc = db.notes.find_one({"_id": oid})
            if doc:
                note_context = f"Title: {doc.get('title')}\nSubject: {doc.get('subject')}\nContent:\n{doc.get('content')}"
        except Exception:
            pass

    # History from request or database
    history_list = []
    if payload.history:
        history_list = [h.model_dump() for h in payload.history]
    elif note_id:
        # Load recent 6 messages from MongoDB
        db_history = list(db.chats.find({"note_id": note_id}).sort("created_at", 1).limit(10))
        for msg in db_history:
            history_list.append({"role": msg.get("role"), "content": msg.get("content")})

    result = ai_service.chat_tutor(
        message=payload.message,
        note_context=note_context,
        history=history_list
    )

    # Save to MongoDB
    now = datetime.utcnow()
    user_msg_doc = {
        "note_id": note_id,
        "role": "user",
        "content": payload.message,
        "created_at": now
    }
    bot_msg_doc = {
        "note_id": note_id,
        "role": "assistant",
        "content": result["reply"],
        "created_at": datetime.utcnow()
    }
    db.chats.insert_many([user_msg_doc, bot_msg_doc])

    return ChatResponse(
        reply=result["reply"],
        suggested_questions=result.get("suggested_questions", [])
    )

@router.get("/history")
def get_chat_history(note_id: Optional[str] = Query(None)):
    db = get_db()
    query = {}
    if note_id and note_id.strip():
        query["note_id"] = note_id.strip()

    messages = list(db.chats.find(query).sort("created_at", 1).limit(50))
    result = []
    for m in messages:
        result.append({
            "id": str(m["_id"]),
            "note_id": m.get("note_id"),
            "role": m.get("role"),
            "content": m.get("content"),
            "created_at": m.get("created_at")
        })
    return result

@router.delete("/history/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def clear_chat_history(note_id: str):
    db = get_db()
    db.chats.delete_many({"note_id": note_id})
    return None
