import json
from groq import Groq
from app.config import settings
from app.models.schemas import AnswerItem, GradeResult

client = Groq(api_key=settings.groq_api_key)

SYSTEM = """Você é um corretor justo e didático.
- Para múltipla escolha: compare exatamente a alternativa.
- Para dissertativa: avalie com base na resposta esperada + explicação.
- Dê feedback construtivo, citando o que faltou.
- Retorne JSON válido."""

def grade_answers(answers: list[AnswerItem]) -> list[GradeResult]:
    payload = [
        {
            "question_id": a.question_id,
            "question": a.question,
            "student_answer": a.student_answer,
            "correct_answer": a.correct_answer,
            "explanation": a.explanation,
        }
        for a in answers
    ]
    resp = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": json.dumps({"answers": payload}, ensure_ascii=False)
             + '\n\nRetorne: {"results":[{"question_id":1,"is_correct":true,"score":1.0,"feedback":"..."}]}'},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    data = json.loads(resp.choices[0].message.content)
    return [GradeResult(**r) for r in data["results"]]
