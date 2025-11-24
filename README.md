# Intelligestor Backend

Sistema de gestão e análise competitiva para Mercado Livre com integração de IA.

## 🚀 Estrutura do Projeto

```
intelligestor-backend-main/
├── app/                          # Aplicação principal
│   ├── config/                   # Configurações (settings, database)
│   ├── middleware/               # Middlewares (auth, CORS, etc)
│   ├── models/                   # Modelos de dados
│   ├── routers/                  # Endpoints da API
│   │   ├── auth.py              # Autenticação
│   │   ├── auth_ml.py           # OAuth Mercado Livre
│   │   ├── catalog.py           # Catálogo de produtos
│   │   ├── ml_real.py           # API Real do Mercado Livre
│   │   ├── ia_buybox.py         # Análise IA BuyBox
│   │   ├── ai_analysis.py       # Análises de IA
│   │   ├── produtos.py          # Gestão de produtos
│   │   ├── estoque.py           # Gestão de estoque
│   │   ├── automacao.py         # Automações
│   │   └── webhooks_ml.py       # Webhooks do ML
│   ├── services/                 # Serviços de negócio
│   └── utils/                    # Utilitários
├── api/                          # API routes (Vercel)
│   └── index.py
├── frontend/                     # Frontend Next.js
│   ├── src/
│   │   ├── app/                 # Pages (App Router)
│   │   ├── components/          # Componentes React
│   │   └── services/            # Serviços API
│   └── public/
├── tests/                        # Testes automatizados
├── main.py                       # Aplicação FastAPI principal
├── start_server.py              # Script de inicialização
├── requirements.txt             # Dependências Python
├── render.yaml                  # Config deploy Render
├── vercel.json                  # Config deploy Vercel
└── README.md

```

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web Python
- **Supabase** - Database PostgreSQL + Auth
- **OpenAI API** - Análises de IA
- **Mercado Livre API** - Integração oficial

### Frontend
- **Next.js 15** - Framework React
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

### Backend

```powershell
# Clone o repositório
git clone https://github.com/JonasDluna/intelligestor-backend.git
cd intelligestor-backend-main

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente (.env)
SUPABASE_URL=sua_url
SUPABASE_KEY=sua_key
OPENAI_API_KEY=sua_key
ML_CLIENT_ID=seu_client_id
ML_CLIENT_SECRET=seu_secret
ML_REDIRECT_URI=http://localhost:8000/auth/ml/callback

# Iniciar servidor
python start_server.py
```

### Frontend

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
```bash
# Conectar repositório GitHub
# Configurar variáveis de ambiente
# Deploy automático via render.yaml
```

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

**Versão**: 1.0.0  
**Última atualização**: Novembro 2025
