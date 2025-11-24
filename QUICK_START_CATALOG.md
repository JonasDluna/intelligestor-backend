# 🚀 Quick Start - Sistema de Catálogo ML

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Testar Backend com Tokens Reais

```bash
# Edite o arquivo test_catalog_real.py (linhas 14-21)
ML_ACCESS_TOKEN = "APP_USR-SEU_TOKEN_AQUI"  # ← Cole seu token do ML
USER_ID = "123456789"                        # ← Seu User ID
SITE_ID = "MLB"                              # ← MLB, MLA, MLM, etc.
TEST_ITEM_ID = "MLB1234567890"               # ← ID de um item seu

# Execute os testes
python test_catalog_real.py

# ✅ Veja o relatório completo no terminal e JSON gerado
```

### 2️⃣ Usar Interface Web

```bash
# Terminal 1 - Backend
cd intelligestor-backend-main
python main.py
# ✅ Backend: http://localhost:8000

# Terminal 2 - Frontend
cd intelligestor-backend-main/frontend
npm run dev
# ✅ Frontend: http://localhost:3000
```

### 3️⃣ Acessar Páginas

| Página | URL | Função |
|--------|-----|--------|
| **Índice** | `/ecommerce/catalogo` | Visão geral do sistema |
| **Elegibilidade** | `/ecommerce/catalogo/elegibilidade` | Verificar se item pode ir pro catálogo |
| **Busca** | `/ecommerce/catalogo/busca` | Encontrar produtos de catálogo |
| **Monitoramento** | `/ecommerce/catalogo/monitoramento` | Dashboard Buy Box em tempo real |
| **Sugestões** | `/ecommerce/catalogo/sugestoes` | Acompanhar Brand Central |

---

## 📊 Features Implementadas

### ✅ Backend (30+ Endpoints)
- Elegibilidade (single e multiget)
- Busca de produtos (keyword, GTIN, domain)
- Publicação (direta e optin)
- Análise de Buy Box
- Brand Central completo
- Sincronização

### ✅ Frontend (4 Páginas Completas)
- Dashboard de elegibilidade
- Busca visual de produtos
- Monitoramento em tempo real
- Acompanhamento de sugestões

### ✅ Testes (Script Completo)
- Cobertura de todos os endpoints
- Relatórios coloridos
- Exportação JSON
- Fácil configuração

---

## 🎯 Casos de Uso Principais

### 1. Migrar Item para Catálogo
```
1. Acesse /ecommerce/catalogo/elegibilidade
2. Digite o Item ID
3. Se elegível, faça o optin
4. Monitore em /ecommerce/catalogo/monitoramento
```

### 2. Ganhar Buy Box
```
1. Acesse /ecommerce/catalogo/monitoramento
2. Adicione seus Item IDs
3. Ative auto-refresh (5 min)
4. Siga as recomendações exibidas
5. Ajuste preços e serviços
```

### 3. Sugerir Produto Novo
```
1. Acesse /ecommerce/catalogo/sugestoes
2. Digite seu User ID
3. Veja quota disponível
4. Crie sugestão via API
5. Acompanhe validações
```

---

## 📁 Arquivos Principais

```
intelligestor-backend-main/
├── test_catalog_real.py          ← SCRIPT DE TESTES (configure aqui!)
├── CATALOG_API.md                 ← Documentação API completa
├── CATALOG_USAGE_GUIDE.md         ← Guia de uso detalhado
├── QUICK_START_CATALOG.md         ← Este arquivo
│
├── app/
│   ├── services/
│   │   └── ml_official_api.py     ← 25+ métodos de integração
│   └── routers/
│       └── ml_real.py              ← 30+ endpoints REST
│
└── frontend/src/
    ├── services/
    │   └── catalogService.ts       ← Service TypeScript
    └── app/ecommerce/catalogo/
        ├── page.tsx                ← Índice/Dashboard
        ├── elegibilidade/page.tsx  ← Verificar elegibilidade
        ├── busca/page.tsx          ← Buscar produtos
        ├── monitoramento/page.tsx  ← Monitorar Buy Box
        └── sugestoes/page.tsx      ← Brand Central
```

---

## 🔥 Comandos Essenciais

```bash
# Testar tudo
python test_catalog_real.py

# Iniciar backend
python main.py

# Iniciar frontend
cd frontend && npm run dev

# Ver logs do backend
# Abra http://localhost:8000/docs (Swagger UI)

# Testar endpoint específico (PowerShell)
Invoke-RestMethod -Uri "http://localhost:8000/ml/catalog/eligibility/MLB123" -Method Get
```

---

## 🎨 Preview das Páginas

### Elegibilidade
- ✓ Verifica status de um ou mais itens
- ✓ Mostra se pode fazer optin
- ✓ Exibe informações de variações
- ✓ Indicadores visuais de status

### Busca
- ✓ 3 tipos de busca (keyword, GTIN, domain)
- ✓ Cards visuais com imagens
- ✓ Informações de Buy Box winner
- ✓ Links diretos para ML

### Monitoramento
- ✓ Dashboard com métricas em tempo real
- ✓ Gráfico de distribuição
- ✓ Auto-refresh configurável
- ✓ Recomendações automáticas
- ✓ Alertas de preço

### Sugestões
- ✓ Visualizar quota disponível
- ✓ Listar todas as sugestões
- ✓ Filtrar por status
- ✓ Ver validações e erros
- ✓ Ações necessárias destacadas

---

## 🐛 Troubleshooting Rápido

**Backend não inicia?**
```bash
# Verificar porta
netstat -ano | findstr :8000
# Matar processo se ocupada
taskkill /F /PID [PID_DA_PORTA_8000]
```

**Frontend não conecta?**
```bash
# Verificar .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
```

**Token não funciona?**
- Token deve começar com `APP_USR-`
- Precisa ter permissões de escrita
- Teste em: https://api.mercadolibre.com/users/me?access_token=SEU_TOKEN

---

## 📞 Links Úteis

- [CATALOG_API.md](./CATALOG_API.md) - Documentação completa da API
- [CATALOG_USAGE_GUIDE.md](./CATALOG_USAGE_GUIDE.md) - Guia detalhado de uso
- [ML Developers](https://developers.mercadolivre.com.br) - Docs oficiais
- [Swagger UI](http://localhost:8000/docs) - Testar endpoints

---

## ✨ Próximos Passos

1. ✅ Configure seu token em `test_catalog_real.py`
2. ✅ Execute os testes: `python test_catalog_real.py`
3. ✅ Inicie backend e frontend
4. ✅ Acesse http://localhost:3000/ecommerce/catalogo
5. ✅ Explore as 4 páginas criadas
6. ✅ Configure monitoramento automático
7. ✅ Otimize seus itens para Buy Box!

---

**Sistema 100% funcional e pronto para uso! 🎉**

*Desenvolvido para maximizar suas vendas no Mercado Livre através do Catálogo.*
