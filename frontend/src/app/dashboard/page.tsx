'use client';

import React from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  AlertCircle, 
  Info, 
  Plus,
  UserPlus,
  Receipt,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'FATURAMENTO TOTAL',
      value: 'R$ 127.450',
      subtitle: 'Últimos 30 dias',
      change: '↑ 15.3%',
      icon: DollarSign,
      iconBg: 'bg-purple-500',
      changeColor: 'text-green-600',
    },
    {
      title: 'VENDAS REALIZADAS',
      value: '342',
      subtitle: 'Pedidos no mês',
      change: '↑ 8.2%',
      icon: ShoppingCart,
      iconBg: 'bg-blue-500',
      changeColor: 'text-green-600',
    },
    {
      title: 'CLIENTES ATIVOS',
      value: '1.248',
      subtitle: 'Base total',
      change: '↑ 3.7%',
      icon: UserPlus,
      iconBg: 'bg-purple-500',
      changeColor: 'text-green-600',
    },
    {
      title: 'TICKET MÉDIO',
      value: 'R$ 372',
      subtitle: 'Por venda',
      change: '↓ 2.1%',
      icon: TrendingUp,
      iconBg: 'bg-blue-500',
      changeColor: 'text-red-600',
    },
    {
      title: 'CONTAS A RECEBER',
      value: 'R$ 45.230',
      subtitle: 'Próximos 30 dias',
      change: '↑ 18.2%',
      icon: Receipt,
      iconBg: 'bg-purple-500',
      changeColor: 'text-green-600',
    },
  ];

  const quickActions = [
    { icon: Plus, label: 'Nova Venda' },
    { icon: UserPlus, label: 'Novo Cliente' },
    { icon: Package, label: 'Novo Produto' },
    { icon: Receipt, label: 'Contas a Receber' },
    { icon: FileText, label: 'Contas a Pagar' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu negócio em tempo real</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Icon and Change */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
              
              {/* Title */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded bg-blue-100">
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Ações Rápidas</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                  <action.icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-blue-100">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Sistema IntelliGest v8</span> · 
                Conectado ao Supabase. Para mais informações, consulte o{' '}
                <a href="#" className="text-blue-600 hover:underline font-medium">
                  termo de uso e política de privacidade
                </a>.
              </p>
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-gray-800 text-base font-semibold">
                Vendas nos Últimos 7 Dias
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-gray-800 text-base font-semibold">
                Produtos Mais Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
