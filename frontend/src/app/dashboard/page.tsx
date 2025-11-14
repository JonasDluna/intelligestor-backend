'use client';

import React from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatsCard } from '@/components/molecules/StatsCard';
import { SalesChart, RevenueChart, TrendChart } from '@/components/molecules/Charts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/atoms';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Brain,
  Zap,
  Target,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useEstatisticasVendas, useProdutos, useEstoque } from '@/lib/hooks';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: vendas, isLoading: loadingVendas } = useEstatisticasVendas();
  const { data: produtos, isLoading: loadingProdutos } = useProdutos({ limit: 10 });
  const { data: estoque, isLoading: loadingEstoque } = useEstoque({ limit: 10 });

  const estatisticas = vendas?.data;
  const produtosData = produtos?.data?.items || [];
  const estoqueData = estoque?.data?.items || [];

  const totalProdutos = produtosData.length;
  const estoqueBaixo = estoqueData.filter((item: any) => 
    item.quantidade_disponivel <= item.estoque_minimo
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral e insights de IA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Receita Total"
            value={estatisticas?.receita_total ? formatCurrency(estatisticas.receita_total) : 'R$ 0,00'}
            change={estatisticas?.variacao_receita}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            loading={loadingVendas}
          />

          <StatsCard
            title="Vendas do Mês"
            value={estatisticas?.total_vendas || 0}
            change={estatisticas?.variacao_vendas}
            icon={ShoppingCart}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            loading={loadingVendas}
          />

          <StatsCard
            title="Produtos Ativos"
            value={totalProdutos}
            icon={Package}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
            loading={loadingProdutos}
          />

          <StatsCard
            title="Ticket Médio"
            value={estatisticas?.ticket_medio ? formatCurrency(estatisticas.ticket_medio) : 'R$ 0,00'}
            change={estatisticas?.variacao_ticket}
            icon={TrendingUp}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
            loading={loadingVendas}
          />
        </div>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Insights Inteligentes
              <Badge variant="info" size="sm">IA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Alerta de Estoque</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {estoqueBaixo} produtos com estoque abaixo do mínimo
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-amber-700 hover:text-amber-900">
                      Ver detalhes <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Otimização de Preços</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      12 produtos podem ter preços otimizados
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-blue-700 hover:text-blue-900">
                      Otimizar agora <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">BuyBox Conquistado</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Você está ganhando em 8 de 15 anúncios
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-green-700 hover:text-green-900">
                      Analisar <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-start gap-3">
                <Sparkles className="h-6 w-6 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">Recomendação do Dia</h4>
                  <p className="text-sm text-purple-100 leading-relaxed">
                    Seus produtos eletrônicos estão com preços 8% acima da média do mercado. 
                    Ajuste os preços para aumentar competitividade e conquistar mais vendas. 
                    Estimativa de impacto: +15% em conversão.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 bg-white text-purple-600 hover:bg-purple-50">
                    Aplicar Sugestão
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Vendas dos Últimos 30 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estatisticas?.vendas_por_dia && estatisticas.vendas_por_dia.length > 0 ? (
                <SalesChart data={estatisticas.vendas_por_dia} loading={loadingVendas} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Nenhum dado de vendas disponível
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-600" />
                Top 6 Produtos por Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estatisticas?.top_produtos && estatisticas.top_produtos.length > 0 ? (
                <RevenueChart data={estatisticas.top_produtos} loading={loadingVendas} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Nenhum dado de produtos disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Tendência de Receita - Últimas 2 Semanas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estatisticas?.vendas_por_dia && estatisticas.vendas_por_dia.length > 0 ? (
              <TrendChart data={estatisticas.vendas_por_dia} loading={loadingVendas} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                Nenhum dado de tendência disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                <Package className="h-6 w-6" />
                <span className="text-sm">Novo Produto</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                <Brain className="h-6 w-6" />
                <span className="text-sm">Analisar BuyBox</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                <Zap className="h-6 w-6" />
                <span className="text-sm">Otimizar Preços</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                <Sparkles className="h-6 w-6" />
                <span className="text-sm">Gerar Descrições</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
