'use client';

import React from 'react';
import AppLayout from '@/components/templates/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';

export default function MercadoLivrePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Brain className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IA - Mercado Livre</h1>
              <p className="text-gray-500">Análise BuyBox e Otimização Inteligente de Preços</p>
            </div>
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-yellow-50 p-3 rounded-xl">
                <Target size={24} className="text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">BuyBox Ativo</h3>
              <p className="text-3xl font-bold text-gray-900">34</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <TrendingUp size={24} className="text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">Otimizações Hoje</h3>
              <p className="text-3xl font-bold text-gray-900">127</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="bg-purple-50 p-3 rounded-xl">
                <Zap size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-600 font-medium mb-1">IA Ativa</h3>
              <p className="text-3xl font-bold text-gray-900">Sim</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Esta funcionalidade estará disponível em breve.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
