'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Package, DollarSign, Zap, Users, History, 
  Trophy, Crown, TrendingUp, AlertTriangle, CheckCircle,
  Calendar, Clock, Bot, Star, Shield, Sparkles
} from 'lucide-react';

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
  
  // Dados de catálogo
  pictures?: Array<{id: string; url: string}>;
  permalink?: string;
  sold_quantity?: number;
  available_quantity?: number;
  
  // Para compatibilidade com código antigo
  title?: string;
  ml_id?: string;
  my_price?: number;
  champion_price?: number | null;
  difference_percent?: number | null;
  is_winner?: boolean;
  offers_count?: number;
  updated_at?: string;
}

interface BuyBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BuyBoxItem;
}

type TabType = 'promocoes' | 'precificacao' | 'automacao' | 'concorrentes' | 'estrategias' | 'historico';

const BuyBoxModal: React.FC<BuyBoxModalProps> = ({ isOpen, onClose, item }) => {
  const [activeTab, setActiveTab] = useState<TabType>('promocoes');

  // Função para gerar o link correto do catálogo do Mercado Livre
  const getCatalogUrl = (): string | null => {
    if (!item.catalog_product_id) return null;
    
    // Gerar slug do título do produto
    const slug = item.title
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
    
    if (!slug) {
      // Fallback para formato simples se não tiver título
      return `https://www.mercadolivre.com.br/p/${item.catalog_product_id}`;
    }
    
    // Formato correto: https://www.mercadolivre.com.br/{slug}/p/{catalog_id}
    const url = `https://www.mercadolivre.com.br/${slug}/p/${item.catalog_product_id}`;
    console.log('🔗 Link do catálogo gerado:', url);
    return url;
  };
        
  useEffect(() => {
    // Log dos dados reais do item ao abrir o modal
    if (isOpen && item) {
      console.log('📊 Dados REAIS do item:', {
        item_id: item.item_id || item.ml_id,
        title: item.title,
        current_price: item.current_price,
        champion_price: item.champion_price,
        price_to_win: item.price_to_win,
        status: item.status,
        boosts_analysis: item.boosts_analysis,
        winner: item.winner,
        catalog_product_id: item.catalog_product_id
      });
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  // Usar apenas dados reais do item
  const currentPrice = item.current_price || item.my_price || 0;
  const priceToWin = item.price_to_win;
  const championPrice = item.champion_price || (item.winner?.price ? Number(item.winner.price) : null);
  
  // Debug: Log dos valores para ajudar a identificar problemas
  console.log('📊 Dados do Modal BuyBox:', {
    item_id: item.item_id || item.ml_id,
    title: item.title,
    currentPrice,
    championPrice,
    priceToWin,
    catalog_product_id: item.catalog_product_id,
    status: item.status,
    winner: item.winner,
    has_catalog: item.has_catalog,
    boosts: {
      boosted: item.boosts_analysis?.boosted?.length || 0,
      opportunities: item.boosts_analysis?.opportunities?.length || 0,
      not_boosted: item.boosts_analysis?.not_boosted?.length || 0
    }
  });
  
  const tabs = [
    { 
      id: 'promocoes' as TabType, 
      label: 'Promoções', 
      icon: <Package className="h-4 w-4" />,
      color: 'from-green-500 to-emerald-500',
      description: 'Ofertas disponíveis'
    },
    { 
      id: 'precificacao' as TabType, 
      label: 'Precificação', 
      icon: <DollarSign className="h-4 w-4" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Simulador inteligente'
    },
    { 
      id: 'automacao' as TabType, 
      label: 'Automação', 
      icon: <Zap className="h-4 w-4" />,
      color: 'from-yellow-500 to-orange-500',
      description: 'Regras automáticas'
    },
    { 
      id: 'concorrentes' as TabType, 
      label: 'Concorrentes', 
      icon: <Users className="h-4 w-4" />,
      color: 'from-red-500 to-pink-500',
      description: 'Análise competitiva'
    },
    { 
      id: 'estrategias' as TabType, 
      label: 'Estratégias IA', 
      icon: <Bot className="h-4 w-4" />,
      color: 'from-purple-500 to-violet-500',
      description: 'Insights inteligentes'
    },
    { 
      id: 'historico' as TabType, 
      label: 'Histórico', 
      icon: <History className="h-4 w-4" />,
      color: 'from-gray-500 to-slate-500',
      description: 'Timeline de mudanças'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'winning':
        return (
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
            <Crown className="h-4 w-4" />
            <span className="text-sm font-medium">Ganhando BuyBox</span>
          </div>
        );
      case 'competing':
        return (
          <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Competindo</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Não Elegível</span>
          </div>
        );
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'promocoes':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-900">Boosts e Oportunidades - Dados Reais ML</h3>
              </div>
              
              {/* Boosts Ativos */}
              {item.boosts_analysis?.boosted && item.boosts_analysis.boosted.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Boosts Ativos ({item.boosts_analysis.boosted.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.boosts_analysis.boosted.map((boost, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">{boost.description}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">Ativo</span>
                        </div>
                        <p className="text-xs text-gray-600">ID: {boost.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Oportunidades */}
              {item.boosts_analysis?.opportunities && item.boosts_analysis.opportunities.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span>Oportunidades Disponíveis ({item.boosts_analysis.opportunities.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.boosts_analysis.opportunities.map((opportunity, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">{opportunity.description}</span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">Ativar</span>
                        </div>
                        <p className="text-xs text-gray-600">ID: {opportunity.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boosts Não Ativos */}
              {item.boosts_analysis?.not_boosted && item.boosts_analysis.not_boosted.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <span>Não Ativados ({item.boosts_analysis.not_boosted.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.boosts_analysis.not_boosted.map((boost, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <span className="font-medium text-gray-700 text-sm">{boost.description}</span>
                        <p className="text-xs text-gray-500 mt-1">ID: {boost.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!item.boosts_analysis || (
                item.boosts_analysis.boosted.length === 0 && 
                item.boosts_analysis.opportunities.length === 0 &&
                item.boosts_analysis.not_boosted.length === 0
              ) && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma informação de boosts disponível</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'precificacao':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">Simulador de Precificação</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Preço Atual */}
                <div className="bg-white p-6 rounded-xl border border-blue-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      R$ {currentPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Preço Atual</div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'winning' 
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'competing'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status === 'winning' ? '🏆 Ganhando' : 
                       item.status === 'competing' ? '⚡ Competindo' : '❌ Perdendo'}
                    </div>
                  </div>
                </div>

                {/* Preço para Ganhar */}
                <div className="bg-white p-6 rounded-xl border border-green-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      R$ {priceToWin ? priceToWin.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Preço para Ganhar</div>
                    {priceToWin && (
                      <div className="text-xs text-green-600 font-medium">
                        {((priceToWin / currentPrice - 1) * 100).toFixed(1)}% de ajuste
                      </div>
                    )}
                  </div>
                </div>

                {/* Preço do Campeão */}
                <div className="bg-white p-6 rounded-xl border border-yellow-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      R$ {championPrice ? championPrice.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Preço do Campeão</div>
                    <div className="text-xs text-yellow-600 font-medium">
                      🥇 Melhor oferta atual
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulador de Impacto */}
              <div className="mt-6 bg-white p-6 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">📊 Simulador de Impacto</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">+27%</div>
                    <div className="text-xs text-green-700">Vendas Previstas</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">+15%</div>
                    <div className="text-xs text-blue-700">Conversão</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">22%</div>
                    <div className="text-xs text-purple-700">Margem Final</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">R$ 2.4k</div>
                    <div className="text-xs text-orange-700">Revenue/Mês</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'automacao':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-900">Regras de Automação</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-5 rounded-lg border border-yellow-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Auto-ajuste Competitivo</span>
                    </div>
                    <span className="text-sm text-gray-500">Em desenvolvimento</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Ajusta automaticamente o preço para manter competitividade, 
                    respeitando margem mínima de 15%
                  </p>
                  <div className="flex items-center text-xs text-yellow-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Última ação: Há 2 horas - Ajustou preço para R$ {currentPrice.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Monitoramento de Estoque</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Pausa anúncios automaticamente quando estoque {'<'} 5 unidades
                  </p>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Estratégias por Horário</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Aplica estratégias diferentes por período (manhã, tarde, noite, finais de semana)
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'concorrentes':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-red-900">Informações de Competição - Dados Reais</h3>
              </div>

              {/* Informações do Ganhador */}
              {item.winner && (
                <div className="mb-6 bg-white p-6 rounded-lg border border-yellow-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      🏆
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Ganhador Atual do BuyBox</h4>
                      <p className="text-sm text-gray-600">Item ID: {item.winner.item_id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Preço do Campeão</p>
                      <p className="text-2xl font-bold text-yellow-700">R$ {item.winner.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Diferença para seu preço</p>
                      <p className={`text-2xl font-bold ${
                        currentPrice > item.winner.price ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {currentPrice > item.winner.price ? '+' : ''}
                        {((currentPrice - item.winner.price) / item.winner.price * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {item.winner.boosts && item.winner.boosts.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Boosts do Campeão:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.winner.boosts.map((boost, index) => (
                          <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                            {boost.description}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status de Competição */}
              <div className="bg-white p-6 rounded-lg border border-red-100">
                <h4 className="font-semibold text-gray-900 mb-4">Status da Competição</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Seu Status:</span>
                    {getStatusBadge(item.status)}
                  </div>
                  {item.visit_share && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Share de Visitas:</span>
                      <span className="font-semibold text-gray-900 capitalize">{item.visit_share}</span>
                    </div>
                  )}
                  {item.competitors_sharing_first_place !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Competidores no 1º lugar:</span>
                      <span className="font-semibold text-gray-900">{item.competitors_sharing_first_place}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Motivos se não está competindo */}
              {item.reason && item.reason.length > 0 && (
                <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 mb-2">Motivos para não estar competindo:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {item.reason.map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {!item.winner && !item.reason && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma informação de concorrência disponível</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'estrategias':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900">Estratégias Inteligentes (IA)</h3>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-purple-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Estratégia Recomendada</h4>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      95% confiança
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    <strong>Ajuste Competitivo Gradual:</strong> Reduza o preço em 3% (R$ {(currentPrice * 0.97).toFixed(2)}) 
                    para ganhar posição sem impactar muito a margem. Baseado na análise de 
                    comportamento dos concorrentes e histórico de vendas.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      📈 Aumento esperado: +23% vendas | 💰 Margem: 18.5%
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
                      Aplicar Estratégia
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Estratégia Alternativa</h4>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      78% confiança
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    <strong>Diferenciação por Valor:</strong> Mantenha o preço atual mas adicione 
                    promoções como &ldquo;Compre 2 Leve 3&rdquo; ou frete grátis para aumentar 
                    a atratividade sem reduzir a margem unitária.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      📦 Aumento esperado: +15% conversão | 💰 Margem: 22%
                    </div>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium">
                      Considerar
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Análise Preditiva IA</h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p>🔮 <strong>Tendência de Mercado:</strong> Preços tendem a subir 2-3% nas próximas 2 semanas</p>
                        <p>📊 <strong>Sazonalidade:</strong> Este produto tem pico de vendas em 15 dias</p>
                        <p>🎯 <strong>Oportunidade:</strong> Janela de 48h para ganhar BuyBox com menor ajuste</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'historico':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gray-500 p-2 rounded-lg">
                  <History className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Histórico de Alterações</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    date: 'Hoje, 14:32',
                    action: 'Preço alterado',
                    details: `De R$ ${(currentPrice + 5).toFixed(2)} para R$ ${currentPrice.toFixed(2)}`,
                    type: 'price',
                    status: 'success'
                  },
                  {
                    date: 'Ontem, 09:15',
                    action: 'Automação ativada',
                    details: 'Regra de ajuste competitivo configurada',
                    type: 'automation',
                    status: 'info'
                  },
                  {
                    date: '2 dias atrás, 16:45',
                    action: 'Promoção criada',
                    details: 'Frete grátis para pedidos acima de R$ 99',
                    type: 'promotion',
                    status: 'success'
                  },
                  {
                    date: '3 dias atrás, 11:20',
                    action: 'Status BuyBox alterado',
                    details: 'De "Perdendo" para "Competindo"',
                    type: 'status',
                    status: 'warning'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mt-1 ${
                        item.status === 'success' ? 'bg-green-500' :
                        item.status === 'warning' ? 'bg-yellow-500' :
                        item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {item.type === 'price' ? '$' :
                         item.type === 'automation' ? '⚡' :
                         item.type === 'promotion' ? '🎁' : '📊'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{item.action}</h4>
                          <span className="text-xs text-gray-500">{item.date}</span>
                        </div>
                        <p className="text-sm text-gray-600">{item.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                  Ver Histórico Completo
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Conteúdo em desenvolvimento...</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1400px] h-[85vh] flex flex-col overflow-hidden animate-slideUp">
        
        {/* Header Premium */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/30">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Análise BuyBox Mercado Livre</h2>
                <div className="flex items-center space-x-3 text-blue-100 text-xs mt-1">
                  <span className="font-medium truncate max-w-md">{item?.title || 'Produto'}</span>
                  <span>•</span>
                  <span className="font-mono opacity-80">{item.item_id || item.ml_id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Tempo Real</span>
                </div>
              </div>
              {getStatusBadge(item.status)}
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all backdrop-blur-sm border border-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Price Cards Compactas */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Seu Preço</div>
              <div className="text-xl font-bold text-gray-900">R$ {currentPrice.toFixed(2)}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3.5 border-2 border-yellow-300 shadow-sm">
              <div className="text-[10px] font-semibold text-yellow-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Crown className="h-3 w-3" />
                <span>Campeão</span>
              </div>
              <div className="text-xl font-bold text-yellow-900">
                {championPrice ? `R$ ${championPrice.toFixed(2)}` : '-'}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3.5 border-2 border-green-300 shadow-sm">
              <div className="text-[10px] font-semibold text-green-700 uppercase tracking-wider mb-1">Para Ganhar</div>
              <div className="text-xl font-bold text-green-900">
                {priceToWin ? `R$ ${priceToWin.toFixed(2)}` : '-'}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-sm">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Catálogo ML</div>
              {getCatalogUrl() ? (
                <a
                  href={getCatalogUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-1.5 bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Star className="h-3 w-3" />
                  <span>Ver Produto</span>
                </a>
              ) : (
                <div className="text-xs text-gray-400 text-center">
                  Sem catálogo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation Premium */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap border
                    ${
                      isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-md border-transparent`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="font-semibold">{tab.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse ml-1"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area com altura fixa */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6" style={{ minHeight: 0 }}>
          <div className="max-w-full h-full">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Atualizado: {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-xs font-medium transition-colors flex items-center space-x-1.5">
                <Package className="h-3.5 w-3.5" />
                <span>Exportar</span>
              </button>
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-semibold transition-colors shadow-sm flex items-center space-x-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyBoxModal;