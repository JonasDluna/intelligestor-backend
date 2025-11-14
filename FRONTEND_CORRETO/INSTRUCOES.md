# 🔧 Guia de Correção do Frontend

## ⚠️ Problema Identificado

O frontend está usando prefixo `/v1/*` mas o backend **NÃO** usa esse prefixo!

## ✅ Solução - Passo a Passo

### 1. Substituir arquivos no frontend

Copie os arquivos corretos da pasta `FRONTEND_CORRETO/` para o frontend:

```bash
# No PowerShell, execute:
cd C:\Users\jonas\Downloads\intelligestor-frontend

# Fazer backup dos arquivos antigos
Copy-Item src\lib\axios.ts src\lib\axios.ts.backup
Copy-Item src\lib\api.ts src\lib\api.ts.backup

# Copiar arquivos corretos
Copy-Item C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main\FRONTEND_CORRETO\axios.ts src\lib\axios.ts -Force
Copy-Item C:\Users\jonas\Downloads\intelligestor-backend\intelligestor-backend-main\FRONTEND_CORRETO\api.ts src\lib\api.ts -Force
```

### 2. Reiniciar o servidor de desenvolvimento

```bash
# Parar o servidor atual (Ctrl+C no terminal)

# Limpar cache do Next.js
Remove-Item .next -Recurse -Force

# Iniciar novamente
npm run dev
```

### 3. Testar a integração

Abra o console do navegador (F12) e execute:

```javascript
// Importar o cliente API
import api from '@/lib/api';

// Testar health check
const health = await api.health.check();
console.log(health);

// Testar listagem de produtos
const produtos = await api.produtos.list({ limit: 10 });
console.log(produtos);
```

---

## 📋 Principais Mudanças

### Antes (ERRADO):
```typescript
'/v1/produtos'           ❌
'/v1/oauth/ml/auth'      ❌
'/v1/estoque'            ❌
```

### Depois (CORRETO):
```typescript
'/produtos/'             ✅
'/auth/ml/login'         ✅
'/estoque/'              ✅
```

---

## 🧪 Testes Rápidos

### 1. Health Check
```bash
curl http://localhost:3000
```

### 2. Backend Direto
```bash
curl https://intelligestor-backend.onrender.com/health
```

### 3. Produtos (deve funcionar agora)
```bash
curl https://intelligestor-backend.onrender.com/produtos/
```

---

## 🎯 Endpoints Prontos para Usar

Após a correção, você poderá usar:

```typescript
// Auth ML
await api.auth.initiateOAuth()
await api.auth.getStatus()

// Produtos
await api.produtos.list()
await api.produtos.create({ sku_interno: 'ABC123', titulo: 'Produto Teste' })
await api.produtos.getById(1)

// Estoque
await api.estoque.list()
await api.estoque.movimentacao({ produto_id: 1, quantidade: 10, tipo: 'entrada' })

// IA BuyBox
await api.ia.analiseBuyBox({ sku: 'ABC123', ml_id: 'MLB123' })
await api.ia.otimizarPreco({ sku: 'ABC123', estrategia: 'moderada' })

// Automações
await api.automacao.list()
await api.automacao.create({ nome: 'Auto Ajuste', tipo: 'preco_automatico' })
```

---

## ✅ Checklist Final

- [ ] Arquivos `axios.ts` e `api.ts` substituídos
- [ ] Servidor Next.js reiniciado
- [ ] Console sem erros de CORS
- [ ] `/health` retornando status "healthy"
- [ ] `/produtos/` retornando lista (vazia ou com dados)
- [ ] OAuth ML funcionando (testa em `/mercado-livre`)

---

## 🆘 Troubleshooting

### Erro: "Network Error" ou "Failed to fetch"
- Verifique se o backend está online: https://intelligestor-backend.onrender.com/health
- Confirme que CORS está configurado corretamente

### Erro: "404 Not Found"
- Verifique se os endpoints correspondem aos do backend
- Consulte `/api/info` para ver endpoints disponíveis

### Erro: "Unauthorized"
- Implemente autenticação JWT (futura funcionalidade)
- Por enquanto, use `user_id: "default"` como placeholder

---

## 📞 Próximos Passos

Depois de corrigir, você terá um sistema 100% funcional para:
1. ✅ Gerenciar produtos
2. ✅ Controlar estoque
3. ✅ Conectar Mercado Livre via OAuth
4. ✅ Usar IA para análise de preços (BuyBox)
5. ✅ Criar automações
6. ✅ Sincronizar anúncios do ML

Boa sorte! 🚀
