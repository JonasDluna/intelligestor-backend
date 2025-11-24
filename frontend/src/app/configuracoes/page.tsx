'use client';
import AppLayout from '@/components/templates/AppLayout';
import ProtectedRoute from '@/components/templates/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Settings, User, Bell, Shield, Database } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <ConfiguracoesContent />
    </ProtectedRoute>
  );
}

function ConfiguracoesContent() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-500">Preferências e configurações do sistema</p>
        </div>

        {/* Opções de configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Perfil</h3>
                <p className="text-sm text-gray-600">Gerencie suas informações pessoais</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <Bell size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Notificações</h3>
                <p className="text-sm text-gray-600">Configure alertas e notificações</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="bg-emerald-50 p-3 rounded-xl">
                <Shield size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Segurança</h3>
                <p className="text-sm text-gray-600">Senha e autenticação</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="bg-orange-50 p-3 rounded-xl">
                <Database size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Integrações</h3>
                <p className="text-sm text-gray-600">APIs e conexões externas</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Painel de configurações em desenvolvimento...</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
