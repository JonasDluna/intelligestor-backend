# API de Tipos de Publicação (Listing Types) - Mercado Livre

Documentação completa dos endpoints para gerenciar tipos de publicação do Mercado Livre.

## 📋 Endpoints Disponíveis

### 1. Listar Tipos de Publicação por Site
```http
GET /ml/listing-types/{site_id}
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/listing-types/MLB
```

**Resposta:**
```json
{
  "site_id": "MLB",
  "listing_types": [
    {"site_id": "MLB", "id": "gold_pro", "name": "Premium"},
    {"site_id": "MLB", "id": "gold_special", "name": "Clássico"},
    {"site_id": "MLB", "id": "free", "name": "Grátis"}
  ],
  "total": 3
}
```

---

### 2. Obter Especificações de um Tipo
```http
GET /ml/listing-types/{site_id}/{listing_type_id}
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/listing-types/MLB/gold_special
```

**Resposta:**
```json
{
  "id": "gold_special",
  "configuration": {
    "name": "Clássico",
    "listing_exposure": "highest",
    "duration_days": {
      "buy_it_now": 7300
    },
    "sale_fee_criteria": {
      "percentage_of_fee_amount": 13,
      "currency": "BRL"
    }
  }
}
```

---

### 3. Verificar Tipos Disponíveis para Usuário
```http
GET /ml/users/{user_id}/available-listing-types?category_id={category_id}
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/users/123456/available-listing-types?category_id=MLB1055
```

**Resposta:**
```json
{
  "category_id": "MLB1055",
  "available": [
    {
      "site_id": "MLB",
      "id": "gold_pro",
      "name": "Premium",
      "remaining_listings": null
    },
    {
      "site_id": "MLB",
      "id": "free",
      "name": "Gratuita",
      "remaining_listings": 10
    }
  ]
}
```

---

### 4. Obter Níveis de Exposição
```http
GET /ml/listing-exposures/{site_id}
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/listing-exposures/MLB
```

**Resposta:**
```json
{
  "site_id": "MLB",
  "exposures": [
    {
      "id": "highest",
      "name": "Superior",
      "home_page": true,
      "priority_in_search": 0
    },
    {
      "id": "high",
      "name": "Alta",
      "home_page": false,
      "priority_in_search": 1
    }
  ]
}
```

---

### 5. Detalhes de Exposição Específica
```http
GET /ml/listing-exposures/{site_id}/{exposure_id}
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/listing-exposures/MLB/highest
```

---

### 6. Tipos Disponíveis para um Item
```http
GET /ml/items/{item_id}/available-listing-types
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/items/MLB123456789/available-listing-types
```

**Resposta:**
```json
{
  "item_id": "MLB123456789",
  "available_listing_types": [
    {"site_id": "MLB", "id": "gold_pro", "name": "Premium"},
    {"site_id": "MLB", "id": "gold_special", "name": "Clássico"}
  ]
}
```

---

### 7. Upgrades Disponíveis
```http
GET /ml/items/{item_id}/available-upgrades
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/items/MLB123456789/available-upgrades
```

**Resposta:**
```json
{
  "item_id": "MLB123456789",
  "available_upgrades": [
    {"site_id": "MLB", "id": "gold_premium", "name": "Diamante"},
    {"site_id": "MLB", "id": "gold", "name": "Ouro"}
  ]
}
```

---

### 8. Downgrades Disponíveis
```http
GET /ml/items/{item_id}/available-downgrades
```

**Exemplo:**
```bash
curl http://localhost:8000/ml/items/MLB123456789/available-downgrades
```

---

### 9. Atualizar Tipo de Publicação ⚠️
```http
POST /ml/items/{item_id}/listing-type
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```json
{
  "id": "gold_special"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:8000/ml/items/MLB123456789/listing-type \
  -H "Content-Type: application/json" \
  -d '{"id": "gold_special"}'
```

**Resposta:**
```json
{
  "item_id": "MLB123456789",
  "new_listing_type": "gold_special",
  "updated": true,
  "data": {
    "id": "MLB123456789",
    "listing_type_id": "gold_special",
    "title": "Produto Exemplo"
  }
}
```

---

## 🎯 Sites Disponíveis

| Site ID | País |
|---------|------|
| MLB | Brasil |
| MLA | Argentina |
| MLM | México |
| MLC | Chile |
| MLU | Uruguai |
| MCO | Colômbia |
| MPE | Peru |
| MLV | Venezuela |

---

## 📊 Tipos de Publicação Comuns

| ID | Nome | Exposição |
|----|------|-----------|
| `gold_pro` | Premium | Highest |
| `gold_special` | Clássico | Highest |
| `gold_premium` | Diamante | Highest |
| `gold` | Ouro | High |
| `silver` | Prata | Mid |
| `bronze` | Bronze | Low |
| `free` | Grátis | Lowest |

---

## ⚠️ Observações Importantes

1. **Upgrades/Downgrades**: Pode alternar entre `gold_special` e `gold_pro` sem custo adicional
2. **Duração**: Publicações Premium e Clássico têm duração ilimitada
3. **Estoque**: Publicações são pausadas automaticamente quando o estoque chega a 0
4. **Token**: Alguns endpoints requerem autenticação com token ML

---

## 🧪 Teste Rápido

```bash
# Ver tipos disponíveis no Brasil
curl http://localhost:8000/ml/listing-types/MLB

# Ver exposições
curl http://localhost:8000/ml/listing-exposures/MLB
```

---

## 📝 Status dos Serviços

Verifique se o backend está online:
```bash
curl http://localhost:8000/health
```
