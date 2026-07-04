from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = "sqlite:///./erp.db"

    FIRST_SUPERUSER_EMAIL: str = "admin@erp.com"
    FIRST_SUPERUSER_PASSWORD: str = "Admin@123"
    FIRST_SUPERUSER_NAME: str = "Administrador"

    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:3001"]'

    APP_NAME: str = "ERP Empresarial"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    def get_cors_origins(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
