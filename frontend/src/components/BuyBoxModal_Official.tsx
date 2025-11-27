'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Package, DollarSign, Zap, Users, History, 
  Trophy, AlertTriangle, CheckCircle, Bot, Sparkles
} from 'lucide-react';
import { mlOfficialService, type OfficialBuyBoxAnalysis, type OfficialBuyBoxWinner, type OfficialCompetitorsResponse, type CompetitiveAnalysisSummary } from '../services/mlRealService';

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
  const [activeTab, setActiveTab] = useState<TabType>('concorrentes');
  const [officialAnalysis, setOfficialAnalysis] = useState<OfficialBuyBoxAnalysis | null>(null);
  const [winnerData, setWinnerData] = useState<OfficialBuyBoxWinner | null>(null);
  const [officialCompetitors, setOfficialCompetitors] = useState<OfficialCompetitorsResponse | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<CompetitiveAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar dados OFICIAIS do Mercado Livre
  const loadOfficialMarketData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando dados OFICIAIS do ML para:', item.item_id);
      
      // Determinar product_id (se possível extrair do catalog_product_id ou assumir)
      const productId = item.catalog_product_id || undefined;
      
      // Carregar análise COMPLETA usando serviço oficial
      const completeAnalysis = await mlOfficialService.getCompetitiveAnalysisComplete(
        item.item_id, 
        productId
      );
      
      setOfficialAnalysis(completeAnalysis.buybox_analysis);
      setOfficialCompetitors(completeAnalysis.competitors);
      setWinnerData(completeAnalysis.current_winner);
      setExecutiveSummary(completeAnalysis.summary);
      
      console.log('✅ Dados OFICIAIS carregados com sucesso:', {
        analysis: completeAnalysis.buybox_analysis.buybox_status.current_status,
        competitors: completeAnalysis.competitors?.total_competitors || 0,
        winner: completeAnalysis.current_winner?.current_winner.item_id || 'N/A',
        summary: completeAnalysis.summary
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados OFICIAIS:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && item) {
      loadOfficialMarketData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, item]);

  if (!isOpen) return null;

  const currentPrice = item.my_price || item.current_price || 0;
  const competitiveScore = officialAnalysis ? mlOfficialService.calculateCompetitiveScore(officialAnalysis) : 0;
  
  const tabs = [
    { 
      id: 'concorrentes' as TabType, 
      label: 'Concorrentes Reais', 
      icon: <Users className="h-4 w-4" />,
      color: 'from-red-500 to-pink-500',
      description: 'Análise competitiva oficial'
    },
    { 
      id: 'precificacao' as TabType, 
      label: 'Price to Win', 
      icon: <DollarSign className="h-4 w-4" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Preço para ganhar'
    },
    { 
      id: 'promocoes' as TabType, 
      label: 'Boosts ML', 
      icon: <Package className="h-4 w-4" />,
      color: 'from-green-500 to-emerald-500',
      description: 'Oportunidades de boost'
    },
    { 
      id: 'estrategias' as TabType, 
      label: 'Estratégias', 
      icon: <Bot className="h-4 w-4" />,
      color: 'from-purple-500 to-violet-500',
      description: 'Insights estratégicos'
    },
    { 
      id: 'automacao' as TabType, 
      label: 'Automação', 
      icon: <Zap className="h-4 w-4" />,
      color: 'from-yellow-500 to-orange-500',
      description: 'Regras automáticas'
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
    const statusFormat = mlOfficialService.formatStatus(status);
    
    return (
      <div className={`flex items-center space-x-2 bg-opacity-20 px-3 py-1 rounded-full ${statusFormat.color}`}>
        <span>{statusFormat.icon}</span>
        <span className="text-sm font-medium">{statusFormat.text}</span>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'concorrentes':
        return (
          <div className="space-y-6">
            {/* Status Atual do BuyBox */}
            {officialAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">Status no BuyBox</h3>
                  </div>
                  {getStatusBadge(officialAnalysis.buybox_status.current_status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Score Competitivo</div>
                    <div className="text-2xl font-bold text-blue-600">{competitiveScore}/100</div>
                    <div className="text-xs text-gray-500">
                      Boosts: {officialAnalysis.competitive_advantages.boost_score.active_count}/{officialAnalysis.competitive_advantages.boost_score.total_possible}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Visit Share</div>
                    <div className="text-2xl font-bold text-blue-600 capitalize">
                      {officialAnalysis.buybox_status.visit_share || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Tráfego recebido
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Nível Competitivo</div>
                    <div className="text-lg font-bold text-blue-600">
                      {officialAnalysis.competitive_analysis.competitive_level}
                    </div>
                    <div className="text-xs text-gray-500">
                      Urgência: {officialAnalysis.competitive_analysis.urgency}
                    </div>
                  </div>
                </div>

                {/* Preço para Ganhar */}
                {officialAnalysis.pricing_analysis.price_to_win && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-yellow-900">Price to Win</div>
                        <div className="text-2xl font-bold text-yellow-700">
                          R$ {officialAnalysis.pricing_analysis.price_to_win.toFixed(2)}
                        </div>
                        {officialAnalysis.pricing_analysis.price_gap && (
                          <div className="text-sm text-yellow-600">
                            Diferença: R$ {officialAnalysis.pricing_analysis.price_gap.gap_amount.toFixed(2)} 
                            ({officialAnalysis.pricing_analysis.price_gap.gap_percentage.toFixed(1)}%)
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-yellow-700">Preço Atual</div>
                        <div className="text-xl font-semibold">R$ {currentPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ganhador oficial do catálogo e como superar */}
            {winnerData && (
              <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-500 p-2 rounded-lg">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Ganhador atual do catálogo</h3>
                      <p className="text-sm text-gray-600">{winnerData.product_name || 'Produto de catálogo'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Preço do ganhador</div>
                    <div className="text-2xl font-bold text-indigo-700">
                      R$ {winnerData.current_winner.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Logística</div>
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className={winnerData.current_winner.shipping_advantages.free_shipping ? 'text-green-700 font-medium' : 'text-gray-700'}>
                        {winnerData.current_winner.shipping_advantages.free_shipping ? 'Frete grátis' : 'Sem frete grátis'}
                      </div>
                      <div>{winnerData.current_winner.shipping_advantages.is_fulfillment ? 'Mercado Envios Full' : 'Envio padrão'}</div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Vendedor</div>
                    <div className="text-sm text-gray-900 space-y-1">
                      <div>Seller ID: {winnerData.current_winner.seller_id}</div>
                      <div className={winnerData.current_winner.is_official_store ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                        {winnerData.current_winner.is_official_store ? 'Loja oficial' : 'Loja comum'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Gap de preço</div>
                    <div className="text-lg font-bold text-gray-900">
                      {officialAnalysis?.pricing_analysis.price_to_win
                        ? `R$ ${officialAnalysis.pricing_analysis.price_to_win.toFixed(2)}`
                        : 'Calcule a partir do campeão'}
                    </div>
                    <div className="text-xs text-gray-600">Alinhe o preço alvo e mantenha estoque ativo</div>
                  </div>
                </div>
              </div>
            )}

            {/* Ações imediatas para ganhar o catálogo */}
            {executiveSummary && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="h-4 w-4 text-green-700" />
                  <h3 className="text-lg font-semibold text-green-900">Plano rápido para ganhar o catálogo</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    {(executiveSummary.actions_to_win_catalog.length > 0 ? executiveSummary.actions_to_win_catalog : executiveSummary.immediate_actions).map((action, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-green-900">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-3">
                    {officialAnalysis?.pricing_analysis.price_to_win && (
                      <div className="bg-white rounded-lg border border-green-100 p-3">
                        <div className="text-xs uppercase text-green-700 font-semibold mb-1">Preço alvo</div>
                        <div className="text-2xl font-bold text-green-900">
                          R$ {officialAnalysis.pricing_analysis.price_to_win.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">Ajuste para este valor ou menor até conquistar o BuyBox</div>
                      </div>
                    )}
                    {officialAnalysis?.competitive_advantages.available_opportunities.length ? (
                      <div className="bg-white rounded-lg border border-green-100 p-3">
                        <div className="text-xs uppercase text-green-700 font-semibold mb-2">Ative agora</div>
                        <div className="space-y-1">
                          {officialAnalysis.competitive_advantages.available_opportunities.slice(0, 3).map((opp) => (
                            <div key={opp.id} className="flex items-center justify-between text-sm">
                              <span>{opp.name}</span>
                              <span className="text-xs text-green-700">{opp.impact_level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {executiveSummary?.winner_signals && (
                      <div className="bg-white rounded-lg border border-green-100 p-3 text-sm text-gray-800 space-y-1">
                        <div className="text-xs uppercase text-green-700 font-semibold">Vantagens do ganhador</div>
                        <div className={executiveSummary.winner_signals.free_shipping ? 'text-green-700 font-medium' : 'text-gray-600'}>
                          {executiveSummary.winner_signals.free_shipping ? 'Frete grátis ativo' : 'Sem frete grátis'}
                        </div>
                        <div className={executiveSummary.winner_signals.is_fulfillment ? 'text-green-700 font-medium' : 'text-gray-600'}>
                          {executiveSummary.winner_signals.is_fulfillment ? 'Usa Mercado Envios Full' : 'Sem Full'}
                        </div>
                        <div className={executiveSummary.winner_signals.is_official_store ? 'text-blue-700 font-medium' : 'text-gray-600'}>
                          {executiveSummary.winner_signals.is_official_store ? 'Loja oficial' : 'Loja comum'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Concorrentes Oficial */}
            {officialCompetitors && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-red-500 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Concorrentes Oficiais ({officialCompetitors.total_competitors})
                  </h3>
                </div>

                {officialCompetitors.competitors.length > 0 ? (
                  <div className="space-y-3">
                    {officialCompetitors.competitors.slice(0, 5).map((competitor, index) => (
                      <div key={competitor.item_id} className="bg-white p-4 rounded-lg border border-red-100">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">
                              #{index + 1} - {competitor.item_id}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Vendedor: {competitor.seller_id}</span>
                              <span>Estoque: {competitor.available_quantity}</span>
                              <span className={competitor.shipping.free_shipping ? 'text-green-600' : 'text-gray-500'}>
                                {competitor.shipping.free_shipping ? '🚚 Frete Grátis' : '📦 Frete Pago'}
                              </span>
                              {competitor.official_store_id && (
                                <span className="text-blue-600">🏪 Loja Oficial</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-red-600">
                              R$ {competitor.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {competitor.condition}
                            </div>
                          </div>
                        </div>
                        
                        {competitor.buybox_analysis && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">
                                Status: {competitor.buybox_analysis.status}
                              </span>
                              <span className="text-gray-600">
                                Visit Share: {competitor.buybox_analysis.visit_share}
                              </span>
                              <span className="text-gray-600">
                                Nível: {competitor.buybox_analysis.competitive_level}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum concorrente encontrado</p>
                  </div>
                )}

                {/* Insights de Mercado */}
                {officialCompetitors.market_analysis && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Análise de Mercado</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Frete Grátis</div>
                        <div className="font-bold text-blue-600">
                          {officialCompetitors.market_analysis.market_characteristics.free_shipping_adoption.percentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {officialCompetitors.market_analysis.market_characteristics.free_shipping_adoption.count} de {officialCompetitors.market_analysis.market_characteristics.total_analyzed}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Full</div>
                        <div className="font-bold text-blue-600">
                          {officialCompetitors.market_analysis.market_characteristics.fulfillment_adoption.percentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {officialCompetitors.market_analysis.market_characteristics.fulfillment_adoption.count} vendedores
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Lojas Oficiais</div>
                        <div className="font-bold text-blue-600">
                          {officialCompetitors.market_analysis.market_characteristics.official_stores.percentage}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {officialCompetitors.market_analysis.market_characteristics.official_stores.count} lojas
                        </div>
                      </div>
                    </div>
                    
                    {officialCompetitors.market_analysis.competitive_recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">Recomendações Competitivas:</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {officialCompetitors.market_analysis.competitive_recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando dados oficiais do ML...</p>
              </div>
            )}
          </div>
        );

      case 'precificacao':
        return (
          <div className="space-y-6">
            {officialAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Análise de Precificação Oficial</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preço Atual vs Price to Win */}
                  <div className="bg-white p-5 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-4">Comparação de Preços</h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Preço Atual</span>
                        <span className="text-xl font-bold text-gray-900">
                          R$ {officialAnalysis.pricing_analysis.current_price.toFixed(2)}
                        </span>
                      </div>
                      
                      {officialAnalysis.pricing_analysis.price_to_win && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Price to Win</span>
                          <span className="text-xl font-bold text-green-600">
                            R$ {officialAnalysis.pricing_analysis.price_to_win.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {officialAnalysis.pricing_analysis.price_gap && (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Diferença</span>
                            <div className="text-right">
                              <div className="text-lg font-bold text-red-600">
                                R$ {officialAnalysis.pricing_analysis.price_gap.gap_amount.toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ({officialAnalysis.pricing_analysis.price_gap.gap_percentage.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <div className="text-sm text-gray-600">Urgência</div>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              officialAnalysis.pricing_analysis.price_gap.urgency === 'alta' 
                                ? 'bg-red-100 text-red-800' 
                                : officialAnalysis.pricing_analysis.price_gap.urgency === 'média'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {officialAnalysis.pricing_analysis.price_gap.urgency.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status de Ajuste de Preço */}
                  <div className="bg-white p-5 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-4">Status de Ajuste</h4>
                    
                    <div className="text-center">
                      {officialAnalysis.pricing_analysis.price_adjustment_needed ? (
                        <div className="text-yellow-600">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                          <div className="font-medium">Ajuste Recomendado</div>
                          <div className="text-sm mt-1">
                            Seu preço precisa ser ajustado para competir melhor
                          </div>
                        </div>
                      ) : (
                        <div className="text-green-600">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                          <div className="font-medium">Preço Competitivo</div>
                          <div className="text-sm mt-1">
                            Seu preço está bem posicionado
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recomendações Estratégicas */}
                {officialAnalysis.strategic_recommendations.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-3">Recomendações Estratégicas</h4>
                    <ul className="space-y-2">
                      {officialAnalysis.strategic_recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm text-green-800">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'promocoes':
        return (
          <div className="space-y-6">
            {officialAnalysis && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Boosts e Oportunidades Oficiais
                  </h3>
                </div>

                {/* Score de Boost */}
                <div className="bg-white p-5 rounded-lg border border-green-100 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Score de Boost</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {officialAnalysis.competitive_advantages.boost_score.score}/100
                      </div>
                      <div className="text-sm text-gray-500">
                        {officialAnalysis.competitive_advantages.boost_score.active_count} de {officialAnalysis.competitive_advantages.boost_score.total_possible} ativos
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${officialAnalysis.competitive_advantages.boost_score.score}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    {officialAnalysis.competitive_advantages.boost_score.opportunities_count} oportunidades disponíveis
                  </div>
                </div>

                {/* Boosts Ativos */}
                {officialAnalysis.competitive_advantages.active_boosts.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-green-900 mb-3">Boosts Ativos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {officialAnalysis.competitive_advantages.active_boosts.map((boost) => {
                        const boostFormat = mlOfficialService.formatBoostStatus(boost.status);
                        return (
                          <div key={boost.id} className="bg-white p-4 rounded-lg border border-green-100">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span>{boostFormat.icon}</span>
                                <span className="font-medium text-gray-900">{boost.name}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${boostFormat.color} bg-opacity-20`}>
                                {boostFormat.text}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{boost.description}</p>
                            <div className="text-xs text-gray-500">
                              Impacto: {boost.impact_level}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Oportunidades de Boost */}
                {officialAnalysis.competitive_advantages.available_opportunities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-blue-900 mb-3">Oportunidades Disponíveis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {officialAnalysis.competitive_advantages.available_opportunities.map((opportunity) => {
                        const opportunityFormat = mlOfficialService.formatBoostStatus(opportunity.status);
                        return (
                          <div key={opportunity.id} className="bg-white p-4 rounded-lg border border-blue-100">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span>{opportunityFormat.icon}</span>
                                <span className="font-medium text-gray-900">{opportunity.name}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${opportunityFormat.color} bg-opacity-20`}>
                                {opportunityFormat.text}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Impacto: {opportunity.impact_level}
                              </div>
                              <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                                Ativar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Oportunidades Imediatas */}
                {officialAnalysis.immediate_opportunities.length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-900 mb-3">Oportunidades Imediatas</h4>
                    <ul className="space-y-2">
                      {officialAnalysis.immediate_opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Zap className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm text-yellow-800">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'estrategias':
        return (
          <div className="space-y-6">
            {officialAnalysis && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Estratégias Inteligentes
                  </h3>
                </div>

                {/* Análise Competitiva */}
                <div className="bg-white p-5 rounded-lg border border-purple-100 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Cenário Competitivo</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Nível Competitivo</div>
                      <div className="text-lg font-bold text-purple-600">
                        {officialAnalysis.competitive_analysis.competitive_level}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Urgência</div>
                      <div className="text-lg font-bold text-purple-600">
                        {officialAnalysis.competitive_analysis.urgency}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="text-lg font-bold text-purple-600 capitalize">
                        {officialAnalysis.buybox_status.current_status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recomendações de Análise Competitiva */}
                {officialAnalysis.competitive_analysis.recommendations.length > 0 && (
                  <div className="bg-white p-5 rounded-lg border border-purple-100 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recomendações Competitivas</h4>
                    <div className="space-y-3">
                      {officialAnalysis.competitive_analysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="bg-purple-100 p-1 rounded-full">
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Oportunidades de Análise Competitiva */}
                {officialAnalysis.competitive_analysis.opportunities.length > 0 && (
                  <div className="bg-white p-5 rounded-lg border border-purple-100 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Oportunidades Identificadas</h4>
                    <div className="space-y-3">
                      {officialAnalysis.competitive_analysis.opportunities.map((opp, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="bg-yellow-100 p-1 rounded-full">
                            <Sparkles className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{opp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Razões de Bloqueio Resolvidas */}
                {officialAnalysis.blocking_reasons_solved.length > 0 && (
                  <div className="bg-white p-5 rounded-lg border border-purple-100">
                    <h4 className="font-medium text-gray-900 mb-4">Problemas Solucionáveis</h4>
                    <div className="space-y-4">
                      {officialAnalysis.blocking_reasons_solved.map((solution, index) => (
                        <div key={index} className="border-l-4 border-blue-400 pl-4">
                          <div className="font-medium text-gray-900">{solution.problem}</div>
                          <div className="text-sm text-gray-600 mt-1">{solution.solution}</div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Urgência: {solution.urgency}</span>
                            <span>Tempo estimado: {solution.estimated_time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Em Desenvolvimento
            </h3>
            <p className="text-gray-500">
              Esta seção está sendo desenvolvida com dados oficiais do ML.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">BuyBox Intelligence</h2>
                <p className="text-blue-100 text-sm">
                  {item.item_id} • Análise Oficial ML
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {officialAnalysis && getStatusBadge(officialAnalysis.buybox_status.current_status)}
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Score Display */}
          {officialAnalysis && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <div className="text-sm text-blue-100">Score Competitivo</div>
                <div className="text-2xl font-bold">{competitiveScore}/100</div>
              </div>
              
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <div className="text-sm text-blue-100">Preço Atual</div>
                <div className="text-lg font-bold">
                  R$ {officialAnalysis.pricing_analysis.current_price.toFixed(2)}
                </div>
              </div>
              
              {officialAnalysis.pricing_analysis.price_to_win && (
                <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                  <div className="text-sm text-blue-100">Price to Win</div>
                  <div className="text-lg font-bold text-yellow-200">
                    R$ {officialAnalysis.pricing_analysis.price_to_win.toFixed(2)}
                  </div>
                </div>
              )}
              
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <div className="text-sm text-blue-100">Visit Share</div>
                <div className="text-lg font-bold capitalize">
                  {officialAnalysis.buybox_status.visit_share || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default BuyBoxModal;
