# Intelligestor

Plataforma de gestão e análise competitiva para Mercado Livre com integração de IA.

## 🚀 Estrutura do Projeto

```
intelligestor/
├── backend/
│   ├── app/                      # Código FastAPI (config, middleware, models, routers, services, utils)
│   ├── api/                      # Adapter serverless (Vercel) opcional
│   ├── tests/                    # Testes Python
│   ├── sql/                      # Scripts SQL Supabase (RLS, grants)
│   ├── main.py                   # App principal FastAPI
│   ├── start_server.py           # Inicialização local
│   ├── run_sql_supabase.py       # Runner para scripts SQL
│   ├── requirements.txt          # Dependências backend
│   └── .python-version
│
├── frontend/                     # App Next.js (React 19 / Next 16 / Tailwind 4)
│   ├── public/
│   └── src/ (app, components, contexts, lib, services, styles, types, utils)
│
├── infra/
│   ├── render/
│   │   └── render.yaml           # Manifesto Render (cópia)
│   ├── vercel/
│   │   ├── backend-vercel.json   # Manifesto Vercel (backend opcional)
│   │   └── frontend-vercel.json  # Manifesto Vercel (frontend)
│   └── deploy/
│       └── deploy.sh             # Script auxiliar de deploy
│
├── docs/                         # Documentação do projeto
│   └── *.md
│
├── .env.example                  # Variáveis exemplo do backend
├── render.yaml                   # Manifesto Render (ativo)
├── vercel.json                   # Manifesto Vercel backend (opcional)
├── README.md                     # Este arquivo
└── intelligestor-backend.code-workspace

```

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web Python
- **Supabase** - Database PostgreSQL + Auth
- **OpenAI API** - Análises de IA
- **Mercado Livre API** - Integração oficial

### Frontend
- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI

## 📋 Pré-requisitos

- Python 3.11+
- Node.js 18+
- Conta Supabase
- Conta OpenAI
- App Mercado Livre

## 🔧 Instalação

### Backend (local)

```powershell
# Clone o repositório
git clone https://github.com/JonasDluna/intelligestor-backend.git
cd intelligestor-backend-main

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r backend/requirements.txt

# Configurar variáveis de ambiente (.env)
SUPABASE_URL=sua_url
SUPABASE_KEY=sua_key
OPENAI_API_KEY=sua_key
ML_CLIENT_ID=seu_client_id
ML_CLIENT_SECRET=seu_secret
ML_REDIRECT_URI=http://localhost:8000/integrations/ml/callback

# Iniciar servidor
python backend/start_server.py
```

### Frontend (local)

```powershell
cd frontend

# Instalar dependências
npm install

# Configurar .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Iniciar desenvolvimento
npm run dev
```

## 🌐 Endpoints Principais

### Autenticação
- `GET /auth/ml/login` - Login OAuth ML
- `GET /auth/ml/callback` - Callback OAuth
- `POST /auth/logout` - Logout

### Mercado Livre (Real API)
- `GET /ml/buybox/analysis/{item_id}` - Análise BuyBox
- `GET /ml/competitors/{item_id}` - Competidores
- `GET /ml/price-to-win/{item_id}` - Preço para ganhar

### IA e Análises
- `POST /api/ai/analyze` - Análise IA
- `GET /api/buybox/items` - Itens BuyBox
- `GET /api/products` - Produtos

### Catálogo
- `GET /api/catalog/search` - Buscar catálogo
- `GET /api/catalog/product/{id}` - Detalhes produto

## 🚀 Deploy

### Backend (Render)
- O arquivo ativo continua no raiz: `render.yaml`.
- Já atualizado para nova estrutura (instala `backend/requirements.txt` e inicia com `--app-dir backend`).
- Alternativa: mover para `infra/render/render.yaml` e apontar no Render.

### Frontend (Vercel)
```powershell
cd frontend
npm run build
vercel --prod
```

## 📊 Funcionalidades

### ✅ Implementado
- Autenticação OAuth Mercado Livre
- Análise BuyBox em tempo real
- Análise de competidores
- Precificação inteligente com IA
- Dashboard de produtos
- Sistema de automações
- Webhooks Mercado Livre

### 🔄 Em Desenvolvimento
- Auto-ajuste de preços
- Alertas em tempo real
- Análises preditivas avançadas

## 📝 Scripts Úteis

```powershell
# Testar integração completa
python test_integration_complete.py

# Iniciar servidor de desenvolvimento
python start_server.py

# Build frontend
cd frontend
npm run build
```

## 🐛 Troubleshooting

### Erro de conexão Supabase
- Verificar SUPABASE_URL e SUPABASE_KEY no .env
- Confirmar que RLS está configurado corretamente

### Erro OAuth ML
- Validar ML_CLIENT_ID e ML_CLIENT_SECRET
- Verificar URL de callback no painel do ML

### Frontend não conecta ao backend
- Confirmar NEXT_PUBLIC_API_URL
- Verificar CORS no backend (main.py)

## 📄 Licença

Projeto privado - Todos os direitos reservados.

## 👥 Contato

Para suporte e dúvidas, entre em contato através do GitHub.

---

**Versão**: 1.1.0  
**Última atualização**: Novembro 2025
