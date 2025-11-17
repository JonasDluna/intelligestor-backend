'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/templates/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Brain, TrendingUp, Target, Zap, Link as LinkIcon, CheckCircle2, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function MercadoLivrePage() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [mlUserData, setMlUserData] = useState<{ nickname?: string; ml_user_id?: string } | null>(null);

  useEffect(() => {
    // Só verificar se o usuário estiver logado
    if (user) {
      checkMLConnection();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkMLConnection = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token não encontrado no localStorage');
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ml/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        if (data.connected) {
          setMlUserData({
            nickname: data.nickname,
            ml_user_id: data.ml_user_id
          });
        }
      } else if (response.status === 401) {
        console.log('Token inválido ou expirado');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão ML:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToML = () => {
    if (user?.id) {
      const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/ml/login?user_id=${user.id}`;
      window.open(authUrl, '_blank');
      
      // Verificar conexão após 5 segundos
      setTimeout(() => {
        checkMLConnection();
      }, 5000);
    }
  };

  const disconnectFromML = async () => {
    if (!confirm('Tem certeza que deseja desconectar sua conta do Mercado Livre? Você perderá acesso às funcionalidades de sincronização e IA.')) {
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
        alert('✅ Desconectado do Mercado Livre com sucesso!');
      } else {
        throw new Error('Erro ao desconectar');
      }
    } catch (error) {
      console.error('Erro ao desconectar ML:', error);
      alert('❌ Erro ao desconectar. Tente novamente.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Brain className="h-7 w-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">IA - Mercado Livre</h1>
                <p className="text-gray-500">Análise BuyBox e Otimização Inteligente de Preços</p>
              </div>
            </div>
            
            {!isLoading && (
              <div>
                {isConnected ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Conectado ao ML</span>
                    </div>
                    <button
                      onClick={disconnectFromML}
                      disabled={isDisconnecting}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg font-medium transition-colors border border-red-200 disabled:opacity-50"
                      title="Desconectar do Mercado Livre"
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
            )}
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
              <p className="text-3xl font-bold text-gray-900">--</p>
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
              <p className="text-3xl font-bold text-gray-900">--</p>
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
              <p className="text-3xl font-bold text-gray-900">{isConnected ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>

        {!isConnected && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Conecte sua conta do Mercado Livre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Para começar a usar as funcionalidades de IA e sincronização, conecte sua conta do Mercado Livre.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">O que você poderá fazer:</h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                    <li>Sincronizar produtos e estoque automaticamente</li>
                    <li>Análise inteligente de BuyBox e concorrentes</li>
                    <li>Otimização automática de preços com IA</li>
                    <li>Responder perguntas e mensagens automaticamente</li>
                    <li>Gerenciar pedidos e vendas em um só lugar</li>
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
          <Card>
            <CardHeader>
              <CardTitle>Suas Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Mercado Livre</h4>
                      <p className="text-sm text-green-700">
                        {mlUserData?.nickname ? `@${mlUserData.nickname}` : 'Conta conectada e sincronizada'}
                      </p>
                      {mlUserData?.ml_user_id && (
                        <p className="text-xs text-green-600 mt-1">ID: {mlUserData.ml_user_id}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={disconnectFromML}
                    disabled={isDisconnecting}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors px-3 py-1 rounded hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {isDisconnecting ? 'Desconectando...' : 'Desconectar'}
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Dica</h4>
                      <p className="text-sm text-blue-800">
                        Mantenha sua conta conectada para aproveitar sincronização automática, análise de BuyBox e otimização de preços com IA.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
