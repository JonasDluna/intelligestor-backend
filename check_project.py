"""
Script de verificação do projeto
"""
import sys
import os

print("🔍 Verificando configuração do projeto...\n")

# Verificar imports
try:
    from app.config.settings import settings
    print("✅ Settings carregadas com sucesso")
    print(f"   - Environment: {settings.ENVIRONMENT}")
    print(f"   - Debug: {settings.DEBUG}")
    print(f"   - Supabase URL: {settings.SUPABASE_URL[:30]}..." if settings.SUPABASE_URL else "   - Supabase: não configurado")
except Exception as e:
    print(f"❌ Erro ao carregar settings: {e}")
    sys.exit(1)

# Verificar FastAPI
try:
    from main import app
    print("\n✅ FastAPI app carregada com sucesso")
    print(f"   - Title: {app.title}")
    print(f"   - Version: {app.version}")
    print(f"   - Rotas: {len(app.routes)}")
except Exception as e:
    print(f"\n❌ Erro ao carregar FastAPI: {e}")
    sys.exit(1)

# Verificar routers
print("\n📋 Routers disponíveis:")
for route in app.routes:
    if hasattr(route, 'path') and hasattr(route, 'methods'):
        methods = ','.join(route.methods) if route.methods else 'N/A'
        print(f"   - {methods:10} {route.path}")

print("\n✅ Todas as verificações passaram!")
print("\n🚀 Projeto pronto para deploy!")
