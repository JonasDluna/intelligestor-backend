'use client';

import axiosInstance from '@/lib/axios';

export interface BuyBoxData {
  item_id: string;
  title: string;
  current_price: number;
  price_to_win?: number;
  status: 'winning' | 'competing' | 'sharing_first_place' | 'listed';
  champion_price?: number;
  my_price: number;
  profit_margin?: number;
  last_updated: string;
  competitors_count?: number;
  boosts_analysis?: {
    boosted: Array<{id: string; description: string; status: string}>;
    opportunities: Array<{id: string; description: string; status: string}>;
    not_boosted: Array<{id: string; description: string; status: string}>;
  };
}

export interface PriceSimulation {
  new_price: number;
  estimated_position: number;
  estimated_sales_impact: number;
  profit_margin: number;
  break_even_analysis: {
    days_to_break_even: number;
    units_needed: number;
  };
}

class BuyBoxService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  async getCatalogItems(userId: string): Promise<BuyBoxData[]> {
    try {
      console.log('📦 Buscando itens do catálogo...');
      
      const response = await axiosInstance.get(`/api/catalog/items`, {
        params: { user_id: userId }
      });

      if (response.data.status === 'success' && response.data.catalog_items) {
        console.log(`✅ ${response.data.catalog_items.length} itens encontrados`);
        
        // Buscar dados de BuyBox para cada item
        const buyBoxPromises = response.data.catalog_items.map(async (item: any) => {
          try {
            const buyBoxResponse = await axiosInstance.get(`/api/catalog/buybox/${item.ml_id}`, {
              params: { user_id: userId }
            });
            
            if (buyBoxResponse.data.status === 'success') {
              const buyBoxData = buyBoxResponse.data.buybox_data;
              
              return {
                ...buyBoxData,
                // Compatibilidade
                ml_id: item.ml_id,
                item_id: buyBoxData.item_id || item.ml_id,
                title: item.title || buyBoxData.title || 'Título não disponível',
                my_price: buyBoxData.current_price || item.price || 0,
                last_updated: buyBoxData.updated_at || new Date().toISOString(),
                is_winner: buyBoxData.status === 'winning',
                profit_margin: this.calculateProfitMargin(
                  buyBoxData.current_price || item.price || 0,
                  item.cost || 0
                )
              };
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao buscar BuyBox para ${item.ml_id}:`, error);
            return null;
          }
        });

        const buyBoxResults = await Promise.all(buyBoxPromises);
        return buyBoxResults.filter(item => item !== null);
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar catálogo:', error);
      return [];
    }
  }

  async getBuyBoxDetails(itemId: string, userId: string): Promise<BuyBoxData | null> {
    try {
      console.log(`🔍 Buscando detalhes BuyBox para ${itemId}...`);
      
      const response = await axiosInstance.get(`/api/catalog/buybox/${itemId}`, {
        params: { user_id: userId }
      });

      if (response.data.status === 'success') {
        return response.data.buybox_data;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Erro ao buscar BuyBox ${itemId}:`, error);
      return null;
    }
  }

  async simulatePrice(itemId: string, newPrice: number, userId: string): Promise<PriceSimulation> {
    try {
      console.log(`💰 Simulando preço R$ ${newPrice} para ${itemId}...`);
      
      const response = await axiosInstance.post(`/api/catalog/simulate-price`, {
        item_id: itemId,
        new_price: newPrice,
        user_id: userId
      });

      if (response.data.status === 'success') {
        return response.data.simulation;
      } else {
        throw new Error(response.data.message || 'Erro na simulação');
      }
    } catch (error) {
      console.error('❌ Erro na simulação de preço:', error);
      
      // Fallback com cálculo aproximado
      return this.calculateMockSimulation(newPrice, itemId);
    }
  }

  async updatePrice(itemId: string, newPrice: number, userId: string): Promise<boolean> {
    try {
      console.log(`💲 Atualizando preço para R$ ${newPrice} - Item ${itemId}...`);
      
      const response = await axiosInstance.post(`/api/catalog/update-price`, {
        item_id: itemId,
        new_price: newPrice,
        user_id: userId
      });

      if (response.data.status === 'success') {
        console.log('✅ Preço atualizado com sucesso!');
        return true;
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar preço');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar preço:', error);
      return false;
    }
  }

  async getMarketTrends(itemId: string, userId: string): Promise<{
    price_history: Array<{date: string; price: number; position: number}>;
    demand_trend: 'increasing' | 'stable' | 'decreasing';
    seasonal_patterns: string[];
    recommendations: string[];
  }> {
    try {
      console.log(`📈 Buscando tendências de mercado para ${itemId}...`);
      
      const response = await axiosInstance.get(`/api/market/trends/${itemId}`, {
        params: { user_id: userId }
      });

      if (response.data.status === 'success') {
        return response.data.trends;
      } else {
        throw new Error(response.data.message || 'Erro ao buscar tendências');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar tendências:', error);
      
      // Fallback com dados mock
      return this.getMockTrends();
    }
  }

  async createAutomationRule(rule: {
    name: string;
    conditions: Record<string, any>;
    actions: Record<string, any>;
    enabled: boolean;
  }, userId: string): Promise<string> {
    try {
      console.log('🤖 Criando regra de automação:', rule.name);
      
      const response = await axiosInstance.post(`/api/automation/rules`, {
        ...rule,
        user_id: userId
      });

      if (response.data.status === 'success') {
        return response.data.rule_id;
      } else {
        throw new Error(response.data.message || 'Erro ao criar regra');
      }
    } catch (error) {
      console.error('❌ Erro ao criar regra de automação:', error);
      throw error;
    }
  }

  private calculateProfitMargin(price: number, cost: number): number {
    if (!cost || cost === 0) return 0;
    return ((price - cost) / price) * 100;
  }

  private calculateMockSimulation(newPrice: number, itemId: string): PriceSimulation {
    const currentPrice = newPrice * 1.1; // Simula preço atual 10% maior
    const priceReduction = (currentPrice - newPrice) / currentPrice;
    
    return {
      new_price: newPrice,
      estimated_position: Math.max(1, Math.ceil(5 - (priceReduction * 10))),
      estimated_sales_impact: priceReduction * 150, // 150% impact factor
      profit_margin: Math.max(5, 25 - (priceReduction * 100)),
      break_even_analysis: {
        days_to_break_even: Math.ceil(7 / (priceReduction + 0.1)),
        units_needed: Math.ceil(50 * (1 - priceReduction))
      }
    };
  }

  private getMockTrends() {
    const dates = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      price_history: dates.map((date, i) => ({
        date,
        price: 50 + Math.random() * 20 + Math.sin(i / 5) * 5,
        position: Math.ceil(Math.random() * 5) + 1
      })),
      demand_trend: 'stable' as const,
      seasonal_patterns: [
        'Pico de vendas em dezembro',
        'Baixa demanda em fevereiro',
        'Crescimento em maio-junho'
      ],
      recommendations: [
        'Considere promoção em período de baixa demanda',
        'Prepare estoque para pico sazonal',
        'Monitor concorrência mais frequentemente'
      ]
    };
  }
}

export const buyBoxService = new BuyBoxService();