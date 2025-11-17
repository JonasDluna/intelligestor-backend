# 🚀 Guia de Deploy Completo - Intelligestor

## ✅ Status: CÓDIGO COMMITADO E ENVIADO

**Commit:** `feat: Sistema completo - Auth JWT, IA, Automacao, Estoque e Webhooks implementados`
**Branch:** main
**GitHub:** ✅ Atualizado

---

## 📋 Checklist de Deploy

### 1. ✅ Backend no Render

**URL:** https://intelligestor-backend.onrender.com

**Status atual:**
- ✅ Repositório conectado
- ✅ Código atualizado no GitHub
- 🔄 Deploy automático deve iniciar

**Ações necessárias:**

1. **Acesse o Render Dashboard:**
   ```
   https://dashboard.render.com/
   ```

2. **Verifique o Service:**
   - Procure por: `intelligestor-backend`
   - Verifique se o deploy automático iniciou
   - Aguarde conclusão (5-10 minutos)

3. **Variáveis de Ambiente (já configuradas):**
   - ✅ SUPABASE_URL
   - ✅ SUPABASE_ANON_KEY
   - ✅ SUPABASE_SERVICE_ROLE_KEY
   - ✅ OPENAI_API_KEY
   - ✅ ML_CLIENT_ID
   - ✅ ML_CLIENT_SECRET
   - ✅ ML_REDIRECT_URI
   - ✅ SECRET_KEY

4. **Teste após deploy:**
   ```bash
   curl https://intelligestor-backend.onrender.com/health
   ```

---

### 2. 🔄 Frontend no Vercel

**URL Atual:** https://intelligestor-backend-rlyo.vercel.app

**Ações necessárias:**

1. **Acesse o Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Configure variáveis de ambiente:**
   ```env
   NEXT_PUBLIC_API_URL=https://intelligestor-backend.onrender.com
   ```

3. **Redeploy:**
   - Clique no projeto `intelligestor-frontend`
   - Vá em "Deployments"
   - Clique nos 3 pontinhos do último deploy
   - Clique em "Redeploy"

---

### 3. 🗄️ Banco de Dados Supabase

**Status:**
- ✅ Script SQL criado: `setup_complete_database.sql`
- ⚠️ Precisa executar no Supabase

**Execute agora:**

1. Acesse: https://app.supabase.com/project/wsluajpeibcfeerbxqiz/editor
2. Vá para "SQL Editor"
3. Cole o conteúdo de `setup_complete_database.sql`
4. Clique em "Run"

---

## 🧪 Testes Pós-Deploy

### Backend (Render)

```bash
# Health check
curl https://intelligestor-backend.onrender.com/health

# Documentação
https://intelligestor-backend.onrender.com/docs

# Registrar usuário
curl -X POST https://intelligestor-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@intelligestor.com",
    "password": "teste123",
    "nome": "Usuario Teste",
    "empresa": "Intelligestor"
  }'
```

### Frontend (Vercel)

1. Acesse: https://intelligestor-backend-rlyo.vercel.app
2. Faça login/registro
3. Teste navegação
4. Verifique integração com backend

---

## 🔧 Troubleshooting

### Se o Render não fizer deploy automático:

1. **Deploy manual:**
   - Vá para o dashboard do Render
   - Clique em "Manual Deploy"
   - Selecione branch "main"
   - Clique em "Deploy"

2. **Verifique logs:**
   - Clique em "Logs"
   - Procure por erros

### Se houver erro 500:

1. **Verifique se executou o SQL no Supabase**
   - Tabela `users` deve existir
   - Execute `setup_complete_database.sql`

2. **Verifique variáveis de ambiente:**
   - Todas as variáveis devem estar configuradas
   - `SECRET_KEY` deve ser uma string longa e segura

---

## 📊 Endpoints Disponíveis

### Autenticação
- POST `/auth/register` - Registro
- POST `/auth/login` - Login
- GET `/auth/me` - Perfil

### Produtos
- GET `/produtos/` - Listar
- POST `/produtos/` - Criar

### Estoque
- GET `/estoque/produto/{id}` - Consultar
- POST `/estoque/movimentacao` - Movimentar
- POST `/estoque/sync/todos` - Sincronizar com ML

### IA
- POST `/api/buybox/analyze` - Análise BuyBox
- POST `/api/products/optimize-price` - Otimizar preço

### Automação
- POST `/automacao/regras` - Criar regra
- POST `/automacao/executar` - Executar

### Mercado Livre
- GET `/auth/ml/login` - Conectar
- POST `/webhooks/ml/notifications` - Webhook

---

## ✨ Próximos Passos

1. ✅ Executar SQL no Supabase
2. ⏳ Aguardar deploy no Render (5-10 min)
3. 🔄 Fazer redeploy no Vercel
4. 🧪 Testar endpoints
5. 🎯 Configurar webhook no Mercado Livre
6. 🚀 Sistema em produção!

---

**Última atualização:** 17 de novembro de 2025
**Status geral:** 🟡 Aguardando deploy e configuração final
