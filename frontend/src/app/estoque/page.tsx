'use client';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/atoms';
import { Warehouse } from 'lucide-react';

export default function EstoquePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-500 mt-1">Controle de estoque e movimentações</p>
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
    </DashboardLayout>
  );
}
