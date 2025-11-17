'use client';

import AppLayout from '@/components/templates/AppLayout';
import { useState } from 'react';
import { Search, X, List, Grid, Filter, Download } from 'lucide-react';

interface Order {
  id: string;
  customer: {
    name: string;
    avatar: string;
  };
  address: {
    country: string;
    city: string;
    district?: string;
  };
  product: {
    name: string;
    category: string;
  };
  status: 'delivered' | 'prepared' | 'completed';
  date?: string;
}

const orders: Order[] = [
  {
    id: '#9685',
    customer: { name: 'Renala Cooper', avatar: 'RC' },
    address: { country: 'Indonesia', city: 'Surabaya', district: 'Jakarta' },
    product: { name: 'Cornubio', category: 'Baby Soft Chair' },
    status: 'delivered'
  },
  {
    id: '#9643',
    customer: { name: 'Jenny Wilson', avatar: 'JW' },
    address: { country: 'Indonesia', city: 'Medan', district: 'Sumatera' },
    product: { name: 'Kaartell', category: 'Bicycle Chair' },
    status: 'prepared'
  },
  {
    id: '#9653',
    customer: { name: 'Dianne Russell', avatar: 'DR' },
    address: { country: 'Singapore', city: 'City Hub St 10' },
    product: { name: 'Bluboi', category: 'Leather Brown Sofa' },
    date: '04/08/2021',
    status: 'delivered'
  },
  {
    id: '#9231',
    customer: { name: 'Robert Fox', avatar: 'RF' },
    address: { country: 'Indonesia', city: 'Surabaya', district: 'Jakarta' },
    product: { name: 'Cornubio', category: 'Baby Tork Chair' },
    date: '04/08/2021',
    status: 'completed'
  },
  {
    id: '#9657',
    customer: { name: 'Ronald Richards', avatar: 'RR' },
    address: { country: 'Singapore', city: 'City Hub St 10' },
    product: { name: 'Collignis', category: 'Pitoia Michel Chair' },
    date: '04/08/2021',
    status: 'completed'
  },
  {
    id: '#8421',
    customer: { name: 'Jerome Bell', avatar: 'JB' },
    address: { country: 'Vietnam', city: 'Ho Chi Minh VN' },
    product: { name: 'Kaartell', category: 'Modern Chair' },
    date: '07/09/2021',
    status: 'delivered'
  },
  {
    id: '#8867',
    customer: { name: 'Devon Lane', avatar: 'DL' },
    address: { country: 'Indonesia', city: 'Kemayoran', district: 'Jakarta' },
    product: { name: 'Connubia', category: 'New York Chair' },
    date: '07/08/2021',
    status: 'delivered'
  },
  {
    id: '#9583',
    customer: { name: 'Albert Flores', avatar: 'AF' },
    address: { country: 'Vietnam', city: 'Ho Chi Minh VN' },
    product: { name: 'Bluboi', category: 'Leather Brown Sofa' },
    date: '04/08/2021',
    status: 'completed'
  },
];

const tabs = [
  { label: 'All Orders', count: 80 },
  { label: 'Prepared', count: 10 },
  { label: 'Delivered', count: 30 },
  { label: 'Completed', count: 10 },
];

const categories = [
  'All Category',
  'Bedroom',
  'Cafe',
  'Office',
  'Kitchen',
];

export default function PedidosPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('Jakarta');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState('All Category');

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      delivered: 'bg-sky-100 text-sky-600',
      prepared: 'bg-orange-100 text-orange-600',
      completed: 'bg-emerald-100 text-emerald-600',
    };
    
    const labels = {
      delivered: 'Delivered',
      prepared: 'Prepared',
      completed: 'Completed',
    };

    return (
      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-red-500',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <AppLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex items-center space-x-8">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`
                  py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === index
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {tab.label} <span className="text-gray-400">{tab.count}</span>
              </button>
            ))}
            
            <div className="ml-auto text-sm text-gray-400">
              (Showing 1 - 6 of 84 results)
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Search..."
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* View Mode */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              >
                <List size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border-l border-gray-300 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              >
                <Grid size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Filter */}
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter size={18} />
              <span>Filter</span>
            </button>

            {/* Export */}
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ORDER ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  CUSTOMER
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ADDRESS
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PRODUCT
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {/* Category Dropdown */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent border-none text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full ${getAvatarColor(order.customer.name)} flex items-center justify-center`}>
                        <span className="text-white text-sm font-semibold">
                          {order.customer.avatar}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {order.customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.address.country}
                    </div>
                    <div className="text-sm text-sky-500">
                      {order.address.city}
                      {order.address.district && (
                        <span className="text-gray-400"> {order.address.district}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {order.date || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
