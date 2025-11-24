// Tipos para API de Catálogo do Mercado Livre

export interface CatalogEligibilityStatus {
  item_id: string;
  status: 'READY_FOR_OPTIN' | 'ALREADY_OPTED_IN' | 'NOT_ELIGIBLE' | 'CLOSED' | 'PRODUCT_INACTIVE' | string;
  can_optin: boolean;
  has_variations: boolean;
  eligibility: {
    domain_id: string;
    buy_box_eligible: boolean;
    variations?: CatalogVariation[];
  };
}

export interface CatalogVariation {
  id?: string;
  variation_id: string;
  attributes: Record<string, string>;
  eligible: boolean;
  status: string;
}

export interface CatalogMultipleEligibility {
  total_items_checked: number;
  eligible_count: number;
  items: CatalogEligibilityStatus[];
}

export interface CatalogProduct {
  id: string;
  name: string;
  domain_id: string;
  attributes: CatalogAttribute[];
  pictures?: CatalogPicture[];
  buy_box_winner?: {
    price: number;
    currency_id: string;
  };
  permalink: string;
  status?: 'active' | 'inactive' | string;
}

export interface CatalogAttribute {
  id: string;
  name: string;
  value_name?: string;
  value_id?: string;
}

export interface CatalogPicture {
  id: string;
  url: string;
  secure_url: string;
}

export interface CatalogSearchResult {
  results: CatalogProduct[];
  total_results: number;
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface BuyBoxStatus {
  current_status: 'winning' | 'sharing_first_place' | 'competing' | 'listed' | string;
  is_winning: boolean;
  is_competing: boolean;
  is_sharing_first_place: boolean;
  position?: number;
}

export interface BuyBoxPricing {
  currency_id: string;
  current_price: number;
  price_to_win?: number;
  savings_needed?: number;
  discount_percentage?: number;
  reference_price?: number;
}

export interface CompetitiveAdvantage {
  has_advantage: boolean;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface BuyBoxRecommendation {
  type: 'price' | 'shipping' | 'reputation' | 'catalog' | string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
}

export interface BuyBoxAnalysis {
  item_id: string;
  catalog_product_id?: string;
  buybox_status: BuyBoxStatus;
  pricing: BuyBoxPricing;
  competitive_advantages: Record<string, CompetitiveAdvantage>;
  recommendations: BuyBoxRecommendation[];
  seller_reputation?: {
    level_id: string;
    power_seller_status: string;
    transactions_completed: number;
  };
}

export interface BrandCentralQuota {
  user_id: string;
  site_id: string;
  total_quota: number;
  used_quota: number;
  available_quota: number;
  monthly_limit: number;
}

export interface BrandCentralSuggestion {
  id: string;
  user_id: string;
  site_id: string;
  domain_id: string;
  status: 'UNDER_REVIEW' | 'WAITING_FOR_FIX' | 'PUBLISHED' | 'REJECTED' | string;
  sub_status?: string;
  created_date: string;
  last_updated?: string;
  attributes_count: number;
  pictures_count: number;
}

export interface BrandCentralValidation {
  field: string;
  type: 'error' | 'warning';
  message: string;
  code?: string;
}

export interface BrandCentralSuggestionDetail extends BrandCentralSuggestion {
  name: string;
  attributes: CatalogAttribute[];
  pictures: CatalogPicture[];
  validations?: BrandCentralValidation[];
}
