# Script para iniciar o servidor em desenvolvimento

Write-Host "🚀 Iniciando Intelligestor Backend..." -ForegroundColor Green

# Ativar ambiente virtual
if (Test-Path .venv\Scripts\Activate.ps1) {
    Write-Host "🔌 Ativando ambiente virtual..." -ForegroundColor Cyan
    & .\.venv\Scripts\Activate.ps1
} else {
    Write-Host "❌ Ambiente virtual não encontrado. Execute setup.ps1 primeiro." -ForegroundColor Red
    exit 1
}

# Verificar .env
if (-not (Test-Path .env)) {
    Write-Host "⚠️  Arquivo .env não encontrado!" -ForegroundColor Yellow
    Write-Host "Crie um arquivo .env com as variáveis necessárias." -ForegroundColor Yellow
}

# Verificar se a porta 8000 está livre
$port = 8000
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Porta 8000 em uso, tentando porta 8001..." -ForegroundColor Yellow
    $port = 8001
}

# Iniciar servidor
Write-Host "🌐 Iniciando servidor em http://localhost:$port" -ForegroundColor Green
Write-Host "📚 Documentação disponível em http://localhost:$port/docs" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host ""

uvicorn main:app --reload --host 0.0.0.0 --port $port
