# 🚀 Guia de Uso da API - Intelligestor Backend

## 📚 Índice

1. [Autenticação](#autenticação)
2. [Produtos](#produtos)
3. [Estoque](#estoque)
4. [Mercado Livre](#mercado-livre)
5. [IA e BuyBox](#ia-e-buybox)
6. [Automação](#automação)
7. [Webhooks](#webhooks)

---

## 🔐 Autenticação

### Registrar Novo Usuário

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha_segura_123",
  "nome": "João Silva",
  "empresa": "Minha Empresa Ltda"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-do-usuario",
    "email": "usuario@empresa.com",
    "nome": "João Silva",
    "empresa": "Minha Empresa Ltda"
  }
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha_segura_123"
}
```

### Usar Token nas Requisições

Todas as requisições protegidas precisam do token no header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📦 Produtos

### Listar Produtos

```bash
GET /produtos/?limit=20&skip=0
Authorization: Bearer {seu_token}
```

### Criar Produto

```bash
POST /produtos/
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "nome": "Mouse Gamer RGB",
  "descricao": "Mouse gamer com iluminação RGB e 7 botões programáveis",
  "preco": 149.90,
  "custo": 80.00,
  "sku": "MOUSE-RGB-001",
  "categoria": "Periféricos",
  "ativo": true
}
```

### Buscar Produto por ID

```bash
GET /produtos/{produto_id}
Authorization: Bearer {seu_token}
```

---

## 📊 Estoque

### Consultar Estoque de um Produto

```bash
GET /estoque/produto/{produto_id}
Authorization: Bearer {seu_token}
```

### Movimentar Estoque

#### Entrada de Mercadoria

```bash
POST /estoque/movimentacao
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "produto_id": 123,
  "tipo": "entrada",
  "quantidade": 50,
  "motivo": "Compra de fornecedor XYZ",
  "custo_unitario": 80.00,
  "documento": "NF-123456"
}
```

#### Saída por Venda

```bash
POST /estoque/movimentacao
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "produto_id": 123,
  "tipo": "saida",
  "quantidade": 5,
  "motivo": "Venda Mercado Livre - Pedido 7890123456",
  "documento": "MLB123456789"
}
```

#### Ajuste de Inventário

```bash
POST /estoque/movimentacao
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "produto_id": 123,
  "tipo": "ajuste",
  "quantidade": 45,
  "motivo": "Inventário mensal - divergência encontrada"
}
```

### Sincronizar Estoque com Mercado Livre

#### Sincronizar Um Produto

```bash
POST /estoque/sync/produto/123?nova_quantidade=30
Authorization: Bearer {seu_token}
```

#### Sincronizar Todos os Produtos

```bash
POST /estoque/sync/todos
Authorization: Bearer {seu_token}
```

#### Importar Estoques do ML

```bash
POST /estoque/sync/importar-ml
Authorization: Bearer {seu_token}
```

### Alertas de Estoque Baixo

```bash
GET /estoque/alertas/baixo-estoque
Authorization: Bearer {seu_token}
```

---

## 🛒 Mercado Livre

### Conectar com Mercado Livre

1. **Iniciar OAuth:**
```bash
GET /auth/ml/login?user_id={seu_user_id}
```

2. O usuário será redirecionado para autorizar no Mercado Livre

3. Após autorização, o token será salvo automaticamente

### Renovar Token ML

```bash
POST /auth/ml/refresh?user_id={seu_user_id}
```

### Listar Anúncios do ML

```bash
GET /api/catalog/?limit=50
Authorization: Bearer {seu_token}
```

---

## 🤖 IA e BuyBox

### Analisar BuyBox

```bash
POST /api/buybox/analyze
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "anuncio_id": 456,
  "incluir_historico": true
}
```

**Resposta:**
```json
{
  "anuncio_id": 456,
  "nosso_preco": 149.90,
  "preco_campeao": 139.90,
  "diferenca_percent": 7.14,
  "estamos_no_buybox": false,
  "recomendacao": "Recomenda-se reduzir o preço em 5-7% para recuperar o BuyBox...",
  "acoes_sugeridas": [
    "Reduzir preço",
    "Verificar estoque"
  ]
}
```

### Otimizar Preço com IA

```bash
POST /api/products/optimize-price
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "anuncio_id": 456,
  "margem_minima": 25.0
}
```

---

## ⚙️ Automação

### Criar Regra de Automação

#### Regra de Preço Automático

```bash
POST /automacao/regras
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "nome": "Reduzir 5% se perder BuyBox",
  "tipo": "price",
  "condicoes": {
    "perdeu_buybox": true,
    "diferenca_max": "10%"
  },
  "acoes": {
    "acao": "reduzir",
    "percentual": 5,
    "anuncios": ["MLB123456789", "MLB987654321"]
  },
  "ativo": true
}
```

#### Regra de Reativação

```bash
POST /automacao/regras
Authorization: Bearer {seu_token}
Content-Type: application/json

