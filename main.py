"""
Aplicação principal FastAPI - Intelligestor Backend
Sistema de gestão para integração com Mercado Livre
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.routers import (
    ia_buybox, 
    ia_products, 
    auth,
    auth_ml, 
    catalog,
    produtos,
    estoque,
    ml,
    ml_real,  # Nova rota para dados REAIS do ML
    automacao,
    webhooks_ml,
    ai_analysis,
    integrations
)

# Criar aplicação FastAPI
app = FastAPI(
    title="Intelligestor Backend",
    description="Sistema de gestão para integração com Mercado Livre",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS - Permitir origens específicas
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://intelligestor-frontend.vercel.app",
]

# Adicionar todos os domínios preview do Vercel dinamicamente
import re

def check_vercel_origin(origin: str) -> bool:
    """Verifica se a origem é um domínio Vercel válido"""
    vercel_pattern = re.compile(r'^https://intelligestor-frontend.*\.vercel\.app$')
    return bool(vercel_pattern.match(origin))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://intelligestor-frontend.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Incluir routers
# Auth & Catalog
app.include_router(auth.router)
app.include_router(auth_ml.router)
app.include_router(catalog.router)
app.include_router(webhooks_ml.router)

# IA (Legacy + New)
app.include_router(ia_buybox.router)
app.include_router(ia_products.router)
app.include_router(ai_analysis.router)

# Core V2.0 - Novos endpoints
app.include_router(produtos.router)
app.include_router(estoque.router)
app.include_router(ml.router)
app.include_router(ml_real.router)  # API REAL do Mercado Livre
app.include_router(automacao.router)
app.include_router(integrations.router)


@app.get("/")
async def root():
    """Endpoint raiz - Health check"""
    return {
        "status": "online",
        "service": "Intelligestor Backend",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "render_service_id": settings.RENDER_SERVICE_ID
    }


@app.get("/health")
async def health_check():
    """Verificação de saúde da aplicação"""
    return {
        "status": "healthy",
        "timestamp": "2025-11-14T00:00:00Z",
        "services": {
            "supabase": "connected" if settings.SUPABASE_URL else "not configured",
            "openai": "configured" if settings.OPENAI_API_KEY else "not configured",
            "mercadolivre": "configured" if settings.ML_CLIENT_ID else "not configured"
        }
    }


@app.get("/api/info")
async def api_info():
    """Informações sobre a API"""
    return {
        "name": "Intelligestor Backend API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/auth/ml/*",
            "products": "/api/products/*",
            "buybox": "/api/buybox/*",
            "catalog": "/api/catalog/*",
            "monitor": "/api/monitor/*",
            "automations": "/api/automations/*"
        },
        "documentation": {
            "swagger": f"{settings.RENDER_URL}/docs",
            "redoc": f"{settings.RENDER_URL}/redoc"
        }
    }


# Tratamento de erros global
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handler global para exceções não tratadas"""
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Erro interno do servidor",
            "detail": str(exc) if settings.DEBUG else None
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
