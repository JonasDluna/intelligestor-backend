'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, Button, Input, Alert, Spinner } from '@/components/atoms';
import { LogIn, Mail, Lock, ShoppingBag, Brain, Zap, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !senha) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, senha);
      router.replace('/ecommerce');
    } catch (err: unknown) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">IntelliGestor</h1>
            </div>
            <p className="text-xl text-gray-600">
              Sistema Inteligente de Gestão de E-commerce
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Análise BuyBox com IA</h3>
                <p className="text-sm text-gray-600">
                  Otimize seus preços automaticamente com inteligência artificial
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Integração Mercado Livre</h3>
                <p className="text-sm text-gray-600">
                  Sincronize seus anúncios e gerencie tudo em um só lugar
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Gestão Completa</h3>
                <p className="text-sm text-gray-600">
                  Produtos, estoque, vendas e clientes em uma plataforma única
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <p className="text-sm font-medium mb-2">✨ Novo Recurso</p>
            <p className="text-lg font-bold">
              Geração de descrições com GPT-4
            </p>
            <p className="text-sm text-blue-100 mt-2">
              Crie descrições profissionais para seus produtos em segundos
            </p>
          </div>
        </div>

        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta!</h2>
              <p className="text-gray-600 mt-2">Entre com suas credenciais para continuar</p>
            </div>

            {error && (
              <Alert variant="error" className="mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  autoComplete="current-password"
                  leftIcon={<Lock className="h-5 w-5" />}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
                icon={loading ? <Spinner size="sm" /> : <LogIn />}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link href="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
