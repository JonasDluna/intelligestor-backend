'use client';

import ProtectedRoute from '@/components/templates/ProtectedRoute';
import AppLayout from '@/components/templates/AppLayout';
import { DollarSign, ShoppingBag, Users, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      label: 'Preços Campeões',
      value: '15',
      icon: DollarSign,
      change: '+12.5%',
      isPositive: true,
      subtitle: 'vs last month',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      label: 'Alertas Ativos',
      value: '3',
      icon: ShoppingBag,
      change: '+8.2%',
      isPositive: true,
      subtitle: 'vs last month',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50'
    },
    {
      label: 'Perdendo Posição',
      value: '5',
      icon: Users,
      change: '+15.3%',
      isPositive: false,
      subtitle: 'vs last month',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50'
    },
    {
      label: 'Ajustes Automáticos',
      value: '8',
      icon: TrendingUp,
      change: '+3.1%',
      isPositive: true,
      subtitle: 'vs last month',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header com saudação */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Admin!</h1>
          <p className="text-gray-500">It is the best time to manage your finances</p>
        </div>

        {/* Stats Grid - 4 cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.iconBg} p-3 rounded-xl`}>
                    <Icon size={24} className={stat.iconColor} strokeWidth={2} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ArrowUpRight size={20} />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 font-medium mb-1">{stat.label}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <div className="flex items-center text-sm">
                    {stat.isPositive ? (
                      <span className="text-emerald-600 flex items-center">
                        <ArrowUpRight size={16} className="mr-1" />
                        {stat.change}
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center">
                        <ArrowDownRight size={16} className="mr-1" />
                        {stat.change}
                      </span>
                    )}
                    <span className="text-gray-500 ml-2">{stat.subtitle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contas a Receber - Card maior */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-pink-50 p-3 rounded-xl">
              <CreditCard size={24} className="text-pink-600" strokeWidth={2} />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <ArrowUpRight size={20} />
            </button>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Contas a Receber</h3>
            <p className="text-3xl font-bold text-gray-900 mb-2">R$ 45.230</p>
            <div className="flex items-center text-sm">
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight size={16} className="mr-1" />
                +5.7%
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <button className="flex flex-col items-center justify-center p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
              <div className="bg-indigo-100 p-3 rounded-xl mb-3 group-hover:bg-indigo-200 transition-colors">
                <ShoppingBag className="text-indigo-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">Nova Venda</span>
            </button>
            <button className="flex flex-col items-center justify-center p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
              <div className="bg-indigo-100 p-3 rounded-xl mb-3 group-hover:bg-indigo-200 transition-colors">
                <Users className="text-indigo-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">Clientes</span>
            </button>
            <button className="flex flex-col items-center justify-center p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
              <div className="bg-indigo-100 p-3 rounded-xl mb-3 group-hover:bg-indigo-200 transition-colors">
                <DollarSign className="text-indigo-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">Pagamento</span>
            </button>
            <button className="flex flex-col items-center justify-center p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
              <div className="bg-indigo-100 p-3 rounded-xl mb-3 group-hover:bg-indigo-200 transition-colors">
                <CreditCard className="text-indigo-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">Contas</span>
            </button>
            <button className="flex flex-col items-center justify-center p-5 border-2 border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
              <div className="bg-indigo-100 p-3 rounded-xl mb-3 group-hover:bg-indigo-200 transition-colors">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">Relatórios</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Sistema Online</h3>
              <p className="text-indigo-100 text-sm">Todos os serviços operando normalmente</p>
            </div>
            <div className="bg-white/20 px-5 py-2.5 rounded-xl backdrop-blur-sm border border-white/30">
              <span className="text-sm font-semibold flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Operacional
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
