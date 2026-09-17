from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, example="Introduction to Neural Networks")
    content: str = Field(..., example="# Neural Networks\nAn artificial neural network...")
    subject: str = Field(default="General", example="Computer Science")
    tags: List[str] = Field(default_factory=list, example=["AI", "Deep Learning", "Basics"])
    summary: Optional[str] = Field(default=None, example="Key points about neural networks architecture.")
    key_takeaways: Optional[List[str]] = Field(default_factory=list)
    is_pinned: bool = Field(default=False)

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    subject: Optional[str] = None
    tags: Optional[List[str]] = None
    summary: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    is_pinned: Optional[bool] = None

class NoteResponse(NoteBase):
    id: str
    created_at: datetime
    updated_at: datetime
    flashcard_count: Optional[int] = 0
    quiz_count: Optional[int] = 0

class NoteListResponse(BaseModel):
    notes: List[NoteResponse]
    total: int
    subjects: List[str]
    all_tags: List[str]
