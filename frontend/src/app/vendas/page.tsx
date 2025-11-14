'use client';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { TrendingUp } from 'lucide-react';

export default function VendasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-500 mt-1">Histórico e análise de vendas</p>
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
    </DashboardLayout>
  );
}
