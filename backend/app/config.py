"""
Application configuration loaded from environment variables (.env).
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./tshirt_shop.db"

    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    CORS_ORIGINS: str = "https://aftereight-shop.mi312572.workers.dev,http://localhost:5173,http://localhost:3000"

    ADMIN_EMAIL: str = "admin@tshirtshop.com"
    ADMIN_PASSWORD: str = "Admin@12345"

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    class Config:
        env_file = ".env"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
