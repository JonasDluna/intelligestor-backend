# 🚀 DEPLOY RÁPIDO NO VERCEL

## ✅ Pré-requisitos
- ✅ Conta no Vercel: https://vercel.com
- ✅ GitHub conectado ao Vercel
- ✅ Repositório: https://github.com/JonasDluna/intelligestor-backend

---

## 📋 Passo a Passo

### 1. Acessar Vercel
Vá para: https://vercel.com/new

### 2. Importar Repositório
- Clique em **"Import Git Repository"**
- Selecione: `JonasDluna/intelligestor-backend`
- Clique em **"Import"**

### 3. Configurar Projeto
Preencha os campos:

```
Project Name: intelligestor-frontend
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm install && npm run build
Output Directory: .next
Install Command: npm install
```

### 4. Adicionar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```env
NEXT_PUBLIC_API_BASE_URL=https://intelligestor-backend.onrender.com
```

### 5. Deploy
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- ✅ Pronto! Seu app estará no ar

---

## 🔗 Resultado

Após o deploy, você terá:
- **Frontend**: `https://intelligestor-frontend.vercel.app`
- **Backend**: `https://intelligestor-backend.onrender.com`

---

## 🐛 Troubleshooting

### Erro: "Build failed"
**Solução**: Verifique se o Root Directory está como `frontend`

### Erro: "API Connection Failed"
**Solução**: Confirme a variável `NEXT_PUBLIC_API_BASE_URL`

### Erro: "Module not found"
**Solução**: Execute localmente:
```bash
cd frontend
npm install
npm run build
```

---

## 🔄 Próximos Deploys

Após o primeiro deploy, qualquer `git push` atualiza automaticamente!

```bash
cd "C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main"
git add .
git commit -m "Atualização"
git push origin main
```

✅ Vercel detecta automaticamente e redeploya!

---

## 📞 Suporte

- Documentação Vercel: https://vercel.com/docs
- Logs de Deploy: https://vercel.com/dashboard
- Issues GitHub: https://github.com/JonasDluna/intelligestor-backend/issues
