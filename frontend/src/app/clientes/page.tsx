'use client';
import AppLayout from '@/components/templates/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Users, Plus, UserPlus, TrendingUp } from 'lucide-react';

export default function ClientesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
            <p className="text-gray-500">Base de clientes e histórico</p>
          </div>
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all">
            <Plus size={18} />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Total de Clientes</h3>
              <p className="text-3xl font-bold text-gray-900">847</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <UserPlus size={24} className="text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Novos Este Mês</h3>
              <p className="text-3xl font-bold text-gray-900">42</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-purple-50 p-3 rounded-xl">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Clientes Ativos</h3>
              <p className="text-3xl font-bold text-gray-900">652</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Gestão de clientes em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
