# 🚀 Guia Completo de Deploy - IntelliGestor

## 📋 Pré-requisitos

### 1. Contas Necessárias
- ✅ **GitHub** - Repositório do código
- ✅ **Render** - Deploy do Backend (Python/FastAPI)
- ✅ **Vercel** - Deploy do Frontend (Next.js)
- ✅ **Supabase** - Banco de dados PostgreSQL

### 2. Credenciais Necessárias
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Mercado Livre
ML_CLIENT_ID=1234567890
ML_CLIENT_SECRET=abc123xyz...
ML_REDIRECT_URI=https://intelligestor-backend.onrender.com/auth/ml/callback

# OpenAI (opcional)
OPENAI_API_KEY=sk-xxx...
OPENAI_MODEL=gpt-4o-mini
```

---

## 🔧 PARTE 1: Deploy do Backend (Render)

### Opção A: Deploy via GitHub (Recomendado)

#### 1. Preparar Repositório Backend
```powershell
# No diretório raiz do projeto backend
cd intelligestor-backend-main

# Verificar se está tudo commitado
git status

# Commitar mudanças pendentes
git add .
git commit -m "feat: Preparar para deploy backend"

# Criar repositório no GitHub (se ainda não existir)
# Ir em: https://github.com/new
# Nome: intelligestor-backend

# Conectar ao repositório
git remote add origin https://github.com/JonasDluna/intelligestor-backend.git
git branch -M main
git push -u origin main
```

#### 2. Configurar Render

**a) Acessar:** https://dashboard.render.com/

**b) Clicar em:** "New +" → "Web Service"

**c) Conectar GitHub:**
- Selecionar repositório: `intelligestor-backend`
- Branch: `main`

**d) Configurações:**
```yaml
Name: intelligestor-backend
Region: Oregon (US West)
Branch: main
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 2
Plan: Free
```

**e) Environment Variables:**
```env
ENVIRONMENT=production
DEBUG=False
SUPABASE_URL=<seu_url>
SUPABASE_ANON_KEY=<sua_key>
SUPABASE_SERVICE_ROLE_KEY=<sua_key>
OPENAI_API_KEY=<sua_key>
OPENAI_MODEL=gpt-4o-mini
ML_CLIENT_ID=<seu_id>
ML_CLIENT_SECRET=<seu_secret>
ML_REDIRECT_URI=https://intelligestor-backend.onrender.com/auth/ml/callback
ML_AUTH_URL=https://auth.mercadolivre.com.br/authorization
ML_API_URL=https://api.mercadolibre.com
CORS_ORIGINS=http://localhost:3000,https://intelligestor-frontend.vercel.app
```

**f) Clicar em:** "Create Web Service"

**g) Aguardar build** (3-5 minutos)

**h) Testar:** https://intelligestor-backend.onrender.com/health

### Opção B: Deploy Manual (Render CLI)

```powershell
# Instalar Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy --service intelligestor-backend
```

---

## 🎨 PARTE 2: Deploy do Frontend (Vercel)

### Opção A: Deploy via GitHub (Recomendado)

#### 1. Preparar Repositório Frontend
```powershell
# No diretório frontend
cd intelligestor-backend-main/frontend

# Verificar se está tudo commitado
git status

# Commitar mudanças pendentes
git add .
git commit -m "feat: Preparar para deploy frontend"

# Criar repositório no GitHub (se ainda não existir)
# Ir em: https://github.com/new
# Nome: intelligestor-frontend

# Conectar ao repositório (se for repositório separado)
git remote add origin https://github.com/JonasDluna/intelligestor-frontend.git
git branch -M main
git push -u origin main
```

#### 2. Configurar Vercel

**a) Acessar:** https://vercel.com/new

**b) Importar Projeto:**
- Selecionar repositório: `intelligestor-frontend`
- Ou conectar ao monorepo: `intelligestor-backend` (pasta `/frontend`)

**c) Configurações:**
```yaml
Framework Preset: Next.js
Root Directory: frontend (se monorepo) ou deixar vazio
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**d) Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://intelligestor-backend.onrender.com
NEXT_PUBLIC_ML_APP_ID=<seu_ml_app_id>
NODE_ENV=production
```

**e) Clicar em:** "Deploy"

**f) Aguardar build** (2-4 minutos)

**g) Testar:** https://intelligestor-frontend.vercel.app

### Opção B: Deploy via Vercel CLI

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (no diretório frontend)
cd frontend
vercel

# Deploy para produção
vercel --prod
```

