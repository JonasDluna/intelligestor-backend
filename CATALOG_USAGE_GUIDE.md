# Sistema de Catálogo - Guia de Uso Completo

## 🎉 Implementação Concluída!

O sistema completo de Catálogo do Mercado Livre foi implementado com sucesso!

---

## 📦 O que foi Implementado

### 1. Backend (API Endpoints)

#### Arquivo: `app/services/ml_official_api.py`
- ✅ 25+ métodos de integração com APIs do ML
- ✅ Elegibilidade de catálogo
- ✅ Busca de produtos
- ✅ Publicação e optin
- ✅ Brand Central completo
- ✅ Sincronização

#### Arquivo: `app/routers/ml_real.py`
- ✅ 30+ endpoints REST documentados
- ✅ Validação de parâmetros
- ✅ Tratamento de erros
- ✅ Exemplos em docstrings

### 2. Frontend (Interface Web)

#### Serviço: `frontend/src/services/catalogService.ts`
- ✅ 20+ funções de integração
- ✅ TypeScript com tipos completos
- ✅ Tratamento de erros
- ✅ Axios configurado

#### Páginas Criadas:

##### 📋 Elegibilidade (`/ecommerce/catalogo/elegibilidade`)
**Funcionalidades:**
- Verificar elegibilidade de item único
- Verificar múltiplos itens (multiget)
- Visualizar status de variações
- Indicadores visuais de status
- Informações sobre Buy Box

##### 🔍 Busca de Produtos (`/ecommerce/catalogo/busca`)
**Funcionalidades:**
- Busca por palavras-chave
- Busca por código de barras (GTIN/EAN)
- Busca por domínio/categoria
- Visualização em cards com imagens
- Informações de Buy Box winner
- Atributos do produto
- Links diretos para ML

##### 📊 Monitoramento Buy Box (`/ecommerce/catalogo/monitoramento`)
**Funcionalidades:**
- Monitorar múltiplos itens simultaneamente
- Dashboard com estatísticas em tempo real
- Auto-refresh configurável (1-30 min)
- Gráfico de distribuição de status
- Análise de preços (atual vs para ganhar)
- Vantagens competitivas
- Recomendações automáticas
- Alertas visuais

##### 🌟 Sugestões Brand Central (`/ecommerce/catalogo/sugestoes`)
**Funcionalidades:**
- Visualizar quota disponível
- Listar todas as sugestões
- Filtrar por status
- Ver detalhes completos
- Acompanhar validações
- Ver erros e warnings
- Ações necessárias destacadas

### 3. Testes

#### Arquivo: `test_catalog_real.py`
**Funcionalidades:**
- Script completo de testes
- Cobertura de 30+ endpoints
- Relatórios coloridos no terminal
- Exportação JSON de resultados
- Configuração fácil de tokens

---

## 🚀 Como Usar

### 1. Testar com Tokens Reais do ML

```bash
# 1. Edite o arquivo test_catalog_real.py
# Configure suas credenciais:
ML_ACCESS_TOKEN = "APP_USR-SEU_TOKEN_REAL"
USER_ID = "123456789"
SITE_ID = "MLB"
TEST_ITEM_ID = "MLB1234567890"

# 2. Execute os testes
cd C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main
python test_catalog_real.py

# 3. Veja o relatório
# Será gerado: test_catalog_report_YYYYMMDD_HHMMSS.json
```

### 2. Usar Interface Web

#### Passo 1: Iniciar Backend
```bash
cd C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main
python main.py
# Backend rodando em http://localhost:8000
```

#### Passo 2: Iniciar Frontend
```bash
cd C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main\frontend
npm run dev
# Frontend rodando em http://localhost:3000
```

#### Passo 3: Navegar nas Páginas

**Verificar Elegibilidade:**
```
http://localhost:3000/ecommerce/catalogo/elegibilidade
```
- Digite um Item ID (ex: MLB1234567890)
- Clique em "Verificar Elegibilidade"
- Veja se pode fazer optin para catálogo

**Buscar Produtos:**
```
http://localhost:3000/ecommerce/catalogo/busca
```
- Escolha o tipo de busca
- Digite palavras-chave, GTIN ou domínio
- Explore os produtos disponíveis

**Monitorar Buy Box:**
```
http://localhost:3000/ecommerce/catalogo/monitoramento
```
- Adicione Item IDs para monitorar
- Ative auto-atualização
- Acompanhe em tempo real

**Acompanhar Sugestões:**
```
http://localhost:3000/ecommerce/catalogo/sugestoes
```
- Digite seu User ID
- Veja todas as sugestões
- Filtre por status
- Visualize validações

---

## 📝 Exemplos Práticos

### Exemplo 1: Migrar Item para Catálogo

1. **Verificar elegibilidade:**
```bash
GET http://localhost:8000/ml/catalog/eligibility/MLB1234567890
```

