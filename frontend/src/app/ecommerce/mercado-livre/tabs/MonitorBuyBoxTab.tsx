'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { TrendingUp, TrendingDown, RefreshCw, Info } from 'lucide-react';
import api from '@/lib/api';

interface BuyBoxItem {
  ml_id: string;
  title: string;
  my_price: number;
  champion_price: number | null;
  difference_percent: number;
  is_winner: boolean;
  offers_count: number;
  updated_at: string;
  has_catalog: boolean;
}

export default function MonitorBuyBoxTab() {
  const [items, setItems] = useState<BuyBoxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBuyBoxData();
  }, []);

  const loadBuyBoxData = async () => {
    try {
      setLoading(true);
      
      // Primeiro busca itens do catálogo
      const catalogResponse = await api.mlExtended.catalogItems();
      console.log('[DEBUG] Response catalogItems:', catalogResponse);
      
      if (!catalogResponse?.success || !catalogResponse?.items) {
        console.warn('[DEBUG] Catálogo vazio ou inválido:', catalogResponse);
        setItems([]);
        return;
      }

      const catalogItems = catalogResponse.items;

      // Para cada item, busca dados de BuyBox
      const buyboxPromises = catalogItems.map(async (item: any) => {
        try {
          const buyboxResponse = await api.mlExtended.buyboxData(item.ml_id);
          if (buyboxResponse?.success && buyboxResponse?.data) {
            return buyboxResponse.data;
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
    if (!item.champion_price) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Sem dados</span>;
    }
    
    if (item.is_winner) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">🏆 Ganhando</span>;
    }
    
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">📉 Perdendo</span>;
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preço Campeão</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Diferença</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status BuyBox</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ofertas</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Atualização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.ml_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 font-mono">{item.ml_id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          R$ {item.my_price.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-blue-600">
                          {item.champion_price ? `R$ ${item.champion_price.toFixed(2)}` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {item.champion_price ? (
                          <span className={`text-sm font-semibold ${item.difference_percent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.difference_percent > 0 ? '+' : ''}{item.difference_percent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(item)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{item.offers_count}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatTimeSince(item.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">💡 Dica de otimização BuyBox:</p>
              <p>
                Para ganhar o BuyBox, seu preço deve ser igual ou menor que o campeão atual. 
                Considere também outros fatores como reputação, frete e tempo de entrega.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
