#!/usr/bin/env python3
"""
Script para iniciar o servidor FastAPI
"""
import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Iniciando servidor Intelligestor Backend...")
    print("📡 Servidor: http://localhost:8000")
    print("📚 Documentação: http://localhost:8000/docs")
    print("🔧 API ML Real: http://localhost:8000/ml/buybox/analysis/MLB4237624393")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )