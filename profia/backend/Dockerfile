# syntax=docker/dockerfile:1

FROM python:3.12-slim

WORKDIR /app

# Instalar dependências de sistema (necessárias para sentence-transformers/torch)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY app ./app

# Criar pasta de uploads
RUN mkdir -p storage/uploads

# Expor porta
EXPOSE 8000

# Rodar uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
