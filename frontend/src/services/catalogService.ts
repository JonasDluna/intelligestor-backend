/**
 * Serviço de Catálogo do Mercado Livre
 * Integração completa com APIs de catálogo, Brand Central e Buy Box
 */

import axiosInstance, { ApiResponse } from '@/lib/axios';

// ===========================
// INTERFACES
// ===========================

export interface CatalogEligibility {
  item_id: string;
  eligibility: {
    item_id: string;
    site_id: string;
    domain_id: string;
    buy_box_eligible: boolean;
    status: 'READY_FOR_OPTIN' | 'ALREADY_OPTED_IN' | 'CLOSED' | 'PRODUCT_INACTIVE' | 'NOT_ELIGIBLE';
    variations?: Array<{
      id: number;
      status: string;
      buy_box_eligible: boolean;
    }>;
  };
  can_optin: boolean;
  status: string;
  has_variations: boolean;
}

export interface CatalogProduct {
  id: string;
  status: 'active' | 'inactive';
  domain_id: string;
  name: string;
  family_name?: string;
  permalink?: string;
  attributes: Array<{
    id: string;
    name: string;
    value_id?: string;
    value_name: string;
  }>;
  pictures: Array<{
    id: string;
    url: string;
    secure_url: string;
  }>;
  parent_id?: string;
  children_ids?: string[];
  buy_box_winner?: {
    item_id: string;
    price: number;
    currency_id: string;
    seller_id: number;
  };
  buy_box_winner_price_range?: {
    min: { price: number; currency_id: string };
    max: { price: number; currency_id: string };
  };
}

export interface CatalogProductSearchResult {
  site_id: string;
  query?: string;
  total_results: number;
  results: CatalogProduct[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface BrandCentralQuota {
  user_id: string;
  quota: Array<{
    type: string;
    available: number;
  }>;
  total_available: number;
  can_create_suggestions: boolean;
}

export interface BrandCentralDomain {
  id: string;
  name: string;
  available: boolean;
  pictures: Array<{
    id: string;
    url: string;
  }>;
}

export interface BrandCentralSuggestion {
  suggestion_id: string;
  status: 'UNDER_REVIEW' | 'WAITING_FOR_FIX' | 'PUBLISHED' | 'REJECTED';
  sub_status?: string;
  needs_action: boolean;
  is_published: boolean;
  suggestion: {
    id: string;
    title: string;
    domain_id: string;
    seller_id: number;
    date_created: string;
    attributes: any[];
    pictures: any[];
  };
}

export interface BuyBoxAnalysis {
  item_id: string;
  buybox_status: {
    current_status: 'winning' | 'competing' | 'sharing_first_place' | 'listed';
    is_winning: boolean;
    is_competing: boolean;
    visit_share: 'maximum' | 'medium' | 'minimum';
    consistent: boolean;
  };
  pricing: {
    current_price: number;
    currency_id: string;
    price_to_win: number | null;
    savings_needed?: number;
    discount_percentage?: number;
  };
  competitive_advantages: {
    [key: string]: {
      status: string;
      description: string;
      has_advantage: boolean;
    };
  };
  winner_info?: {
    item_id: string;
    price: number;
    has_fulfillment: boolean;
    has_free_installments: boolean;
  };
  recommendations: string[];
}

// ===========================
// ELEGIBILIDADE
// ===========================

/**
 * Verifica elegibilidade de um item para catálogo
 */
export async function checkCatalogEligibility(itemId: string): Promise<CatalogEligibility> {
  const response = await axiosInstance.get<ApiResponse<CatalogEligibility>>(
    `/ml/catalog/eligibility/${itemId}`
  );
  return response.data.data || response.data;
}

/**
 * Verifica elegibilidade de múltiplos itens
 */
export async function checkMultipleCatalogEligibility(
  itemIds: string[]
): Promise<{ total_items_checked: number; eligible_count: number; items: any[] }> {
  const response = await axiosInstance.get<ApiResponse>(`/ml/catalog/eligibility/multiget`, {
    params: { item_ids: itemIds.join(',') },
  });
  return response.data.data || response.data;
}

/**
 * Lista itens de catálogo de um vendedor
 */
export async function getSellerCatalogItems(
  userId: string,
  catalogListing: boolean = true,
  status?: 'active' | 'paused' | 'closed'
): Promise<{ seller_id: string; total_items: number; items: string[] }> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/catalog/seller/${userId}/items`,
    {
      params: {
        catalog_listing: catalogListing,
        ...(status && { status }),
      },
    }
  );
  return response.data.data || response.data;
}

// ===========================
// BUSCA DE PRODUTOS
// ===========================

/**
 * Busca produtos de catálogo
 */
export async function searchCatalogProducts(params: {
  siteId: string;
  q?: string;
  productIdentifier?: string;
  domainId?: string;
  listingStrategy?: 'catalog_required' | 'catalog_only';
  status?: 'active' | 'inactive';
  offset?: number;
  limit?: number;
}): Promise<CatalogProductSearchResult> {
  const response = await axiosInstance.get<ApiResponse<CatalogProductSearchResult>>(
    `/ml/catalog/products/search`,
    {
      params: {
        site_id: params.siteId,
        ...(params.q && { q: params.q }),
        ...(params.productIdentifier && { product_identifier: params.productIdentifier }),
        ...(params.domainId && { domain_id: params.domainId }),
        ...(params.listingStrategy && { listing_strategy: params.listingStrategy }),
        ...(params.status && { status: params.status }),
        offset: params.offset || 0,
        limit: params.limit || 10,
      },
    }
  );
  return response.data.data || response.data;
}

/**
 * Obtém detalhes de um produto de catálogo
 */
export async function getCatalogProductDetails(productId: string): Promise<{
  product_id: string;
  product: CatalogProduct;
  is_parent: boolean;
  is_child: boolean;
  is_buyable: boolean;
  has_winner: boolean;
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/catalog/products/${productId}`
  );
  return response.data.data || response.data;
}

