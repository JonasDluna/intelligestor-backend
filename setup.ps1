# Script de Setup - Intelligestor Backend
# Execute este script para configurar o ambiente

Write-Host "🚀 Iniciando setup do Intelligestor Backend..." -ForegroundColor Green

# 1. Verificar se Python está instalado
Write-Host "`n📦 Verificando Python..." -ForegroundColor Cyan
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Python não encontrado. Instale Python 3.9+ primeiro." -ForegroundColor Red
    exit 1
}
Write-Host "✅ $pythonVersion encontrado" -ForegroundColor Green

# 2. Criar ambiente virtual
Write-Host "`n🔧 Criando ambiente virtual..." -ForegroundColor Cyan
if (Test-Path .venv) {
    Write-Host "⚠️  Ambiente virtual já existe" -ForegroundColor Yellow
} else {
    python -m venv .venv
    Write-Host "✅ Ambiente virtual criado" -ForegroundColor Green
}

# 3. Ativar ambiente virtual
Write-Host "`n🔌 Ativando ambiente virtual..." -ForegroundColor Cyan
& .\.venv\Scripts\Activate.ps1

# 4. Atualizar pip
Write-Host "`n⬆️  Atualizando pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# 5. Instalar dependências
Write-Host "`n📚 Instalando dependências..." -ForegroundColor Cyan
pip install -r requirements.txt

# 6. Verificar instalação
Write-Host "`n✅ Verificando instalação..." -ForegroundColor Cyan
Write-Host "Pacotes instalados:" -ForegroundColor Yellow
pip list | Select-String -Pattern "fastapi|uvicorn|supabase|openai|pyjwt|bcrypt"

# 7. Verificar arquivo .env
Write-Host "`n🔐 Verificando configuração..." -ForegroundColor Cyan
if (Test-Path .env) {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Arquivo .env não encontrado. Crie um baseado em .env.example" -ForegroundColor Yellow
}

Write-Host "`n✨ Setup concluído!" -ForegroundColor Green
Write-Host "`n📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure as variáveis de ambiente no arquivo .env"
Write-Host "2. Execute: uvicorn main:app --reload"
Write-Host "3. Acesse: http://localhost:8000/docs"
Write-Host "`n🎉 Pronto para usar!" -ForegroundColor Green
