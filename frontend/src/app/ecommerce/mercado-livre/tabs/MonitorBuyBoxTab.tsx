'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { TrendingUp, RefreshCw, ExternalLink, Award, ChevronRight, Info } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { formatCurrency } from '@/utils/currencyUtils';
import { getFirstSecureImage } from '@/utils/imageUtils';
import BuyBoxModal from '@/components/BuyBoxModal';

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
  const [selectedItem, setSelectedItem] = useState<BuyBoxItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Função para gerar o link correto do catálogo do Mercado Livre
  const getCatalogUrl = useCallback((item: BuyBoxItem): string | null => {
    if (!item.catalog_product_id) return null;

    const slug = item.title
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    if (!slug) {
      return `https://www.mercadolivre.com.br/p/${item.catalog_product_id}`;
    }

    return `https://www.mercadolivre.com.br/${slug}/p/${item.catalog_product_id}`;
  }, []);

  const openModal = useCallback((item: BuyBoxItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
    setModalOpen(false);
  }, []);

  const loadBuyBoxData = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      
      // Primeiro busca itens do catálogo com nova API
      const catalogResponse = await axiosInstance.get('/api/catalog/items', {
        params: { user_id: userId }
      });
      
      if (!catalogResponse?.data?.catalog_items || catalogResponse.data.status !== 'success') {
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
          
          if (buyboxResponse?.data?.buybox_data && buyboxResponse.data.status === 'success') {
            const data = buyboxResponse.data.buybox_data;
            
            // Calcular preço do campeão corretamente
            const winnerPrice = data.winner?.price ? Number(data.winner.price) : null;
            const priceToWinValue = data.price_to_win ? Number(data.price_to_win) : null;
            const championPriceValue = winnerPrice || priceToWinValue;
            
            // Calcular o preço real para ganhar
            // Se price_to_win existe, use ele, senão calcule baseado no champion_price
            let calculatedPriceToWin = priceToWinValue;
            if (!calculatedPriceToWin && championPriceValue && data.status !== 'winning') {
              // Se não está ganhando, precisa ser menor que o campeão
              calculatedPriceToWin = championPriceValue - 0.01;
            }
            
            // Mapear novos campos para compatibilidade
            return {
              ...data,
              // Campos originais (para compatibilidade)
              ml_id: data.item_id,
              item_id: data.item_id,
              title: item.title, // Vem do catálogo
              my_price: Number(data.current_price) || 0,
              champion_price: championPriceValue,
              difference_percent: data.price_difference_percent || data.winner_price_difference_percent || null,
              is_winner: data.status === 'winning',
              offers_count: data.competitors_sharing_first_place || 0,
              
              // Validar e normalizar novos campos
              current_price: Number(data.current_price) || 0,
              price_to_win: calculatedPriceToWin,
              status: data.status || 'listed',
              catalog_product_id: data.catalog_product_id || item.catalog_product_id || null,
              has_catalog: data.has_catalog !== false,
              boosts_analysis: data.boosts_analysis || {
                boosted: [],
                opportunities: [],
                not_boosted: [],
                not_apply: [],
              },
              winner: data.winner,
              reason: data.reason || [],
              price_difference: data.price_difference,
              price_difference_percent: data.price_difference_percent,
              winner_price_difference: data.winner_price_difference,
              winner_price_difference_percent: data.winner_price_difference_percent,
              updated_at: data.updated_at || new Date().toISOString(),
              // Dados adicionais do catálogo
              pictures: Array.isArray(item.pictures)
                ? item.pictures
                    .map((pic: unknown) => {
                      if (typeof pic === 'string') return pic;
                      if (pic && typeof pic === 'object' && 'secure_url' in (pic as Record<string, unknown>)) {
                        return (pic as { secure_url?: string }).secure_url;
                      }
                      if (pic && typeof pic === 'object' && 'url' in (pic as Record<string, unknown>)) {
                        return (pic as { url?: string }).url;
                      }
                      return null;
                    })
                    .filter((url: any): url is string => Boolean(url))
                : [],
              permalink: item.permalink || null,
              sold_quantity: item.sold_quantity || 0,
              available_quantity: item.available_quantity || 0,
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
      
      setItems(validData as BuyBoxItem[]);
    } catch (error) {
      console.error('Erro ao carregar dados BuyBox:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBuyBoxData();
  }, [loadBuyBoxData]);

  const handleRefresh = useCallback(async () => {
    setUpdating(true);
    await loadBuyBoxData();
    setUpdating(false);
  }, [loadBuyBoxData]);

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

  const { totalMonitorados, ganhandoBuyBox, perdendoBuyBox } = useMemo(() => {
    const total = items.length;
    const winners = items.filter((i) => i.is_winner).length;
    const losing = items.filter((i) => !i.is_winner && i.champion_price).length;
    return {
      totalMonitorados: total,
      ganhandoBuyBox: winners,
      perdendoBuyBox: losing,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header com Botão Atualizar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitor BuyBox</h2>
          <p className="text-sm text-gray-600 mt-1">{totalMonitorados} produtos em catálogo</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={updating}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <RefreshCw className={`h-5 w-5 ${updating ? 'animate-spin' : ''}`} />
          {updating ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Tabela BuyBox */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Catálogo de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum item no catálogo</h3>
              <p className="text-gray-600 mb-4">
                Sincronize seus anúncios na aba &quot;Meus Anúncios&quot; primeiro
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Foto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Anúncio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Preço Atual</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Campeão</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Diferença</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Catálogo ML</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((item) => {
                    const coverImage = getFirstSecureImage(item.pictures);
                    return (
                      <tr
                        key={item.ml_id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => openModal(item)}
                      >
                      {/* Foto */}
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {coverImage ? (
                            <img 
                              src={coverImage} 
                              alt={item.title || 'Produto'}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs text-center">Sem foto</div>
                          )}
                        </div>
                      </td>

                      {/* Anúncio */}
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900 truncate mb-1">{item.title || 'Título não disponível'}</p>
                          <p className="text-xs text-gray-500 font-mono">{item.ml_id}</p>
                        </div>
                      </td>

                      {/* Preço Atual */}
                      <td className="px-6 py-4">
                        <div className="text-base font-semibold text-gray-900">
                          {formatCurrency(item.my_price || 0)}
                        </div>
                      </td>

                      {/* Campeão */}
                      <td className="px-6 py-4">
                        {item.champion_price ? (
                          <div className="flex items-center space-x-2">
                            <div className="text-base font-semibold text-yellow-700">
                              {formatCurrency(item.champion_price)}
                            </div>
                            {item.is_winner && (
                              <Award className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Diferença */}
                      <td className="px-6 py-4">
                        {item.price_difference_percent !== undefined && item.price_difference_percent !== null ? (
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm ${
                            item.price_difference_percent > 0 
                              ? 'bg-red-50 text-red-700' 
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {item.price_difference_percent > 0 ? '+' : ''}{item.price_difference_percent.toFixed(1)}%
                          </div>
                        ) : item.difference_percent !== null && typeof item.difference_percent === 'number' ? (
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm ${
                            item.difference_percent > 0 
                              ? 'bg-red-50 text-red-700' 
                              : 'bg-green-50 text-green-700'
                          }`}>
                            {item.difference_percent > 0 ? '+' : ''}{item.difference_percent.toFixed(1)}%
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">{getStatusBadge(item)}</td>

                      {/* Catálogo ML */}
                      <td className="px-6 py-4">
                        {getCatalogUrl(item) ? (
                          <a
                            href={getCatalogUrl(item)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-sm">Ver Catálogo</span>
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Sem catálogo</span>
                        )}
                      </td>
                    </tr>
                  );
                  })}
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
              <p className="font-semibold mb-2">Guia de Otimização BuyBox:</p>
              <div className="space-y-1">
                <p><strong>Ganhando:</strong> Máxima visibilidade, todas as vendas vão para você</p>
                <p><strong>Compartilhando:</strong> Divide o primeiro lugar com outros vendedores</p>
                <p><strong>Competindo:</strong> Perdendo por preço, mas ainda visível</p>
                <p><strong>Apenas listado:</strong> Não compete (reputação, manufacturing time, etc.)</p>
                <p className="mt-2 pt-2 border-t border-blue-200">
                  <strong>Boosts importantes:</strong> Mercado Envios Full, Frete Grátis, Parcelamento sem juros
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do BuyBox */}
      {modalOpen && selectedItem && (
        <BuyBoxModal
          isOpen={modalOpen}
          onClose={closeModal}
          item={selectedItem}
        />
      )}
    </div>
  );
}
