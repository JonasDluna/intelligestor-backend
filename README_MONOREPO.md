# Intelligestor - Monorepo

Este repositório unificado contém o **backend (FastAPI)** e o **frontend (Next.js)** da aplicação Intelligestor.

## 📁 Estrutura

```
intelligestor-backend-main/
├── app/                    # Backend FastAPI
│   ├── config/
│   ├── models/
│   ├── routers/
│   └── services/
├── frontend/               # Frontend Next.js
│   ├── src/
│   ├── public/
│   └── package.json
├── main.py                # Entrada do backend
├── requirements.txt       # Dependências Python
└── README_MONOREPO.md    # Este arquivo
```

## 🚀 Deploy no Vercel (Monorepo Completo)

### Opção 1: Deploy Separado (Recomendado)

#### Backend no Render
✅ **Já está deployado**: https://intelligestor-backend.onrender.com

#### Frontend no Vercel

1. **Criar novo projeto no Vercel**:
   - Acesse: https://vercel.com/new
   - Importe: `JonasDluna/intelligestor-backend`
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `cd frontend && npm install && npm run build`

2. **Configurar Variáveis de Ambiente**:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://intelligestor-backend.onrender.com
   ```

3. **Deploy**:
   - Clique em "Deploy"
   - Aguarde o build completar

---

### Opção 2: Deploy Unificado no Vercel (Experimental)

**⚠️ Limitações**: Vercel tem timeout de 60s para serverless functions, pode não ser ideal para operações longas de IA.

1. **Criar `vercel.json` na raiz**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/next"
       },
       {
         "src": "main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "main.py"
       },
       {
         "src": "/(.*)",
         "dest": "frontend/$1"
       }
     ]
   }
   ```

2. **Deploy no Vercel**

---

## 🛠️ Desenvolvimento Local

### Backend

```bash
# Na raiz do projeto
pip install -r requirements.txt
python main.py
```

Acesse: http://localhost:8000

### Frontend

```bash
# Na pasta frontend
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3000

---

## 📝 Comandos Git

### Adicionar mudanças ao repositório unificado

```bash
cd "C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main"

# Adicionar tudo
git add .

# Commit
git commit -m "feat: Adicionar frontend ao monorepo"

# Push
git push origin main
```

---

## ✅ Status

- ✅ Backend deployado no Render
- ✅ Frontend integrado no monorepo
- ✅ API Client corrigido (sem prefixo /v1)
- ✅ CORS configurado
- ⏳ Frontend aguardando deploy no Vercel

---

## 🔗 Links Úteis

- **Backend**: https://intelligestor-backend.onrender.com
- **Docs API**: https://intelligestor-backend.onrender.com/docs
- **GitHub**: https://github.com/JonasDluna/intelligestor-backend
- **Vercel**: https://vercel.com/dashboard
