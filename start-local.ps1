# Script para iniciar o backend localmente
Write-Host "`n🚀 INICIANDO BACKEND LOCAL`n" -ForegroundColor Green
Write-Host "API: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Docs: http://127.0.0.1:8000/docs`n" -ForegroundColor Yellow

# Ativar ambiente virtual
& .\.venv\Scripts\Activate.ps1

# Mudar para o diretório do projeto e iniciar uvicorn
Set-Location -Path $PSScriptRoot
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
