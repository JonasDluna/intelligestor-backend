'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/templates/AppLayout';
import ProtectedRoute from '@/components/templates/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import {
  LayoutDashboard,
  Package,
  Target,
  MessageSquare,
  ShoppingCart,
  ArrowLeft,
  CheckCircle2,
  LogOut,
  Link as LinkIcon,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const TABS: Array<{ id: TabType; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'anuncios', label: 'Meus Anúncios', icon: Package },
  { id: 'catalogo', label: 'Catálogo ML', icon: BookOpen },
  { id: 'buybox', label: 'Monitor BuyBox', icon: Target },
  { id: 'perguntas', label: 'Perguntas', icon: MessageSquare },
  { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
];

export default function MercadoLivrePage() {
  return (
    <ProtectedRoute>
      <MercadoLivreContent />
    </ProtectedRoute>
  );
}

function MercadoLivreContent() {
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [mlUserData, setMlUserData] = useState<{ nickname?: string; ml_user_id?: string } | null>(null);
  const [backendVersion, setBackendVersion] = useState<string>('');
  const [banner, setBanner] = useState<null | { type: 'success' | 'error'; message: string }>(null);
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  const popupIntervalRef = useRef<number | null>(null);
  const popupFallbackRef = useRef<number | null>(null);

  const clearPopupWatchers = useCallback(() => {
    if (popupIntervalRef.current) {
      window.clearInterval(popupIntervalRef.current);
      popupIntervalRef.current = null;
    }
    if (popupFallbackRef.current) {
      window.clearTimeout(popupFallbackRef.current);
      popupFallbackRef.current = null;
    }
  }, []);

  const checkBackendVersion = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/health`);
      if (response.ok) {
        const data = await response.json();
        if (data?.version) {
          setBackendVersion(data.version);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar versão backend:', error);
    }
  }, []);

  const checkMLConnection = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token || !userId) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      // Se não houver integrationId configurado, tentar buscar agora
      let currentIntegrationId = integrationId;
      if (!currentIntegrationId) {
        const listResp = await fetch(`${API_BASE_URL}/integrations/ml?user_id=${userId}&ts=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });
        if (listResp.ok) {
          const listData = await listResp.json();
          const first = listData?.integrations?.[0];
          if (first?.id) {
            currentIntegrationId = first.id as string;
            setIntegrationId(currentIntegrationId);
          }
        }
      }

      if (!currentIntegrationId) {
        setIsConnected(false);
        setMlUserData(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/integrations/ml/${currentIntegrationId}/status?user_id=${userId}&ts=${Date.now()}` , {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        const connected = (data?.status === 'connected');
        setIsConnected(connected);
        if (connected) {
          setMlUserData({
            nickname: data.nickname,
            ml_user_id: data.ml_user_id
          });
        } else {
          setMlUserData(null);
        }
      } else {
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
  }, [integrationId, userId]);

  const connectToML = useCallback(async () => {
    if (!userId) return;

    const token = localStorage.getItem('auth_token');
    try {
      // Garantir que temos uma integration
      let currentIntegrationId = integrationId;
      if (!currentIntegrationId) {
        const listResp = await fetch(`${API_BASE_URL}/integrations/ml?user_id=${userId}&ts=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });
        if (listResp.ok) {
          const listData = await listResp.json();
          const first = listData?.integrations?.[0];
          if (first?.id) {
            currentIntegrationId = first.id as string;
            setIntegrationId(currentIntegrationId);
          }
        }
      }

      if (!currentIntegrationId) {
        alert('Integração do Mercado Livre não configurada. Crie uma integração nas Configurações.');
        return;
      }

      // Obter auth_url da integração
      const resp = await fetch(`${API_BASE_URL}/integrations/ml/${currentIntegrationId}/auth-url?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!resp.ok) {
        const txt = await resp.text();
        alert('Não foi possível iniciar a conexão: ' + txt);
        return;
      }
      const { auth_url } = await resp.json();
      const authUrl = auth_url as string;

    // Criar janela popup para autenticação
    const popup = window.open(
      authUrl,
      'ml-auth',
      'width=600,height=700,left=' + (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 350),
    );

    if (!popup) {
      alert('Não foi possível abrir o popup de autenticação. Verifique o bloqueador de pop-ups.');
      return;
    }

    clearPopupWatchers();

    // Monitorar a janela popup
    popupIntervalRef.current = window.setInterval(() => {
      if (popup.closed) {
        clearPopupWatchers();
        window.setTimeout(() => {
          checkMLConnection();
        }, 2000);
      }
    }, 1000);

    // Fallback: verificar após 30 segundos mesmo se a janela não fechar
    popupFallbackRef.current = window.setTimeout(() => {
      clearPopupWatchers();
      if (!popup.closed) {
        popup.close();
      }
      checkMLConnection();
    }, 30000);
    } catch (e) {
      console.error('Erro ao iniciar conexão ML:', e);
      alert('Não foi possível iniciar a conexão. Tente novamente.');
    }
  }, [checkMLConnection, clearPopupWatchers, userId, integrationId]);

  const disconnectFromML = useCallback(async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Mercado Livre?')) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!integrationId || !userId) {
        alert('Integração não encontrada.');
        setIsDisconnecting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/integrations/ml/${integrationId}/disconnect?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (response.ok) {
        setIsConnected(false);
        setMlUserData(null);
        setBanner({ type: 'success', message: 'Conta Mercado Livre desconectada com sucesso.' });
        setTimeout(() => setBanner(null), 5000);
        // Pequeno atraso para garantir conclusão no backend
        setTimeout(() => {
          checkMLConnection();
          // Segunda verificação para evitar cache/condições de corrida
          setTimeout(() => {
            checkMLConnection();
          }, 800);
        }, 400);
      } else {
        alert('❌ Erro ao desconectar. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao desconectar ML:', error);
      alert('❌ Erro ao desconectar. Tente novamente.');
    } finally {
      setIsDisconnecting(false);
    }
  }, [checkMLConnection, integrationId, userId]);

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
    return () => {
      window.removeEventListener('message', handleMessage);
      clearPopupWatchers();
    };
  }, [checkBackendVersion, checkMLConnection, clearPopupWatchers, user]);

  // Banner de sucesso/erro via query (?connected=1 | ?error=...)
  useEffect(() => {
    const connected = searchParams?.get('connected');
    const error = searchParams?.get('error');
    if (!connected && !error) return;

    if (connected === '1') {
      setBanner({ type: 'success', message: 'Conta Mercado Livre conectada com sucesso.' });
      // Garante atualização do status após o redirect final
      setTimeout(() => {
        checkMLConnection();
      }, 800);
    }
    if (error) {
      setBanner({ type: 'error', message: `Falha na conexão: ${decodeURIComponent(error)}` });
    }

    // Remove os parâmetros da URL para evitar reaparecer ao recarregar
    const url = new URL(window.location.href);
    url.searchParams.delete('connected');
    url.searchParams.delete('error');
    router.replace(url.pathname + (url.search ? '?' + url.searchParams.toString() : ''));

    // Auto-fecha o banner após 5s
    const t = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(t);
  }, [searchParams, router, checkMLConnection]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {banner && (
          <div
            className={`flex items-start justify-between gap-4 px-4 py-3 rounded-lg border text-sm ${
              banner.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {banner.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{banner.message}</span>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="shrink-0 text-xs underline underline-offset-2"
            >
              Fechar
            </button>
          </div>
        )}
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
              {TABS.map((tab) => {
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
