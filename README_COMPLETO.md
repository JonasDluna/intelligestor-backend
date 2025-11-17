# 🎯 Intelligestor Backend - Sistema de Gestão e IA para Mercado Livre

Sistema completo de gestão de e-commerce com integração ao Mercado Livre, análise inteligente de BuyBox com IA e automação de processos.

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação e Segurança
- ✅ Sistema de registro e login de usuários
- ✅ Autenticação JWT com tokens de 7 dias
- ✅ Middleware de proteção de rotas
- ✅ Hash seguro de senhas com bcrypt
- ✅ Renovação automática de tokens

### 📦 Gestão de Produtos
- ✅ CRUD completo de produtos
- ✅ Controle de SKU, preço e custo
- ✅ Categorização e organização
- ✅ Busca e filtros avançados
- ✅ Validações e regras de negócio

### 📊 Gestão de Estoque
- ✅ Controle de estoque atual e disponível
- ✅ Movimentações (entrada, saída, ajuste, reserva)
- ✅ Histórico completo de movimentações
- ✅ Alertas de estoque baixo
- ✅ Sincronização bidirecional com Mercado Livre
- ✅ Importação de quantidades do ML
- ✅ Atualização em lote

### 🛒 Integração Mercado Livre
- ✅ OAuth2 completo com ML
- ✅ Renovação automática de tokens
- ✅ Sincronização de anúncios
- ✅ Atualização de preços e estoque
- ✅ Consulta de dados em tempo real
- ✅ Webhook para notificações

### 🔔 Webhooks e Eventos
- ✅ Recepção de notificações do ML
- ✅ Processamento de pedidos
- ✅ Processamento de perguntas
- ✅ Processamento de mensagens
- ✅ Atualização de anúncios
- ✅ Logs completos de eventos

### 🤖 IA e Análise Inteligente
- ✅ Análise de BuyBox com GPT-4
- ✅ Otimização de preços
- ✅ Recomendações estratégicas
- ✅ Análise de concorrência
- ✅ Histórico de mudanças
- ✅ Sugestões de ações práticas

### ⚙️ Automação
- ✅ Criação de regras personalizadas
- ✅ Ajuste automático de preços
- ✅ Gestão automática de BuyBox
- ✅ Reativação de anúncios
- ✅ Execução manual e agendada
- ✅ Logs de execução

## 🚀 Início Rápido

### Pré-requisitos

- Python 3.9+
- Conta Supabase (banco de dados)
- Conta OpenAI (para IA)
- Conta de desenvolvedor Mercado Livre

### Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/intelligestor-backend.git
cd intelligestor-backend
```

2. **Execute o setup:**
```powershell
.\setup.ps1
```

3. **Configure as variáveis de ambiente:**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite .env com suas credenciais
```

4. **Inicie o servidor:**
```powershell
.\start-dev.ps1
```

5. **Acesse a documentação:**
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📚 Documentação da API

Consulte o [Guia de Uso da API](API_USAGE_GUIDE.md) para exemplos completos de todas as funcionalidades.

### Endpoints Principais

#### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário logado
- `POST /auth/refresh` - Renovar token

#### Produtos
- `GET /produtos/` - Listar produtos
- `POST /produtos/` - Criar produto
- `GET /produtos/{id}` - Buscar produto
- `PUT /produtos/{id}` - Atualizar produto
- `DELETE /produtos/{id}` - Deletar produto

#### Estoque
- `GET /estoque/produto/{id}` - Consultar estoque
- `POST /estoque/movimentacao` - Movimentar estoque
- `GET /estoque/movimentacoes/{id}` - Histórico
- `POST /estoque/sync/produto/{id}` - Sincronizar com ML
- `POST /estoque/sync/todos` - Sincronizar tudo
- `POST /estoque/sync/importar-ml` - Importar do ML

#### Mercado Livre
- `GET /auth/ml/login` - Conectar com ML
- `POST /auth/ml/refresh` - Renovar token ML
- `GET /api/catalog/` - Listar anúncios

#### IA e BuyBox
- `POST /api/buybox/analyze` - Analisar BuyBox
- `POST /api/products/optimize-price` - Otimizar preço

#### Automação
- `POST /automacao/regras` - Criar regra
- `GET /automacao/regras` - Listar regras
- `POST /automacao/executar` - Executar regras
- `PATCH /automacao/regras/{id}/desativar` - Desativar regra

