'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import {
  Search,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Package,
  Target,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type CatalogoView = 'overview' | 'elegibilidade' | 'busca' | 'monitoramento' | 'sugestoes';
type FeatureColor = 'green' | 'blue' | 'yellow' | 'purple';

type FeatureCard = {
  id: CatalogoView;
  icon: LucideIcon;
  title: string;
  description: string;
  color: FeatureColor;
  stats: string;
};

const FEATURE_COLOR_MAP: Record<FeatureColor, { bg: string; text: string; hover: string; border: string }> = {
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    hover: 'hover:bg-green-100',
    border: 'border-green-200',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-100',
    border: 'border-blue-200',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    hover: 'hover:bg-yellow-100',
    border: 'border-yellow-200',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-100',
    border: 'border-purple-200',
  },
};

const FEATURE_CARDS: FeatureCard[] = [
  {
    id: 'elegibilidade',
    icon: CheckCircle2,
    title: 'Verificar Elegibilidade',
    description: 'Verifique se seus produtos podem ser publicados no catálogo',
    color: 'green',
    stats: '+50% visibilidade',
  },
  {
    id: 'busca',
    icon: Search,
    title: 'Buscar Produtos',
    description: 'Encontre produtos do catálogo para publicar',
    color: 'blue',
    stats: '5000+ produtos',
  },
  {
    id: 'monitoramento',
    icon: Target,
    title: 'Monitorar Buy Box',
    description: 'Acompanhe sua performance em tempo real',
    color: 'yellow',
    stats: 'Tempo real',
  },
  {
    id: 'sugestoes',
    icon: Lightbulb,
    title: 'Brand Central',
    description: 'Sugira novos produtos para o catálogo',
    color: 'purple',
    stats: 'Quota disponível',
  },
];

interface CatalogoTabProps {
  userId: string;
}

export default function CatalogoTab({ userId }: CatalogoTabProps) {
  const [activeView, setActiveView] = useState<CatalogoView>('overview');

  if (activeView === 'overview') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-2xl shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sistema de Catálogo Mercado Livre
                </h2>
                <p className="text-gray-600 mb-4">
                  Gerencie publicações de catálogo, verifique elegibilidade e monitore performance
                </p>
                {userId && (
                  <p className="text-sm text-gray-500 mb-4">
                    Conta vinculada: <span className="font-mono">{userId}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-green-200">
                    <Sparkles className="h-4 w-4" />
                    +50% de visibilidade
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200">
                    <Target className="h-4 w-4" />
                    +30% conversão
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-200">
                    <TrendingUp className="h-4 w-4" />
                    Melhor ranqueamento
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon;
            const colors = FEATURE_COLOR_MAP[feature.color];

            return (
              <Card
                key={feature.id}
                className={`cursor-pointer transition-all border-2 ${colors.hover} ${colors.border}`}
                onClick={() => setActiveView(feature.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`${colors.bg} p-3 rounded-xl`}>
                      <Icon className={`h-6 w-6 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {feature.description}
                      </p>
                      <div className={`inline-flex items-center gap-1 ${colors.text} text-sm font-semibold`}>
                        <TrendingUp className="h-4 w-4" />
                        {feature.stats}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Start Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Como Começar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Verifique Elegibilidade</h4>
                  <p className="text-sm text-gray-600">
                    Confirme se seus produtos podem ser publicados no catálogo ML
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Busque Produtos</h4>
                  <p className="text-sm text-gray-600">
                    Encontre produtos de catálogo por palavra-chave, GTIN ou domínio
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-yellow-100 text-yellow-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Monitore Performance</h4>
                  <p className="text-sm text-gray-600">
                    Acompanhe Buy Box, preços e concorrência em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sugira Produtos</h4>
                  <p className="text-sm text-gray-600">
                    Use o Brand Central para sugerir novos produtos ao catálogo
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Views específicas serão carregadas dinamicamente
  return (
    <div className="space-y-6">
      {/* Breadcrumb/Back */}
      <button
        onClick={() => setActiveView('overview')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        ← Voltar para Catálogo
      </button>

      {/* Conteúdo da view específica */}
      {activeView === 'elegibilidade' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Verificar Elegibilidade</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                Em breve: interface para verificar elegibilidade de produtos
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Você pode acessar a página completa em{' '}
                  <a href="/ecommerce/catalogo/elegibilidade" className="underline">
                    /ecommerce/catalogo/elegibilidade
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'busca' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Buscar Produtos</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                Em breve: interface de busca de produtos do catálogo
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Você pode acessar a página completa em{' '}
                  <a href="/ecommerce/catalogo/busca" className="underline">
                    /ecommerce/catalogo/busca
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'monitoramento' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Monitorar Buy Box</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                Em breve: dashboard de monitoramento de Buy Box
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Você pode acessar a página completa em{' '}
                  <a href="/ecommerce/catalogo/monitoramento" className="underline">
                    /ecommerce/catalogo/monitoramento
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'sugestoes' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Brand Central - Sugestões</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                Em breve: sistema de sugestões do Brand Central
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Você pode acessar a página completa em{' '}
                  <a href="/ecommerce/catalogo/sugestoes" className="underline">
                    /ecommerce/catalogo/sugestoes
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
