from fastapi import APIRouter
from app.models.schemas import QuizRequest, QuizResponse, GradeRequest, GradeResponse
from app.services.quiz_generator import generate_quiz
from app.services.grader import grade_answers

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.post("/generate", response_model=QuizResponse)
def gen(req: QuizRequest):
    questions = generate_quiz(
        req.book_id, req.topic, req.num_questions, req.difficulty, req.type
    )
    return QuizResponse(book_id=req.book_id, topic=req.topic, questions=questions)

@router.post("/grade", response_model=GradeResponse)
def grade(req: GradeRequest):
    results = grade_answers(req.answers)
    total = sum(r.score for r in results) / len(results) if results else 0
    return GradeResponse(results=results, total_score=round(total, 2))
