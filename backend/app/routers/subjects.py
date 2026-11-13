import json
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from app.config import settings
from app.services.vector_store import client, COLLECTION
from qdrant_client.models import Filter, FieldCondition, MatchValue, Distance, VectorParams, PointStruct

router = APIRouter(prefix="/subjects", tags=["subjects"])
client_groq = Groq(api_key=settings.groq_api_key)

SUBJECTS_COLLECTION = "subjects"

class SubjectRequest(BaseModel):
    book_id: str
    subject_name: str
    keywords: list[str]

def ensure_subjects_collection():
    if not client.collection_exists(SUBJECTS_COLLECTION):
        # Vetor de tamanho 1 só para cumprir o requisito do Qdrant
        client.create_collection(
            collection_name=SUBJECTS_COLLECTION,
            vectors_config=VectorParams(size=1, distance=Distance.COSINE),
        )

@router.post("/suggest")
def suggest_subjects(book_id: str):
    points, _ = client.scroll(
        collection_name=COLLECTION,
        scroll_filter=Filter(must=[FieldCondition(key="book_id", match=MatchValue(value=book_id))]),
        limit=5,
        with_payload=True
    )
    sample_text = "\n".join([p.payload["text"] for p in points])
    
    prompt = f"""Analise o texto abaixo e sugira divisões de matérias (ex: Matemática, Português, História).
Retorne um JSON no formato:
{{
  "subjects": [
    {{"name": "Matemática", "keywords": ["números", "contas"]}},
    {{"name": "Português", "keywords": ["texto", "gramática"]}}
  ]
}}
Texto: {sample_text}"""
    
    resp = client_groq.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)

@router.post("/tag")
def tag_subject(req: SubjectRequest):
    ensure_subjects_collection()
    
    # Verifica se a matéria já existe para esse livro
    existing, _ = client.scroll(
        collection_name=SUBJECTS_COLLECTION,
        scroll_filter=Filter(must=[
            FieldCondition(key="book_id", match=MatchValue(value=req.book_id)),
            FieldCondition(key="name", match=MatchValue(value=req.subject_name))
        ]),
        limit=1
    )
    if existing:
        return {"message": "Matéria já existe!"}

    # Salva a nova matéria no Qdrant
    point = PointStruct(
        id=str(uuid.uuid4()),
        vector=[0.0], # Vetor dummy
        payload={
            "book_id": req.book_id,
            "name": req.subject_name,
            "keywords": req.keywords
        }
    )
    client.upsert(collection_name=SUBJECTS_COLLECTION, points=[point])
    return {"message": f"Matéria {req.subject_name} salva com sucesso!"}

@router.get("/list/{book_id}")
def list_subjects(book_id: str):
    ensure_subjects_collection()
    points, _ = client.scroll(
        collection_name=SUBJECTS_COLLECTION,
        scroll_filter=Filter(must=[FieldCondition(key="book_id", match=MatchValue(value=book_id))]),
        limit=100,
        with_payload=True
    )
    return [{"name": p.payload["name"], "keywords": p.payload["keywords"]} for p in points]
