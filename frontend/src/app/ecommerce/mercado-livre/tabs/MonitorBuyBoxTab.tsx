'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { TrendingUp, TrendingDown, RefreshCw, Info } from 'lucide-react';
import api from '@/lib/api';
import axiosInstance from '@/lib/axios';
import { formatCurrency } from '@/utils/currencyUtils';

interface BuyBoxItem {
  // Dados básicos
  item_id: string;
  current_price: number;
  currency_id: string;
  
  // Dados de competição (API price_to_win)
  price_to_win?: number;
  status: 'winning' | 'competing' | 'sharing_first_place' | 'listed';
  consistent?: boolean;
  visit_share?: 'maximum' | 'medium' | 'minimum';
  competitors_sharing_first_place?: number;
  catalog_product_id?: string;
  has_catalog: boolean;
  
  // Boosts e oportunidades
  boosts_analysis: {
    boosted: Array<{id: string; description: string; status: string}>;
    opportunities: Array<{id: string; description: string; status: string}>;
    not_boosted: Array<{id: string; description: string; status: string}>;
    not_apply: Array<{id: string; description: string; status: string}>;
  };
  
  // Dados do ganhador
  winner?: {
    item_id: string;
    price: number;
    currency_id: string;
    boosts: Array<{id: string; description: string; status: string}>;
  };
  
  // Motivos para não competir
  reason?: string[];
  
  // Cálculos de diferença
  price_difference?: number;
  price_difference_percent?: number;
  winner_price_difference?: number;
  winner_price_difference_percent?: number;
  
  // Para compatibilidade com código antigo
  title?: string;
  ml_id: string;
  my_price: number;
  champion_price: number | null;
  difference_percent: number | null;
  is_winner: boolean;
  offers_count?: number;
  updated_at: string;
}

interface MonitorBuyBoxTabProps {
  userId: string;
}

