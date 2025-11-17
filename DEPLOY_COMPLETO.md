# 🚀 Deploy Completo - IntelliGestor

## Status Atual
✅ **Código Commitado:** Todas as alterações foram enviadas para o GitHub
✅ **Configurações:** Arquivos `render.yaml` e `vercel.json` configurados

---

## 🎯 DEPLOY BACKEND (Render)

### Opção 1: Deploy Automático via GitHub (Recomendado)

1. **Acesse:** https://render.com
2. **Login:** Entre com sua conta GitHub
3. **Dashboard:** Clique em "New +" → "Web Service"
4. **Conectar GitHub:**
   - Autorize o Render a acessar seus repositórios
   - Selecione: `JonasDluna/intelligestor-backend`
5. **Configuração Automática:**
   - O Render detectará automaticamente o arquivo `render.yaml`
   - Clique em "Apply" para usar as configurações
6. **Variáveis de Ambiente:**
   ```
   SUPABASE_URL=https://wsluajpeibcfeerbxqiz.supabase.co
   SUPABASE_ANON_KEY=sua_chave_anon
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   OPENAI_API_KEY=sua_chave_openai
   ML_CLIENT_ID=seu_client_id_ml
   ML_CLIENT_SECRET=seu_client_secret_ml
   ```
7. **Deploy:** Clique em "Create Web Service"
8. **Aguardar:** Build leva ~5 minutos
9. **URL:** https://intelligestor-backend.onrender.com

### Opção 2: Deploy Manual

Se preferir configurar manualmente:
- **Name:** intelligestor-backend
- **Runtime:** Python 3
- **Branch:** main
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** ./

---

## 🎨 DEPLOY FRONTEND (Vercel)

### Passo 1: Preparar Repositório Frontend

Você tem 2 opções:

#### Opção A: Monorepo (Atual)
O frontend está na pasta `frontend/` dentro do repositório `intelligestor-backend`

#### Opção B: Repositório Separado (Recomendado)
Criar um novo repositório apenas com o código do frontend:

```powershell
# Criar novo repositório no GitHub chamado 'intelligestor-frontend'
# Depois executar:

cd "c:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main\frontend"
git init
git add .
git commit -m "Initial commit - IntelliGestor Frontend"
git branch -M main
git remote add origin https://github.com/JonasDluna/intelligestor-frontend.git
git push -u origin main
```

### Passo 2: Deploy no Vercel

1. **Acesse:** https://vercel.com
2. **Login:** Entre com sua conta GitHub
3. **Novo Projeto:** Clique em "Add New" → "Project"
4. **Importar:**
   - **Opção A (Monorepo):** Selecione `intelligestor-backend`
   - **Opção B (Separado):** Selecione `intelligestor-frontend`

### Passo 3: Configurar Projeto

**Framework Preset:**
```
Next.js
```

**Root Directory:**
- **Opção A (Monorepo):** `frontend`
- **Opção B (Separado):** `./`

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Variáveis de Ambiente:**
```
NEXT_PUBLIC_API_URL=https://intelligestor-backend.onrender.com
NODE_ENV=production
```

### Passo 4: Deploy

1. Clique em "Deploy"
2. Aguardar build (~3 minutos)
3. URL gerada: `https://intelligestor-frontend-xxx.vercel.app`

### Passo 5: Configurar Domínio (Opcional)

1. No Vercel Dashboard → "Settings" → "Domains"
2. Adicionar domínio customizado
3. Seguir instruções DNS

---

## 🔧 Comandos Úteis

### Deploy do Backend (Render)
```bash
# Trigger deploy manual
git add .
git commit -m "deploy: update backend"
git push origin main
# O Render fará deploy automático
```

### Deploy do Frontend (Vercel)
```bash
# Opção A: Via Git (Automático)
cd frontend
git add .
git commit -m "deploy: update frontend"
git push origin main
# O Vercel fará deploy automático

# Opção B: Via Vercel CLI
npm i -g vercel
cd frontend
vercel --prod
```

---

## 📊 Monitoramento

### Backend (Render)
- **Dashboard:** https://dashboard.render.com
- **Logs:** Dashboard → Service → Logs
- **Status:** Dashboard → Service → Events

### Frontend (Vercel)
- **Dashboard:** https://vercel.com/dashboard
- **Analytics:** Dashboard → Project → Analytics
- **Logs:** Dashboard → Project → Deployments → View Logs

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar logs no Render Dashboard
# Testar localmente:
cd intelligestor-backend-main
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend não conecta ao Backend
1. Verificar se `NEXT_PUBLIC_API_URL` está correto
2. Verificar CORS no backend
3. Testar API: `curl https://intelligestor-backend.onrender.com/health`

### Build falha
```bash
# Limpar cache e rebuild
# Render: Settings → Clear build cache & Deploy
# Vercel: Settings → Clear Cache → Redeploy
```

---

## 🎉 Deploy Concluído!

**Backend:** https://intelligestor-backend.onrender.com
**Frontend:** https://intelligestor-frontend.vercel.app (após deploy)

**Próximos passos:**
1. Testar todas as funcionalidades
2. Configurar domínio customizado
3. Ativar SSL (automático)
4. Configurar CI/CD adicional se necessário
