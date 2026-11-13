import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter,
    FieldCondition, MatchValue,
)
from app.config import settings
from app.services.embeddings import embed_texts, embed_query

client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
COLLECTION = "books"
DIM = 384

def _ensure_collection():
    if not client.collection_exists(COLLECTION):
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=VectorParams(size=DIM, distance=Distance.COSINE),
        )

def index_chunks(book_id: str, chunks: list[str]) -> int:
    _ensure_collection()
    vectors = embed_texts(chunks)
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vec,
            payload={"book_id": book_id, "text": chunk, "chunk_index": i},
        )
        for i, (chunk, vec) in enumerate(zip(chunks, vectors))
    ]
    client.upsert(collection_name=COLLECTION, points=points)
    return len(points)

def search(book_id: str, query: str, top_k: int = None) -> list[dict]:
    top_k = top_k or settings.top_k
    vec = embed_query(query)
    response = client.query_points(
        collection_name=COLLECTION,
        query=vec,
        limit=top_k,
        query_filter=Filter(
            must=[FieldCondition(key="book_id", match=MatchValue(value=book_id))]
        ),
    )
    return [
        {"text": r.payload["text"], "score": r.score, "index": r.payload["chunk_index"]}
        for r in response.points
    ]
