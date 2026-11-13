from groq import Groq
from app.config import settings
from app.services.vector_store import search

client = Groq(api_key=settings.groq_api_key)

SYSTEM = """Você é um tutor socrático. Responda APENAS com base no contexto.
Se a resposta não estiver no contexto, diga que não encontrou no material.
Cite a página sempre que possível.
Nunca entregue respostas prontas de atividades — guie o aluno com perguntas."""

def tutor_answer(book_id: str, message: str, history: list[dict]) -> tuple[str, list[str]]:
    chunks = search(book_id, message, top_k=4)
    context = "\n\n---\n\n".join(c["text"] for c in chunks)

    messages = [
        {"role": "system", "content": SYSTEM},
        {"role": "system", "content": f"CONTEXTO DO LIVRO:\n{context}"},
        *history[-6:],
        {"role": "user", "content": message},
    ]
    resp = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        temperature=0.3,
    )
    sources = [c["text"][:200] for c in chunks]
    return resp.choices[0].message.content, sources