// ===========================
// PUBLICAÇÃO NO CATÁLOGO
// ===========================

/**
 * Cria publicação direta no catálogo
 */
export async function createCatalogListing(data: {
  site_id: string;
  title: string;
  category_id: string;
  price: number;
  currency_id: string;
  available_quantity: number;
  buying_mode: string;
  listing_type_id: string;
  catalog_product_id: string;
  catalog_listing: boolean;
  condition: string;
  warranty?: string;
  attributes?: any[];
  pictures?: any[];
}): Promise<{ success: boolean; item_id: string; catalog_listing: boolean }> {
  const response = await axiosInstance.post<ApiResponse>(
    `/ml/catalog/items/create`,
    data
  );
  return response.data.data || response.data;
}

/**
 * Faz optin de item tradicional para catálogo
 */
export async function createCatalogOptin(data: {
  item_id: string;
  catalog_product_id: string;
  variation_id?: number;
}): Promise<{
  success: boolean;
  original_item_id: string;
  catalog_item_id: string;
  catalog_product_id: string;
}> {
  const response = await axiosInstance.post<ApiResponse>(
    `/ml/catalog/items/optin`,
    data
  );
  return response.data.data || response.data;
}

// ===========================
// COMPETIÇÃO E BUY BOX
// ===========================

/**
 * Análise completa do Buy Box
 */
export async function getBuyBoxAnalysis(itemId: string): Promise<BuyBoxAnalysis> {
  const response = await axiosInstance.get<ApiResponse<BuyBoxAnalysis>>(
    `/ml/buybox/analysis/${itemId}`
  );
  return response.data.data || response.data;
}

/**
 * Detalhes da competição em um produto
 */
export async function getProductCompetition(productId: string): Promise<{
  product_id: string;
  total_competitors: number;
  winner: any;
  price_range: {
    min: number;
    max: number;
    median: number;
  };
  competitors: any[];
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/products/${productId}/competition`
  );
  return response.data.data || response.data;
}

/**
 * Lista competidores de uma PDP
 */
export async function getProductCompetitors(
  productId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ product_id: string; total_items: number; items: any[] }> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/products/${productId}/items`,
    {
      params: { limit, offset },
    }
  );
  return response.data.data || response.data;
}

// ===========================
// BRAND CENTRAL
// ===========================

/**
 * Verifica quota de sugestões disponível
 */
export async function getBrandCentralQuota(userId: string): Promise<BrandCentralQuota> {
  const response = await axiosInstance.get<ApiResponse<BrandCentralQuota>>(
    `/ml/brand-central/users/${userId}/quota`
  );
  return response.data.data || response.data;
}

/**
 * Lista domínios disponíveis para sugestões
 */
export async function getAvailableDomains(siteId: string): Promise<{
  site_id: string;
  total_domains: number;
  available_domains: number;
  domains: BrandCentralDomain[];
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/brand-central/domains/${siteId}/available`
  );
  return response.data.data || response.data;
}

/**
 * Obtém ficha técnica de um domínio
 */
export async function getDomainTechnicalSpecs(
  domainId: string,
  specType: 'full' | 'input' | 'output' = 'full'
): Promise<{
  domain_id: string;
  spec_type: string;
  attributes: any[];
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/brand-central/domains/${domainId}/technical-specs`,
    {
      params: { spec_type: specType },
    }
  );
  return response.data.data || response.data;
}

/**
 * Valida sugestão de produto
 */
export async function validateCatalogSuggestion(data: {
  title: string;
  domain_id: string;
  pictures: any[];
  attributes: any[];
}): Promise<{
  is_valid: boolean;
  can_create: boolean;
  validation_result: any;
  errors: any[];
}> {
  const response = await axiosInstance.post<ApiResponse>(
    `/ml/brand-central/suggestions/validate`,
    data
  );
  return response.data.data || response.data;
}

