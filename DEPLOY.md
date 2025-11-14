# Guia de Deploy - Intelligestor Backend

## 🚀 Deploy no Render

### Passo 1: Criar conta no Render
1. Acesse https://render.com
2. Crie uma conta (pode usar GitHub)

### Passo 2: Conectar GitHub
1. No Render Dashboard, clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório GitHub
4. Selecione o repositório `pipeline-production-v5`

### Passo 3: Configurar o Service
- **Name**: intelligestor-backend
- **Runtime**: Python 3
- **Branch**: main
- **Root Directory**: intelligestor-backend-main
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Plan**: Free (ou escolha um pago)

### Passo 4: Adicionar Variáveis de Ambiente

No Render Dashboard, vá em **Environment** e adicione:

```
ENVIRONMENT=production
DEBUG=False

SUPABASE_URL=https://wsluajpeibcfeerbxqiz.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

OPENAI_API_KEY=sua_chave_openai
OPENAI_MODEL=gpt-4

ML_CLIENT_ID=seu_client_id_ml
ML_CLIENT_SECRET=seu_client_secret_ml
ML_REDIRECT_URI=https://intelligestor-backend.onrender.com/auth/ml/callback

SECRET_KEY=gere_uma_chave_secreta_forte_aqui
RENDER_URL=https://intelligestor-backend.onrender.com
```

### Passo 5: Deploy
1. Clique em "Create Web Service"
2. Aguarde o build e deploy (3-5 minutos)
3. Acesse: https://intelligestor-backend.onrender.com

### Passo 6: Verificar
Acesse os endpoints:
- https://intelligestor-backend.onrender.com/ (health check)
- https://intelligestor-backend.onrender.com/docs (documentação)

## 🔄 Deploy Automático

Toda vez que você fizer push para a branch `main`:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

O Render detectará automaticamente e fará o deploy.

## 📊 Configurar Supabase

### Criar Tabelas

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo de `database_schema.sql`
4. Execute o script

### Configurar RLS (Row Level Security)

As políticas já estão no script SQL, mas você pode ajustá-las conforme necessário.

## 🔗 Configurar Mercado Livre

### 1. Criar Aplicação no ML

1. Acesse: https://developers.mercadolivre.com.br/
2. Crie uma nova aplicação
3. Configure o **Redirect URI**: `https://intelligestor-backend.onrender.com/auth/ml/callback`
4. Copie `CLIENT_ID` e `CLIENT_SECRET`
5. Adicione no Render Environment

### 2. Testar OAuth2

1. Acesse: https://intelligestor-backend.onrender.com/auth/ml/login
2. Autorize a aplicação
3. Verifique se o token foi salvo no Supabase

## 🐛 Troubleshooting

### Erro: "Module not found"
- Verifique se todas as dependências estão no `requirements.txt`
- Adicione versões específicas se necessário

### Erro: "Database connection failed"
- Verifique as credenciais do Supabase
- Confirme que as variáveis de ambiente estão corretas

### Erro: "Port already in use"
- No Render, use sempre `$PORT` (variável de ambiente)
- Comando: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Logs no Render
1. Acesse o Dashboard
2. Clique no seu service
3. Vá em **Logs** para ver erros em tempo real

## 📝 Checklist de Deploy

- [ ] Criar conta no Render
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Fazer primeiro deploy
- [ ] Verificar health check (`/health`)
- [ ] Executar SQL no Supabase
- [ ] Criar aplicação no Mercado Livre
- [ ] Testar OAuth2 (`/auth/ml/login`)
- [ ] Verificar logs no Render
- [ ] Documentar URL final

## 🔐 Segurança

### Gerar SECRET_KEY
```python
import secrets
print(secrets.token_urlsafe(32))
```

### Rotacionar Tokens
- Periodicamente, gere novas chaves
- Atualize no Render Environment
- Restart o service

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no Render
2. Teste localmente primeiro
3. Confirme as variáveis de ambiente
4. Verifique a conexão com Supabase

---

**Service ID**: srv-d4bi0h7diees73ajfp3g  
**URL**: https://intelligestor-backend.onrender.com
