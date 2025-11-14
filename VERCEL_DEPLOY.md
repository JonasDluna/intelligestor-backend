# Deploy na Vercel - Intelligestor Backend

## 📋 Informações do Projeto

- **Project Name**: intelligestor-backend-rlyo
- **Project ID**: prj_IK70OvzluVgwj61IWmuCL6g0kU5k
- **Repository**: https://github.com/JonasDluna/intelligestor-backend
- **URL**: https://intelligestor-backend-rlyo.vercel.app

## 🚀 Deploy Automático via GitHub

### 1. Conectar Repositório (Já feito ✅)

Seu repositório já está conectado à Vercel:
- Repository: `JonasDluna/intelligestor-backend`
- Branch principal: `main`

### 2. Configurar Variáveis de Ambiente

Acesse: https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo/settings/environment-variables

Adicione as seguintes variáveis:

```env
# Supabase Configuration
SUPABASE_URL=https://wsluajpeibcfeerbxqiz.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# OpenAI Configuration
OPENAI_API_KEY=sua_chave_openai
OPENAI_MODEL=gpt-4

# Mercado Livre Configuration
ML_CLIENT_ID=seu_client_id
ML_CLIENT_SECRET=seu_client_secret
ML_REDIRECT_URI=https://intelligestor-backend-rlyo.vercel.app/auth/ml/callback

# Application Settings
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=sua_secret_key_forte
```

### 3. Fazer Deploy

```bash
# Fazer commit das mudanças
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

A Vercel detectará automaticamente e fará o deploy! 🎉

## 🔧 Deploy Manual via Vercel CLI

### 1. Instalar Vercel CLI

```powershell
npm install -g vercel
```

### 2. Login na Vercel

```powershell
vercel login
```

### 3. Fazer Deploy

```powershell
cd intelligestor-backend-main
vercel
```

Para deploy em produção:

```powershell
vercel --prod
```

## 📊 Estrutura para Vercel

```
intelligestor-backend-main/
├── api/
│   └── index.py          # Entry point para Vercel
├── app/
│   ├── config/
│   ├── models/
│   ├── routers/
│   └── services/
├── main.py               # Aplicação FastAPI
├── vercel.json           # Configuração Vercel
├── .vercelignore         # Arquivos ignorados
└── requirements.txt      # Dependências Python
```

## ⚙️ Configuração do vercel.json

```json
{
  "version": 2,
  "name": "intelligestor-backend-rlyo",
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

## 🔗 URLs Importantes

### Produção
- **API**: https://intelligestor-backend-rlyo.vercel.app
- **Docs**: https://intelligestor-backend-rlyo.vercel.app/docs
- **Health**: https://intelligestor-backend-rlyo.vercel.app/health

### Dashboard Vercel
- **Settings**: https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo/settings
- **Deployments**: https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo/deployments
- **Environment Variables**: https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo/settings/environment-variables

## 🆚 Vercel vs Render

### Vercel (Serverless)
✅ Deploy instantâneo
✅ Edge Functions (global)
✅ Integração perfeita com GitHub
✅ Grátis para projetos pessoais
❌ Cold start (primeiro request lento)
❌ Limitações de tempo de execução (10s)
❌ Melhor para APIs simples

### Render (Always On)
✅ Servidor sempre ativo (sem cold start)
✅ Ideal para background jobs
✅ Melhor para automações
✅ Webhooks funcionam melhor
❌ Deploy mais lento
❌ Plano gratuito dorme após inatividade

## 💡 Recomendação

**Use ambos estrategicamente:**

### Vercel
- Endpoints de leitura rápidos
- Health checks
- Rotas de consulta
- API pública

### Render
- Background jobs (monitoramento de preços)
- Webhooks do Mercado Livre
- Tarefas agendadas (cron)
- Operações longas

## ⚠️ Importante: Atualizar Redirect URI no Mercado Livre

Adicione os dois URLs de callback:

1. **Vercel**: `https://intelligestor-backend-rlyo.vercel.app/auth/ml/callback`
2. **Render**: `https://intelligestor-backend.onrender.com/auth/ml/callback`

No painel de desenvolvedor do ML, você pode adicionar múltiplos Redirect URIs.

## 🧪 Testar Deploy

```powershell
# Health check
curl https://intelligestor-backend-rlyo.vercel.app/health

# API Info
curl https://intelligestor-backend-rlyo.vercel.app/api/info
```

## 📝 Logs e Monitoramento

Acesse os logs em tempo real:
https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo/logs

## 🐛 Troubleshooting

### Erro: Module not found
- Verifique se todas as dependências estão no `requirements.txt`
- Certifique-se de que o Python 3.11 está especificado

### Erro: Function timeout
- Vercel tem limite de 10s por request
- Use Render para operações longas
- Considere usar background tasks

### Erro: Environment variables não carregadas
- Verifique se todas as variáveis estão no dashboard
- Faça redeploy após adicionar variáveis
- Use `vercel env pull` para testar localmente

## 🔄 Sincronizar Variáveis Localmente

```powershell
# Baixar variáveis de ambiente da Vercel
vercel env pull .env.vercel

# Testar localmente com variáveis da Vercel
vercel dev
```

## 📦 Comandos Úteis

```powershell
# Ver logs
vercel logs

# Listar deployments
vercel ls

# Ver informações do projeto
vercel inspect

# Remover deployment
vercel rm [deployment-url]

# Promover preview para produção
vercel promote [deployment-url]
```

## 🎯 Próximos Passos

- [ ] Adicionar variáveis de ambiente na Vercel
- [ ] Atualizar Redirect URI no Mercado Livre
- [ ] Fazer primeiro deploy (push to main)
- [ ] Testar endpoints
- [ ] Configurar domínio customizado (opcional)
- [ ] Monitorar logs
- [ ] Configurar alertas

## 🔗 Links Úteis

- [Vercel Python Docs](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [FastAPI on Vercel](https://vercel.com/guides/deploying-fastapi-with-vercel)

---

**Última atualização**: 14/11/2025
