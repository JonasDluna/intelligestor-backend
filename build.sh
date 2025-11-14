#!/usr/bin/env bash
# Build script para Render

echo "🚀 Iniciando build do Intelligestor Backend..."

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

echo "✅ Build concluído com sucesso!"
