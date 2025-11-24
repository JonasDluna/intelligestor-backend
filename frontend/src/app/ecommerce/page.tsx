'use client';

import React from 'react';
import AppLayout from '@/components/templates/AppLayout';
import ProtectedRoute from '@/components/templates/ProtectedRoute';
import { Card, CardContent } from '@/components/atoms';
import { ShoppingCart, Package, TrendingUp, MessageSquare, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function EcommercePage() {
  return (
    <ProtectedRoute>
      <EcommerceContent />
    </ProtectedRoute>
  );
}

function EcommerceContent() {
  const platforms = [
    {
      name: 'Mercado Livre',
      icon: Package,
      description: 'Gerencie anúncios, monitore BuyBox e otimize vendas',
      href: '/ecommerce/mercado-livre',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      hoverBg: 'hover:bg-yellow-100',
      status: 'active'
    },
    {
      name: 'Shopee',
      icon: ShoppingCart,
      description: 'Integração com Shopee (em breve)',
      href: '#',
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-100',
      status: 'coming-soon'
    },
    {
      name: 'Amazon',
      icon: TrendingUp,
      description: 'Integração com Amazon (em breve)',
      href: '#',
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-100',
      status: 'coming-soon'
    },
    {
      name: 'Shopify',
      icon: MessageSquare,
      description: 'Integração com Shopify (em breve)',
      href: '#',
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-100',
      status: 'coming-soon'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl">
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">E-commerce</h1>
              <p className="text-gray-500">Gerencie todas as suas integrações de marketplace</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Total Anúncios</h3>
            <p className="text-3xl font-bold text-gray-900">--</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Vendas Hoje</h3>
            <p className="text-3xl font-bold text-gray-900">--</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-yellow-50 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Faturamento</h3>
            <p className="text-3xl font-bold text-gray-900">--</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-xl">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 font-medium mb-1">Perguntas</h3>
            <p className="text-3xl font-bold text-gray-900">--</p>
          </div>
        </div>

        {/* Platforms Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Plataformas Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isActive = platform.status === 'active';
              
              if (isActive) {
                return (
                  <Link key={platform.name} href={platform.href}>
                    <Card className={`${platform.bgColor} ${platform.borderColor} border-2 ${platform.hoverBg} transition-all cursor-pointer hover:shadow-lg`}>
                      <CardContent className="p-6">
                        <div className={`${platform.bgColor} p-3 rounded-xl inline-block mb-4 border ${platform.borderColor}`}>
                          <Icon className={`h-8 w-8 ${platform.iconColor}`} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{platform.name}</h3>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              }

              return (
                <Card key={platform.name} className={`${platform.bgColor} ${platform.borderColor} border-2 opacity-60 cursor-not-allowed`}>
                  <CardContent className="p-6">
                    <div className={`${platform.bgColor} p-3 rounded-xl inline-block mb-4 border ${platform.borderColor}`}>
                      <Icon className={`h-8 w-8 ${platform.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{platform.name}</h3>
                    <p className="text-sm text-gray-600">{platform.description}</p>
                    <span className="inline-block mt-2 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Em breve
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-2">💡 Dica</h3>
            <p className="text-gray-700">
              Conecte seus marketplaces para centralizar vendas, estoque e atendimento em uma única plataforma. 
              Use a IA para otimizar preços e ganhar mais BuyBox!
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
