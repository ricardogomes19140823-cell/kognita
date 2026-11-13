from sentence_transformers import SentenceTransformer

MODEL_PATH = "/app/modelo_local"

_model = SentenceTransformer(MODEL_PATH)

def embed_texts(texts: list[str]) -> list[list[float]]:
    vecs = _model.encode(texts, convert_to_numpy=True)
    return [v.tolist() for v in vecs]

def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
