'use client';

import React from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/atoms';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  AlertCircle, 
  Zap, 
  CheckCircle, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Receita Total',
      value: 'R$ 45.280,00',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Vendas do Mês',
      value: '156',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Produtos Ativos',
      value: '89',
      change: '+5 novos',
      trend: 'up',
      icon: Package,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      title: 'Ticket Médio',
      value: 'R$ 290,26',
      change: '+12.8%',
      trend: 'up',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-pink-600',
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  const alerts = [
    { 
      type: 'warning', 
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      message: '3 produtos com estoque abaixo do mínimo', 
      action: 'Ver detalhes',
    },
    { 
      type: 'info', 
      icon: Zap,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      message: '12 produtos podem ter análise otimizada', 
      action: 'Otimizar agora',
    },
    { 
      type: 'success', 
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      message: 'Você está ganhando em 5 de 10 anúncios', 
      action: 'Analisar',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Header Premium */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600 text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Visão geral e insights com IA
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <Badge variant="success" className="px-4 py-2 text-sm font-medium">
                  Sistema Online
                </Badge>
                <Badge variant="info" className="px-4 py-2 text-sm font-medium">
                  Última atualização: Agora
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              
              <div className="relative p-6">
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500 group-hover:w-full`} 
                      style={{ width: '75%' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts Section Premium */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl ${alert.bgColor} border ${alert.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl ${alert.bgColor} ring-2 ring-white shadow-sm`}>
                    <alert.icon className={`h-6 w-6 ${alert.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-3 leading-relaxed">
                      {alert.message}
                    </p>
                    <button className={`inline-flex items-center gap-2 text-sm font-semibold ${alert.iconColor} hover:gap-3 transition-all duration-200`}>
                      {alert.action}
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendation Card Premium */}
        <div className="relative group overflow-hidden rounded-2xl">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          
          <div className="relative p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Recomendação da IA</h3>
                </div>
                <p className="text-white/90 text-base leading-relaxed mb-6">
                  Seus produtos eletrônicos estão com preços 5% acima da média do mercado. 
                  Ajuste os preços para aumentar competitividade e conquistar mais vendas. 
                  Estimativa de impacto: <span className="font-bold">+15% em conversão</span>.
                </p>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 hover:scale-105 transition-all duration-200 shadow-lg">
                  Aplicar Sugestão
                  <Zap className="h-5 w-5" />
                </button>
              </div>
              <div className="hidden lg:block">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <TrendingUp className="h-16 w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50/50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="p-2 rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                Vendas nos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border-2 border-dashed border-gray-200">
                Nenhum dado de vendas disponível
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50/50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                Produtos Mais Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl border-2 border-dashed border-gray-200">
                Nenhum dado de produtos disponível
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
