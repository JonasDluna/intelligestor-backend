'use client';

import AppLayout from '@/components/templates/AppLayout';
import { useState } from 'react';
import { Search, Plus, Filter, Download, Edit, Trash2 } from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: string;
  status: 'active' | 'inactive';
}

const products: Product[] = [
  { id: 1, sku: 'PRD001', name: 'Cadeira Gamer Pro', category: 'Office', stock: 45, price: 'R$ 1.299', status: 'active' },
  { id: 2, sku: 'PRD002', name: 'Mesa Escritório', category: 'Office', stock: 23, price: 'R$ 899', status: 'active' },
  { id: 3, sku: 'PRD003', name: 'Sofá 3 Lugares', category: 'Bedroom', stock: 12, price: 'R$ 2.499', status: 'active' },
  { id: 4, sku: 'PRD004', name: 'Cadeira Fixa', category: 'Cafe', stock: 67, price: 'R$ 299', status: 'active' },
  { id: 5, sku: 'PRD005', name: 'Poltrona Relax', category: 'Bedroom', stock: 8, price: 'R$ 1.599', status: 'inactive' },
];

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: Product['status']) => {
    return status === 'active' 
      ? <span className="px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-600">Ativo</span>
      : <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-500">Inativo</span>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos</h1>
          <p className="text-gray-500">Gerencie seu catálogo de produtos</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
              placeholder="Buscar produtos..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white shadow-sm transition-all">
              <Filter size={18} />
              <span>Filtros</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white shadow-sm transition-all">
              <Download size={18} />
              <span>Exportar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all">
              <Plus size={18} />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PRODUTO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CATEGORIA</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ESTOQUE</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PREÇO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.sku}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.stock} un</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{product.price}</td>
                    <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
