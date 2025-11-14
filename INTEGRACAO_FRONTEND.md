# 🔗 Guia de Integração Frontend + Backend

## ✅ Backend (FastAPI) - Configurado

**URL Produção:** `https://intelligestor-backend.onrender.com`  
**URL Local:** `http://localhost:8000`  
**Documentação:** `https://intelligestor-backend.onrender.com/docs`

### CORS Configurado
O backend já aceita requisições de:
- ✅ `http://localhost:3000` (Next.js dev)
- ✅ `http://localhost:5173` (Vite dev)
- ✅ `https://intelligestor-backend-rlyo.vercel.app` (Vercel)

---

## 📦 Setup Frontend (Next.js)

### 1. Variáveis de Ambiente

Crie `.env.local` na raiz do projeto frontend:

```env
# API URLs
NEXT_PUBLIC_API_URL=https://intelligestor-backend.onrender.com
NEXT_PUBLIC_API_URL_LOCAL=http://localhost:8000

# Mercado Livre OAuth (copie do backend)
NEXT_PUBLIC_ML_APP_ID=seu_app_id
NEXT_PUBLIC_ML_REDIRECT_URI=https://intelligestor-backend.onrender.com/ml/callback
```

### 2. Cliente API TypeScript

Crie `lib/api.ts`:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.detail || 'Erro na requisição' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: 'Erro de conexão com o servidor' };
    }
  }

  // Health Check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/');
  }

  // Produtos
  async getProdutos(skip: number = 0, limit: number = 100) {
    return this.request<any[]>(`/produtos?skip=${skip}&limit=${limit}`);
  }

  async getProduto(id: string) {
    return this.request<any>(`/produtos/${id}`);
  }

  async createProduto(produto: any) {
    return this.request<any>('/produtos', {
      method: 'POST',
      body: JSON.stringify(produto),
    });
  }

  async updateProduto(id: string, produto: any) {
    return this.request<any>(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(produto),
    });
  }

  async deleteProduto(id: string) {
    return this.request<any>(`/produtos/${id}`, {
      method: 'DELETE',
    });
  }

  // Análise BuyBox (IA)
  async analisarBuyBox(sku: string, ml_id?: string) {
    const params = new URLSearchParams({ sku });
    if (ml_id) params.append('ml_id', ml_id);
    return this.request<any>(`/ia/buybox/analise?${params}`);
  }

  // Mercado Livre Auth
  async getMercadoLivreAuthUrl() {
    return this.request<{ auth_url: string }>('/ml/login');
  }

  async getMercadoLivreStatus() {
    return this.request<any>('/ml/status');
  }

  async disconnectMercadoLivre() {
    return this.request<any>('/ml/disconnect', { method: 'POST' });
  }

  // Webhooks ML
  async getWebhooksStatus() {
    return this.request<any>('/webhooks/ml/status');
  }
}

