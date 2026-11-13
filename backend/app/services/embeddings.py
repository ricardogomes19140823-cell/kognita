import os
from sentence_transformers import SentenceTransformer

# Se a pasta local existir (como no seu Docker local), usa ela.
# Se não existir (como no Railway), baixa o modelo direto do Hugging Face.
MODEL_PATH = "/app/modelo_local"
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "all-MiniLM-L6-v2"  # Nome do modelo para download

_model = SentenceTransformer(MODEL_PATH)

def embed_texts(texts: list[str]) -> list[list[float]]:
    vecs = _model.encode(texts, convert_to_numpy=True)
    return [v.tolist() for v in vecs]

def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
