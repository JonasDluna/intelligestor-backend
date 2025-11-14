# 🗺️ Mapeamento Real dos Endpoints

## ✅ Endpoints Confirmados do Backend

### Health & Info
```
GET  /                     → Health check básico
GET  /health              → Health check detalhado
GET  /api/info            → Informações da API
```

### Mercado Livre - Auth
```
GET  /auth/ml/login       → Inicia OAuth
GET  /auth/ml/callback    → Callback OAuth
POST /auth/ml/refresh     → Refresh token
GET  /auth/ml/status      → Status da autenticação
POST /auth/ml/disconnect  → Desconectar conta
```

### Produtos (via /api prefix)
```
GET  /api/products/sync   → Sincronizar produtos do ML
```

### Produtos (via /produtos prefix)
```
POST   /produtos/                  → Criar produto
GET    /produtos/{produto_id}      → Buscar produto
PUT    /produtos/{produto_id}      → Atualizar produto
DELETE /produtos/{produto_id}      → Deletar produto
GET    /produtos/                  → Listar produtos
GET    /produtos/sku/{sku}         → Buscar por SKU
```

### Estoque
```
POST   /estoque/movimentacao       → Registrar movimentação
GET    /estoque/                   → Listar estoque
GET    /estoque/produto/{id}       → Estoque de um produto
GET    /estoque/baixo              → Produtos com estoque baixo
GET    /estoque/movimentacoes      → Histórico de movimentações
```

### Mercado Livre - Operações
```
GET    /mercadolivre/anuncios      → Listar anúncios
POST   /mercadolivre/anuncios      → Criar anúncio
GET    /mercadolivre/anuncios/{id} → Detalhes do anúncio
PUT    /mercadolivre/anuncios/{id} → Atualizar anúncio
DELETE /mercadolivre/anuncios/{id} → Deletar anúncio
POST   /mercadolivre/sync          → Sincronizar com ML
```

### IA - BuyBox
```
GET  /ia/buybox/analise         → Análise de BuyBox
GET  /ia/buybox/concorrentes    → Análise de concorrentes
POST /ia/buybox/otimizar        → Otimizar preço
```

### IA - Produtos
```
POST /ia/products/description    → Gerar descrição com IA
GET  /ia/products/analise        → Análise do produto
```

### Automação
```
POST   /automacao/                → Criar automação
GET    /automacao/                → Listar automações
GET    /automacao/{id}            → Buscar automação
PUT    /automacao/{id}            → Atualizar automação
DELETE /automacao/{id}            → Deletar automação
POST   /automacao/{id}/toggle     → Ativar/Desativar
POST   /automacao/{id}/executar   → Executar manualmente
```

### Webhooks Mercado Livre
```
POST /webhooks/ml/notifications  → Receber notificações do ML
GET  /webhooks/ml/status         → Status dos webhooks
```

### Catálogo
```
GET /api/catalog/search          → Buscar no catálogo ML
GET /api/catalog/categories      → Listar categorias ML
```

---

## ⚠️ Problema Identificado

O **frontend** usa prefixo `/v1/*` mas o **backend** NÃO usa esse prefixo!

**Frontend atual:**
```typescript
'/v1/oauth/ml/auth'      ❌
'/v1/produtos'           ❌
'/v1/estoque'            ❌
```

**Backend real:**
```
'/auth/ml/login'         ✅
'/produtos'              ✅
'/estoque'               ✅
```

---

## 🔧 Solução

Precisamos atualizar `src/lib/axios.ts` no frontend para remover o prefixo `/v1/`.
