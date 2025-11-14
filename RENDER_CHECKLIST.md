# Render Deployment Checklist

## ✅ Pré-requisitos (Completos)

- [x] Código no GitHub
- [x] render.yaml configurado
- [x] build.sh criado
- [x] start.sh criado (otimizado)
- [x] requirements.txt atualizado
- [x] Health check implementado (/health)
- [x] Variáveis de ambiente documentadas

## 📋 Passo a Passo Deploy

### 1. Acessar Render Dashboard
```
https://dashboard.render.com
```

### 2. Criar Novo Web Service

1. Clique em **"New +"** → **"Web Service"**
2. Conecte sua conta GitHub (se ainda não conectou)
3. Selecione o repositório: **JonasDluna/intelligestor-backend**
4. Clique em **"Connect"**

### 3. Configurar Service

**Preencha os campos**:

```
Name: intelligestor-backend
Region: Oregon (mais próximo do Brasil)
Branch: main
Root Directory: (deixe em branco ou use ".")
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: bash start.sh
```

**Ou use configuração automática**:
- ✅ Render detectará o `render.yaml` automaticamente

### 4. Selecionar Plano

**Plano Free** (Recomendado para começar):
- ✅ Gratuito
- ⚠️ Dorme após 15min de inatividade
- ⚠️ 512MB RAM
- ⚠️ Cold start ~30s

**Plano Starter** ($7/mês):
- ✅ Sempre ativo
- ✅ 512MB RAM
- ✅ Sem cold start

### 5. Adicionar Variáveis de Ambiente

Clique em **"Advanced"** → **"Add Environment Variable"**

Adicione uma por uma:

```env
ENVIRONMENT=production
DEBUG=False

SUPABASE_URL=https://wsluajpeibcfeerbxqiz.supabase.co
SUPABASE_ANON_KEY=<sua_chave_aqui>
SUPABASE_SERVICE_ROLE_KEY=<sua_chave_aqui>

OPENAI_API_KEY=<sua_chave_aqui>
OPENAI_MODEL=gpt-4

ML_CLIENT_ID=<seu_client_id>
ML_CLIENT_SECRET=<seu_client_secret>
ML_REDIRECT_URI=https://intelligestor-backend.onrender.com/auth/ml/callback

SECRET_KEY=<gerar_chave_forte>
RENDER_URL=https://intelligestor-backend.onrender.com
RENDER_SERVICE_ID=srv-d4bi0h7diees73ajfp3g
```

**Como gerar SECRET_KEY**:
```python
import secrets
print(secrets.token_urlsafe(32))
```

### 6. Criar Web Service

1. Clique em **"Create Web Service"**
2. Aguarde o build (5-10 minutos)
3. Acompanhe os logs em tempo real

### 7. Verificar Deploy

**Logs devem mostrar**:
```
🚀 Iniciando Intelligestor Backend...
📊 Environment: production
🐍 Python version: 3.11.x
👥 Workers: 2
✅ Iniciando FastAPI com Uvicorn...
Application startup complete.
```

**URLs para testar**:
```
https://intelligestor-backend.onrender.com/
https://intelligestor-backend.onrender.com/health
https://intelligestor-backend.onrender.com/docs
```

## 🧪 Testes Pós-Deploy

### 1. Health Check
```powershell
curl https://intelligestor-backend.onrender.com/health
```

**Resposta esperada**:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "services": {
    "supabase": "connected",
    "openai": "configured",
    "mercadolivre": "configured"
  }
}
```

### 2. Documentação
```
https://intelligestor-backend.onrender.com/docs
```

### 3. Root Endpoint
```powershell
curl https://intelligestor-backend.onrender.com/
```

**Resposta esperada**:
```json
{
  "status": "online",
  "service": "Intelligestor Backend",
  "version": "1.0.0",
  "environment": "production",
  "render_service_id": "srv-d4bi0h7diees73ajfp3g"
}
```

## 🔧 Configurações Adicionais (Opcional)

### Adicionar Domínio Customizado

1. No dashboard do Render
2. Vá em **"Settings"** → **"Custom Domain"**
3. Adicione seu domínio
4. Configure DNS conforme instruções

### Configurar Cron Job (Monitoramento)

1. **"New +"** → **"Cron Job"**
2. **Name**: price-monitor
3. **Schedule**: `0 */6 * * *` (a cada 6 horas)
4. **Command**: `python scripts/monitor_prices.py`

### Configurar Notificações

1. **"Settings"** → **"Notifications"**
2. Adicione email ou Slack webhook
3. Receba alertas de:
   - Deploy success/failure
   - Service down
   - High resource usage

## 📊 Monitoramento

### Verificar Logs
```
Dashboard → Your Service → Logs
```

### Métricas
```
Dashboard → Your Service → Metrics
```

**Acompanhe**:
- CPU Usage
- Memory Usage
- Request Count
- Response Time

### Events
```
Dashboard → Your Service → Events
```

**Histórico de**:
- Deploys
- Restarts
- Configuration changes

## 🚨 Troubleshooting

### Deploy Failed

**Verificar**:
1. Logs de build
2. requirements.txt correto
3. Python version compatível

**Solução**:
```bash
# Testar build localmente
pip install -r requirements.txt
python -c "from main import app; print('OK')"
```

### Application Error

**Verificar**:
1. Variáveis de ambiente
2. Logs de runtime
3. Health check endpoint

**Solução**:
```bash
# Verificar logs no dashboard
# Confirmar todas as env vars
# Testar localmente primeiro
```

### Cold Start Lento (Plano Free)

**Normal**: Primeira request após 15min de inatividade

**Soluções**:
1. Upgrade para plano pago
2. Usar Vercel para requests críticos
3. Ping service periodicamente (cron)

## ✅ Checklist Final

Após deploy completo:

- [ ] Health check retorna 200
- [ ] Documentação acessível em /docs
- [ ] Logs mostram "startup complete"
- [ ] Variáveis de ambiente configuradas
- [ ] Service ID correto (srv-d4bi0h7diees73ajfp3g)
- [ ] URL funcionando
- [ ] Monitoramento ativo

## 🎯 Próximos Passos

1. **Configurar Mercado Livre**:
   - Adicionar Redirect URI do Render
   - Testar OAuth2

2. **Executar SQL no Supabase**:
   - Criar tabelas
   - Configurar RLS

3. **Testar Endpoints**:
   - /auth/ml/login
   - /api/products/sync
   - /api/catalog/search

4. **Configurar Webhooks** (opcional):
   - Receber notificações do ML
   - Processar vendas automaticamente

## 📞 Suporte

- **Dashboard**: https://dashboard.render.com
- **Docs**: https://render.com/docs
- **Support**: support@render.com
- **Status**: https://status.render.com

---

**Última atualização**: 14/11/2025  
**Status**: ✅ Pronto para deploy
