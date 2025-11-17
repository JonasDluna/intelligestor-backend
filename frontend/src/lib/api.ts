// Frontend: src/lib/api.ts
// Cliente API correto para o IntelliGestor Backend

import axiosInstance, { ApiResponse } from './axios';
import type { 
  ProdutoApiCreateRequest,
  ProdutoUpdateRequest, 
  AnuncioCreateRequest, 
  AnuncioUpdateRequest,
  DescricaoProdutoRequest,
  AutomacaoCreateRequest,
  AutomacaoUpdateRequest,
  ClienteCreateRequest,
  ClienteUpdateRequest
} from '@/types';

// ============================================
// HEALTH & INFO
// ============================================

export const healthApi = {
  async check() {
    const response = await axiosInstance.get<ApiResponse>('/health');
    return response.data;
  },

  async info() {
    const response = await axiosInstance.get<ApiResponse>('/api/info');
    return response.data;
  },
};

// ============================================
// AUTHENTICATION - MERCADO LIVRE
// ============================================

export const authApi = {
  // Iniciar OAuth (retorna URL para redirecionar)
  async initiateOAuth() {
    const response = await axiosInstance.get<ApiResponse<{ auth_url: string }>>('/auth/ml/login');
    return response.data;
  },

  // Status da autenticação
  async getStatus(userId?: string) {
    const response = await axiosInstance.get<ApiResponse>('/auth/ml/status', {
      params: userId ? { user_id: userId } : undefined
    });
    return response.data;
  },

  // Refresh token
  async refreshToken(userId: string) {
    const response = await axiosInstance.post<ApiResponse>('/auth/ml/refresh', { user_id: userId });
    return response.data;
  },

  // Desconectar
  async disconnect(userId: string) {
    const response = await axiosInstance.post<ApiResponse>('/auth/ml/disconnect', { user_id: userId });
    return response.data;
  },
};

// ============================================
// PRODUTOS
// ============================================

export const produtosApi = {
  // Listar produtos
  async list(params?: { skip?: number; limit?: number; ativo?: boolean }) {
    const response = await axiosInstance.get<ApiResponse>('/produtos/', { params });
    return response.data;
  },

  // Buscar produto por ID
  async getById(produtoId: number | string) {
    const response = await axiosInstance.get<ApiResponse>('/produtos/' + produtoId);
    return response.data;
  },

  // Buscar produto por SKU
  async getBySku(sku: string) {
    const response = await axiosInstance.get<ApiResponse>('/produtos/sku/' + sku);
    return response.data;
  },

  // Criar produto
  async create(produtoData: ProdutoApiCreateRequest) {
    const response = await axiosInstance.post<ApiResponse>('/produtos/', produtoData);
    return response.data;
  },

  // Atualizar produto
  async update(produtoId: number | string, produtoData: ProdutoUpdateRequest) {
    const response = await axiosInstance.put<ApiResponse>('/produtos/' + produtoId, produtoData);
    return response.data;
  },

  // Deletar produto
  async delete(produtoId: number | string) {
    const response = await axiosInstance.delete<ApiResponse>('/produtos/' + produtoId);
    return response.data;
  },

  // Sincronizar produtos do ML
  async syncFromML(userId: number) {
    const response = await axiosInstance.get<ApiResponse>('/api/products/sync', {
      params: { user_id: userId }
    });
    return response.data;
  },
};

// ============================================
// ESTOQUE
// ============================================

export const estoqueApi = {
  // Listar estoque
  async list(params?: { skip?: number; limit?: number }) {
    const response = await axiosInstance.get<ApiResponse>('/estoque/', { params });
    return response.data;
  },

  // Estoque de um produto específico
  async getByProduct(produtoId: number | string) {
    const response = await axiosInstance.get<ApiResponse>('/estoque/produto/' + produtoId);
    return response.data;
  },

  // Produtos com estoque baixo
  async getBaixoEstoque() {
    const response = await axiosInstance.get<ApiResponse>('/estoque/baixo');
    return response.data;
  },

  // Registrar movimentação de estoque
  async movimentacao(data: {
    produto_id: number;
    quantidade: number;
    tipo: 'entrada' | 'saida';
    motivo?: string;
    custo_unitario?: number;
  }) {
    const response = await axiosInstance.post<ApiResponse>('/estoque/movimentacao', data);
    return response.data;
  },

  // Histórico de movimentações
  async movimentacoes(params?: { skip?: number; limit?: number }) {
    const response = await axiosInstance.get<ApiResponse>('/estoque/movimentacoes', { params });
    return response.data;
  },
};

