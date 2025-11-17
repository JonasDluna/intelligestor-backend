# Script de Deploy - IntelliGestor Frontend
param([string]$GithubUsername = "JonasDluna", [string]$RepoName = "intelligestor-frontend")

Write-Host "Iniciando deploy do Frontend IntelliGestor..." -ForegroundColor Cyan
Write-Host ""

# Verificar package.json
if (!(Test-Path "package.json")) {
    Write-Host "ERRO: package.json nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "OK: package.json encontrado!" -ForegroundColor Green
Write-Host ""

# Build
Write-Host "Executando build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build falhou!" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Build passou!" -ForegroundColor Green
Write-Host ""

# Git init
Write-Host "Configurando Git..." -ForegroundColor Yellow
if (!(Test-Path ".git")) {
    git init
    Write-Host "OK: Git inicializado!" -ForegroundColor Green
} else {
    Write-Host "OK: Git ja inicializado!" -ForegroundColor Green
}

# Add e commit
git add .
git status --short

$commitExists = git log --oneline 2>$null
if (!$commitExists) {
    git commit -m "feat: Initial commit - Frontend IntelliGestor"
} else {
    $changes = git status --porcelain
    if ($changes) {
        git commit -m "feat: Preparar para deploy"
    }
}

Write-Host "OK: Commit criado!" -ForegroundColor Green
Write-Host ""

# Remote
Write-Host "Configurando remote..." -ForegroundColor Yellow
$repoUrl = "https://github.com/$GithubUsername/$RepoName.git"
Write-Host "URL: $repoUrl"

$currentRemote = git remote get-url origin 2>$null
if ($currentRemote) {
    git remote set-url origin $repoUrl
} else {
    git remote add origin $repoUrl
}

Write-Host "OK: Remote configurado!" -ForegroundColor Green
Write-Host ""

# Branch main
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    git branch -M main
}

Write-Host "OK: Branch main configurada!" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "Enviando para GitHub..." -ForegroundColor Yellow
Write-Host "Voce precisara autenticar com GitHub!" -ForegroundColor Yellow
Write-Host "Use seu Personal Access Token como senha" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERRO ao fazer push!" -ForegroundColor Red
    Write-Host "Crie um Personal Access Token em:" -ForegroundColor Yellow
    Write-Host "https://github.com/settings/tokens" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "SUCESSO! Codigo enviado para GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://vercel.com/new" -ForegroundColor White
Write-Host "2. Selecione: $RepoName" -ForegroundColor White
Write-Host "3. Adicione variaveis:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_URL = https://intelligestor-backend.onrender.com" -ForegroundColor Yellow
Write-Host "   NODE_ENV = production" -ForegroundColor Yellow
Write-Host "4. Clique em Deploy" -ForegroundColor White
Write-Host ""
Write-Host "Abrindo Vercel..." -ForegroundColor Yellow
Start-Process "https://vercel.com/new"
