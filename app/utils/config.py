"""
Configuration module for environment variables and app settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application settings
    APP_NAME: str = "IntelliGestor Backend"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True
    LOG_LEVEL: str = "INFO"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # Supabase settings
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Mercado Livre API settings
    MERCADOLIVRE_CLIENT_ID: str = ""
    MERCADOLIVRE_CLIENT_SECRET: str = ""
    MERCADOLIVRE_REDIRECT_URI: str = ""
    MERCADOLIVRE_ACCESS_TOKEN: str = ""
    
    # OpenAI settings
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
