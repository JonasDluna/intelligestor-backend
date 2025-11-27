/**
 * Serviço OFICIAL de integração com Mercado Livre
 * Conecta com APIs reais: price_to_win, products, competidores
 */

import axiosInstance, { ApiResponse } from '@/lib/axios';

// Interfaces para APIs OFICIAIS do ML
export interface OfficialBuyBoxAnalysis {
  item_id: string;
  analysis_timestamp: string;
  api_source: 'official_mercadolibre';
  catalog_product_id?: string;
  
  buybox_status: {
    current_status: 'winning' | 'competing' | 'sharing_first_place' | 'listed';
    is_winning: boolean;
    is_competing: boolean;
    is_sharing_first_place: boolean;
    is_listed_only: boolean;
    visit_share: 'maximum' | 'medium' | 'minimum';
    competitors_sharing_first_place: number | null;
    consistent: boolean;
  };
  
  pricing_analysis: {
    current_price: number;
    price_to_win: number | null;
    currency_id: string;
    price_adjustment_needed: boolean;
    price_gap: {
      gap_amount: number;
      gap_percentage: number;
      urgency: 'alta' | 'média' | 'baixa';
    } | null;
  };

  product_context?: {
    product_id?: string;
    product_name?: string;
    permalink?: string;
    winner?: OfficialBuyBoxWinner['current_winner'];
    price_range?: OfficialBuyBoxWinner['price_range'];
    activation_date?: string;
  };

  competitors_summary?: {
    total_competitors: number;
    top_competitors: OfficialCompetitor[];
    competitor_price_range?: {
      min_price: number;
      max_price: number;
      avg_price: number;
      median_price: number;
      price_spread: number;
    } | null;
  };

  competitive_advantages: {
    active_boosts: Array<{
      id: string;
      name: string;
      description: string;
      status: string;
      is_active: boolean;
      impact_level: string;
    }>;
    available_opportunities: Array<{
      id: string;
      name: string;
      description: string;
      status: string;
      is_opportunity: boolean;
      impact_level: string;
    }>;
    boost_score: {
      score: number;
      active_count: number;
      total_possible: number;
      opportunities_count: number;
      level: string;
    };
  };
  
  competitive_analysis: {
    competitive_level: string;
    urgency: string;
    recommendations: string[];
    opportunities: string[];
  };
  
  blocking_reasons: string[];
  blocking_reasons_solved: Array<{
    problem: string;
    solution: string;
    urgency: string;
    estimated_time: string;
  }>;
  
  current_winner: {
    item_id: string;
    price: number;
    currency_id: string;
  };
  
  strategic_recommendations: string[];
  immediate_opportunities: string[];
}

export interface OfficialCompetitor {
  item_id: string;
  seller_id: number;
  price: number;
  currency_id: string;
  available_quantity: number;
  condition: string;
  listing_type_id: string;
  official_store_id: number | null;
  shipping: {
    free_shipping: boolean;
    mode: string;
    logistic_type: string;
  };
  warranty: string;
  tags: string[];
  buybox_analysis?: {
    status: string;
    visit_share: string;
    competitive_level: string;
  } | null;
}

export interface OfficialCompetitorsResponse {
  product_id: string;
  api_source: 'official_mercadolibre';
  filters_applied: {
    shipping_cost?: string;
    official_store?: string;
    price_range?: string;
    limit?: number;
  };
  total_competitors: number;
  competitors: OfficialCompetitor[];
  market_analysis: {
    market_characteristics: {
      total_analyzed: number;
      free_shipping_adoption: {
        count: number;
        percentage: number;
        is_standard: boolean;
      };
      fulfillment_adoption: {
        count: number;
        percentage: number;
        competitive_advantage: boolean;
      };
      official_stores: {
        count: number;
        percentage: number;
      };
    };
    competitive_recommendations: string[];
  };
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
  analysis_date: string;
}

export interface OfficialBuyBoxWinner {
  product_id: string;
  product_name: string;
  permalink: string;
  
