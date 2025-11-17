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
    
    # Vercel Configuration
    VERCEL_PROJECT_ID: str = os.getenv("VERCEL_PROJECT_ID", "")
    VERCEL_URL: str = os.getenv("VERCEL_URL", "")
    
    # Application Settings
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change_this_secret_key_in_production")
    
    # CORS Settings - Allow all origins for Vercel preview deployments
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "https://intelligestor-backend.onrender.com",
        "https://intelligestor-backend-rlyo.vercel.app",
        "https://intelligestor-frontend.vercel.app",
        "https://intelligestor-frontend-git-main-jonasdlunas-projects.vercel.app",
        "*"  # Allow all for testing - CHANGE IN PRODUCTION
    ]
    
    # JWT Settings
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignorar variáveis extras do .env


# Instância global das configurações
settings = Settings()


# Validações em produção - warnings em vez de errors para permitir deployment inicial
import warnings

if not settings.OPENAI_API_KEY:
    warnings.warn("⚠️  OPENAI_API_KEY não configurada. Funcionalidades de IA não funcionarão.")

if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
    warnings.warn("⚠️  Configurações do Supabase não encontradas. Database não funcionará.")

if not settings.ML_CLIENT_ID or not settings.ML_CLIENT_SECRET:
    warnings.warn("⚠️  Credenciais do Mercado Livre não configuradas. OAuth não funcionará.")


# Exportações para compatibilidade com código existente
OPENAI_API_KEY = settings.OPENAI_API_KEY
OPENAI_MODEL = settings.OPENAI_MODEL


# Supabase Client Singleton
_supabase_client = None

def get_supabase_client():
    """
    Retorna cliente Supabase singleton
    Inicializa apenas uma vez para melhor performance
    """
    global _supabase_client
    
    if _supabase_client is None:
        from supabase import create_client
        
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError("Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.")
        
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY  # Service role para bypass RLS
        )
    
    return _supabase_client

