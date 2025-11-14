# 🔐 VARIÁVEIS DE AMBIENTE PARA RENDER
# Copie e cole estas variáveis no Dashboard do Render

## ✅ CONFIGURAÇÃO COMPLETA

### 1. Acesse o Render Dashboard
URL: https://dashboard.render.com/web/srv-d4bi0h7diees73ajfp3g
(ou navegue: Dashboard → intelligestor-backend → Environment)

### 2. Adicione estas variáveis (uma por vez):

---

**Nome da Variável:** SUPABASE_URL
**Valor:**
```
https://wsluajpeibcfeerbxqiz.supabase.co
```

---

**Nome da Variável:** SUPABASE_ANON_KEY
**Valor:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbHVhanBlaWJjZmVlcmJ4cWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTA2MzQsImV4cCI6MjA3ODMyNjYzNH0.QJdnORzY_T4MbFZfx-cmYRzqHCOnWhNLzi-3-F-61tM
```

---

**Nome da Variável:** SUPABASE_SERVICE_ROLE_KEY
**Valor:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbHVhanBlaWJjZmVlcmJ4cWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1MDYzNCwiZXhwIjoyMDc4MzI2NjM0fQ.H2y4BbGz5ercnMZ4oLQpYwhFIZx3MDbsK8d5v1VXsxo
```

---

**Nome da Variável:** SECRET_KEY
**Valor:**
```
ZNm1Rc5o2plY80iZiUKormgvZ9ln2INXBIWL1suYeBk
```

---

**Nome da Variável:** ENVIRONMENT
**Valor:**
```
production
```

---

**Nome da Variável:** DEBUG
**Valor:**
```
False
```

---

**Nome da Variável:** OPENAI_MODEL
**Valor:**
```
gpt-4
```

---

## ⏳ VARIÁVEIS OPCIONAIS (Adicionar depois)

Você pode adicionar estas depois quando tiver as credenciais:

**OPENAI_API_KEY** - Obtenha em: https://platform.openai.com/api-keys
```
sk-proj-...
```

**ML_CLIENT_ID** - Crie o app em: https://developers.mercadolivre.com.br/apps
```
seu_client_id
```

**ML_CLIENT_SECRET** - Da mesma página do app Mercado Livre
```
seu_client_secret
```

**ML_REDIRECT_URI**
```
https://intelligestor-backend.onrender.com/auth/ml/callback
```

---

## 📋 PASSO A PASSO NO RENDER

### Método 1: Interface Web (Recomendado)
1. Abra: https://dashboard.render.com/web/srv-d4bi0h7diees73ajfp3g
2. Clique em **Environment** no menu lateral
3. Para cada variável acima:
   - Clique em **Add Environment Variable**
   - Cole o **Nome** exatamente como mostrado
   - Cole o **Valor** exatamente como mostrado
   - Clique em **Add**
4. Após adicionar todas, clique em **Save Changes**
5. Render fará redeploy automático (~2 min)

### Método 2: Arquivo .env (Alternativo)
1. Clique em **Environment** → **Secret Files**
2. Clique em **Add Secret File**
3. Filename: `.env`
4. Contents: (copie tudo abaixo)

```env
SUPABASE_URL=https://wsluajpeibcfeerbxqiz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbHVhanBlaWJjZmVlcmJ4cWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTA2MzQsImV4cCI6MjA3ODMyNjYzNH0.QJdnORzY_T4MbFZfx-cmYRzqHCOnWhNLzi-3-F-61tM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbHVhanBlaWJjZmVlcmJ4cWl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1MDYzNCwiZXhwIjoyMDc4MzI2NjM0fQ.H2y4BbGz5ercnMZ4oLQpYwhFIZx3MDbsK8d5v1VXsxo
SECRET_KEY=ZNm1Rc5o2plY80iZiUKormgvZ9ln2INXBIWL1suYeBk
ENVIRONMENT=production
DEBUG=False
OPENAI_MODEL=gpt-4
```

5. Clique em **Save**

---

## ✅ VERIFICAÇÃO APÓS DEPLOY

### 1. Aguarde o Deploy Concluir
- Status mudará de 🟡 amarelo para 🟢 verde
- Leva ~2-3 minutos

### 2. Verifique os Logs
Acesse: **Logs** tab
Procure por:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
```

### 3. Teste o Endpoint de Health
Abra no navegador ou curl:
```bash
https://intelligestor-backend.onrender.com/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "IntelliGestor API is running",
  "timestamp": "2025-11-14T..."
}
```

### 4. Acesse a Documentação Swagger
```
https://intelligestor-backend.onrender.com/docs
```

Deve mostrar todos os 19 endpoints disponíveis.

---

## 🎯 PRÓXIMOS PASSOS APÓS CONFIGURAÇÃO

### 1. Executar Schema do Database
1. Acesse: https://app.supabase.com/project/wsluajpeibcfeerbxqiz/sql/new
2. Abra o arquivo: `database_schema.sql` (no seu projeto)
3. Copie todo o conteúdo
4. Cole no SQL Editor do Supabase
5. Clique em **Run**

### 2. Criar Aplicativo Mercado Livre
1. Acesse: https://developers.mercadolivre.com.br/apps
2. Clique em **Criar aplicativo**
3. Configure:
   - Nome: **IntelliGestor**
   - Redirect URI: `https://intelligestor-backend.onrender.com/auth/ml/callback`
   - Scopes: `offline_access`, `read`, `write`
4. Copie **App ID** e **Secret Key**
5. Adicione no Render como `ML_CLIENT_ID` e `ML_CLIENT_SECRET`

### 3. Configurar OpenAI
1. Acesse: https://platform.openai.com/api-keys
2. Crie nova chave
3. Adicione no Render como `OPENAI_API_KEY`

### 4. Configurar Vercel (Opcional)
Se quiser deploy também na Vercel:
1. Acesse: https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo/settings/environment-variables
2. Adicione as mesmas variáveis de ambiente

---

## 🔒 SEGURANÇA

⚠️ **IMPORTANTE**: As credenciais compartilhadas neste arquivo são SENSÍVEIS!

- ✅ Use no Render (plataforma segura)
- ✅ Mantenha o arquivo `.env.example` no projeto (sem valores reais)
- ❌ NÃO commit este arquivo no Git
- ❌ NÃO compartilhe as chaves publicamente

Este arquivo está salvo apenas localmente no seu computador.

---

## 📞 Suporte

Se tiver dúvidas durante a configuração:
1. Verifique os logs do Render em tempo real
2. Confirme que todas as variáveis foram salvas corretamente
3. Teste o endpoint `/health` primeiro
4. Use o Swagger UI em `/docs` para testar outros endpoints