// ============================================
// MERCADO LIVRE - ANÚNCIOS
// ============================================

export const mercadoLivreApi = {
  // Listar anúncios
  async listAnuncios(params?: { status?: string; skip?: number; limit?: number }) {
    const response = await axiosInstance.get<ApiResponse>('/mercadolivre/anuncios', { params });
    return response.data;
  },

  // Detalhes do anúncio
  async getAnuncio(anuncioId: string) {
    const response = await axiosInstance.get<ApiResponse>('/mercadolivre/anuncios/' + anuncioId);
    return response.data;
  },

  // Criar anúncio
  async createAnuncio(anuncioData: AnuncioCreateRequest) {
    const response = await axiosInstance.post<ApiResponse>('/mercadolivre/anuncios', anuncioData);
    return response.data;
  },

  // Atualizar anúncio
  async updateAnuncio(anuncioId: string, anuncioData: AnuncioUpdateRequest) {
    const response = await axiosInstance.put<ApiResponse>('/mercadolivre/anuncios/' + anuncioId, anuncioData);
    return response.data;
  },

  // Deletar anúncio
  async deleteAnuncio(anuncioId: string) {
    const response = await axiosInstance.delete<ApiResponse>('/mercadolivre/anuncios/' + anuncioId);
    return response.data;
  },

  // Sincronizar com ML
  async sync(userId: number) {
    const response = await axiosInstance.post<ApiResponse>('/mercadolivre/sync', { user_id: userId });
    return response.data;
  },
};

// ============================================
// IA - BUYBOX & ANÁLISES
// ============================================

export const iaApi = {
  // Análise de BuyBox
  async analiseBuyBox(params: { sku: string; ml_id?: string }) {
    const response = await axiosInstance.get<ApiResponse>('/ia/buybox/analise', { params });
    return response.data;
  },

  // Análise de concorrentes
  async analiseConcorrentes(params: { ml_id: string }) {
    const response = await axiosInstance.get<ApiResponse>('/ia/buybox/concorrentes', { params });
    return response.data;
  },

  // Otimizar preço
  async otimizarPreco(data: {
    sku: string;
    ml_id?: string;
    estrategia?: 'agressiva' | 'moderada' | 'conservadora';
  }) {
    const response = await axiosInstance.post<ApiResponse>('/ia/buybox/otimizar', data);
    return response.data;
  },

  // Gerar descrição com IA
  async gerarDescricao(produtoData: DescricaoProdutoRequest) {
    const response = await axiosInstance.post<ApiResponse>('/ia/products/description', produtoData);
    return response.data;
  },

  // Análise de produto
  async analiseProduto(params: { sku: string }) {
    const response = await axiosInstance.get<ApiResponse>('/ia/products/analise', { params });
    return response.data;
  },
};

// ============================================
// AUTOMAÇÃO
// ============================================

export const automacaoApi = {
  // Listar automações
  async list(params?: { skip?: number; limit?: number; ativo?: boolean }) {
    const response = await axiosInstance.get<ApiResponse>('/automacao/', { params });
    return response.data;
  },

  // Buscar automação
  async getById(automacaoId: number | string) {
    const response = await axiosInstance.get<ApiResponse>('/automacao/' + automacaoId);
    return response.data;
  },

  // Criar automação
  async create(automacaoData: AutomacaoCreateRequest) {
    const response = await axiosInstance.post<ApiResponse>('/automacao/', automacaoData);
    return response.data;
  },

  // Atualizar automação
  async update(automacaoId: number | string, automacaoData: AutomacaoUpdateRequest) {
    const response = await axiosInstance.put<ApiResponse>('/automacao/' + automacaoId, automacaoData);
    return response.data;
  },

  // Deletar automação
  async delete(automacaoId: number | string) {
    const response = await axiosInstance.delete<ApiResponse>('/automacao/' + automacaoId);
    return response.data;
  },

  // Ativar/Desativar automação
  async toggle(automacaoId: number | string) {
    const response = await axiosInstance.post<ApiResponse>('/automacao/' + automacaoId + '/toggle');
    return response.data;
  },

  // Executar automação manualmente
  async executar(automacaoId: number | string) {
    const response = await axiosInstance.post<ApiResponse>('/automacao/' + automacaoId + '/executar');
    return response.data;
  },
};

// ============================================
// VENDAS
// ============================================

