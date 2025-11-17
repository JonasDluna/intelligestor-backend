'use client';
import AppLayout from '@/components/templates/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';

export default function FinanceiroPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financeiro</h1>
          <p className="text-gray-500">Gestão financeira e relatórios</p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <DollarSign size={24} className="text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Saldo Total</h3>
              <p className="text-3xl font-bold text-gray-900">R$ 87.450</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-blue-50 p-3 rounded-xl">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Receitas</h3>
              <p className="text-3xl font-bold text-gray-900">R$ 125.300</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-red-50 p-3 rounded-xl">
                <TrendingDown size={24} className="text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Despesas</h3>
              <p className="text-3xl font-bold text-gray-900">R$ 37.850</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-purple-50 p-3 rounded-xl">
                <CreditCard size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">A Receber</h3>
              <p className="text-3xl font-bold text-gray-900">R$ 45.230</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Controle Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Módulo financeiro em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
