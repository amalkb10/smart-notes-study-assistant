from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, status
from bson import ObjectId
from app.database import get_db
from app.models.note import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse

router = APIRouter(prefix="/api/notes", tags=["Notes"])

def format_note(doc, db) -> dict:
    note_id_str = str(doc["_id"])
    flashcard_count = db.flashcards.count_documents({"note_id": note_id_str})
    quiz_count = db.quizzes.count_documents({"note_id": note_id_str})
    
    return {
        "id": note_id_str,
        "title": doc.get("title", "Untitled Note"),
        "content": doc.get("content", ""),
        "subject": doc.get("subject", "General"),
        "tags": doc.get("tags", []),
        "summary": doc.get("summary"),
        "key_takeaways": doc.get("key_takeaways", []),
        "is_pinned": doc.get("is_pinned", False),
        "created_at": doc.get("created_at", datetime.utcnow()),
        "updated_at": doc.get("updated_at", datetime.utcnow()),
        "flashcard_count": flashcard_count,
        "quiz_count": quiz_count
    }

@router.get("", response_model=NoteListResponse)
def list_notes(
    search: Optional[str] = Query(None, description="Search keyword across title and content"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    tag: Optional[str] = Query(None, description="Filter by tag")
):
    db = get_db()
    query = {}
    
    if subject and subject.strip() and subject.lower() != "all":
        query["subject"] = subject.strip()
        
    if tag and tag.strip():
        query["tags"] = tag.strip()
        
    if search and search.strip():
        search_regex = {"$regex": search.strip(), "$options": "i"}
        query["$or"] = [
            {"title": search_regex},
            {"content": search_regex},
            {"tags": search_regex},
            {"summary": search_regex}
        ]

    # Sort pinned notes first, then by updated_at descending
    cursor = db.notes.find(query).sort([("is_pinned", -1), ("updated_at", -1)])
    notes = [format_note(doc, db) for doc in cursor]

    # Extract unique subjects and tags across all notes in DB
    all_notes = list(db.notes.find({}, {"subject": 1, "tags": 1}))
    subjects = sorted(list({n.get("subject", "General") for n in all_notes if n.get("subject")}))
    
    tag_set = set()
    for n in all_notes:
        for t in n.get("tags", []):
            if t:
                tag_set.add(t)
    tags = sorted(list(tag_set))

    return {
        "notes": notes,
        "total": len(notes),
        "subjects": subjects,
        "all_tags": tags
    }

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate):
    db = get_db()
    now = datetime.utcnow()
    doc = payload.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    
    result = db.notes.insert_one(doc)
    doc["_id"] = result.inserted_id
    return format_note(doc, db)

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: str):
    db = get_db()
    try:
        oid = ObjectId(note_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Note ID format")

    doc = db.notes.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Note not found")

    return format_note(doc, db)

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: str, payload: NoteUpdate):
    db = get_db()
    try:
        oid = ObjectId(note_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Note ID format")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    result = db.notes.find_one_and_update(
        {"_id": oid},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Note not found")

    return format_note(result, db)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: str):
    db = get_db()
    try:
        oid = ObjectId(note_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Note ID format")

    result = db.notes.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")

    # Clean up associated flashcards, quizzes, and chat messages
    db.flashcards.delete_many({"note_id": note_id})
    db.quizzes.delete_many({"note_id": note_id})
    db.chats.delete_many({"note_id": note_id})

    return None
