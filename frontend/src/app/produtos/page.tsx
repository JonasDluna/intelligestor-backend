'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Spinner } from '@/components/atoms';
import { Package, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useProdutos, useDeletarProduto } from '@/lib/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Produto } from '@/types';

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoria, setCategoria] = useState('');

  // Buscar produtos com React Query
  const { data, isLoading, error } = useProdutos({ 
    search: searchTerm, 
    categoria: categoria || undefined,
    limit: 50 
  });

  const deletarProduto = useDeletarProduto();

  const handleDelete = async (produtoId: string) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await deletarProduto.mutateAsync(produtoId);
        alert('Produto deletado com sucesso!');
      } catch (error) {
        alert('Erro ao deletar produto');
      }
    }
  };

  const produtos = data?.data?.items || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-500 mt-1">CatÃƒÂ¡logo completo de produtos</p>
          </div>
          <Button icon={<Plus />} variant="primary">
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-5 w-5" />}
                />
              </div>
              <div className="w-full md:w-64">
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Todas categorias</option>
                  <option value="eletronicos">EletrÃƒÂ´nicos</option>
                  <option value="vestuario">VestuÃƒÂ¡rio</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="livros">Livros</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Produtos ({produtos.length})</CardTitle>
              {isLoading && <Spinner size="sm" />}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  <p className="font-semibold">Erro ao carregar produtos</p>
                  <p className="text-sm mt-1">
                    {error instanceof Error ? error.message : 'Erro desconhecido'}
                  </p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !error && produtos.length === 0 && (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Nenhum produto encontrado</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm || categoria 
                    ? 'Tente ajustar os filtros de busca' 
                    : 'Comece adicionando seu primeiro produto'}
                </p>
              </div>
            )}

            {!isLoading && !error && produtos.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PreÃƒÂ§o
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estoque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AÃƒÂ§ÃƒÂµes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtos.map((produto: Produto) => (
                      <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {produto.nome}
                              </div>
                              <div className="text-sm text-gray-500">
                                {produto.descricao?.substring(0, 50)}
                                {produto.descricao && produto.descricao.length > 50 ? '...' : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{produto.sku || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{produto.categoria || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(produto.preco_venda)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Custo: {formatCurrency(produto.preco_custo)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {produto.estoque_atual} un
                          </div>
                          {produto.estoque_atual <= produto.estoque_minimo && (
                            <Badge size="sm" variant="warning" className="mt-1">
                              Baixo
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={produto.ativo ? 'success' : 'default'}>
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900 p-1"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(produto.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Deletar"
                              disabled={deletarProduto.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {!isLoading && produtos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Total de Produtos</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {produtos.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Produtos Ativos</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {produtos.filter((p: Produto) => p.ativo).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Estoque Baixo</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">
                  {produtos.filter((p: Produto) => p.estoque_atual <= p.estoque_minimo).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">Valor Total</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(
                    produtos.reduce((sum: number, p: Produto) => sum + (p.preco_venda * p.estoque_atual), 0)
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
