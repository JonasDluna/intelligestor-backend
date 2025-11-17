'use client';

import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SalesChartProps {
  data: Array<{ data: string; total: number }>;
  loading?: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando grÃ¡fico...</div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    valor: item.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
        <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
        />
        <Area type="monotone" dataKey="valor" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

interface RevenueChartProps {
  data: Array<{ nome: string; receita_total: number; quantidade_vendida: number }>;
  loading?: boolean;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando grÃ¡fico...</div>
      </div>
    );
  }

  const chartData = data.slice(0, 6).map((item) => ({
    produto: item.nome.length > 20 ? item.nome.substring(0, 20) + '...' : item.nome,
    receita: item.receita_total,
    vendas: item.quantidade_vendida,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="produto" stroke="#6B7280" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
        <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
        <Tooltip 
          formatter={(value: number, name: string) => [name === 'receita' ? formatCurrency(value) : value, name === 'receita' ? 'Receita' : 'Vendas']}
          contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
        />
        <Legend />
        <Bar dataKey="receita" fill="#3B82F6" radius={[8, 8, 0, 0]} />
        <Bar dataKey="vendas" fill="#6366F1" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface TrendChartProps {
  data: Array<{ data: string; total: number }>;
  loading?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando grÃ¡fico...</div>
      </div>
    );
  }

  const chartData = data.slice(0, 14).map((item) => ({
    date: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    valor: item.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '11px' }} />
        <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
        />
        <Line type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
