"""
IntelliGestor Backend - FastAPI Application
Main entry point for the application
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import mercadolivre, openai_gpt, products
from app.utils.config import settings

# Initialize FastAPI app
app = FastAPI(
    title="IntelliGestor Backend",
    description="Backend FastAPI do IntelliGestor – integra Mercado Livre, Supabase, OpenAI (GPT-5.1) e automações",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(mercadolivre.router, prefix="/api/v1/mercadolivre", tags=["Mercado Livre"])
app.include_router(openai_gpt.router, prefix="/api/v1/ai", tags=["OpenAI"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "IntelliGestor Backend API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )
