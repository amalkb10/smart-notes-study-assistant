from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class QuizOption(BaseModel):
    id: str  # e.g., "A", "B", "C", "D"
    text: str

class QuizQuestion(BaseModel):
    id: Optional[str] = None
    question: str
    options: List[QuizOption]
    correct_option: str # "A", "B", "C", or "D"
    explanation: str

class GenerateQuizRequest(BaseModel):
    note_id: Optional[str] = None
    content: Optional[str] = None
    num_questions: int = Field(default=5, ge=1, le=15)
    difficulty: str = Field(default="medium", example="easy, medium, hard")

class QuizSubmissionItem(BaseModel):
    question_index: int
    selected_option: str

class QuizSubmitRequest(BaseModel):
    note_id: Optional[str] = None
    answers: List[QuizSubmissionItem]
    questions: List[QuizQuestion]

class QuizEvaluationResult(BaseModel):
    total_questions: int
    correct_count: int
    score_percentage: float
    feedback: str
    details: List[dict]
