from pypdf import PdfReader

def extract_text(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append(f"[Página {i}]\n{text}")
    return "\n\n".join(pages)

def get_title(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    meta = reader.metadata
    if meta and meta.title:
        return meta.title
    return "Livro sem título"
