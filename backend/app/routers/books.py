from fastapi import APIRouter, HTTPException
from qdrant_client.models import Filter, FieldCondition, MatchValue
from app.services.vector_store import client, COLLECTION

router = APIRouter(tags=["books"])

@router.get("/books/{book_id}")
def get_book_info(book_id: str):
    try:
        result = client.count(
            collection_name=COLLECTION,
            count_filter=Filter(
                must=[FieldCondition(key="book_id", match=MatchValue(value=book_id))]
            ),
        )
        if result.count == 0:
            raise HTTPException(404, "Livro não encontrado")
        return {"book_id": book_id, "title": "Livro indexado", "num_chunks": result.count}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Erro: {e}")

@router.get("/books/{book_id}/page/{page_number}")
def get_book_page(book_id: str, page_number: int):
    try:
        points, _ = client.scroll(
            collection_name=COLLECTION,
            scroll_filter=Filter(
                must=[FieldCondition(key="book_id", match=MatchValue(value=book_id))]
            ),
            limit=200,
        )
        page_marker = f"[Página {page_number}]"
        for point in points:
            text = point.payload.get("text", "")
            if page_marker in text:
                page_text = text.split(page_marker)[1].strip()
                return {"page": page_number, "text": page_text}
        raise HTTPException(404, f"Página {page_number} não encontrada")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Erro: {e}")