2. **Se elegível, fazer optin:**
```bash
POST http://localhost:8000/ml/catalog/items/optin
{
  "item_id": "MLB1234567890",
  "catalog_product_id": "MLB18500844"
}
```

3. **Acompanhar Buy Box:**
```bash
GET http://localhost:8000/ml/buybox/analysis/MLB1234567890
```

### Exemplo 2: Criar Sugestão de Produto

1. **Verificar quota:**
```bash
GET http://localhost:8000/ml/brand-central/users/123456789/quota
```

2. **Ver domínios disponíveis:**
```bash
GET http://localhost:8000/ml/brand-central/domains/MLB/available
```

3. **Validar sugestão:**
```bash
POST http://localhost:8000/ml/brand-central/suggestions/validate
{
  "title": "Samsung Galaxy S21",
  "domain_id": "MLB-CELLPHONES",
  "pictures": [...],
  "attributes": [...]
}
```

4. **Criar sugestão:**
```bash
POST http://localhost:8000/ml/brand-central/suggestions/create
{...}
```

### Exemplo 3: Otimizar para Ganhar Buy Box

1. **Analisar situação atual:**
```bash
GET http://localhost:8000/ml/buybox/analysis/MLB1234567890
```

2. **Ver recomendações:**
```json
{
  "recommendations": [
    "Reduza o preço para R$ 350.000 para ganhar o Buy Box",
    "Ative Mercado Envios Full",
    "Ofereça parcelamento sem juros"
  ]
}
```

3. **Ajustar preço e serviços**

4. **Monitorar resultado:**
```bash
GET http://localhost:8000/ml/buybox/analysis/MLB1234567890
```

---

## 🎯 Recursos Principais

### Dashboard de Monitoramento

**Métricas em Tempo Real:**
- Total de itens monitorados
- Quantos estão ganhando Buy Box
- Quantos estão competindo
- Gap total de preço

**Gráficos:**
- Distribuição de status (Pizza)
- Linha do tempo de preços (futuro)

**Auto-refresh:**
- Configurable: 1, 5, 10, 30 minutos
- Atualização manual disponível

### Sistema de Sugestões

**Acompanhamento Completo:**
- Status: UNDER_REVIEW, WAITING_FOR_FIX, PUBLISHED, REJECTED
- Validações em tempo real
- Erros e warnings detalhados
- Ações necessárias destacadas

**Filtros Avançados:**
- Por status
- Por domínio
- Por título

---

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente Necessárias

**Backend (.env):**
```env
ML_ACCESS_TOKEN=APP_USR-seu-token-aqui
DATABASE_URL=postgresql://...
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📚 Documentação Adicional

### Arquivos de Referência

1. **CATALOG_API.md** - Documentação completa da API
2. **API_USAGE_GUIDE.md** - Guia de uso geral
3. Este arquivo - **CATALOG_USAGE_GUIDE.md** - Guia específico de uso

### Endpoints Principais

**Elegibilidade:**
- `GET /ml/catalog/eligibility/{item_id}`
- `GET /ml/catalog/eligibility/multiget`

**Busca:**
- `GET /ml/catalog/products/search`
- `GET /ml/catalog/products/{product_id}`

**Publicação:**
- `POST /ml/catalog/items/create`
- `POST /ml/catalog/items/optin`

**Competição:**
- `GET /ml/buybox/analysis/{item_id}`
- `GET /ml/products/{product_id}/competition`

**Brand Central:**
- `GET /ml/brand-central/users/{user_id}/quota`
- `POST /ml/brand-central/suggestions/create`
- `GET /ml/brand-central/users/{user_id}/suggestions`

---

## 🎓 Boas Práticas

1. **Sempre verifique elegibilidade** antes de tentar optin
2. **Use multiget** para verificar vários itens de uma vez
3. **Monitore preços regularmente** para ganhar Buy Box
4. **Valide sugestões** antes de criar no Brand Central
5. **Acompanhe status** das sugestões periodicamente
6. **Configure auto-refresh** para monitoramento contínuo
7. **Ative melhorias** (fulfillment, frete grátis) para competir melhor

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar porta 8000
netstat -ano | findstr :8000

# Matar processo se necessário
taskkill /F /PID [PID]

# Reiniciar
python main.py
```

### Frontend não conecta
```bash
# Verificar URL da API
# Arquivo: frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Verificar CORS no backend
# Arquivo: app/main.py (configurado)
```

### Erros de autenticação
- Verifique se o token ML está correto
- Token deve começar com `APP_USR-`
- Token deve ter permissões de escrita

---

## 📞 Suporte

Para dúvidas:
1. Consulte a documentação oficial do ML
2. Veja exemplos no arquivo de testes
3. Verifique logs do backend
4. Inspecione Network tab no navegador

---

**Sistema pronto para uso! 🎉**

Desenvolvido com ❤️ para facilitar suas vendas no Mercado Livre.