  current_winner: {
    item_id: string;
    seller_id: number;
    price: number;
    currency_id: string;
    available_quantity: number;
    condition: string;
    listing_type: string;
    official_store_id: number | null;
    is_official_store: boolean;
    
    shipping_advantages: {
      free_shipping: boolean;
      shipping_mode: string;
      logistic_type: string;
      is_fulfillment: boolean;
    };
    
    seller_advantages: {
      reputation_level: string;
      seller_tags: string[];
    };
  };
  
  price_range: {
    min: { price: number; currency_id: string };
    max: { price: number; currency_id: string };
  };
  
  competitive_insights: string[];
  how_to_compete: string[];
  analysis_timestamp: string;
}

type ApiData<T> = ApiResponse<T> | T;

const unwrapApiData = <T>(payload: ApiData<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data ?? (payload as T);
  }
  return payload as T;
};

interface OfficialCompetitorOptions {
  limit?: number;
  shipping_cost?: 'free';
  official_store?: 'all';
  price_range?: string;
}

export interface CompetitiveAnalysisSummary {
  status: string;
  urgency: string;
  competitive_level: string;
  immediate_actions: string[];
  market_position: string;
  actions_to_win_catalog: string[];
  price_to_win_target?: number | null;
  winner_signals?: {
    free_shipping: boolean;
    is_fulfillment: boolean;
    is_official_store: boolean;
  };
}

interface CompetitiveAnalysisResult {
  buybox_analysis: OfficialBuyBoxAnalysis;
  competitors: OfficialCompetitorsResponse | null;
  current_winner: OfficialBuyBoxWinner | null;
  summary: CompetitiveAnalysisSummary;
}

class MLOfficialService {

