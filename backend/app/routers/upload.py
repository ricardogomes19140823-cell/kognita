import os, uuid, shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from qdrant_client.models import Filter, FieldCondition, MatchValue
from app.config import settings
from app.services.pdf_extractor import extract_text, get_title
from app.services.chunker import chunk_text
from app.services.vector_store import index_chunks, client, COLLECTION
from app.models.schemas import UploadResponse

router = APIRouter(prefix="/upload", tags=["upload"])
os.makedirs(settings.upload_dir, exist_ok=True)

@router.post("", response_model=UploadResponse)
async def upload_book(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Apenas PDF suportado no MVP")
    book_id = str(uuid.uuid4())
    path = os.path.join(settings.upload_dir, f"{book_id}.pdf")
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    text = extract_text(path)
    if len(text) < 100:
        raise HTTPException(422, "PDF sem texto extraível")
    chunks = chunk_text(text)
    n = index_chunks(book_id, chunks)
    return UploadResponse(book_id=book_id, title=get_title(path), num_chunks=n,
                          message=f"{n} chunks indexados com sucesso")