/**
 * Cria sugestão de produto
 */
export async function createCatalogSuggestion(data: {
  title: string;
  domain_id: string;
  pictures: any[];
  attributes: any[];
}): Promise<{
  success: boolean;
  suggestion_id: string;
  status: string;
  title: string;
  domain_id: string;
}> {
  const response = await axiosInstance.post<ApiResponse>(
    `/ml/brand-central/suggestions/create`,
    data
  );
  return response.data.data || response.data;
}

/**
 * Obtém detalhes de uma sugestão
 */
export async function getCatalogSuggestion(
  suggestionId: string
): Promise<BrandCentralSuggestion> {
  const response = await axiosInstance.get<ApiResponse<BrandCentralSuggestion>>(
    `/ml/brand-central/suggestions/${suggestionId}`
  );
  return response.data.data || response.data;
}

/**
 * Atualiza sugestão de produto
 */
export async function updateCatalogSuggestion(
  suggestionId: string,
  data: {
    title?: string;
    pictures?: any[];
    attributes?: any[];
  }
): Promise<{ success: boolean; suggestion_id: string }> {
  const response = await axiosInstance.put<ApiResponse>(
    `/ml/brand-central/suggestions/${suggestionId}`,
    data
  );
  return response.data.data || response.data;
}

/**
 * Lista todas as sugestões do usuário
 */
export async function listUserSuggestions(
  userId: string,
  params?: {
    status?: 'UNDER_REVIEW' | 'WAITING_FOR_FIX' | 'PUBLISHED' | 'REJECTED';
    domainIds?: string[];
    title?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{
  user_id: string;
  total_suggestions: number;
  suggestions: BrandCentralSuggestion[];
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/brand-central/users/${userId}/suggestions`,
    {
      params: {
        ...(params?.status && { status: params.status }),
        ...(params?.domainIds && { domain_ids: params.domainIds.join(',') }),
        ...(params?.title && { title: params.title }),
        limit: params?.limit || 10,
        offset: params?.offset || 0,
      },
    }
  );
  return response.data.data || response.data;
}

/**
 * Obtém validações de uma sugestão
 */
export async function getSuggestionValidations(suggestionId: string): Promise<{
  suggestion_id: string;
  total_validations: number;
  total_errors: number;
  total_warnings: number;
  has_errors: boolean;
  validations: Array<{
    department: string;
    cause_id: number;
    type: 'error' | 'warning';
    code: string;
    message: string;
  }>;
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/brand-central/suggestions/${suggestionId}/validations`
  );
  return response.data.data || response.data;
}

// ===========================
// SINCRONIZAÇÃO
// ===========================

/**
 * Verifica status de sincronização
 */
export async function getCatalogSyncStatus(itemId: string): Promise<{
  item_id: string;
  sync_status: 'SYNC' | 'UNSYNC';
  is_synced: boolean;
  needs_fix: boolean;
  timestamp: number | null;
  relations: string[];
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/catalog/sync/${itemId}/status`
  );
  return response.data.data || response.data;
}

/**
 * Corrige sincronização
 */
export async function fixCatalogSync(itemId: string): Promise<{
  item_id: string;
  sync_fixed: boolean;
  message: string;
}> {
  const response = await axiosInstance.post<ApiResponse>(
    `/ml/catalog/sync/${itemId}/fix`
  );
  return response.data.data || response.data;
}

/**
 * Consulta data limite (forewarning)
 */
export async function getCatalogForewarningDate(itemId: string): Promise<{
  item_id: string;
  status: 'date_defined' | 'date_not_defined' | 'date_expired';
  is_synced: boolean;
  needs_fix: boolean;
  moderation_date?: string;
  needs_action: boolean;
}> {
  const response = await axiosInstance.get<ApiResponse>(
    `/ml/catalog/forewarning/${itemId}/date`
  );
  return response.data.data || response.data;
}

export default {
  // Elegibilidade
  checkCatalogEligibility,
  checkMultipleCatalogEligibility,
  getSellerCatalogItems,
  
  // Busca
  searchCatalogProducts,
  getCatalogProductDetails,
  
  // Publicação
  createCatalogListing,
  createCatalogOptin,
  
  // Competição
  getBuyBoxAnalysis,
  getProductCompetition,
  getProductCompetitors,
  
  // Brand Central
  getBrandCentralQuota,
  getAvailableDomains,
  getDomainTechnicalSpecs,
  validateCatalogSuggestion,
  createCatalogSuggestion,
  getCatalogSuggestion,
  updateCatalogSuggestion,
  listUserSuggestions,
  getSuggestionValidations,
  
  // Sincronização
  getCatalogSyncStatus,
  fixCatalogSync,
  getCatalogForewarningDate,
};