export default function MonitorBuyBoxTab({ userId }: MonitorBuyBoxTabProps) {
  const [items, setItems] = useState<BuyBoxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBuyBoxData();
  }, []);

  const loadBuyBoxData = async () => {
    try {
      setLoading(true);
      
      // Primeiro busca itens do catálogo com nova API
      const catalogResponse = await axiosInstance.get('/api/catalog/items', {
        params: { user_id: userId }
      });
      
      console.log('[DEBUG] Response catalogItems:', catalogResponse.data);
      
      if (!catalogResponse?.data?.success || !catalogResponse?.data?.catalog_items) {
        console.warn('[DEBUG] Catálogo vazio ou inválido:', catalogResponse.data);
        setItems([]);
        return;
      }

      const catalogItems = catalogResponse.data.catalog_items;

      // Para cada item, busca dados de BuyBox com nova API
      const buyboxPromises = catalogItems.map(async (item: any) => {
        try {
          const buyboxResponse = await axiosInstance.get(`/api/catalog/buybox/${item.ml_id}`, {
            params: { user_id: userId }
          });
          
          if (buyboxResponse?.data?.success && buyboxResponse?.data?.buybox_data) {
            const data = buyboxResponse.data.buybox_data;
            
            // Mapear novos campos para compatibilidade
            return {
              ...data,
              // Campos originais (para compatibilidade)
              ml_id: data.item_id,
              title: item.title, // Vem do catálogo
              my_price: Number(data.current_price) || 0,
              champion_price: data.winner?.price || (data.price_to_win ? Number(data.price_to_win) : null),
              difference_percent: data.price_difference_percent || data.winner_price_difference_percent || null,
              is_winner: data.status === 'winning',
              offers_count: data.competitors_sharing_first_place || 0,
              
              // Validar e normalizar novos campos
              current_price: Number(data.current_price) || 0,
              price_to_win: data.price_to_win ? Number(data.price_to_win) : undefined,
              status: data.status || 'listed',
              has_catalog: data.has_catalog !== false,
              boosts_analysis: data.boosts_analysis || {
                boosted: [],
                opportunities: [],
                not_boosted: [],
                not_apply: []
              },
              winner: data.winner,
              reason: data.reason || [],
              price_difference: data.price_difference,
              price_difference_percent: data.price_difference_percent,
              winner_price_difference: data.winner_price_difference,
              winner_price_difference_percent: data.winner_price_difference_percent,
              updated_at: data.updated_at || new Date().toISOString()
            };
          }
          return null;
        } catch (error) {
          console.error(`Erro ao buscar BuyBox para ${item.ml_id}:`, error);
          return null;
        }
      });

      const buyboxData = await Promise.all(buyboxPromises);
      const validData = buyboxData.filter(d => d !== null && d.has_catalog);
      
      setItems(validData);
    } catch (error) {
      console.error('Erro ao carregar dados BuyBox:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setUpdating(true);
    await loadBuyBoxData();
    setUpdating(false);
  };

  const getStatusBadge = (item: BuyBoxItem) => {
    const { status, reason = [] } = item;
    
    switch (status) {
      case 'winning':
        return (
          <div className="flex items-center gap-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              🏆 Ganhando
            </span>
            <span className="text-xs text-gray-500">({item.visit_share})</span>
          </div>
        );
        
      case 'sharing_first_place':
        return (
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              🤝 Compartilhando
            </span>
            {item.competitors_sharing_first_place && (
              <div className="text-xs text-gray-500 mt-1">
                +{item.competitors_sharing_first_place} vendedores
              </div>
            )}
          </div>
        );
        
      case 'competing':
        return (
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
              ⚡ Competindo
            </span>
            <div className="text-xs text-gray-500 mt-1">Visibilidade mínima</div>
          </div>
        );
        
      case 'listed':
        return (
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              📋 Apenas listado
            </span>
            {reason.length > 0 && (
              <div className="text-xs text-red-600 mt-1 max-w-32 truncate" title={reason.join(', ')}>
                {reason[0]}
              </div>
            )}
          </div>
        );
        
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Sem dados</span>;
    }
  };

  const getBoostsInfo = (item: BuyBoxItem) => {
    const { boosts_analysis } = item;
    if (!boosts_analysis) return null;
    
    const totalBoosts = boosts_analysis.boosted.length;
    const totalOpportunities = boosts_analysis.opportunities.length;
    
    return (
      <div className="text-xs text-gray-600">
        <div className="text-green-600">{totalBoosts} boosts ativos</div>
        {totalOpportunities > 0 && (
          <div className="text-orange-600">{totalOpportunities} oportunidades</div>
        )}
      </div>
    );
  };

  const formatTimeSince = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  // Estatísticas
  const totalMonitorados = items.length;
  const ganhandoBuyBox = items.filter(i => i.is_winner).length;
  const perdendoBuyBox = items.filter(i => !i.is_winner && i.champion_price).length;

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Monitorados</p>
                <p className="text-3xl font-bold text-blue-900">{totalMonitorados}</p>
              </div>
              <Info className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Ganhando BuyBox</p>
                <p className="text-3xl font-bold text-green-900">{ganhandoBuyBox}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Perdendo BuyBox</p>
                <p className="text-3xl font-bold text-red-900">{perdendoBuyBox}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Atualizar */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={updating}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-5 w-5 ${updating ? 'animate-spin' : ''}`} />
          {updating ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Tabela BuyBox */}
      <Card>
        <CardHeader>
          <CardTitle>Monitor BuyBox - Catálogo ML</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum item no catálogo</h3>
              <p className="text-gray-600 mb-4">
                Sincronize seus anúncios na aba &quot;Meus Anúncios&quot; primeiro
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Anúncio</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preço Atual</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preço p/ Ganhar</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Diferença</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status Competição</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Boosts</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Atualização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.ml_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">{item.title || 'Título não disponível'}</p>
                          <p className="text-xs text-gray-500 font-mono">{item.ml_id}</p>
                          {item.catalog_product_id && (
                            <p className="text-xs text-blue-500">Cat: {item.catalog_product_id}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.my_price || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          {item.price_to_win !== undefined ? (
                            <span className="text-sm font-semibold text-blue-600">
                              {formatCurrency(item.price_to_win)}
                            </span>
                          ) : item.champion_price ? (
                            <span className="text-sm font-semibold text-blue-600">
                              {formatCurrency(item.champion_price)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                          {item.status === 'listed' && (
                            <div className="text-xs text-red-500">Não compete</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.price_difference_percent !== undefined && item.price_difference_percent !== null ? (
                          <div>
                            <span className={`text-sm font-semibold ${item.price_difference_percent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.price_difference_percent > 0 ? '+' : ''}{item.price_difference_percent.toFixed(1)}%
                            </span>
                            {item.price_difference && (
                              <div className="text-xs text-gray-500">
                                {formatCurrency(Math.abs(item.price_difference))}
                              </div>
                            )}
                          </div>
                        ) : item.difference_percent !== null && typeof item.difference_percent === 'number' ? (
                          <span className={`text-sm font-semibold ${item.difference_percent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.difference_percent > 0 ? '+' : ''}{item.difference_percent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(item)}</td>
                      <td className="px-4 py-4">
                        {getBoostsInfo(item) || (
                          <span className="text-sm text-gray-400">{item.offers_count || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatTimeSince(item.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box Melhorado */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">💡 Guia de Otimização BuyBox (Atualizado):</p>
              <div className="space-y-1">
                <p><strong>🏆 Ganhando:</strong> Máxima visibilidade, todas as vendas vão para você</p>
                <p><strong>🤝 Compartilhando:</strong> Divide o primeiro lugar com outros vendedores</p>
                <p><strong>⚡ Competindo:</strong> Perdendo por preço, mas ainda visível</p>
                <p><strong>📋 Apenas listado:</strong> Não compete (reputação, manufacturing time, etc.)</p>
                <p className="mt-2 pt-2 border-t border-blue-200">
                  <strong>Boosts importantes:</strong> Mercado Envios Full, Frete Grátis, Parcelamento s/ juros
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
