from pydantic import BaseModel, Field
from typing import Literal, Optional

class UploadResponse(BaseModel):
    book_id: str
    title: str
    num_chunks: int
    message: str

class QuizRequest(BaseModel):
    book_id: str
    topic: str
    num_questions: int = Field(5, ge=1, le=20)
    difficulty: Literal["facil", "medio", "dificil"] = "medio"
    type: Literal["multipla_escolha", "dissertativa"] = "multipla_escolha"

class Question(BaseModel):
    id: int
    question: str
    options: Optional[list[str]] = None
    correct_answer: str
    explanation: str
    source_reference: str

class QuizResponse(BaseModel):
    book_id: str
    topic: str
    questions: list[Question]

class AnswerItem(BaseModel):
    question_id: int
    question: str
    student_answer: str
    correct_answer: str
    explanation: str

class GradeRequest(BaseModel):
    answers: list[AnswerItem]

class GradeResult(BaseModel):
    question_id: int
    is_correct: bool
    score: float
    feedback: str

class GradeResponse(BaseModel):
    results: list[GradeResult]
    total_score: float

class ChatRequest(BaseModel):
    book_id: str
    message: str
    history: list[dict] = []

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
