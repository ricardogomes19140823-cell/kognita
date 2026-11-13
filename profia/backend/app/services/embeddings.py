from sentence_transformers import SentenceTransformer

# Modelo local gratuito, roda na CPU. Dimensão: 384
_model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_texts(texts: list[str]) -> list[list[float]]:
    vecs = _model.encode(texts, convert_to_numpy=True)
    return [v.tolist() for v in vecs]

def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
