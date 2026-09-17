from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.database import get_db
from app.services.pdf_service import document_service
from app.services.ai_service import ai_service
from app.routes.notes import format_note

router = APIRouter(prefix="/api/upload", tags=["Upload & Documents"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form("General"),
    create_note: bool = Form(True)
):
    filename = file.filename or "uploaded_study_material.txt"
    content_bytes = await file.read()
    
    if not content_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        try:
            parsed = document_service.extract_text_from_pdf(content_bytes, filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif ext in ["txt", "md"]:
        try:
            parsed = document_service.extract_text_from_txt(content_bytes, filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Only PDF and TXT/MD files are supported.")

    if not parsed["content"].strip():
        raise HTTPException(status_code=400, detail="No readable text could be extracted from the document.")

    if create_note:
        db = get_db()
        # Generate initial summary and takeaways
        summary_data = ai_service.summarize(parsed["content"][:3000])

        now = datetime.utcnow()
        doc = {
            "title": parsed["title"],
            "content": parsed["content"],
            "subject": subject,
            "tags": ["Document", ext.upper(), "Extracted"],
            "summary": summary_data.get("summary"),
            "key_takeaways": summary_data.get("key_takeaways", []),
            "is_pinned": False,
            "created_at": now,
            "updated_at": now
        }
        res = db.notes.insert_one(doc)
        doc["_id"] = res.inserted_id
        return {
            "success": True,
            "message": f"Successfully parsed {filename} and created Smart Note.",
            "note": format_note(doc, db),
            "stats": {"pages": parsed["pages"], "characters": parsed["char_count"]}
        }

    return {
        "success": True,
        "title": parsed["title"],
        "content": parsed["content"],
        "stats": {"pages": parsed["pages"], "characters": parsed["char_count"]}
    }
