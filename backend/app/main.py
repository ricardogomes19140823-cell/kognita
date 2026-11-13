from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import upload, quiz, chat, books, subjects

app = FastAPI(title="ProfIA", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(books.router)
app.include_router(quiz.router)
app.include_router(chat.router)
app.include_router(subjects.router)

@app.get("/health")
def health():
    return {"status": "ok"}
