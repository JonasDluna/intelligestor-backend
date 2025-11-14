import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

load_dotenv()


class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")
    
    # Mercado Livre Configuration
    ML_CLIENT_ID: str = os.getenv("ML_CLIENT_ID", "")
    ML_CLIENT_SECRET: str = os.getenv("ML_CLIENT_SECRET", "")
    ML_REDIRECT_URI: str = os.getenv("ML_REDIRECT_URI", "")
    ML_AUTH_URL: str = "https://auth.mercadolivre.com.br/authorization"
    ML_TOKEN_URL: str = "https://api.mercadolibre.com/oauth/token"
    ML_API_URL: str = "https://api.mercadolibre.com"
    
    # Render Configuration
    RENDER_SERVICE_ID: str = os.getenv("RENDER_SERVICE_ID", "")
    RENDER_URL: str = os.getenv("RENDER_URL", "")
    
    # Application Settings
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_this_secret_key_in_production")
    
    # CORS Settings
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "https://intelligestor-backend.onrender.com",
        "https://intelligestor-backend-rlyo.vercel.app",
        "https://vercel.app",
        "https://*.vercel.app"
    ]
    
    # JWT Settings
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Instância global das configurações
settings = Settings()


# Validações
if not settings.OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY não configurada. Defina no .env ou nas variáveis de ambiente.")

if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
    raise RuntimeError("Configurações do Supabase não encontradas. Defina SUPABASE_URL e SUPABASE_ANON_KEY no .env")


# Exportações para compatibilidade com código existente
OPENAI_API_KEY = settings.OPENAI_API_KEY
OPENAI_MODEL = settings.OPENAI_MODEL