---

## 📦 PARTE 3: Scripts Automatizados

### Script PowerShell: Deploy Completo

Criar arquivo `deploy-full.ps1` na raiz:

```powershell
# Deploy Completo - Backend + Frontend
param(
    [string]$Message = "Deploy automático"
)

Write-Host "🚀 Iniciando Deploy Completo..." -ForegroundColor Cyan
Write-Host ""

# ==========================================
# BACKEND
# ==========================================
Write-Host "📦 BACKEND: Preparando deploy..." -ForegroundColor Yellow

cd intelligestor-backend-main

# Verificar mudanças
$backendChanges = git status --porcelain
if ($backendChanges) {
    Write-Host "✓ Mudanças detectadas no backend" -ForegroundColor Green
    
    # Commit e push
    git add .
    git commit -m "backend: $Message"
    git push origin main
    
    Write-Host "✓ Backend pushed para GitHub" -ForegroundColor Green
    Write-Host "✓ Render fará deploy automático em ~3 minutos" -ForegroundColor Green
} else {
    Write-Host "⊘ Sem mudanças no backend" -ForegroundColor Gray
}

Write-Host ""

# ==========================================
# FRONTEND
# ==========================================
Write-Host "🎨 FRONTEND: Preparando deploy..." -ForegroundColor Yellow

cd frontend

# Verificar mudanças
$frontendChanges = git status --porcelain
if ($frontendChanges) {
    Write-Host "✓ Mudanças detectadas no frontend" -ForegroundColor Green
    
    # Commit e push
    git add .
    git commit -m "frontend: $Message"
    git push origin main
    
    Write-Host "✓ Frontend pushed para GitHub" -ForegroundColor Green
    Write-Host "✓ Vercel fará deploy automático em ~2 minutos" -ForegroundColor Green
} else {
    Write-Host "⊘ Sem mudanças no frontend" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Deploy iniciado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  https://intelligestor-backend.onrender.com/health" -ForegroundColor White
Write-Host "   Frontend: https://intelligestor-frontend.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "📊 Dashboards:" -ForegroundColor Cyan
Write-Host "   Render:  https://dashboard.render.com/" -ForegroundColor White
Write-Host "   Vercel:  https://vercel.com/dashboard" -ForegroundColor White
```

Usar:
```powershell
.\deploy-full.ps1 -Message "Melhorias no modal BuyBox"
```

---

## 🔄 PARTE 4: CI/CD Automático (GitHub Actions)

### Backend: `.github/workflows/backend-deploy.yml`

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'intelligestor-backend-main/**'
      - '!intelligestor-backend-main/frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Frontend: `.github/workflows/frontend-deploy.yml`

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'intelligestor-backend-main/frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          cd intelligestor-backend-main/frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🧪 PARTE 5: Testes Pós-Deploy

### Script de Teste: `test-deploy.ps1`

```powershell
Write-Host "🧪 Testando Deploy..." -ForegroundColor Cyan
Write-Host ""

# Backend
Write-Host "📦 Testando Backend..." -ForegroundColor Yellow
$backendHealth = Invoke-RestMethod -Uri "https://intelligestor-backend.onrender.com/health"
if ($backendHealth.status -eq "healthy") {
    Write-Host "✓ Backend: OK" -ForegroundColor Green
} else {
    Write-Host "✗ Backend: ERRO" -ForegroundColor Red
}

# Frontend
Write-Host "🎨 Testando Frontend..." -ForegroundColor Yellow
try {
    $frontendStatus = Invoke-WebRequest -Uri "https://intelligestor-frontend.vercel.app" -UseBasicParsing
    if ($frontendStatus.StatusCode -eq 200) {
        Write-Host "✓ Frontend: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend: ERRO" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Testes concluídos!" -ForegroundColor Green
```

---

## 📝 PARTE 6: Checklist de Deploy

### Antes do Deploy

- [ ] Testes locais passando
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Commits descritivos
- [ ] README atualizado
- [ ] CHANGELOG atualizado (se houver)

### Backend (Render)

- [ ] `render.yaml` configurado
- [ ] `requirements.txt` atualizado
- [ ] Variáveis de ambiente no painel Render
- [ ] URL de callback do ML configurada
- [ ] CORS configurado para URL do frontend

### Frontend (Vercel)

