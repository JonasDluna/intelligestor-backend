'use client';
import AppLayout from '@/components/templates/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Warehouse, Package, TrendingDown, AlertTriangle } from 'lucide-react';

export default function EstoquePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Estoque</h1>
          <p className="text-gray-500">Controle de estoque e movimentações</p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Package size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Produtos em Estoque</h3>
              <p className="text-3xl font-bold text-gray-900">342</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-orange-50 p-3 rounded-xl">
                <TrendingDown size={24} className="text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Estoque Baixo</h3>
              <p className="text-3xl font-bold text-gray-900">15</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-red-50 p-3 rounded-xl">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Sem Estoque</h3>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Sistema de estoque em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
