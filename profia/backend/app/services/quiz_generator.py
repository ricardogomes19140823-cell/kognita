import json
from groq import Groq
from app.config import settings
from app.services.vector_store import search
from app.models.schemas import Question

client = Groq(api_key=settings.groq_api_key)

SYSTEM = """Você é um professor especialista que cria atividades didáticas.
Regras:
- Baseie-se EXCLUSIVAMENTE no contexto fornecido.
- Não invente fatos.
- Retorne JSON válido, nada além do JSON."""

USER_TEMPLATE = """Com base no contexto abaixo sobre o tema "{topic}",
gere {n} questões do tipo "{qtype}" com dificuldade "{difficulty}".

CONTEXTO:
{context}

Schema JSON esperado:
{{
  "questions": [
    {{
      "question": "...",
      "options": ["...","...","...","..."],
      "correct_answer": "...",
      "explanation": "...",
      "source_reference": "[Página X]"
    }}
  ]
}}"""

def generate_quiz(book_id: str, topic: str, n: int, difficulty: str, qtype: str) -> list[Question]:
    chunks = search(book_id, topic, top_k=6)
    context = "\n\n---\n\n".join(c["text"] for c in chunks)

    prompt = USER_TEMPLATE.format(
        topic=topic, n=n, qtype=qtype, difficulty=difficulty, context=context
    )
    resp = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    data = json.loads(resp.choices[0].message.content)
    return [Question(id=i + 1, **q) for i, q in enumerate(data["questions"])]
