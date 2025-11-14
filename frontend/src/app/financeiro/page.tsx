'use client';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { DollarSign } from 'lucide-react';

export default function FinanceiroPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500 mt-1">Gestão financeira e relatórios</p>
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
    </DashboardLayout>
  );
}
