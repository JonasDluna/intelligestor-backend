'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { DollarSign, Package, TrendingUp, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/utils/currencyUtils';

interface Venda {
  id: number;
  date_created: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  currency_id: string;
  buyer_id: number;
  items: unknown[];
}

export default function VendasTab() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);

  const loadVendas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.mlExtended.vendas(50);
      if (response?.success && response?.vendas) {
        setVendas(response.vendas);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVendas();
  }, [loadVendas]);

  // Estatísticas
  const { vendasHoje, faturamentoHoje, pendentes, totalVendas, taxaConversao } = useMemo(() => {
    const today = new Date().toDateString();
    let vendasHojeCount = 0;
    let faturamento = 0;
    let pendentesCount = 0;
    let pagosCount = 0;

    vendas.forEach((venda) => {
      const vendaDate = new Date(venda.date_created).toDateString();
      if (vendaDate === today) {
        vendasHojeCount += 1;
        faturamento += venda.total_amount;
      }
      if (venda.status === 'pending' || venda.status === 'pending_payment') {
        pendentesCount += 1;
      }
      if (venda.status === 'paid') {
        pagosCount += 1;
      }
    });

    const total = vendas.length;
    const taxa = total > 0 ? ((pagosCount / total) * 100).toFixed(1) : '0.0';

    return {
      vendasHoje: vendasHojeCount,
      faturamentoHoje: faturamento,
      pendentes: pendentesCount,
      totalVendas: total,
      taxaConversao: taxa,
    };
  }, [vendas]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
      confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
  };

  const formatPrice = (amount: number, currency: string = 'BRL') => {
    if (currency === 'BRL') {
      return formatCurrency(amount);
    }
    return `${currency} ${formatCurrency(amount).replace('R$ ', '')}`;
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Vendas Hoje</p>
                <p className="text-3xl font-bold text-green-900">{vendasHoje}</p>
              </div>
              <Package className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Faturamento Hoje</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(faturamentoHoje)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pedidos Pendentes</p>
                <p className="text-3xl font-bold text-yellow-900">{pendentes}</p>
              </div>
              <Package className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Taxa Conversão</p>
                <p className="text-3xl font-bold text-purple-900">{taxaConversao}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Atualizar */}
      <div className="flex justify-end">
        <button
          onClick={loadVendas}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Tabela de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes ({vendas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : vendas.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma venda encontrada</h3>
              <p className="text-gray-600">As vendas aparecerão aqui quando houver pedidos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pedido</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Comprador</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Pago</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Itens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendas.map((venda) => (
                    <tr key={venda.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono text-gray-900">{venda.id}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{formatDate(venda.date_created)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">ID: {venda.buyer_id}</td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(venda.total_amount, venda.currency_id)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-green-600">
                          {formatPrice(venda.paid_amount, venda.currency_id)}
                        </span>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(venda.status)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{venda.items.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
