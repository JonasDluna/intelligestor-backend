'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2, Lightbulb } from 'lucide-react';
import { aiService } from '../services/aiService';

interface CatalogItem {
  ml_id: string;
  title?: string;
  my_price: number;
  champion_price?: number | null;
  status: string;
  price_to_win?: number;
  price_difference_percent?: number;
  boosts_analysis?: {
    opportunities?: Array<{
      description: string;
    }>;
  };
}

interface AIAnalysisWidgetProps {
  item: CatalogItem;
  userId: string;
}

interface AIInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

export default function AIAnalysisWidget({ item, userId }: AIAnalysisWidgetProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string>('');

  const analyzeItem = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🤖 Analisando item com IA:', item.ml_id);
      
      // Análise de precificação
      const pricingAnalysis = await aiService.analyzeProduct({
        item_data: item as any,
        analysis_type: 'pricing',
        user_context: `Produto ${item.title || item.ml_id} com preço atual R$ ${item.my_price}`,
        market_data: {
          champion_price: item.champion_price,
          status: item.status,
          price_to_win: item.price_to_win
        }
      }, userId);

      // Gerar insights baseados nas análises
      const generatedInsights: AIInsight[] = [];

      // Insight de preço
      if (item.status === 'competing' && item.price_to_win) {
        const priceDiff = ((item.my_price - item.price_to_win) / item.price_to_win * 100);
        if (priceDiff > 5) {
          generatedInsights.push({
            type: 'warning',
            title: 'Preço Não Competitivo',
            description: `Seu preço está ${priceDiff.toFixed(1)}% acima do necessário para ganhar o BuyBox`,
            action: `Reduza para R$ ${item.price_to_win?.toFixed(2)} para competir`,
            confidence: 0.9
          });
        }
      }

      // Insight de status BuyBox
      if (item.status === 'winning') {
        generatedInsights.push({
          type: 'success',
          title: 'Ganhando BuyBox! 🏆',
          description: 'Produto está na melhor posição competitiva',
          action: 'Mantenha qualidade do anúncio e estoque',
          confidence: 0.95
        });
      }

      // Insight de IA personalizado
      if (pricingAnalysis.key_insights && pricingAnalysis.key_insights.length > 0) {
        generatedInsights.push({
          type: 'info',
          title: 'Análise IA',
          description: pricingAnalysis.key_insights[0] || 'Análise realizada com sucesso',
          action: 'Revisar estratégia baseada na IA',
          confidence: pricingAnalysis.confidence_score || 0.75
        });
      }

      setInsights(generatedInsights);
      setLastAnalysis(pricingAnalysis.analysis || 'Análise concluída');

    } catch (error) {
      console.error('❌ Erro na análise de IA:', error);
      
      // Insights de fallback baseados nos dados
      const fallbackInsights: AIInsight[] = [];
      
      if (item.status === 'listed') {
        fallbackInsights.push({
          type: 'error',
          title: 'Produto Não Compete',
          description: 'Item não está participando da disputa do BuyBox',
          action: 'Verifique requisitos de qualidade',
          confidence: 0.9
        });
      }
      
      if (item.price_difference_percent && item.price_difference_percent > 10) {
        fallbackInsights.push({
          type: 'warning',
          title: 'Grande Diferença de Preço',
          description: `${item.price_difference_percent.toFixed(1)}% acima do campeão`,
          action: 'Considere ajuste de preço',
          confidence: 0.85
        });
      }

      setInsights(fallbackInsights);
    } finally {
      setLoading(false);
    }
  }, [item, userId]);

  useEffect(() => {
    if (item && item.ml_id) {
      analyzeItem();
    }
  }, [item, analyzeItem]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200 shadow-sm">
        <div className="flex items-center space-x-3 text-purple-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-semibold">🧠 IA analisando produto...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-1.5 rounded-lg">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Análise Inteligente</span>
        </div>
        <button
          onClick={analyzeItem}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg transition-colors"
          title="Atualizar análise"
        >
          🔄
        </button>
      </div>

      {insights.length > 0 ? (
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`rounded-xl p-3 border-2 shadow-sm transition-all hover:shadow-md ${getInsightBg(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900">
                      {insight.title}
                    </p>
                    <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                      <TrendingUp className="h-3 w-3 text-purple-500" />
                      <span className="text-xs font-semibold text-purple-700">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <div className="mt-2 bg-white/50 rounded-lg p-2 border border-gray-200">
                      <p className="text-xs font-semibold text-purple-700">
                        💡 {insight.action}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border-2 border-gray-200">
          <div className="text-center">
            <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              Nenhum insight disponível
            </p>
            <button
              onClick={analyzeItem}
              className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              🔄 Gerar Análise
            </button>
          </div>
        </div>
      )}

      {lastAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-xl p-3 border-2 border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <p className="text-xs text-purple-900 font-bold">
              Última Análise IA
            </p>
          </div>
          <p className="text-xs text-purple-700 leading-relaxed line-clamp-3">
            {lastAnalysis.substring(0, 200)}...
          </p>
        </div>
      )}
    </div>
  );
}