# API de Catálogo do Mercado Livre - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Elegibilidade de Catálogo](#elegibilidade-de-catálogo)
3. [Busca de Produtos](#busca-de-produtos)
4. [Publicação no Catálogo](#publicação-no-catálogo)
5. [Competição e Buy Box](#competição-e-buy-box)
6. [Brand Central](#brand-central)
7. [Sincronização](#sincronização)
8. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

O **Catálogo do Mercado Livre** permite que vendedores publiquem produtos em páginas padronizadas (PDPs - Product Detail Pages), onde múltiplos vendedores competem pelo Buy Box. Os compradores veem um único produto com vários vendedores competindo por preço, frete e condições.

### Benefícios do Catálogo
- ✅ Maior visibilidade nos resultados de busca
- ✅ Conteúdo profissional (fotos, descrições, fichas técnicas)
- ✅ Competição justa baseada em preço e serviço
- ✅ Melhor experiência de compra

### Conceitos-Chave
- **Produto de Catálogo**: Página padronizada com ficha técnica completa
- **Buy Box**: Caixa de compra destacada para o vendedor ganhador
- **Optin**: Processo de associar item tradicional ao catálogo
- **Produtos Pai/Filho**: Hierarquia de produtos (ex: iPhone 13 → iPhone 13 128GB Preto)

---

## ✅ Elegibilidade de Catálogo

### 1. Verificar Elegibilidade de Um Item

```bash
GET http://localhost:8000/ml/catalog/eligibility/{item_id}
```

**Exemplo de Resposta:**
```json
{
  "item_id": "MLA123456789",
  "eligibility": {
    "item_id": "MLA123456789",
    "site_id": "MLA",
    "domain_id": "MLA-CELLPHONES",
    "buy_box_eligible": true,
    "status": "READY_FOR_OPTIN",
    "variations": [
      {
        "id": 1312323,
        "status": "READY_FOR_OPTIN",
        "buy_box_eligible": true
      }
    ]
  },
  "can_optin": true,
  "status": "READY_FOR_OPTIN",
  "has_variations": true
}
```

**Status Possíveis:**
- `READY_FOR_OPTIN`: Pode publicar no catálogo
- `ALREADY_OPTED_IN`: Já tem item de catálogo
- `CLOSED`: Item fechado/pausado
- `PRODUCT_INACTIVE`: Produto de catálogo inativo
- `NOT_ELIGIBLE`: Não elegível (ex: produto usado)

### 2. Verificar Múltiplos Itens (Multiget)

```bash
GET http://localhost:8000/ml/catalog/eligibility/multiget?item_ids=MLA123,MLA456,MLA789
```

**Exemplo de Resposta:**
```json
{
  "total_items_checked": 3,
  "eligible_count": 2,
  "items": [
    {
      "id": "MLA123",
      "buy_box_eligible": true,
      "status": "READY_FOR_OPTIN"
    },
    {
      "id": "MLA456",
      "buy_box_eligible": false,
      "status": "NOT_ELIGIBLE"
    },
    {
      "id": "MLA789",
      "buy_box_eligible": true,
      "status": "READY_FOR_OPTIN"
    }
  ]
}
```

### 3. Listar Itens de Catálogo de um Vendedor

```bash
# Publicações de catálogo
GET http://localhost:8000/ml/catalog/seller/123456/items?catalog_listing=true

# Publicações tradicionais
GET http://localhost:8000/ml/catalog/seller/123456/items?catalog_listing=false

# Com filtro de status
GET http://localhost:8000/ml/catalog/seller/123456/items?catalog_listing=true&status=active
```

**Exemplo de Resposta:**
```json
{
  "seller_id": "123456",
  "catalog_listing": true,
  "status_filter": "active",
  "total_items": 42,
  "items": [
    "MLA111111111",
    "MLA222222222",
    "MLA333333333"
  ],
  "paging": {
    "total": 42,
    "offset": 0,
    "limit": 50
  }
}
```

---

## 🔍 Busca de Produtos

### 1. Buscar Produtos por Palavras-Chave

```bash
GET http://localhost:8000/ml/catalog/products/search?site_id=MLA&q=iPhone 13&status=active
```

**Parâmetros:**
- `site_id` (obrigatório): MLB, MLA, MLM, etc.
- `q`: Palavras-chave ("Samsung Galaxy S20")
- `product_identifier`: GTIN/EAN/UPC
- `domain_id`: Filtrar por domínio
- `listing_strategy`: `catalog_required` ou `catalog_only`
- `status`: `active` ou `inactive`
- `offset`, `limit`: Paginação

**Exemplo de Resposta:**
```json
{
  "site_id": "MLA",
  "query": "iPhone 13",
  "total_results": 18,
  "results": [
    {
      "id": "MLA18500844",
      "status": "active",
      "domain_id": "MLA-CELLPHONES",
      "name": "Apple iPhone 13 (128 GB) - Azul medianoche",
      "settings": {
        "listing_strategy": "catalog_required"
      },
      "attributes": [...],
      "pictures": [...],
      "parent_id": "MLA18500843",
      "children_ids": []
    }
  ],
  "paging": {
    "total": 18,
    "offset": 0,
    "limit": 10
  }
}
```

### 2. Buscar por Código de Barras (GTIN)

```bash
GET http://localhost:8000/ml/catalog/products/search?site_id=MLB&product_identifier=7891234567890
```

### 3. Buscar por Domínio e Estratégia

```bash
# Apenas produtos obrigatórios de catálogo
GET http://localhost:8000/ml/catalog/products/search?site_id=MLA&domain_id=MLA-CELLPHONES&listing_strategy=catalog_required

# Apenas produtos exclusivos de catálogo
GET http://localhost:8000/ml/catalog/products/search?site_id=MLB&domain_id=MLB-CELLPHONES&listing_strategy=catalog_only
```

### 4. Obter Detalhes de um Produto

```bash
GET http://localhost:8000/ml/catalog/products/{product_id}
```

**Exemplo de Resposta:**
```json
{
  "product_id": "MLA18500844",
  "product": {
    "id": "MLA18500844",
    "status": "active",
    "domain_id": "MLA-CELLPHONES",
    "name": "Apple iPhone 13 (128 GB) - Azul medianoche",
    "family_name": "Apple iPhone 13",
    "permalink": "https://www.mercadolibre.com.ar/...",
    "attributes": [
      {
        "id": "BRAND",
        "name": "Marca",
        "value_name": "Apple"
      },
      {
        "id": "INTERNAL_MEMORY",
        "name": "Memoria interna",
        "value_name": "128 GB"
      }
    ],
    "pictures": [...],
    "parent_id": "MLA18500843",
    "children_ids": [],
    "buy_box_winner": {
      "item_id": "MLA987654321",
      "price": 362999,
      "currency_id": "ARS",
      "seller_id": 123456
    },
    "buy_box_winner_price_range": {
      "min": {"price": 330158, "currency_id": "ARS"},
      "max": {"price": 437999, "currency_id": "ARS"}
    }
  },
  "is_parent": false,
  "is_child": true,
  "is_buyable": true,
  "has_winner": true
}
```

---

## 📝 Publicação no Catálogo

### 1. Criar Publicação Direta no Catálogo

```bash
POST http://localhost:8000/ml/catalog/items/create
Content-Type: application/json
```

**Body:**
```json
{
  "site_id": "MLA",
  "title": "Apple iPhone 13 128GB Azul medianoche",
  "category_id": "MLA1055",
  "price": 500000,
  "currency_id": "ARS",
  "available_quantity": 5,
  "buying_mode": "buy_it_now",
  "listing_type_id": "gold_special",
  "catalog_product_id": "MLA18500844",
  "catalog_listing": true,
  "condition": "new",
  "warranty": "Garantía de fábrica: 12 meses",
  "attributes": [
    {
      "id": "CARRIER",
      "value_id": "298335",
      "value_name": "Liberado"
    },
    {
      "id": "ITEM_CONDITION",
      "value_id": "2230284",
      "value_name": "Nuevo"
    }
  ],
  "pictures": [
    {"id": "973345-MLA47781591382_102021"}
  ]
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "item_id": "MLA999888777",
  "catalog_listing": true,
  "status": "active",
  "permalink": "https://articulo.mercadolibre.com.ar/...",
  "data": {...}
}
```

### 2. Fazer Optin (Item Tradicional → Catálogo)

#### Sem Variações:
```bash
POST http://localhost:8000/ml/catalog/items/optin
Content-Type: application/json
```

**Body:**
```json
{
  "item_id": "MLA123456789",
  "catalog_product_id": "MLA18500844"
}
```

#### Com Variações:
```json
{
  "item_id": "MLM123456789",
  "catalog_product_id": "MLM15996654",
  "variation_id": 174997747229
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "original_item_id": "MLA123456789",
  "catalog_item_id": "MLA987654321",
  "catalog_product_id": "MLA18500844",
  "variation_id": null,
  "catalog_listing": true,
  "item_relations": [
    {
      "id": "MLA123456789",
      "variation_id": null,
      "stock_relation": 1
    }
  ]
}
```

### 3. Consultar Data Limite (Forewarning)

```bash
GET http://localhost:8000/ml/catalog/forewarning/{item_id}/date
```

**Possíveis Status:**
- `date_defined`: Data limite definida para fazer optin
- `date_not_defined`: Item não tem tag catalog_forewarning
- `date_expired`: Prazo expirou, item será moderado

**Exemplo de Resposta:**
```json
{
  "item_id": "MLA123456789",
  "status": "date_defined",
  "moderation_date": "2025-12-20T13:00:00Z",
  "needs_action": true
}
```

---

## 🏆 Competição e Buy Box

### 1. Análise Completa do BuyBox

```bash
GET http://localhost:8000/ml/buybox/analysis/{item_id}
```

**Exemplo de Resposta:**
```json
{
  "item_id": "MLA987654321",
  "buybox_status": {
    "current_status": "competing",
    "is_winning": false,
    "is_competing": true,
    "visit_share": "minimum",
    "consistent": true
  },
  "pricing": {
    "current_price": 267999,
    "currency_id": "ARS",
    "price_to_win": 265000,
    "savings_needed": 2999,
    "discount_percentage": 1.12
  },
  "competitive_advantages": {
    "fulfillment": {
      "status": "opportunity",
      "description": "Mercado Envios Full",
      "has_advantage": false
    },
    "free_shipping": {
      "status": "boosted",
      "description": "Envíos gratis",
      "has_advantage": true
    },
    "same_day_shipping": {
      "status": "boosted",
      "description": "Envíos en el día",
      "has_advantage": true
    }
  },
  "winner_info": {
    "item_id": "MLA111222333",
    "price": 265000,
    "has_fulfillment": true,
    "has_free_installments": true
  },
  "recommendations": [
    "Reduza o preço para R$ 265.000 para ganhar o Buy Box",
    "Ative Mercado Envios Full para mais vantagem competitiva",
    "Ofereça parcelamento sem juros"
  ]
}
```

### 2. Detalhes da Competição

```bash
GET http://localhost:8000/ml/products/{product_id}/competition
```

**Exemplo de Resposta:**
```json
{
  "product_id": "MLA18500844",
  "total_competitors": 15,
  "winner": {
    "item_id": "MLA987654321",
    "seller_id": 123456,
    "price": 362999,
    "currency_id": "ARS",
    "shipping": {
      "free_shipping": true,
      "logistic_type": "fulfillment"
    },
    "listing_type_id": "gold_special"
  },
  "price_range": {
    "min": 330158,
    "max": 437999,
    "median": 380000
  },
  "competitors": [
    {
      "item_id": "MLA111222333",
      "price": 365000,
      "seller_reputation": "GREEN",
      "has_fulfillment": true
    }
  ]
}
```

### 3. Listar Competidores de uma PDP

```bash
GET http://localhost:8000/ml/products/{product_id}/items
```

### 4. Verificar Status de Competição

**Status Possíveis:**
- `winning`: Ganhando (máxima visibilidade)
- `sharing_first_place`: Compartilhando primeiro lugar (média visibilidade)
- `competing`: Perdendo (mínima visibilidade)
- `listed`: Não competindo (apenas na listagem)

**Motivos para "listed":**
- `non_trusted_seller`: Vendedor não confiável
- `reputation_below_threshold`: Reputação insuficiente
- `manufacturing_time`: Tem prazo de fabricação
- `item_paused`: Item pausado
- `shipping_mode`: Método de envio inferior

---

## 🌟 Brand Central (Sugestões de Produtos)

### 1. Verificar Quota Disponível

```bash
GET http://localhost:8000/ml/brand-central/users/{user_id}/quota
```

**Resposta:**
```json
{
  "user_id": "123456",
  "quota": [
    {
      "type": "standard",
      "available": 10
    }
  ],
  "total_available": 10,
  "can_create_suggestions": true
}
```

### 2. Listar Domínios Disponíveis

```bash
GET http://localhost:8000/ml/brand-central/domains/{site_id}/available
```

**Exemplo de Resposta:**
```json
{
  "site_id": "MLA",
  "generation_date": "2025-11-19T10:00:00Z",
  "total_domains": 500,
  "available_domains": 120,
  "domains": [
    {
      "id": "MLA-CELLPHONES",
      "name": "Celulares e Smartphones",
      "available": true,
      "pictures": [...]
    },
    {
      "id": "MLA-TABLETS",
      "name": "Tablets",
      "available": true,
      "pictures": [...]
    }
  ]
}
```

### 3. Obter Ficha Técnica de um Domínio

```bash
# Completa (input + output)
GET http://localhost:8000/ml/brand-central/domains/{domain_id}/technical-specs?spec_type=full

# Apenas campos de entrada
GET http://localhost:8000/ml/brand-central/domains/{domain_id}/technical-specs?spec_type=input

# Apenas campos de saída
GET http://localhost:8000/ml/brand-central/domains/{domain_id}/technical-specs?spec_type=output
```

### 4. Validar Sugestão

```bash
POST http://localhost:8000/ml/brand-central/suggestions/validate
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Samsung Galaxy S21 128GB Preto",
  "domain_id": "MLA-CELLPHONES",
  "pictures": [
    {"id": "647954-MLA46144073729_052021"}
  ],
  "attributes": [
    {
      "id": "BRAND",
      "values": [{"name": "Samsung"}]
    },
    {
      "id": "MODEL",
      "values": [{"name": "Galaxy S21"}]
    },
    {
      "id": "INTERNAL_MEMORY",
      "values": [{"name": "128 GB"}]
    },
    {
      "id": "COLOR",
      "values": [{"name": "Preto"}]
    },
    {
      "id": "GTIN",
      "values": [{"name": "8801643709488"}]
    }
  ]
}
```

**Resposta de Sucesso:**
```json
{
  "is_valid": true,
  "can_create": true,
  "validation_result": {
    "valid": true,
    "message": "Sugestão válida"
  },
  "errors": []
}
```

**Resposta com Erros:**
```json
{
  "is_valid": false,
  "can_create": false,
  "validation_result": {
    "valid": false,
    "errors": [
      {
        "department": "quality",
        "code": "InvalidProductIdentifier",
        "message": "El código universal 12345678 tiene un formato incorrecto."
      },
      {
        "department": "items",
        "code": "item.attributes.missing_required",
        "message": "The attributes [MODEL] are required."
      }
    ]
  },
  "errors": [...]
}
```

### 5. Criar Sugestão

```bash
POST http://localhost:8000/ml/brand-central/suggestions/create
Content-Type: application/json
```

**Body:** (Mesma estrutura do validate)

**Resposta:**
```json
{
  "success": true,
  "suggestion_id": "MLA922220746",
  "status": "UNDER_REVIEW",
  "title": "Samsung Galaxy S21 128GB Preto",
  "domain_id": "MLA-CELLPHONES"
}
```

### 6. Consultar Sugestão

```bash
GET http://localhost:8000/ml/brand-central/suggestions/{suggestion_id}
```

**Status Possíveis:**
- `UNDER_REVIEW`: Em revisão pelo ML
- `WAITING_FOR_FIX`: Precisa correções
- `PUBLISHED`: Aprovada e publicada
- `REJECTED`: Rejeitada

**Resposta:**
```json
{
  "suggestion_id": "MLA922220746",
  "status": "UNDER_REVIEW",
  "sub_status": "VALIDATING",
  "needs_action": false,
  "is_published": false,
  "suggestion": {
    "id": "MLA922220746",
    "title": "Samsung Galaxy S21 128GB Preto",
    "domain_id": "MLA-CELLPHONES",
    "seller_id": 123456,
    "date_created": "2025-11-19T10:30:00Z",
    "attributes": [...],
    "pictures": [...]
  }
}
```

### 7. Modificar Sugestão

```bash
PUT http://localhost:8000/ml/brand-central/suggestions/{suggestion_id}
Content-Type: application/json
```

**Nota:** Apenas permitido quando `status = WAITING_FOR_FIX`

### 8. Listar Todas as Sugestões

```bash
# Todas as sugestões do usuário
GET http://localhost:8000/ml/brand-central/users/{user_id}/suggestions

# Com filtros
GET http://localhost:8000/ml/brand-central/users/{user_id}/suggestions?status=UNDER_REVIEW
GET http://localhost:8000/ml/brand-central/users/{user_id}/suggestions?domain_ids=MLA-CELLPHONES,MLA-TABLETS
GET http://localhost:8000/ml/brand-central/users/{user_id}/suggestions?title=Samsung
```

### 9. Adicionar/Modificar Descrição

```bash
# Criar descrição
POST http://localhost:8000/ml/brand-central/suggestions/{suggestion_id}/description
Content-Type: application/json
{
  "description": "Descrição completa do produto..."
}

# Modificar descrição
PUT http://localhost:8000/ml/brand-central/suggestions/{suggestion_id}/description
Content-Type: application/json
{
  "description": "Nova descrição..."
}
```

### 10. Ver Validações da Sugestão

```bash
GET http://localhost:8000/ml/brand-central/suggestions/{suggestion_id}/validations
```

**Resposta:**
```json
{
  "suggestion_id": "MLA922220746",
  "total_validations": 3,
  "total_errors": 2,
  "total_warnings": 1,
  "has_errors": true,
  "validations": [
    {
      "department": "quality",
      "cause_id": 3026,
      "type": "error",
      "code": "InvalidProductIdentifier",
      "message": "El código universal 12345678 tiene un formato incorrecto."
    },
    {
      "department": "quality",
      "cause_id": 3035,
      "type": "error",
      "code": "IreqAttributesMissing",
      "message": "El campo \"Memoria interna\" es obligatorio."
    }
  ]
}
```

---

## 🔄 Sincronização

### 1. Verificar Status de Sincronização

```bash
GET http://localhost:8000/ml/catalog/sync/{item_id}/status
```

**Resposta Sincronizado:**
```json
{
  "item_id": "MLA123456789",
  "sync_status": "SYNC",
  "is_synced": true,
  "needs_fix": false,
  "timestamp": null,
  "relations": ["MLA987654321"]
}
```

**Resposta Dessincronizado:**
```json
{
  "item_id": "MLA123456789",
  "sync_status": "UNSYNC",
  "is_synced": false,
  "needs_fix": true,
  "timestamp": 1678116777461,
  "relations": ["MLA987654321"]
}
```

### 2. Corrigir Sincronização

```bash
POST http://localhost:8000/ml/catalog/sync/{item_id}/fix
```

**Resposta:**
```json
{
  "item_id": "MLA123456789",
  "sync_fixed": true,
  "message": "Sincronização corrigida",
  "data": {...}
}
```

---

## 💡 Exemplos Práticos

### Fluxo 1: Publicar Item Novo no Catálogo

```bash
# Passo 1: Buscar produto de catálogo
GET http://localhost:8000/ml/catalog/products/search?site_id=MLA&q=iPhone 13 128GB Preto

# Passo 2: Ver detalhes do produto
GET http://localhost:8000/ml/catalog/products/MLA18500844

# Passo 3: Criar publicação
POST http://localhost:8000/ml/catalog/items/create
{
  "site_id": "MLA",
  "title": "Apple iPhone 13 128GB Preto",
  "category_id": "MLA1055",
  "price": 500000,
  "currency_id": "ARS",
  "available_quantity": 5,
  "catalog_product_id": "MLA18500844",
  "catalog_listing": true,
  ...
}

# Passo 4: Verificar competição
GET http://localhost:8000/ml/buybox/analysis/MLA999888777
```

### Fluxo 2: Migrar Item Tradicional para Catálogo

```bash
# Passo 1: Verificar elegibilidade
GET http://localhost:8000/ml/catalog/eligibility/MLA123456789

# Passo 2: Fazer optin
POST http://localhost:8000/ml/catalog/items/optin
{
  "item_id": "MLA123456789",
  "catalog_product_id": "MLA18500844"
}

# Passo 3: Verificar sincronização
GET http://localhost:8000/ml/catalog/sync/MLA123456789/status

# Passo 4: Analisar competição
GET http://localhost:8000/ml/buybox/analysis/MLA987654321
```

### Fluxo 3: Sugerir Produto Novo

```bash
# Passo 1: Verificar quota
GET http://localhost:8000/ml/brand-central/users/123456/quota

# Passo 2: Ver domínios disponíveis
GET http://localhost:8000/ml/brand-central/domains/MLA/available

# Passo 3: Ver ficha técnica do domínio
GET http://localhost:8000/ml/brand-central/domains/MLA-CELLPHONES/technical-specs?spec_type=input

# Passo 4: Validar sugestão
POST http://localhost:8000/ml/brand-central/suggestions/validate
{
  "title": "Samsung Galaxy S21 FE 128GB",
  "domain_id": "MLA-CELLPHONES",
  "pictures": [...],
  "attributes": [...]
}

# Passo 5: Criar sugestão
POST http://localhost:8000/ml/brand-central/suggestions/create
{...}

# Passo 6: Acompanhar status
GET http://localhost:8000/ml/brand-central/suggestions/MLA922220746
GET http://localhost:8000/ml/brand-central/suggestions/MLA922220746/validations
```

### Fluxo 4: Otimizar para Ganhar Buy Box

```bash
# Passo 1: Analisar situação atual
GET http://localhost:8000/ml/buybox/analysis/MLA987654321

# Passo 2: Ver competidores
GET http://localhost:8000/ml/products/MLA18500844/items

# Passo 3: Ajustar preço (via API de items)
# PUT /items/{item_id} com novo preço

# Passo 4: Ativar melhorias (fulfillment, frete grátis, etc)
# PUT /items/{item_id}/shipping

# Passo 5: Verificar nova posição
GET http://localhost:8000/ml/buybox/analysis/MLA987654321
```

---

## 📊 Códigos de Erro Comuns

### Elegibilidade
- `item.catalog_listing.not_eligible`: Item não elegível
- `item.catalog_product_id`: Produto não ativo ou incorreto

### Criação/Optin
- `body.required_fields`: Campos obrigatórios faltando
- `item.variations.invalid`: Variação inválida
- `catalog_product_id` obrigatório

### Brand Central
- `forbidden`: Usuário não permitido
- `validation_error`: Erros de validação
- `InvalidProductIdentifier`: GTIN inválido
- `IreqAttributesMissing`: Atributos obrigatórios faltando
- `InvalidAttributeValue`: Valor de atributo incorreto

---

## 🎓 Boas Práticas

1. **Sempre valide elegibilidade** antes de tentar optin
2. **Use multiget** para verificar múltiplos itens de uma vez
3. **Verifique produtos pai/filho** antes de publicar
4. **Monitore sincronização** regularmente
5. **Valide sugestões** antes de criar
6. **Acompanhe status** de sugestões periodicamente
7. **Otimize preços e serviços** baseado em price_to_win
8. **Ative melhorias** (fulfillment, frete grátis) para competir melhor

---

## 📞 Suporte

Para mais informações, consulte:
- [Documentação Oficial do ML](https://developers.mercadolivre.com.br)
- [Guia de Catálogo](https://developers.mercadolivre.com.br/pt_br/catalogo)
- [Guia de Brand Central](https://developers.mercadolivre.com.br/pt_br/brand-central)

---

**Última atualização:** 19 de novembro de 2025
