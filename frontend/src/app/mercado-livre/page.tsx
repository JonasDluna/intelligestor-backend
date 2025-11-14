'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Spinner, Alert } from '@/components/atoms';
import { Brain, TrendingUp, TrendingDown, Zap, Target, DollarSign, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useAnalisarBuybox, useOtimizarPreco, useAnuncios } from '@/lib/hooks';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import type { Anuncio } from '@/types';

export default function MercadoLivrePage() {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [estrategia, setEstrategia] = useState<'agressiva' | 'moderada' | 'conservadora'>('moderada');
  const [showAnalise, setShowAnalise] = useState(false);

  // Buscar anúncios
  const { data: anunciosData, isLoading: loadingAnuncios } = useAnuncios();
  
  // Mutations para IA
  const analisarBuybox = useAnalisarBuybox();
  const otimizarPreco = useOtimizarPreco();

  const anuncios = anunciosData?.data?.items || [];

  const handleAnalisar = async () => {
    if (!selectedItemId) {
      alert('Selecione um anúncio para analisar');
      return;
    }

    try {
      await analisarBuybox.mutateAsync({ item_id: selectedItemId });
      setShowAnalise(true);
    } catch (error) {
      console.error('Erro ao analisar BuyBox:', error);
    }
  };

  const handleOtimizar = async () => {
    if (!selectedItemId) {
      alert('Selecione um anúncio para otimizar');
      return;
    }

    try {
      await otimizarPreco.mutateAsync({ item_id: selectedItemId, estrategia });
      alert('Preço otimizado com sucesso!');
    } catch (error) {
      console.error('Erro ao otimizar preço:', error);
    }
  };

  const analiseData = analisarBuybox.data?.data;
  const otimizacaoData = otimizarPreco.data?.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">IA - Mercado Livre</h1>
          </div>
          <p className="text-gray-500">Análise BuyBox e Otimização Inteligente de Preços</p>
        </div>

        {/* Seleção de Anúncio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Selecionar Anúncio para Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anúncio do Mercado Livre
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  disabled={loadingAnuncios}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Selecione um anúncio...</option>
                  {anuncios.map((anuncio: Anuncio) => (
                    <option key={anuncio.item_id} value={anuncio.item_id}>
                      {anuncio.title} - {formatCurrency(anuncio.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estratégia de Preço
                </label>
                <select
                  value={estrategia}
                  onChange={(e) => setEstrategia(e.target.value as any)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="conservadora">Conservadora</option>
                  <option value="moderada">Moderada</option>
                  <option value="agressiva">Agressiva</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAnalisar}
                disabled={!selectedItemId || analisarBuybox.isPending}
                variant="primary"
                icon={analisarBuybox.isPending ? <Spinner size="sm" /> : <Brain />}
              >
                {analisarBuybox.isPending ? 'Analisando...' : 'Analisar BuyBox'}
              </Button>

              <Button
                onClick={handleOtimizar}
                disabled={!selectedItemId || otimizarPreco.isPending}
                variant="secondary"
                icon={otimizarPreco.isPending ? <Spinner size="sm" /> : <Zap />}
              >
                {otimizarPreco.isPending ? 'Otimizando...' : 'Otimizar Preço'}
              </Button>
            </div>

            {/* Descrição das Estratégias */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Estratégias de Precificação:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <Badge variant="success" size="sm">Conservadora</Badge>
                  <span className="text-gray-600">Preço competitivo, prioriza margem de lucro</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="info" size="sm">Moderada</Badge>
                  <span className="text-gray-600">Equilíbrio entre vendas e margem</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="warning" size="sm">Agressiva</Badge>
                  <span className="text-gray-600">Maximiza vendas, menor margem</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análise BuyBox */}
        {showAnalise && analiseData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Análise BuyBox - {analiseData.produto_nome}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status BuyBox */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                {analiseData.tem_buybox ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Você tem o BuyBox! </h3>
                      <p className="text-sm text-gray-600">Seu anúncio está ganhando o Buy Box</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-amber-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">BuyBox não conquistado</h3>
                      <p className="text-sm text-gray-600">Veja as recomendações para melhorar</p>
                    </div>
                  </>
                )}
              </div>

              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Seu Preço</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analiseData.preco_atual)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Menor Preço</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(analiseData.menor_preco)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Preço Médio</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(analiseData.preco_medio)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Competidores</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analiseData.total_competidores}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Análise Detalhada */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Análise da IA
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {analiseData.analise_ia}
                </p>
              </div>

              {/* Recomendações */}
              {analiseData.recomendacoes && analiseData.recomendacoes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    Recomendações
                  </h4>
                  <div className="space-y-2">
                    {analiseData.recomendacoes.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Competidores */}
              {analiseData.competidores_proximos && analiseData.competidores_proximos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Top Competidores</h4>
                  <div className="space-y-2">
                    {analiseData.competidores_proximos.slice(0, 5).map((comp: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="default" size="sm">#{index + 1}</Badge>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{comp.vendedor}</div>
                            <div className="text-xs text-gray-500">{comp.reputacao}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(comp.preco)}
                          </div>
                          <div className="text-xs text-gray-500">{comp.vendas} vendas</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resultado da Otimização */}
        {otimizacaoData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Otimização de Preço - Estratégia {estrategia.charAt(0).toUpperCase() + estrategia.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comparação de Preços */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 bg-gray-50">
                    <div className="text-sm text-gray-600 mb-1">Preço Atual</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(otimizacaoData.preco_atual)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 bg-green-50">
                    <div className="text-sm text-gray-600 mb-1">Preço Sugerido</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(otimizacaoData.preco_sugerido)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 bg-blue-50">
                    <div className="text-sm text-gray-600 mb-1">Variação</div>
                    <div className="flex items-center gap-2">
                      {otimizacaoData.variacao_percentual >= 0 ? (
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      )}
                      <span className={`text-2xl font-bold ${otimizacaoData.variacao_percentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(Math.abs(otimizacaoData.variacao_percentual))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Justificativa da IA */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Justificativa da IA
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {otimizacaoData.justificativa}
                </p>
              </div>

              {/* Impactos Estimados */}
              {otimizacaoData.impacto_estimado && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Impacto em Vendas</h5>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {otimizacaoData.impacto_estimado.vendas > 0 ? '+' : ''}
                      {formatPercentage(otimizacaoData.impacto_estimado.vendas)}
                    </div>
                    <p className="text-xs text-gray-500">Estimativa de variação no volume</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Impacto em Margem</h5>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {otimizacaoData.impacto_estimado.margem > 0 ? '+' : ''}
                      {formatPercentage(otimizacaoData.impacto_estimado.margem)}
                    </div>
                    <p className="text-xs text-gray-500">Estimativa de variação na margem</p>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button variant="primary" icon={<CheckCircle />}>
                  Aplicar Preço Sugerido
                </Button>
                <Button variant="outline">
                  Ver Histórico de Otimizações
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Anúncios */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Anúncios no Mercado Livre</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAnuncios && (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            )}

            {!loadingAnuncios && anuncios.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum anúncio encontrado</p>
                <p className="text-sm text-gray-500 mt-1">Conecte sua conta do Mercado Livre para começar</p>
              </div>
            )}

            {!loadingAnuncios && anuncios.length > 0 && (
              <div className="space-y-3">
                {anuncios.map((anuncio: Anuncio) => (
                  <div
                    key={anuncio.item_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedItemId === anuncio.item_id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedItemId(anuncio.item_id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{anuncio.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>SKU: {anuncio.sku || 'N/A'}</span>
                          <span>Estoque: {anuncio.available_quantity}</span>
                          <Badge variant={anuncio.status === 'active' ? 'success' : 'default'}>
                            {anuncio.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(anuncio.price)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {anuncio.sold_quantity || 0} vendidos
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
