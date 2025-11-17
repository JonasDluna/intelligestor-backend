'use client';
import AppLayout from '@/components/templates/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';

export default function VendasPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendas</h1>
          <p className="text-gray-500">Histórico e análise de vendas</p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <DollarSign size={24} className="text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Vendas Hoje</h3>
              <p className="text-3xl font-bold text-gray-900">R$ 12.450</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-blue-50 p-3 rounded-xl">
                <ShoppingCart size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Pedidos</h3>
              <p className="text-3xl font-bold text-gray-900">48</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-purple-50 p-3 rounded-xl">
                <Users size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Novos Clientes</h3>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Relatório de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Análise de vendas em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
