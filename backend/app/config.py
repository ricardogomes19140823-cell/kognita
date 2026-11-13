from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    groq_api_key: str
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    upload_dir: str = "./storage/uploads"
    chunk_size: int = 800
    chunk_overlap: int = 100
    top_k: int = 4

    class Config:
        env_file = ".env"

settings = Settings()
