#!/usr/bin/env bash
# Start script otimizado para Render

echo "🚀 Iniciando Intelligestor Backend..."

# Verificar variáveis de ambiente críticas
if [ -z "$SUPABASE_URL" ]; then
    echo "⚠️ AVISO: SUPABASE_URL não configurada"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️ AVISO: OPENAI_API_KEY não configurada"
fi

# Mostrar informações do ambiente
echo "📊 Environment: $ENVIRONMENT"
echo "🐍 Python version: $(python --version)"
echo "📦 Uvicorn version: $(uvicorn --version)"

# Determinar número de workers baseado no plano
WORKERS=${WEB_CONCURRENCY:-2}
echo "👥 Workers: $WORKERS"

# Iniciar aplicação
echo "✅ Iniciando FastAPI com Uvicorn..."
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers $WORKERS \
    --log-level info \
    --access-log \
    --use-colors
