import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produtosApi, estoqueApi, vendasApi, clientesApi, mercadoLivreApi, iaApi } from '@/lib/api';
import type { Produto, Venda, Cliente, Anuncio, EstatisticasVendas } from '@/types';

// ============================================
// PRODUTOS HOOKS
// ============================================

export function useProdutos(params?: { search?: string; categoria?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['produtos', params],
    queryFn: () => produtosApi.listProdutos(params),
  });
}

export function useProduto(produtoId: string) {
  return useQuery({
    queryKey: ['produto', produtoId],
    queryFn: () => produtosApi.getProduto(produtoId),
    enabled: !!produtoId,
  });
}

export function useCriarProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (produtoData: Partial<Produto>) => produtosApi.criarProduto(produtoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

export function useAtualizarProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ produtoId, produtoData }: { produtoId: string; produtoData: Partial<Produto> }) =>
      produtosApi.atualizarProduto(produtoId, produtoData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produto', variables.produtoId] });
    },
  });
}

export function useDeletarProduto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (produtoId: string) => produtosApi.deletarProduto(produtoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

// ============================================
// ESTOQUE HOOKS
// ============================================

export function useEstoque(params?: { produto_id?: string; baixo_estoque?: boolean; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['estoque', params],
    queryFn: () => estoqueApi.listEstoque(params),
  });
}

export function useMovimentarEstoque() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ produtoId, quantidade, tipo, motivo }: { produtoId: string; quantidade: number; tipo: 'entrada' | 'saida'; motivo?: string }) =>
      estoqueApi.atualizarQuantidade(produtoId, quantidade, tipo, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

export function useMovimentacoes(produtoId?: string, limit?: number, offset?: number) {
  return useQuery({
    queryKey: ['movimentacoes', produtoId, limit, offset],
    queryFn: () => estoqueApi.getMovimentacoes(produtoId, limit, offset),
  });
}

// ============================================
// VENDAS HOOKS
// ============================================

export function useVendas(params?: { status?: string; data_inicio?: string; data_fim?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['vendas', params],
    queryFn: () => vendasApi.listVendas(params),
  });
}

export function useVenda(vendaId: string) {
  return useQuery({
    queryKey: ['venda', vendaId],
    queryFn: () => vendasApi.getVenda(vendaId),
    enabled: !!vendaId,
  });
}

export function useEstatisticasVendas(dataInicio?: string, dataFim?: string) {
  return useQuery({
    queryKey: ['estatisticas-vendas', dataInicio, dataFim],
    queryFn: () => vendasApi.getEstatisticas(dataInicio, dataFim),
  });
}

// ============================================
// CLIENTES HOOKS
// ============================================

export function useClientes(params?: { search?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => clientesApi.listClientes(params),
  });
}

export function useCliente(clienteId: string) {
  return useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => clientesApi.getCliente(clienteId),
    enabled: !!clienteId,
  });
}

export function useHistoricoCompras(clienteId: string) {
  return useQuery({
    queryKey: ['historico-compras', clienteId],
    queryFn: () => clientesApi.getHistoricoCompras(clienteId),
    enabled: !!clienteId,
  });
}

// ============================================
// MERCADO LIVRE HOOKS
// ============================================

export function useAnuncios(userId: string, sellerId: string, status?: string, limit?: number, offset?: number) {
  return useQuery({
    queryKey: ['anuncios', userId, sellerId, status, limit, offset],
    queryFn: () => mercadoLivreApi.listAnuncios(userId, sellerId, status, limit, offset),
    enabled: !!userId && !!sellerId,
  });
}

export function useAnuncio(itemId: string, userId: string) {
  return useQuery({
    queryKey: ['anuncio', itemId, userId],
    queryFn: () => mercadoLivreApi.getAnuncio(itemId, userId),
    enabled: !!itemId && !!userId,
  });
}

export function useCriarAnuncio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, anuncioData }: { userId: string; anuncioData: any }) =>
      mercadoLivreApi.criarAnuncio(userId, anuncioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncios'] });
    },
  });
}

export function usePausarAnuncio() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, userId }: { itemId: string; userId: string }) =>
      mercadoLivreApi.pausarAnuncio(itemId, userId),
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
    mutationFn: ({ itemId, userId }: { itemId: string; userId: string }) =>
      iaApi.analisarBuybox(itemId, userId),
  });
}

export function useOtimizarPreco() {
  return useMutation({
    mutationFn: ({ itemId, userId, estrategia }: { itemId: string; userId: string; estrategia: 'agressiva' | 'moderada' | 'conservadora' }) =>
      iaApi.otimizarPreco(itemId, userId, estrategia),
  });
}

export function useGerarDescricao() {
  return useMutation({
    mutationFn: (produtoData: any) => iaApi.gerarDescricao(produtoData),
  });
}
