'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Brain, TrendingUp, AlertTriangle, Target, DollarSign, Zap, Users, Trophy } from 'lucide-react';
import { aiService } from '../services/aiService';

interface CatalogItem {
  ml_id: string;
  status: string;
  my_price: number;
  price_to_win?: number;
  price_difference_percent?: number;
  title?: string;
}

interface AIInsightsDashboardProps {
  items: CatalogItem[];
  userId: string;
}

interface DashboardInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  description: string;
  actionable: boolean;
}

export default function AIInsightsDashboard({ items, userId }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalAnalysis, setGlobalAnalysis] = useState<string>('');

  const generateDashboardInsights = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🧠 Gerando insights do dashboard IA para', items.length, 'items');

      // Análise geral dos dados
      const winningItems = items.filter(item => item.status === 'winning').length;
      const competingItems = items.filter(item => item.status === 'competing').length;
      const listedItems = items.filter(item => item.status === 'listed').length;
      const totalItems = items.length;

      // Análise de preços
      const itemsWithPriceIssues = items.filter(item => 
        item.price_difference_percent && item.price_difference_percent > 10
      ).length;

      // Análise de oportunidades
      const itemsWithPriceToWin = items.filter(item => 
        item.price_to_win && item.my_price > item.price_to_win
      ).length;

      // Calcular potencial de revenue
      const potentialRevenue = items.reduce((acc, item) => {
        if (item.price_to_win && item.my_price > item.price_to_win) {
          return acc + (item.my_price - item.price_to_win);
        }
        return acc;
      }, 0);

      const generatedInsights: DashboardInsight[] = [
        {
          type: 'success',
          icon: <Trophy className="h-5 w-5 text-green-600" />,
          title: 'BuyBox Conquistado',
          value: `${winningItems}/${totalItems}`,
          change: `${((winningItems / totalItems) * 100).toFixed(1)}%`,
          description: 'Produtos ganhando o BuyBox',
          actionable: winningItems < totalItems * 0.7
        },
        {
          type: competingItems > totalItems * 0.3 ? 'warning' : 'info',
          icon: <Target className="h-5 w-5 text-blue-600" />,
          title: 'Competindo',
          value: competingItems.toString(),
          change: `${((competingItems / totalItems) * 100).toFixed(1)}%`,
          description: 'Produtos competindo por preço',
          actionable: competingItems > 0
        },
        {
          type: listedItems > 0 ? 'error' : 'success',
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          title: 'Não Competindo',
          value: listedItems.toString(),
          description: 'Produtos não elegíveis para BuyBox',
          actionable: listedItems > 0
        },
        {
          type: itemsWithPriceIssues > 0 ? 'warning' : 'success',
          icon: <DollarSign className="h-5 w-5 text-yellow-600" />,
          title: 'Preços Desalinhados',
          value: itemsWithPriceIssues.toString(),
          description: 'Produtos com preço >10% acima do mercado',
          actionable: itemsWithPriceIssues > 0
        },
        {
          type: itemsWithPriceToWin > 0 ? 'info' : 'success',
          icon: <Zap className="h-5 w-5 text-purple-600" />,
          title: 'Oportunidades',
          value: itemsWithPriceToWin.toString(),
          description: 'Produtos com potencial de ganhar BuyBox',
          actionable: itemsWithPriceToWin > 0
        },
        {
          type: potentialRevenue > 100 ? 'info' : 'success',
          icon: <TrendingUp className="h-5 w-5 text-green-600" />,
          title: 'Potencial de Economia',
          value: `R$ ${potentialRevenue.toFixed(2)}`,
          description: 'Economia potencial com ajustes de preço',
          actionable: potentialRevenue > 50
        }
      ];

      setInsights(generatedInsights);

      // Gerar análise global com IA
      try {
        const globalAnalysisResult = await aiService.analyzeProduct({
          item_data: {
            total_items: totalItems,
            winning_percentage: (winningItems / totalItems) * 100,
            competing_items: competingItems,
            price_issues: itemsWithPriceIssues,
            opportunities: itemsWithPriceToWin
          },
          analysis_type: 'strategy',
          user_context: 'Análise geral do portfólio de produtos',
          market_data: {
            total_items: totalItems,
            performance_summary: `${winningItems} ganhando, ${competingItems} competindo, ${listedItems} não elegíveis`
          }
        }, userId);

        setGlobalAnalysis(globalAnalysisResult.analysis || 'Análise do portfólio concluída');
      } catch (error) {
        console.log('Global analysis not available:', error);
        setGlobalAnalysis(`Portfólio de ${totalItems} produtos analisado. ${winningItems} produtos ganhando BuyBox (${((winningItems / totalItems) * 100).toFixed(1)}%). ${itemsWithPriceToWin} oportunidades de melhoria identificadas.`);
      }

    } catch (error) {
      console.error('❌ Erro ao gerar insights do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [items, userId]);

  useEffect(() => {
    if (items && items.length > 0) {
      generateDashboardInsights();
    }
  }, [items, generateDashboardInsights]);

  const getInsightCardBg = (type: string, actionable: boolean) => {
    if (!actionable) return 'bg-gray-50 border-gray-200';
    
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
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            <div>
              <h3 className="font-semibold text-purple-900">IA Analisando Portfólio</h3>
              <p className="text-sm text-purple-700">Gerando insights inteligentes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Dashboard IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-purple-900">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Insights Inteligentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-purple-700">
            Análise automatizada do seu portfólio com recomendações estratégicas
          </p>
        </CardContent>
      </Card>

      {/* Grid de Insights */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {insights.map((insight, index) => (
          <Card 
            key={index}
            className={`transition-all hover:shadow-md ${getInsightCardBg(insight.type, insight.actionable)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                {insight.icon}
                <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  {insight.title}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {insight.value}
                  </span>
                  {insight.change && (
                    <span className="text-xs text-gray-600">
                      {insight.change}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {insight.description}
                </p>
                {insight.actionable && (
                  <div className="pt-1">
                    <span className="inline-flex items-center text-xs font-medium text-purple-600">
                      ⚡ Ação recomendada
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Análise Global IA */}
      {globalAnalysis && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-indigo-900">
              <Users className="h-5 w-5 text-indigo-600" />
              <span>Análise Estratégica IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {globalAnalysis}
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={generateDashboardInsights}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                🔄 Atualizar Análise
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}