export const vendasApi = {
  // Listar vendas
  async list(params?: { skip?: number; limit?: number; data_inicio?: string; data_fim?: string }) {
    const response = await axiosInstance.get<ApiResponse>('/vendas/', { params });
    return response.data;
  },

  // Buscar venda por ID
  async getById(vendaId: number | string) {
    const response = await axiosInstance.get<ApiResponse>('/vendas/' + vendaId);
    return response.data;
  },

  // Estatísticas de vendas
  async estatisticas(params?: { data_inicio?: string; data_fim?: string }) {
    const response = await axiosInstance.get<ApiResponse>('/vendas/estatisticas', { params });
    return response.data;
  },
};

// ============================================
// CLIENTES
// ============================================

export const clientesApi = {
  // Listar clientes
  async list(params?: { skip?: number; limit?: number }) {
    const response = await axiosInstance.get<ApiResponse>('/clientes/', { params });
    return response.data;
  },

  // Buscar cliente por ID
  async getById(clienteId: number | string) {
    const response = await axiosInstance.get<ApiResponse>('/clientes/' + clienteId);
    return response.data;
  },

  // Criar cliente
  async create(clienteData: ClienteCreateRequest) {
    const response = await axiosInstance.post<ApiResponse>('/clientes/', clienteData);
    return response.data;
  },

  // Atualizar cliente
  async update(clienteId: number | string, clienteData: ClienteUpdateRequest) {
    const response = await axiosInstance.put<ApiResponse>('/clientes/' + clienteId, clienteData);
    return response.data;
  },

  // Deletar cliente
  async delete(clienteId: number | string) {
    const response = await axiosInstance.delete<ApiResponse>('/clientes/' + clienteId);
    return response.data;
  },
};

// ============================================
// CATÁLOGO ML
// ============================================

export const catalogoApi = {
  // Buscar no catálogo ML
  async search(query: string, limit?: number) {
    const response = await axiosInstance.get<ApiResponse>('/api/catalog/search', {
      params: { query, limit }
    });
    return response.data;
  },

  // Listar categorias ML
  async categories() {
    const response = await axiosInstance.get<ApiResponse>('/api/catalog/categories');
    return response.data;
  },
};

// ============================================
// MERCADO LIVRE - EXTENDED
// ============================================

export const mlExtendedApi = {
  // Listar anúncios locais
  async listarAnuncios(limit = 100) {
    const response = await axiosInstance.get<ApiResponse>('/ml/anuncios', {
      params: { limit }
    });
    return response.data;
  },

  // Sincronizar anúncios com ML
  async sincronizar() {
    const response = await axiosInstance.post<ApiResponse>('/ml/sincronizar');
    return response.data;
  },

  // Catalog Items (para BuyBox)
  async catalogItems() {
    const response = await axiosInstance.get<ApiResponse>('/ml/catalog/items');
    return response.data;
  },

  // Dados BuyBox de um item
  async buyboxData(itemId: string) {
    const response = await axiosInstance.get<ApiResponse>(`/ml/catalog/buybox/${itemId}`);
    return response.data;
  },

  // Listar perguntas
  async perguntas(status: 'unanswered' | 'answered' | 'all' = 'unanswered') {
    const response = await axiosInstance.get<ApiResponse>('/ml/perguntas', {
      params: { status }
    });
    return response.data;
  },

  // Responder pergunta
  async responderPergunta(questionId: number, resposta: string) {
    const response = await axiosInstance.post<ApiResponse>('/ml/perguntas/responder', {
      question_id: questionId,
      resposta
    });
    return response.data;
  },

  // Listar vendas
  async vendas(limit = 50) {
    const response = await axiosInstance.get<ApiResponse>('/ml/vendas', {
      params: { limit }
    });
    return response.data;
  },

  // Status da conexão ML
  async status() {
    const response = await axiosInstance.get<ApiResponse>('/ml/status');
    return response.data;
  },

  // Desconectar ML
  async disconnect() {
    const response = await axiosInstance.post<ApiResponse>('/ml/disconnect');
    return response.data;
  },
};

// ============================================
// WEBHOOKS
// ============================================

export const webhooksApi = {
  // Status dos webhooks
  async status() {
    const response = await axiosInstance.get<ApiResponse>('/webhooks/ml/status');
    return response.data;
  },
};

// ============================================
// EXPORT DEFAULT
// ============================================

const api = {
  health: healthApi,
  auth: authApi,
  produtos: produtosApi,
  estoque: estoqueApi,
  vendas: vendasApi,
  clientes: clientesApi,
  ml: mercadoLivreApi,
  mlExtended: mlExtendedApi,
  ia: iaApi,
  automacao: automacaoApi,
  catalogo: catalogoApi,
  webhooks: webhooksApi,
};

export default api;

