'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, Button, Input, Alert, Spinner } from '@/components/atoms';
import { UserPlus, Mail, Lock, User, Building, ShoppingBag, Brain, Zap, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegistroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!nome || !email || !senha || !confirmarSenha) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register({
        nome,
        email,
        senha,
        empresa: empresa || undefined,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Coluna Esquerda - Informações */}
        <div className="hidden lg:block space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">IntelliGestor</h1>
            </div>
            <p className="text-xl text-gray-600">
              Comece gratuitamente e transforme seu e-commerce
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

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            <p className="text-sm font-medium mb-2">🎉 Grátis para começar</p>
            <p className="text-lg font-bold">
              Sem cartão de crédito necessário
            </p>
            <p className="text-sm text-green-100 mt-2">
              Crie sua conta e comece a usar agora mesmo
            </p>
          </div>
        </div>

        {/* Coluna Direita - Formulário */}
        <Card className="shadow-2xl">
          <CardContent className="p-8">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
              <ArrowLeft className="h-4 w-4" />
              Voltar para login
            </Link>

            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Criar conta grátis</h2>
              <p className="text-gray-600 mt-2">Preencha seus dados para começar</p>
            </div>

            {error && (
              <Alert variant="error" className="mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  leftIcon={<User className="h-5 w-5" />}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail *
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa (opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Nome da sua empresa"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  leftIcon={<Building className="h-5 w-5" />}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  leftIcon={<Lock className="h-5 w-5" />}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar senha *
                </label>
                <Input
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
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
                icon={loading ? <Spinner size="sm" /> : <UserPlus />}
              >
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Fazer login
                </Link>
              </p>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              Ao criar uma conta, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a>
              {' '}e{' '}
              <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
