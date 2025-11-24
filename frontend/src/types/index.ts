// ============================================
// CATALOG TYPES
// ============================================

export * from './catalog';

// ============================================
// COMMON TYPES
// ============================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================
// PRODUTO TYPES
// ============================================

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  sku?: string;
  ean?: string;
  preco_custo: number;
  preco_venda: number;
  margem_lucro: number;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  ativo: boolean;
  imagens?: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// ESTOQUE TYPES
// ============================================

export interface Estoque {
  id: string;
  produto_id: string;
  produto?: Produto;
  quantidade: number;
  estoque_minimo: number;
  estoque_maximo: number;
  localizacao?: string;
  updated_at: string;
}

export interface MovimentacaoEstoque {
  id: string;
  produto_id: string;
  produto?: Produto;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo?: string;
  observacao?: string;
  usuario_id?: string;
  created_at: string;
}

// ============================================
// VENDA TYPES
// ============================================

export interface Venda {
  id: string;
  cliente_id?: string;
  cliente?: Cliente;
  data_venda: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'enviado' | 'entregue';
  valor_total: number;
  valor_desconto: number;
  valor_frete: number;
  forma_pagamento?: string;
  itens: ItemVenda[];
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemVenda {
  id: string;
  venda_id: string;
  produto_id: string;
  produto?: Produto;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  desconto?: number;
}

export interface EstatisticasVendas {
  total_vendas: number;
  valor_total: number;
  ticket_medio: number;
  total_itens: number;
  vendas_por_dia: { data: string; total: number; valor: number }[];
  top_produtos: { produto_id: string; nome: string; quantidade: number; valor: number }[];
}

// ============================================
// CLIENTE TYPES
// ============================================

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf_cnpj?: string;
  endereco?: Endereco;
  total_compras?: number;
  valor_total_gasto?: number;
  ultima_compra?: string;
  created_at: string;
  updated_at: string;
}

export interface Endereco {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
}

// ============================================
// MERCADO LIVRE TYPES
// ============================================

export interface Anuncio {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  status: 'active' | 'paused' | 'closed' | 'under_review';
  condition: 'new' | 'used' | 'not_specified';
  listing_type_id: string;
  permalink: string;
  thumbnail: string;
  pictures?: { id: string; url: string; secure_url: string }[];
  attributes?: { id: string; name: string; value_name: string }[];
  created_at: string;
  updated_at: string;
}

export interface MLOAuthStatus {
  connected: boolean;
  user_id?: string;
  nickname?: string;
  expires_at?: string;
}

// ============================================
// IA / BUYBOX TYPES
// ============================================

export interface BuyBoxAnalise {
  item_id: string;
  tem_buybox: boolean;
  preco_buybox?: number;
  vencedor_buybox?: {
    seller_id: string;
    nickname: string;
    preco: number;
    reputacao: string;
  };
  sua_posicao?: number;
  diferenca_preco?: number;
  sugestao_preco?: number;
  estrategia_recomendada?: 'agressiva' | 'moderada' | 'conservadora';
  analise_detalhada?: string;
}

export interface OtimizacaoPreco {
  item_id: string;
  preco_atual: number;
  preco_sugerido: number;
  diferenca: number;
  diferenca_percentual: number;
  estrategia: 'agressiva' | 'moderada' | 'conservadora';
  justificativa: string;
  impacto_estimado?: {
    aumento_vendas?: number;
    variacao_lucro?: number;
  };
}

export interface ConcorrenciaAnalise {
  item_id: string;
  concorrentes: {
    seller_id: string;
    nickname: string;
    preco: number;
    quantidade_disponivel: number;
    reputacao: string;
    vendas_recentes: number;
  }[];
  preco_medio: number;
  preco_minimo: number;
  preco_maximo: number;
  total_concorrentes: number;
  analise_ia?: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardMetrics {
  total_vendas_hoje: number;
  total_vendas_mes: number;
  total_produtos: number;
  produtos_baixo_estoque: number;
  total_clientes: number;
  ticket_medio: number;
  variacao_vendas: number; // percentual
  variacao_ticket: number; // percentual
}

export interface GraficoVendas {
  labels: string[];
  vendas: number[];
  receita: number[];
}

// ============================================
// USER / AUTH TYPES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'viewer';
  ml_user_id?: string;
  ml_connected: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================
// API REQUEST TYPES
// ============================================

export interface ProdutoApiCreateRequest {
  sku_interno: string;
  titulo: string;
  descricao?: string;
  categoria_ml?: string;
  custo?: number;
  preco_sugerido?: number;
  margem_minima?: number;
}

export interface ProdutoCreateRequest {
  nome: string;
  descricao?: string;
  categoria?: string;
  sku?: string;
  ean?: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual?: number;
  estoque_minimo?: number;
  estoque_maximo?: number;
  imagens?: string[];
}

export type ProdutoUpdateRequest = Partial<ProdutoCreateRequest>;

export interface AnuncioCreateRequest {
  title: string;
  category_id: string;
  price: number;
  currency_id?: string;
  available_quantity: number;
  buying_mode?: string;
  listing_type_id?: string;
  condition: 'new' | 'used';
  description?: string;
  pictures?: { source: string }[];
  attributes?: { id: string; value_name: string }[];
  shipping?: {
    mode: string;
    free_shipping?: boolean;
  };
}

export type AnuncioUpdateRequest = Partial<AnuncioCreateRequest>;

export interface DescricaoProdutoRequest {
  titulo: string;
  categoria?: string;
  marca?: string;
  modelo?: string;
  caracteristicas?: string;
  beneficios?: string;
  publico_alvo?: string;
  diferenciais?: string;
}

export interface AutomacaoCreateRequest {
  nome: string;
  tipo: 'preco' | 'estoque' | 'anuncio';
  regras: Record<string, unknown>;
  ativo: boolean;
  produtos?: string[];
}

export type AutomacaoUpdateRequest = Partial<AutomacaoCreateRequest>;

export interface ClienteCreateRequest {
  nome: string;
  email?: string;
  telefone?: string;
  cpf_cnpj?: string;
  endereco?: Endereco;
}

export type ClienteUpdateRequest = Partial<ClienteCreateRequest>;
