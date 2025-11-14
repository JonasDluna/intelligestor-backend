# Script de Deploy Automatizado - IntelliGestor Frontend
# Execute este script após criar o repositório no GitHub

param(
    [Parameter(Mandatory=$true)]
    [string]$GithubUsername,
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "intelligestor-frontend"
)

Write-Host "🚀 Iniciando Deploy do IntelliGestor Frontend..." -ForegroundColor Green
Write-Host ""

# Navegar para pasta do frontend
$FrontendPath = "C:\Users\jonas\Downloads\intelligestor-frontend"
Set-Location $FrontendPath

Write-Host "📁 Verificando diretório: $FrontendPath" -ForegroundColor Cyan
if (-not (Test-Path $FrontendPath)) {
    Write-Host "❌ Erro: Diretório do frontend não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se tem alterações
Write-Host ""
Write-Host "📝 Status do Git:" -ForegroundColor Cyan
git status

# Verificar se já tem remote
$RemoteUrl = git remote get-url origin 2>$null
if ($RemoteUrl) {
    Write-Host ""
    Write-Host "⚠️  Remote já existe: $RemoteUrl" -ForegroundColor Yellow
    $UpdateRemote = Read-Host "Deseja atualizar o remote? (S/N)"
    
    if ($UpdateRemote -eq "S" -or $UpdateRemote -eq "s") {
        git remote set-url origin "https://github.com/$GithubUsername/$RepoName.git"
        Write-Host "✅ Remote atualizado!" -ForegroundColor Green
    }
} else {
    git remote add origin "https://github.com/$GithubUsername/$RepoName.git"
    Write-Host "✅ Remote adicionado!" -ForegroundColor Green
}

# Fazer commit se necessário
Write-Host ""
$NeedCommit = Read-Host "Deseja fazer commit das alterações? (S/N)"
if ($NeedCommit -eq "S" -or $NeedCommit -eq "s") {
    git add .
    git commit -m "feat: Deploy frontend com integração backend corrigida"
    Write-Host "✅ Commit realizado!" -ForegroundColor Green
}

# Push para GitHub
Write-Host ""
Write-Host "📤 Enviando código para GitHub..." -ForegroundColor Cyan
git branch -M main

try {
    git push -u origin main
    Write-Host "✅ Código enviado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao enviar código. Verifique suas credenciais do GitHub." -ForegroundColor Red
    Write-Host "Erro: $_" -ForegroundColor Red
    exit 1
}

# Instruções finais
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "🎉 CÓDIGO ENVIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "📍 Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse: https://vercel.com/new" -ForegroundColor White
Write-Host "2. Faça login com sua conta GitHub" -ForegroundColor White
Write-Host "3. Selecione o repositório: $RepoName" -ForegroundColor White
Write-Host "4. Configure as variáveis de ambiente:" -ForegroundColor White
Write-Host ""
Write-Host "   NEXT_PUBLIC_API_URL = https://intelligestor-backend.onrender.com" -ForegroundColor Yellow
Write-Host "   NODE_ENV = production" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Clique em 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "6. Após o deploy, adicione a URL da Vercel no CORS do backend" -ForegroundColor White
Write-Host "   (arquivo: app/config/settings.py)" -ForegroundColor White
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "📚 Documentação completa: GUIA_DEPLOY_VERCEL.md" -ForegroundColor Cyan
Write-Host ""

# Abrir URLs úteis
$OpenBrowser = Read-Host "Deseja abrir a Vercel no navegador? (S/N)"
if ($OpenBrowser -eq "S" -or $OpenBrowser -eq "s") {
    Start-Process "https://vercel.com/new"
    Start-Process "https://github.com/$GithubUsername/$RepoName"
}

Write-Host "✅ Script concluído!" -ForegroundColor Green
