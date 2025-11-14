# 🚀 Guia de Deploy - IntelliGestor Frontend

## 📋 Pré-requisitos

- Conta no GitHub
- Conta na Vercel (gratuita)
- Código do frontend com correções aplicadas ✅

---

## 🔧 Passo 1: Criar Repositório no GitHub

### 1.1 Acesse GitHub
```
https://github.com/new
```

### 1.2 Configurações do Repositório
- **Repository name**: `intelligestor-frontend`
- **Description**: `Frontend Next.js para IntelliGestor - Sistema de gestão com IA`
- **Visibility**: Private ou Public
- **NÃO** marque "Initialize with README"

### 1.3 Criar repositório
Clique em **"Create repository"**

---

## 📤 Passo 2: Enviar Código para GitHub

Copie e execute os comandos que o GitHub mostra:

```powershell
cd C:\Users\jonas\Downloads\intelligestor-frontend

# Verificar se já tem commit
git status

# Se necessário, fazer commit
git add .
git commit -m "Initial commit - Frontend IntelliGestor com integração backend"

# Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/intelligestor-frontend.git

# Ou se já existe, atualizar:
git remote set-url origin https://github.com/SEU_USUARIO/intelligestor-frontend.git

# Enviar código
git branch -M main
git push -u origin main
```

**IMPORTANTE**: Substitua `SEU_USUARIO` pelo seu usuário real do GitHub!

---

## 🌐 Passo 3: Deploy na Vercel

### 3.1 Acesse Vercel
```
https://vercel.com
```

### 3.2 Fazer Login
- Login com conta GitHub (recomendado)

### 3.3 Importar Projeto
1. Clique em **"Add New..."** → **"Project"**
2. Selecione o repositório `intelligestor-frontend`
3. Clique em **"Import"**

### 3.4 Configurar Projeto

**Framework Preset**: Next.js (detectado automaticamente)

**Build Settings**:
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Root Directory**: `./` (raiz)

### 3.5 Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```env
NEXT_PUBLIC_API_URL
https://intelligestor-backend.onrender.com

NODE_ENV
production
```

**IMPORTANTE**: NÃO use aspas nos valores!

### 3.6 Deploy
Clique em **"Deploy"**

Aguarde 2-3 minutos. A Vercel vai:
- ✅ Instalar dependências
- ✅ Fazer build do Next.js
- ✅ Fazer deploy
- ✅ Gerar URL pública

---

## 🎯 Passo 4: Atualizar CORS no Backend

Após o deploy, você receberá uma URL tipo:
```
https://intelligestor-frontend.vercel.app
```

### 4.1 Adicionar ao Backend

Edite no backend: `app/config/settings.py`

```python
ALLOWED_ORIGINS: list = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    "https://intelligestor-backend.onrender.com",
    "https://intelligestor-backend-rlyo.vercel.app",
    "https://intelligestor-frontend.vercel.app",  # ← Adicione sua URL aqui!
]
```

### 4.2 Fazer Deploy do Backend

```powershell
cd C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main

git add app/config/settings.py
git commit -m "feat: Adicionar URL do frontend Vercel no CORS"
git push origin main
```

O Render vai fazer deploy automaticamente em ~2 minutos.

---

## ✅ Passo 5: Testar Produção

### 5.1 Acessar Frontend
```
https://sua-url.vercel.app
```

### 5.2 Testar Health Check

Abra o console (F12) e execute:

```javascript
fetch('https://intelligestor-backend.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Deve retornar:
```json
{
  "status": "healthy",
  "services": {...}
}
```

### 5.3 Testar Páginas
- `/dashboard`
- `/produtos`
- `/mercado-livre`
- `/estoque`

---

## 🔄 Atualizações Futuras

Sempre que fizer alterações:

```powershell
# No frontend
cd C:\Users\jonas\Downloads\intelligestor-frontend
git add .
git commit -m "feat: Descrição da alteração"
git push origin main
```

A Vercel fará deploy automaticamente! 🎉

---

## 🆘 Troubleshooting

### Erro de Build na Vercel
- Verificar se `package.json` está correto
- Ver logs de build na Vercel Dashboard
- Confirmar que todas as dependências estão instaladas

### Erro CORS
- Verificar se a URL da Vercel está em `ALLOWED_ORIGINS`
- Aguardar 2-3 minutos após atualizar backend
- Limpar cache do navegador (Ctrl+Shift+Delete)

### Backend Lento
- Primeiro acesso no Render demora ~30s (cold start)
- Isso é normal no plano gratuito
- Após o primeiro acesso, fica rápido

### 404 nos Endpoints
- Verificar se o backend está online: `/health`
- Confirmar variável `NEXT_PUBLIC_API_URL` na Vercel
- Ver logs de erro no console do navegador

---

## 📞 URLs Importantes

### Desenvolvimento
- Frontend Local: http://localhost:3000
- Backend Local: http://localhost:8000

### Produção
- Frontend Vercel: https://sua-url.vercel.app
- Backend Render: https://intelligestor-backend.onrender.com
- Docs Backend: https://intelligestor-backend.onrender.com/docs

### Dashboards
- Vercel: https://vercel.com/dashboard
- Render: https://dashboard.render.com
- GitHub: https://github.com/SEU_USUARIO

---

## 🎉 Pronto!

Após seguir esses passos, você terá:

✅ Frontend publicado na Vercel
✅ Backend publicado no Render
✅ Integração funcionando 100%
✅ URLs públicas acessíveis de qualquer lugar
✅ Deploy automático a cada push

**Seu sistema estará no ar! 🚀**

---

## 💡 Dicas Extras

### Domínio Customizado
Na Vercel, você pode adicionar domínio próprio:
- Settings → Domains → Add Domain

### Analytics
Vercel oferece analytics gratuito:
- Analytics → Enable

### Logs em Tempo Real
- Vercel: Deployments → View Function Logs
- Render: Logs → Live Logs

### Preview Deployments
Toda branch no GitHub gera preview automático na Vercel!

---

Boa sorte com o deploy! 🎊
