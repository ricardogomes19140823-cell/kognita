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
- Retorne JSON válido, nada além do JSON.
- NUNCA retorne null. Se não souber um campo, retorne uma string vazia."""

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
    prompt = USER_TEMPLATE.format(topic=topic, n=n, qtype=qtype, difficulty=difficulty, context=context)
    
    resp = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.7,
        max_tokens=2000,
    )
    data = json.loads(resp.choices[0].message.content)
    
    questions = []
    for i, q in enumerate(data.get("questions", [])):
        # Sanitização: garante que campos obrigatórios não sejam None
        questions.append(Question(
            id=i + 1,
            question=q.get("question") or "Questão gerada sem texto.",
            options=q.get("options") if q.get("options") else None,
            correct_answer=q.get("correct_answer") or "Resposta não fornecida pela IA.",
            explanation=q.get("explanation") or "Explicação não fornecida.",
            source_reference=q.get("source_reference") or "[Página não identificada]"
        ))
    
    return questions
