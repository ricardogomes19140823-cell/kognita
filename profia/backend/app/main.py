from fastapi import FastAPI
from app.routers import upload, quiz, chat

app = FastAPI(title="ProfIA", version="0.1.0")

app.include_router(upload.router)
app.include_router(quiz.router)
app.include_router(chat.router)

@app.get("/health")
def health():
    return {"status": "ok"}
