# Intelligestor Backend

Sistema de gestão para integração com Mercado Livre - Backend em Python com FastAPI.

## 🚀 Stack Tecnológica

- **Backend**: Python 3.11+ com FastAPI
- **Banco de Dados**: Supabase (PostgreSQL)
- **IA**: OpenAI GPT-4
- **Deploy**: Render + Vercel
- **Integração**: Mercado Livre API OAuth2
- **CI/CD**: GitHub Actions

## 📋 Funcionalidades

- ✅ Autenticação OAuth2 com Mercado Livre
- ✅ Sincronização de produtos
- ✅ Comparação de catálogo
- ✅ Monitoramento de preços
- ✅ Automações de regras
- ✅ Detector de Buy Box
- ✅ Predição de preços com IA

## 🛠️ Configuração Local

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/pipeline-production-v5.git
cd pipeline-production-v5/intelligestor-backend-main
```

### 2. Criar ambiente virtual

```bash
python -m venv venv
```

**Windows:**
```powershell
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas chaves:

```env
# Supabase
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui

# OpenAI
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4

# Mercado Livre
ML_CLIENT_ID=seu_client_id
ML_CLIENT_SECRET=seu_client_secret
ML_REDIRECT_URI=http://localhost:8000/auth/ml/callback
```

### 5. Configurar banco de dados

Execute o script SQL no Supabase:

```bash
# Acesse o Supabase SQL Editor e execute:
# database_schema.sql
```

### 6. Executar localmente

```bash
uvicorn main:app --reload
```

Acesse: http://localhost:8000

## 📚 Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🌐 Endpoints Principais

### Autenticação
- `GET /auth/ml/login` - Iniciar OAuth2 do ML
- `GET /auth/ml/callback` - Callback OAuth2
- `POST /auth/ml/refresh` - Renovar token
- `GET /auth/ml/status/{user_id}` - Status da autenticação

### Produtos
- `GET /api/products/` - Listar produtos
- `POST /api/products/sync` - Sincronizar com ML

### Buy Box
- `POST /api/buybox/analyze` - Analisar Buy Box

## 🚀 Deploy no Render

### 1. Conectar repositório GitHub

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. New → Web Service
3. Conecte seu repositório GitHub

### 2. Configurar Service

- **Name**: intelligestor-backend
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Adicionar variáveis de ambiente

No Render Dashboard, adicione todas as variáveis do `.env`:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- ML_CLIENT_ID
- ML_CLIENT_SECRET
- ML_REDIRECT_URI (https://intelligestor-backend.onrender.com/auth/ml/callback)
- SECRET_KEY

### 4. Deploy automático

Toda vez que você fizer push para a branch `main`, o Render irá:
1. Detectar mudanças
2. Executar build
3. Fazer deploy automático

## 📊 Estrutura do Banco de Dados (Supabase)

```
tokens_ml              - Tokens OAuth2 do Mercado Livre
produtos               - Produtos sincronizados
anuncios              - Anúncios publicados
catalogo              - Catálogo do ML
precos_concorrentes   - Preços de concorrentes
logs_monitoramento    - Logs de automações
usuarios              - Dados dos usuários
```

## 🔐 Segurança

- ✅ Variáveis de ambiente protegidas
- ✅ `.env` no `.gitignore`
- ✅ CORS configurado
- ✅ JWT para autenticação
- ✅ RLS (Row Level Security) no Supabase

## 📝 TODO

- [ ] Implementar rotas de produtos completas
- [ ] Adicionar webhook do Mercado Livre
- [ ] Sistema de notificações
- [ ] Dashboard de métricas
- [ ] Testes automatizados
- [ ] CI/CD com GitHub Actions

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🔗 Links Úteis

- [Documentação FastAPI](https://fastapi.tiangolo.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Mercado Livre API](https://developers.mercadolivre.com.br/)
- [OpenAI API](https://platform.openai.com/docs)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)

## 📞 Suporte

### Render
- Service ID: srv-d4bi0h7diees73ajfp3g
- URL: https://intelligestor-backend.onrender.com

### Vercel
- Project ID: prj_IK70OvzluVgwj61IWmuCL6g0kU5k
- URL: https://intelligestor-backend-rlyo.vercel.app
- Repository: https://github.com/JonasDluna/intelligestor-backend

### Supabase
- URL: https://wsluajpeibcfeerbxqiz.supabase.co

