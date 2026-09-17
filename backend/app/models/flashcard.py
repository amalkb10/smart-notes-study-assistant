from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class FlashcardItem(BaseModel):
    id: Optional[str] = None
    note_id: Optional[str] = None
    question: str = Field(..., example="What is backpropagation in neural networks?")
    answer: str = Field(..., example="An algorithm for training neural networks by calculating the gradient of the loss function.")
    hint: Optional[str] = Field(default=None, example="It utilizes the chain rule of calculus.")
    mastered: bool = Field(default=False)
    review_count: int = Field(default=0)
    created_at: Optional[datetime] = None

class FlashcardBatchCreate(BaseModel):
    note_id: Optional[str] = None
    cards: List[FlashcardItem]

class FlashcardReviewUpdate(BaseModel):
    mastered: bool

class GenerateFlashcardsRequest(BaseModel):
    note_id: Optional[str] = None
    content: Optional[str] = None
    count: int = Field(default=5, ge=1, le=20)
