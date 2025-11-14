# 🎯 DEPLOY RÁPIDO - 3 PASSOS

## ⚡ Opção 1: SCRIPT AUTOMÁTICO (Recomendado)

```powershell
cd C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main

# Execute (substitua SEU_USUARIO pelo seu GitHub username):
.\deploy-frontend.ps1 -GithubUsername "SEU_USUARIO"
```

O script vai:
- ✅ Configurar remote do Git
- ✅ Fazer commit
- ✅ Enviar para GitHub
- ✅ Abrir Vercel no navegador

---

## 📝 Opção 2: MANUAL (3 Passos)

### PASSO 1: Criar Repositório GitHub (30 segundos)

1. Acesse: https://github.com/new
2. Nome: `intelligestor-frontend`
3. **NÃO** marque "Initialize with README"
4. Clique "Create repository"

### PASSO 2: Enviar Código (1 minuto)

```powershell
cd C:\Users\jonas\Downloads\intelligestor-frontend

# Adicionar remote (SUBSTITUA seu_usuario!)
git remote set-url origin https://github.com/seu_usuario/intelligestor-frontend.git

# Ou se não existe:
git remote add origin https://github.com/seu_usuario/intelligestor-frontend.git

# Enviar código
git push -u origin main
```

### PASSO 3: Deploy Vercel (2 minutos)

1. Acesse: https://vercel.com/new
2. Login com GitHub
3. Selecione `intelligestor-frontend`
4. Adicione variáveis de ambiente:
   ```
   NEXT_PUBLIC_API_URL = https://intelligestor-backend.onrender.com
   NODE_ENV = production
   ```
5. Clique **"Deploy"**

---

## ⏱️ Tempo Total: ~5 minutos

Você terá:
- ✅ Frontend no ar (Vercel)
- ✅ Backend no ar (Render) 
- ✅ Integração funcionando
- ✅ URL pública acessível

---

## 🔗 Depois do Deploy

Adicione a URL da Vercel no CORS do backend:

1. Copie sua URL (ex: `https://intelligestor-frontend.vercel.app`)
2. Edite: `intelligestor-backend-main/app/config/settings.py`
3. Adicione na lista `ALLOWED_ORIGINS`
4. Commit e push

```powershell
cd C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main

git add app/config/settings.py
git commit -m "feat: Add Vercel URL to CORS"
git push origin main
```

O Render fará deploy automaticamente!

---

## 🎉 PRONTO!

Seu sistema estará 100% no ar em minutos! 🚀

**Documentação completa**: `GUIA_DEPLOY_VERCEL.md`
