from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., example="user or assistant")
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequest(BaseModel):
    note_id: Optional[str] = None
    note_context: Optional[str] = None
    message: str = Field(..., example="Can you explain the main concept in simple terms?")
    history: List[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    suggested_questions: Optional[List[str]] = Field(default_factory=list)
