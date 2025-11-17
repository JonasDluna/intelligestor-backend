import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produtosApi, estoqueApi, vendasApi, clientesApi, mercadoLivreApi, iaApi } from '@/lib/api';
import type { Produto, AnuncioCreateRequest, AnuncioUpdateRequest, DescricaoProdutoRequest } from '@/types';

// ============================================
// PRODUTOS HOOKS
// ============================================

export function useProdutos(params?: { search?: string; categoria?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['produtos', params],
    queryFn: () => produtosApi.list(params),
  });
}

export function useProduto(produtoId: string) {
  return useQuery({
    queryKey: ['produto', produtoId],
    queryFn: () => produtosApi.getById(produtoId),
    enabled: !!produtoId,
  });
}

export function useCriarProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: produtosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

export function useAtualizarProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ produtoId, produtoData }: { produtoId: string; produtoData: Partial<Produto> }) =>
      produtosApi.update(produtoId, produtoData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produto', variables.produtoId] });
    },
  });
}

export function useDeletarProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (produtoId: string) => produtosApi.delete(produtoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

// ============================================
// ESTOQUE HOOKS
// ============================================

export function useEstoque(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['estoque', params],
    queryFn: () => estoqueApi.list(params),
  });
}

export function useMovimentarEstoque() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { produto_id: number; quantidade: number; tipo: 'entrada' | 'saida'; motivo?: string; custo_unitario?: number }) =>
      estoqueApi.movimentacao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

export function useMovimentacoes(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['movimentacoes', params],
    queryFn: () => estoqueApi.movimentacoes(params),
  });
}

// ============================================
// VENDAS HOOKS
// ============================================

export function useVendas(params?: { skip?: number; limit?: number; data_inicio?: string; data_fim?: string }) {
  return useQuery({
    queryKey: ['vendas', params],
    queryFn: () => vendasApi.list(params),
  });
}

export function useVenda(vendaId: string) {
  return useQuery({
    queryKey: ['venda', vendaId],
    queryFn: () => vendasApi.getById(vendaId),
    enabled: !!vendaId,
  });
}

export function useEstatisticasVendas(params?: { data_inicio?: string; data_fim?: string }) {
  return useQuery({
    queryKey: ['estatisticas-vendas', params],
    queryFn: () => vendasApi.estatisticas(params),
  });
}

// ============================================
// CLIENTES HOOKS
// ============================================

export function useClientes(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => clientesApi.list(params),
  });
}

export function useCliente(clienteId: string) {
  return useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => clientesApi.getById(clienteId),
    enabled: !!clienteId,
  });
}

// ============================================
// MERCADO LIVRE HOOKS
// ============================================

export function useAnuncios(params?: { status?: string; skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['anuncios', params],
    queryFn: () => mercadoLivreApi.listAnuncios(params),
  });
}

export function useAnuncio(itemId: string) {
  return useQuery({
    queryKey: ['anuncio', itemId],
    queryFn: () => mercadoLivreApi.getAnuncio(itemId),
    enabled: !!itemId,
  });
}

export function useCriarAnuncio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (anuncioData: AnuncioCreateRequest) =>
      mercadoLivreApi.createAnuncio(anuncioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
    },
  });
}

export function useAtualizarAnuncio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ anuncioId, anuncioData }: { anuncioId: string; anuncioData: AnuncioUpdateRequest }) =>
      mercadoLivreApi.updateAnuncio(anuncioId, anuncioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
    },
  });
}

// ============================================
// IA / BUYBOX HOOKS
// ============================================

export function useAnalisarBuybox() {
  return useMutation({
    mutationFn: (params: { item_id: string; sku?: string; ml_id?: string }) =>
      iaApi.analiseBuyBox({ sku: params.sku || params.item_id, ml_id: params.ml_id || params.item_id }),
  });
}

export function useOtimizarPreco() {
  return useMutation({
    mutationFn: (params: { item_id: string; estrategia?: 'agressiva' | 'moderada' | 'conservadora'; sku?: string; ml_id?: string }) =>
      iaApi.otimizarPreco({ sku: params.sku || params.item_id, ml_id: params.ml_id || params.item_id, estrategia: params.estrategia }),
  });
}

export function useGerarDescricao() {
  return useMutation({
    mutationFn: (produtoData: DescricaoProdutoRequest) => iaApi.gerarDescricao(produtoData),
  });
}
