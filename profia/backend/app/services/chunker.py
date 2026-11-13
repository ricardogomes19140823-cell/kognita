import tiktoken
from app.config import settings

_enc = tiktoken.get_encoding("cl100k_base")

def chunk_text(text: str, size: int = None, overlap: int = None) -> list[str]:
    size = size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap

    tokens = _enc.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = start + size
        chunk_tokens = tokens[start:end]
        chunks.append(_enc.decode(chunk_tokens))
        start += size - overlap
    return chunks