- [ ] `vercel.json` configurado
- [ ] `package.json` com scripts corretos
- [ ] `NEXT_PUBLIC_API_URL` apontando para backend
- [ ] Build local sem erros
- [ ] Imagens otimizadas

### Pós-Deploy

- [ ] Testar rota `/health` do backend
- [ ] Testar página inicial do frontend
- [ ] Testar login/autenticação
- [ ] Testar integração com Mercado Livre
- [ ] Verificar logs no Render
- [ ] Verificar logs no Vercel
- [ ] Testar modal BuyBox
- [ ] Verificar responsividade mobile

---

## 🔍 PARTE 7: Troubleshooting

### Backend não inicia no Render

**Problema:** Build falha
```bash
# Verificar logs no Render Dashboard
# Possíveis causas:
# - requirements.txt com dependência faltando
# - Variável de ambiente faltando
# - Python version incompatível
```

**Solução:**
```yaml
# render.yaml
buildCommand: |
  python --version
  pip install --upgrade pip
  pip install -r requirements.txt --no-cache-dir
```

### Frontend com erro 500

**Problema:** Não consegue conectar ao backend
```javascript
// Verificar se API_URL está correta
console.log(process.env.NEXT_PUBLIC_API_URL)
```

**Solução:**
```bash
# No Vercel Dashboard:
# Settings → Environment Variables
# Adicionar: NEXT_PUBLIC_API_URL=https://intelligestor-backend.onrender.com
# Redeployar
```

### CORS Error

**Problema:** Frontend não consegue fazer requisições
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS
```

**Solução:**
```python
# No backend: app/config/settings.py
ALLOWED_ORIGINS: list = [
    "http://localhost:3000",
    "https://intelligestor-frontend.vercel.app",
    "https://intelligestor-frontend-*.vercel.app"  # Preview deploys
]
```

---

## 🎯 PARTE 8: Comandos Rápidos

### Deploy Rápido (apenas commit atual)
```powershell
# Backend
cd intelligestor-backend-main
git add . ; git commit -m "deploy" ; git push

# Frontend
cd frontend
git add . ; git commit -m "deploy" ; git push
```

### Forçar Redeploy (sem mudanças)
```powershell
# Trigger webhook do Render
Invoke-WebRequest -Uri "https://api.render.com/deploy/srv-xxx" -Method POST

# Ou criar commit vazio
git commit --allow-empty -m "chore: force deploy"
git push
```

### Rollback para versão anterior
```powershell
# No Render Dashboard:
# Service → Deployments → Rollback

# Ou via Git:
git revert HEAD
git push
```

---

## 📊 PARTE 9: Monitoramento

### Logs Backend (Render)
```bash
# Via dashboard: https://dashboard.render.com/
# Services → intelligestor-backend → Logs

# Ou via CLI:
render logs intelligestor-backend
```

### Logs Frontend (Vercel)
```bash
# Via dashboard: https://vercel.com/dashboard
# Project → Deployments → [Select] → Logs

# Ou via CLI:
vercel logs intelligestor-frontend
```

### Health Checks
```powershell
# Backend
curl https://intelligestor-backend.onrender.com/health

# Frontend
curl https://intelligestor-frontend.vercel.app

# Com detalhes
curl https://intelligestor-backend.onrender.com/api/info
```

---

## 🚀 EXECUTAR DEPLOY AGORA

### Passo 1: Backend
```powershell
cd c:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main

# Commitar mudanças
git add .
git commit -m "feat: Deploy com melhorias no modal BuyBox"

# Push para GitHub (Render fará deploy automático)
git push origin main

# Aguardar 3-5 minutos
# Verificar: https://dashboard.render.com/
```

### Passo 2: Frontend
```powershell
cd c:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main\frontend

# Commitar mudanças
git add .
git commit -m "feat: Deploy com modal BuyBox profissional"

# Push para GitHub (Vercel fará deploy automático)
git push origin main

# Aguardar 2-4 minutos
# Verificar: https://vercel.com/dashboard
```

### Passo 3: Testar
```powershell
# Backend
Start-Process "https://intelligestor-backend.onrender.com/health"

# Frontend
Start-Process "https://intelligestor-frontend.vercel.app"

# Docs API
Start-Process "https://intelligestor-backend.onrender.com/docs"
```

---

## 📞 Suporte

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/actions

**Status:** ✅ Pronto para Deploy  
**Última atualização:** 24/11/2025
