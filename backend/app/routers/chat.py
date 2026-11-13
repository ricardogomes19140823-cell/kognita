from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.tutor import tutor_answer

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest):
    answer, sources = tutor_answer(req.book_id, req.message, req.history)
    return ChatResponse(answer=answer, sources=sources)
