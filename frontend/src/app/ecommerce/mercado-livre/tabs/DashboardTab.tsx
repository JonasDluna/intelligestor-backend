'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { TrendingUp, Package, DollarSign, Target, Eye, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const DASHBOARD_STATS: Array<{
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}> = [
  {
    label: 'Anúncios Ativos',
    value: '--',
    change: '+0%',
    isPositive: true,
    icon: Package,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    label: 'Vendas Hoje',
    value: '--',
    change: '+0%',
    isPositive: true,
    icon: TrendingUp,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
  },
  {
    label: 'Faturamento',
    value: 'R$ --',
    change: '+0%',
    isPositive: true,
    icon: DollarSign,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-50',
  },
  {
    label: 'Perguntas Pendentes',
    value: '--',
    change: '0%',
    isPositive: false,
    icon: MessageSquare,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
  },
  {
    label: 'Taxa Conversão',
    value: '--%',
    change: '+0%',
    isPositive: true,
    icon: Target,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
  },
  {
    label: 'Visualizações',
    value: '--',
    change: '+0%',
    isPositive: true,
    icon: Eye,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
  },
];

export default function DashboardTab() {

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DASHBOARD_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm text-gray-600 font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Vendas nos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Gráfico de vendas será exibido aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anúncios por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Distribuição de categorias será exibida aqui</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-gray-400 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm mt-1">Conecte-se e sincronize seus dados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
