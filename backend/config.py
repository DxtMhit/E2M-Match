from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Gemini AI
    GEMINI_API_KEY: str = ""
    MODEL_NAME: str = "gemini-2.0-flash"
    MODEL_TEMPERATURE: float = 0.3
    MODEL_MAX_TOKENS: int = 8192

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Server
    PORT: int = 8000

    # File upload
    MAX_FILE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
