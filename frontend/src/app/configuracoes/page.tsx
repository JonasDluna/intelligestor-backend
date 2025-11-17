'use client';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Settings } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ConfiguraÃ§Ãµes</h1>
          <p className="text-gray-500 mt-1">PreferÃªncias e configuraÃ§Ãµes do sistema</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>ConfiguraÃ§Ãµes Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Painel de configuraÃ§Ãµes em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
