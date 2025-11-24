'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/templates/AppLayout';
import ProtectedRoute from '@/components/templates/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { 
  LayoutDashboard, Package, Target, MessageSquare, ShoppingCart, 
  ArrowLeft, CheckCircle2, LogOut, Link as LinkIcon, AlertCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Importar componentes das abas
import DashboardTab from './tabs/DashboardTab';
import MeusAnunciosTab from './tabs/MeusAnunciosTab';
import MonitorBuyBoxTab from './tabs/MonitorBuyBoxTab';
import PerguntasTab from './tabs/PerguntasTab';
import VendasTab from './tabs/VendasTab';
import CatalogoTab from './tabs/CatalogoTab';

type TabType = 'dashboard' | 'anuncios' | 'catalogo' | 'buybox' | 'perguntas' | 'vendas';

export default function MercadoLivrePage() {
  return (
    <ProtectedRoute>
      <MercadoLivreContent />
    </ProtectedRoute>
  );
}

function MercadoLivreContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [mlUserData, setMlUserData] = useState<{ nickname?: string; ml_user_id?: string } | null>(null);
  const [backendVersion, setBackendVersion] = useState<string>('');

  useEffect(() => {
    if (user) {
      checkMLConnection();
      checkBackendVersion();
    } else {
      setIsLoading(false);
    }

    // Listener para mensagens do popup de autenticação
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'ML_AUTH_SUCCESS') {
        setTimeout(() => checkMLConnection(), 1000);
      } else if (event.data.type === 'ML_AUTH_ERROR') {
        alert('❌ Erro na autenticação: ' + event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  const checkBackendVersion = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ml/health`);
      if (response.ok) {
        const data = await response.json();
        setBackendVersion(data.version);
      }
    } catch (error) {
      console.error('Erro ao verificar versão backend:', error);
    }
  };

  const checkMLConnection = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      console.log('[DEBUG] Verificando conexão ML, token:', token ? 'existe' : 'não existe');
      
      if (!token) {
        console.log('[DEBUG] Sem token, definindo como desconectado');
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ml/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('[DEBUG] Status response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[DEBUG] Status data:', data);
        
        setIsConnected(data.connected);
        if (data.connected) {
          setMlUserData({
            nickname: data.nickname,
            ml_user_id: data.ml_user_id
          });
          console.log('[DEBUG] Conectado como:', data.nickname);
        } else {
          console.log('[DEBUG] ML não conectado');
          setMlUserData(null);
        }
      } else {
        console.log('[DEBUG] Erro na resposta:', response.status);
        setIsConnected(false);
        setMlUserData(null);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão ML:', error);
      setIsConnected(false);
      setMlUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToML = () => {
    if (user?.id) {
      const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/ml/login?user_id=${user.id}`;
      
      // Criar janela popup para autenticação
      const popup = window.open(
        authUrl, 
        'ml-auth', 
        'width=600,height=700,left=' + (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 350)
      );
      
      // Monitorar a janela popup
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Aguardar um pouco e verificar conexão
          setTimeout(() => {
            checkMLConnection();
          }, 2000);
        }
      }, 1000);
      
      // Fallback: verificar após 30 segundos mesmo se a janela não fechar
      setTimeout(() => {
        clearInterval(checkClosed);
        if (!popup?.closed) {
          popup?.close();
        }
        checkMLConnection();
      }, 30000);
    }
  };

  const disconnectFromML = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Mercado Livre?')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ml/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsConnected(false);
        setMlUserData(null);
        // Forçar atualização da página automaticamente
        window.location.reload();
      } else {
        alert('❌ Erro ao desconectar. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao desconectar ML:', error);
      alert('❌ Erro ao desconectar. Tente novamente.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'anuncios', label: 'Meus Anúncios', icon: Package },
    { id: 'catalogo', label: 'Catálogo ML', icon: BookOpen },
    { id: 'buybox', label: 'Monitor BuyBox', icon: Target },
    { id: 'perguntas', label: 'Perguntas', icon: MessageSquare },
    { id: 'vendas', label: 'Vendas', icon: ShoppingCart }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header com voltar */}
        <div>
          <Link href="/ecommerce" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar para E-commerce
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Package className="h-7 w-7 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mercado Livre</h1>
                <p className="text-gray-500">Gerencie seus anúncios e monitore vendas</p>
              </div>
            </div>
            
            {!isLoading && (
              <div className="flex flex-col items-end gap-2">
                {backendVersion && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono ${
                    backendVersion === '9b23f08' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                  }`}>
                    <AlertCircle className="h-3 w-3" />
                    Backend: {backendVersion}
                  </div>
                )}
                <div>
                  {isConnected ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Conectado</span>
                        {mlUserData?.nickname && (
                          <span className="text-sm">@{mlUserData.nickname}</span>
                        )}
                      </div>
                      <button
                        onClick={disconnectFromML}
                        disabled={isDisconnecting}
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200 disabled:opacity-50"
                      >
                        <LogOut className="h-5 w-5" />
                        {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={connectToML}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      <LinkIcon className="h-5 w-5" />
                      Conectar com Mercado Livre
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        {isConnected && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content */}
        {!isConnected && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Conecte sua conta do Mercado Livre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Para acessar o dashboard e funcionalidades, conecte sua conta do Mercado Livre.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">O que você poderá fazer:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                    <li>Ver dashboard com estatísticas em tempo real</li>
                    <li>Gerenciar todos os seus anúncios</li>
                    <li>Monitorar BuyBox e concorrência</li>
                    <li>Responder perguntas rapidamente</li>
                    <li>Acompanhar vendas e pedidos</li>
                  </ul>
                </div>
                <button
                  onClick={connectToML}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                  <LinkIcon className="h-5 w-5" />
                  Conectar Agora
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {isConnected && (
          <div>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'anuncios' && <MeusAnunciosTab />}
            {activeTab === 'catalogo' && <CatalogoTab userId={mlUserData?.ml_user_id || ''} />}
            {activeTab === 'buybox' && <MonitorBuyBoxTab userId={mlUserData?.ml_user_id || 'default'} />}
            {activeTab === 'perguntas' && <PerguntasTab />}
            {activeTab === 'vendas' && <VendasTab />}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
