import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

# Search and load .env from current directory, backend directory, and root workspace
current_dir = Path(__file__).resolve().parent
for candidate in [
    Path.cwd() / ".env",
    current_dir.parent / ".env",
    current_dir.parent.parent / ".env",
]:
    if candidate.exists():
        load_dotenv(candidate, override=False)

def _get_google_client_id() -> Optional[str]:
    raw = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID")
    if not raw:
        return None
    cleaned = raw.strip().strip('"').strip("'")
    return cleaned if cleaned else None

class Settings(BaseSettings):
    PROJECT_NAME: str = "Solvify Financial Health & Bankruptcy Risk Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "solvify-enterprise-super-secret-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./solvify.db")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GOOGLE_CLIENT_ID: Optional[str] = _get_google_client_id()
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