{
  "nome": "Reativar anúncios com estoque",
  "tipo": "reactivation",
  "condicoes": {
    "estoque_minimo": 5
  },
  "acoes": {
    "acao": "reativar",
    "anuncios": ["MLB123456789"]
  },
  "ativo": true
}
```

### Listar Regras

```bash
GET /automacao/regras?apenas_ativas=true
Authorization: Bearer {seu_token}
```

### Executar Regras Manualmente

```bash
POST /automacao/executar
Authorization: Bearer {seu_token}
```

**Resposta:**
```json
{
  "total_regras": 3,
  "executadas": 3,
  "sucesso": 2,
  "falhas": 1,
  "detalhes": [
    {
      "regra_id": 1,
      "nome": "Reduzir 5% se perder BuyBox",
      "resultado": {
        "sucesso": true,
        "acoes_executadas": [
          {
            "anuncio": "MLB123456789",
            "acao": "preco_reduzido",
            "de": "149.90",
            "para": "142.41"
          }
        ],
        "mensagem": "Regra de preço executada"
      }
    }
  ]
}
```

### Desativar Regra

```bash
PATCH /automacao/regras/{regra_id}/desativar
Authorization: Bearer {seu_token}
```

---

## 🔔 Webhooks

### Configurar Webhook no Mercado Livre

No painel do Mercado Livre, configure:

```
URL do Webhook: https://seu-dominio.com/webhooks/ml/notifications
Eventos: orders, items, questions, messages
```

### Testar Webhook

```bash
GET /webhooks/ml/test
```

### Tipos de Notificações Processadas

- **orders**: Novos pedidos e alterações de status
- **items**: Alterações em anúncios
- **questions**: Novas perguntas de compradores
- **messages**: Novas mensagens

---

## 📊 Exemplos de Fluxo Completo

### Fluxo 1: Novo Produto do Zero até ML

```bash
# 1. Login
POST /auth/login
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}

# 2. Criar Produto
POST /produtos/
Authorization: Bearer {token}
{
  "nome": "Mouse Gamer RGB",
  "preco": 149.90,
  "custo": 80.00,
  "sku": "MOUSE-001"
}

# 3. Dar Entrada no Estoque
POST /estoque/movimentacao
Authorization: Bearer {token}
{
  "produto_id": 123,
  "tipo": "entrada",
  "quantidade": 100,
  "motivo": "Estoque inicial"
}

# 4. Conectar ML
GET /auth/ml/login?user_id={user_id}

# 5. Sincronizar Estoque com ML
POST /estoque/sync/produto/123?nova_quantidade=100
Authorization: Bearer {token}
```

### Fluxo 2: Otimização de Preços com IA

```bash
# 1. Analisar BuyBox
POST /api/buybox/analyze
Authorization: Bearer {token}
{
  "anuncio_id": 456,
  "incluir_historico": true
}

# 2. Criar Regra de Automação
POST /automacao/regras
Authorization: Bearer {token}
{
  "nome": "Ajuste automático de preço",
  "tipo": "price",
  "condicoes": {"perdeu_buybox": true},
  "acoes": {
    "acao": "reduzir",
    "percentual": 5
  },
  "ativo": true
}

# 3. Executar Regras
POST /automacao/executar
Authorization: Bearer {token}
```

---

## 🔧 Configuração Inicial

### Variáveis de Ambiente Necessárias

```env
# Supabase
SUPABASE_URL=sua-url
SUPABASE_ANON_KEY=sua-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-key

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Mercado Livre
ML_CLIENT_ID=seu-client-id
ML_CLIENT_SECRET=seu-secret
ML_REDIRECT_URI=https://seu-dominio.com/auth/ml/callback

# Aplicação
SECRET_KEY=sua-chave-secreta-jwt
ENVIRONMENT=production
```

---

## 📱 Integração com Frontend

### Exemplo React/Next.js

```typescript
// api/auth.ts
export async function login(email: string, password: string) {
  const response = await fetch('https://api.intelligestor.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
}

// api/produtos.ts
export async function getProdutos() {
  const token = localStorage.getItem('token');
  const response = await fetch('https://api.intelligestor.com/produtos/', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

---

## 🆘 Suporte

- **Documentação Interativa:** https://seu-dominio.com/docs
- **ReDoc:** https://seu-dominio.com/redoc
- **Health Check:** https://seu-dominio.com/health

---

## 📝 Notas Importantes

1. **Tokens JWT expiram em 7 dias** - Use `/auth/refresh` para renovar
2. **Tokens ML expiram em 6 horas** - Sistema renova automaticamente
3. **Rate Limits do ML:** Respeite os limites da API do Mercado Livre
4. **Webhooks:** Configure corretamente para receber notificações em tempo real
5. **IA:** Requer OpenAI API Key válida e com créditos

---

**Versão:** 1.0.0  
**Última Atualização:** Novembro 2025