#### Webhooks
- `POST /webhooks/ml/notifications` - Receber notificações ML

## 🏗️ Arquitetura

```
intelligestor-backend/
├── app/
│   ├── config/          # Configurações
│   │   └── settings.py
│   ├── models/          # Schemas Pydantic
│   │   └── schemas.py
│   ├── routers/         # Endpoints API
│   │   ├── auth.py      # Autenticação usuários
│   │   ├── auth_ml.py   # OAuth Mercado Livre
│   │   ├── produtos.py  # Gestão de produtos
│   │   ├── estoque.py   # Gestão de estoque
│   │   ├── automacao.py # Automação
│   │   └── webhooks_ml.py # Webhooks
│   ├── services/        # Lógica de negócio
│   │   ├── ia_service.py        # IA/BuyBox
│   │   ├── estoque_service.py   # Estoque
│   │   ├── ml_sync_service.py   # Sync ML
│   │   └── automacao_service.py # Automação
│   └── middleware/      # Autenticação JWT
│       └── auth.py
├── main.py             # Aplicação FastAPI
├── requirements.txt    # Dependências
└── setup.ps1          # Script de setup
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service

# OpenAI
OPENAI_API_KEY=sk-sua-chave
OPENAI_MODEL=gpt-4

# Mercado Livre
ML_CLIENT_ID=seu-id
ML_CLIENT_SECRET=seu-secret
ML_REDIRECT_URI=http://localhost:8000/auth/ml/callback

# Aplicação
SECRET_KEY=chave-jwt-segura
ENVIRONMENT=development
```

## 📊 Banco de Dados

O sistema usa Supabase (PostgreSQL) com as seguintes tabelas principais:

- `users` - Usuários do sistema
- `produtos` - Catálogo de produtos
- `estoque` - Estoque atual
- `movimentacoes_estoque` - Histórico de movimentações
- `tokens_ml` - Tokens OAuth do Mercado Livre
- `anuncios_ml` - Anúncios sincronizados
- `regras_automacao` - Regras de automação
- `logs_automacao` - Logs de execução
- `logs_ia` - Logs de uso da IA

## 🧪 Testes

```bash
# Executar testes
pytest

# Com cobertura
pytest --cov=app
```

## 📈 Monitoramento

- Health Check: `GET /health`
- Status da API: `GET /`
- Logs: Sistema registra todas as operações

## 🚀 Deploy

### Render.com

```yaml
# render.yaml já configurado
services:
  - type: web
    name: intelligestor-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Vercel (Alternativa)

```json
// vercel.json já configurado
{
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ]
}
```

## 🔒 Segurança

- ✅ JWT tokens seguros
- ✅ Senhas com hash bcrypt
- ✅ Validação de entrada em todos os endpoints
- ✅ CORS configurado
- ✅ Rate limiting (via proxy)
- ✅ Ambiente variables para secrets

## 📝 Exemplos de Uso

### Autenticação e Criação de Produto

```python
import requests

# 1. Login
response = requests.post('http://localhost:8000/auth/login', json={
    'email': 'usuario@empresa.com',
    'password': 'senha123'
})
token = response.json()['access_token']

# 2. Criar produto
headers = {'Authorization': f'Bearer {token}'}
produto = requests.post('http://localhost:8000/produtos/', 
    headers=headers,
    json={
        'nome': 'Mouse Gamer',
        'preco': 149.90,
        'custo': 80.00,
        'sku': 'MOUSE-001'
    }
)
```

### Análise de BuyBox

```python
# Analisar com IA
analise = requests.post('http://localhost:8000/api/buybox/analyze',
    headers=headers,
    json={
        'anuncio_id': 123,
        'incluir_historico': True
    }
)

print(analise.json()['recomendacao'])
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

- **Equipe Intelligestor** - *Desenvolvimento Inicial*

## 🙏 Agradecimentos

- FastAPI por um framework excelente
- Supabase pela infraestrutura
- OpenAI pela IA
- Mercado Livre pela API

---

**Versão:** 1.0.0  
**Status:** ✅ Em Produção  
**Última Atualização:** Novembro 2025

Para mais informações, consulte a [documentação completa](API_USAGE_GUIDE.md).