  /**
   * Obter análise OFICIAL do BuyBox usando price_to_win
   */
  async getBuyBoxAnalysisOfficial(itemId: string): Promise<OfficialBuyBoxAnalysis> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<OfficialBuyBoxAnalysis>>(
        `/ml/buybox/analysis/${itemId}`
      );
      return unwrapApiData(data);
    } catch (error) {
      console.error('Erro ao carregar análise oficial do BuyBox', error);
      throw error;
    }
  }

  /**
   * Obter competidores OFICIAIS usando /products/{product_id}/items
   */
  async getCompetitorsOfficial(
    productId: string,
    options: OfficialCompetitorOptions = {}
  ): Promise<OfficialCompetitorsResponse> {
    try {
      const params = {
        ...(options.limit ? { limit: options.limit } : {}),
        ...(options.shipping_cost ? { shipping_cost: options.shipping_cost } : {}),
        ...(options.official_store ? { official_store: options.official_store } : {}),
        ...(options.price_range ? { price_range: options.price_range } : {}),
      };

      const { data } = await axiosInstance.get<ApiResponse<OfficialCompetitorsResponse>>(
        `/ml/competitors/official/${productId}`,
        { params }
      );

      return unwrapApiData(data);
    } catch (error) {
      console.error('Erro ao carregar competidores oficiais', error);
      throw error;
    }
  }

  /**
   * Obter ganhador OFICIAL do BuyBox
   */
  async getBuyBoxWinnerOfficial(productId: string): Promise<OfficialBuyBoxWinner> {
    try {
      const { data } = await axiosInstance.get<ApiResponse<OfficialBuyBoxWinner>>(
        `/ml/product/winner/${productId}`
      );
      return unwrapApiData(data);
    } catch (error) {
      console.error('Erro ao carregar ganhador oficial', error);
      throw error;
    }
  }

  /**
   * Análise competitiva COMPLETA usando todas as APIs oficiais
   */
  async getCompetitiveAnalysisComplete(itemId: string, productId?: string): Promise<CompetitiveAnalysisResult> {
    try {
      const buyboxAnalysis = await this.getBuyBoxAnalysisOfficial(itemId);
      const resolvedProductId =
        productId ||
        buyboxAnalysis.catalog_product_id ||
        buyboxAnalysis.product_context?.product_id ||
        buyboxAnalysis.competitors_summary?.top_competitors?.[0]?.item_id;

      let competitorsData: OfficialCompetitorsResponse | null = null;
      if (resolvedProductId) {
        try {
          competitorsData = await this.getCompetitorsOfficial(resolvedProductId, { limit: 20 });
        } catch (error) {
          console.warn('Não foi possível carregar competidores oficiais', error);
        }
      }

      let winnerData: OfficialBuyBoxWinner | null = null;
      if (resolvedProductId) {
        try {
          winnerData = await this.getBuyBoxWinnerOfficial(resolvedProductId);
        } catch (error) {
          console.warn('Não foi possível carregar ganhador oficial', error);
        }
      }

      const summary = this.generateExecutiveSummary(buyboxAnalysis, competitorsData, winnerData);

      return {
        buybox_analysis: buyboxAnalysis,
        competitors: competitorsData,
        current_winner: winnerData,
        summary,
      };
    } catch (error) {
      console.error('Erro na análise competitiva completa', error);
      throw error;
    }
  }

  /**
   * Gerar resumo executivo da análise
   */
  private generateExecutiveSummary(
    buyboxAnalysis: OfficialBuyBoxAnalysis,
    competitorsData: OfficialCompetitorsResponse | null,
    winnerData: OfficialBuyBoxWinner | null
  ): CompetitiveAnalysisSummary {
    const status = buyboxAnalysis.buybox_status.current_status;
    const competitiveLevel = buyboxAnalysis.competitive_analysis.competitive_level;
    const urgency = buyboxAnalysis.competitive_analysis.urgency;
    
    // Determinar posição no mercado
    let marketPosition = 'Indefinida';
    if (status === 'winning') {
      marketPosition = 'Líder de mercado';
    } else if (status === 'sharing_first_place') {
      marketPosition = 'Compartilhando liderança';
    } else if (status === 'competing') {
      marketPosition = 'Competindo ativamente';
    } else if (status === 'listed') {
      marketPosition = 'Listado (não competindo)';
    }
    
    // Ações imediatas
    const immediateActions = [];
    const catalogActions = [];
    
    if (buyboxAnalysis.pricing_analysis.price_adjustment_needed) {
      const priceToWin = buyboxAnalysis.pricing_analysis.price_to_win;
      if (priceToWin) {
        immediateActions.push(`Ajustar preço para R$ ${priceToWin.toFixed(2)}`);
        catalogActions.push(`Coloque o preço em R$ ${priceToWin.toFixed(2)} ou abaixo até vencer o BuyBox`);
      }
    }
    
    // Adicionar oportunidades de boost
    const opportunities = buyboxAnalysis.competitive_advantages.available_opportunities;
    opportunities.slice(0, 2).forEach(boost => {
      immediateActions.push(`Ativar ${boost.name}`);
      catalogActions.push(`Ative o boost ${boost.name} (${boost.impact_level})`);
    });
    
    // Adicionar recomendações estratégicas
    buyboxAnalysis.strategic_recommendations.slice(0, 1).forEach(rec => {
      immediateActions.push(rec);
      catalogActions.push(rec);
    });

    // Ações baseadas no winner oficial do catálogo
    const winnerLogistics = {
      free_shipping: winnerData?.current_winner?.shipping_advantages?.free_shipping ?? false,
      is_fulfillment: winnerData?.current_winner?.shipping_advantages?.is_fulfillment ?? false,
      is_official_store: winnerData?.current_winner?.is_official_store ?? false,
    };

    if (winnerLogistics.free_shipping) {
      catalogActions.push('Habilite frete grátis para igualar o ganhador');
    }

    if (winnerLogistics.is_fulfillment) {
      catalogActions.push('Ative Mercado Envios Full (fulfillment) para competir em logística');
    }

    if (winnerLogistics.is_official_store) {
      catalogActions.push('Considere oficializar a loja ou reforçar reputação para competir com loja oficial');
    }

    // Corrigir motivos de bloqueio (se existirem)
    if (Array.isArray(buyboxAnalysis.blocking_reasons) && buyboxAnalysis.blocking_reasons.length) {
      catalogActions.push('Resolva os bloqueios listados para entrar no BuyBox');
    }

    const uniqueCatalogActions = Array.from(new Set(catalogActions)).slice(0, 5);
    
    return {
      status,
      urgency,
      competitive_level: competitiveLevel,
      immediate_actions: immediateActions.slice(0, 3),
      market_position: marketPosition,
      actions_to_win_catalog: uniqueCatalogActions,
      price_to_win_target: buyboxAnalysis.pricing_analysis.price_to_win,
      winner_signals: winnerLogistics,
    };
  }

  /**
   * Formatar status para exibição
   */
  formatStatus(status: string): { text: string; color: string; icon: string } {
    const statusMap: Record<string, { text: string; color: string; icon: string }> = {
      'winning': { text: 'Ganhando', color: 'text-green-600', icon: '🏆' },
      'sharing_first_place': { text: 'Compartilhando 1º lugar', color: 'text-blue-600', icon: '🤝' },
      'competing': { text: 'Competindo', color: 'text-yellow-600', icon: '⚡' },
      'listed': { text: 'Apenas listado', color: 'text-red-600', icon: '⚠️' }
    };

    return statusMap[status] || { text: 'Indefinido', color: 'text-gray-500', icon: '❓' };
  }

  /**
   * Formatar urgência para exibição
   */
  formatUrgency(urgency: string): { text: string; color: string; priority: number } {
    const urgencyMap: Record<string, { text: string; color: string; priority: number }> = {
      'Crítica': { text: 'Crítica', color: 'text-red-600 bg-red-50', priority: 4 },
      'Alta': { text: 'Alta', color: 'text-orange-600 bg-orange-50', priority: 3 },
      'Média': { text: 'Média', color: 'text-yellow-600 bg-yellow-50', priority: 2 },
      'Baixa': { text: 'Baixa', color: 'text-green-600 bg-green-50', priority: 1 }
    };

    return urgencyMap[urgency] || { text: 'Indefinida', color: 'text-gray-500 bg-gray-50', priority: 0 };
  }

  /**
   * Formatar boost status para exibição
   */
  formatBoostStatus(status: string): { text: string; color: string; icon: string } {
    const boostStatusMap: Record<string, { text: string; color: string; icon: string }> = {
      'boosted': { text: 'Ativo', color: 'text-green-600', icon: '✅' },
      'opportunity': { text: 'Oportunidade', color: 'text-blue-600', icon: '💡' },
      'not_boosted': { text: 'Disponível', color: 'text-gray-500', icon: '⚪' },
      'not_apply': { text: 'Não se aplica', color: 'text-gray-400', icon: '❌' }
    };

    return boostStatusMap[status] || { text: 'Indefinido', color: 'text-gray-400', icon: '❓' };
  }

  /**
   * Calcular score de competitividade
   */
  calculateCompetitiveScore(analysis: OfficialBuyBoxAnalysis): number {
    let score = 0;
    
    // Score baseado no status (40%)
    const statusScores = { 'winning': 40, 'sharing_first_place': 30, 'competing': 20, 'listed': 0 };
    score += statusScores[analysis.buybox_status.current_status] || 0;
    
    // Score baseado nos boosts (30%)
    const boostScore = analysis.competitive_advantages.boost_score.score;
    score += (boostScore / 100) * 30;
    
    // Score baseado no preço (30%)
    if (analysis.pricing_analysis.price_gap) {
      const urgency = analysis.pricing_analysis.price_gap.urgency;
      const priceScores = { 'baixa': 30, 'média': 20, 'alta': 10 };
      score += priceScores[urgency] || 0;
    } else {
      score += 30; // Preço já é competitivo
    }
    
    return Math.min(100, Math.max(0, score));
  }
}

// Instância única do serviço oficial
export const mlOfficialService = new MLOfficialService();
export default mlOfficialService;

// Aliases para compatibilidade com código legado
export const mlRealService = mlOfficialService;
export type RealBuyBoxAnalysis = OfficialBuyBoxAnalysis;
export type RealCompetitor = OfficialCompetitor;
export type PricingAnalysis = OfficialBuyBoxAnalysis['pricing_analysis'];