export const api = new ApiClient();
```

### 3. Exemplo de Componente React

```tsx
// components/ProdutosList.tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ProdutosList() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProdutos() {
      const { data, error } = await api.getProdutos();
      
      if (error) {
        setError(error);
      } else if (data) {
        setProdutos(data);
      }
      
      setLoading(false);
    }

    loadProdutos();
  }, []);

  if (loading) return <div>Carregando produtos...</div>;
  if (error) return <div className="text-red-500">Erro: {error}</div>;

  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Produtos ({produtos.length})</h2>
      {produtos.map((produto) => (
        <div key={produto.id} className="border p-4 rounded">
          <h3 className="font-semibold">{produto.titulo}</h3>
          <p className="text-gray-600">{produto.sku}</p>
          <p className="text-green-600 font-bold">
            R$ {produto.preco?.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔌 Principais Endpoints

### Health Check
```bash
GET /
```

### Produtos (CRUD)
```bash
GET    /produtos              # Listar todos
GET    /produtos/{id}         # Buscar por ID
POST   /produtos              # Criar novo
PUT    /produtos/{id}         # Atualizar
DELETE /produtos/{id}         # Deletar
```

### IA - Análise BuyBox
```bash
GET /ia/buybox/analise?sku=ABC123&ml_id=MLB123
GET /ia/buybox/concorrentes?ml_id=MLB123
GET /ia/produtos/analise?sku=ABC123
```

### Mercado Livre OAuth
```bash
GET  /ml/login          # Inicia OAuth (retorna URL)
GET  /ml/callback       # Callback do ML (HTML)
GET  /ml/status         # Status da conexão
POST /ml/disconnect     # Desconectar conta
POST /ml/refresh        # Renovar token
```

### Webhooks Mercado Livre
```bash
POST /webhooks/ml/notifications  # Recebe notificações do ML
GET  /webhooks/ml/status         # Status dos webhooks
```

### Automações
```bash
GET    /automacoes              # Listar automações
POST   /automacoes              # Criar automação
PUT    /automacoes/{id}         # Atualizar
DELETE /automacoes/{id}         # Deletar
POST   /automacoes/{id}/toggle  # Ativar/Desativar
```

---

## 🧪 Testando a Integração

### 1. Teste de Conexão

```typescript
// pages/api/test-backend.ts ou app/api/test-backend/route.ts
import { api } from '@/lib/api';

export async function GET() {
  const { data, error } = await api.healthCheck();
  
  return Response.json({
    backend: data ? 'Conectado ✅' : 'Erro ❌',
    message: data?.message || error,
  });
}
```

### 2. Teste no Terminal (Frontend)

```bash
# No diretório do frontend
npm run dev

# Em outro terminal, teste a API:
curl http://localhost:3000/api/test-backend
```

### 3. Teste Direto do Backend

```bash
# Teste direto
curl https://intelligestor-backend.onrender.com/

# Resposta esperada:
# {"status":"healthy","message":"IntelliGestor API v2.0 is running!"}
```

---

## 🔐 Fluxo OAuth Mercado Livre

### 1. Frontend solicita URL de autenticação
```typescript
const { data } = await api.getMercadoLivreAuthUrl();
window.location.href = data.auth_url; // Redireciona para ML
```

### 2. Usuário autoriza no Mercado Livre
O ML redireciona para: `https://intelligestor-backend.onrender.com/ml/callback?code=...`

### 3. Backend processa e salva tokens
O callback HTML mostra sucesso e fecha a janela automaticamente.

### 4. Frontend verifica status
```typescript
const { data } = await api.getMercadoLivreStatus();
console.log(data.connected); // true/false
```

---

## 🚀 Deploy Frontend (Vercel)

### 1. Variáveis de Ambiente no Vercel
```
NEXT_PUBLIC_API_URL=https://intelligestor-backend.onrender.com
```

### 2. Se precisar adicionar nova origem CORS
Edite `app/config/settings.py` no backend:

```python
ALLOWED_ORIGINS: list = [
    "http://localhost:3000",
    "https://intelligestor-backend.onrender.com",
    "https://intelligestor-backend-rlyo.vercel.app",
    "https://seu-novo-dominio.vercel.app"  # Adicione aqui
]
```

---

## 📊 Estrutura de Dados Principais

### Produto
```typescript
interface Produto {
  id: string;
  sku: string;
  titulo: string;
  descricao?: string;
  preco: number;
  preco_custo?: number;
  estoque_atual?: number;
  estoque_minimo?: number;
  ml_id?: string;
  categoria?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

### Análise BuyBox
```typescript
interface BuyBoxAnalise {
  produto_sku: string;
  ml_id: string;
  recomendacao_preco: number;
  preco_atual: number;
  tem_buybox: boolean;
  score_qualidade: number;
  motivo: string;
  concorrentes_analisados: number;
  created_at: string;
}
```

---

## ❓ Troubleshooting

### Erro CORS
- ✅ Verifique se `ALLOWED_ORIGINS` no backend inclui sua URL
- ✅ Confirme que está usando `NEXT_PUBLIC_API_URL` correto

### Erro 404
- ✅ Verifique a documentação: `https://intelligestor-backend.onrender.com/docs`
- ✅ Confirme que o endpoint existe

### Timeout
- ✅ O Render pode demorar ~30s na primeira requisição (cold start)
- ✅ Implemente loading states no frontend

### Dados não aparecem
- ✅ Verifique se há dados no banco: `/produtos` deve retornar array
- ✅ Confira console do navegador para erros JavaScript

---

## 📞 Suporte

- **Documentação Backend:** https://intelligestor-backend.onrender.com/docs
- **Repositório:** https://github.com/JonasDluna/intelligestor-backend
- **Status Render:** https://dashboard.render.com

---

✅ **Backend 100% pronto para integração!**
