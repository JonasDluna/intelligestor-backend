'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { Package, Search, Filter, RefreshCw, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

interface Anuncio {
  ml_id: string;
  title: string;
  price: string;
  available_quantity: number;
  sold_quantity: number;
  status: string;
  pictures?: string[];
  permalink: string;
}

export default function MeusAnunciosTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAnuncios();
  }, []);

  const loadAnuncios = async () => {
    try {
      setLoading(true);
      const response = await api.mlExtended.listarAnuncios(100);
      if (response.data?.success && response.data?.anuncios) {
        setAnuncios(response.data.anuncios);
      }
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAnuncios = async () => {
    try {
      setSyncing(true);
      await api.mlExtended.sincronizar();
      await loadAnuncios();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      alert('Erro ao sincronizar. Verifique sua conexão com o ML.');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800' },
      closed: { label: 'Fechado', color: 'bg-red-100 text-red-800' },
      under_review: { label: 'Em Revisão', color: 'bg-blue-100 text-blue-800' },
    };
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
  };

  const filteredAnuncios = anuncios.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.ml_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar anúncios por título ou ML ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
              <Filter className="h-5 w-5" />
              Filtros
            </button>
            <button
              onClick={syncAnuncios}
              disabled={syncing}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Anuncios List */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Anúncios ({filteredAnuncios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : filteredAnuncios.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {anuncios.length === 0 ? 'Nenhum anúncio encontrado' : 'Nenhum resultado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {anuncios.length === 0
                  ? 'Clique no botão abaixo para sincronizar seus anúncios do Mercado Livre'
                  : 'Tente buscar por outro termo'}
              </p>
              {anuncios.length === 0 && (
                <button
                  onClick={syncAnuncios}
                  disabled={syncing}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {syncing ? 'Sincronizando...' : 'Sincronizar Anúncios'}
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Produto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ML ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Preço</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Disponível</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vendidos</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAnuncios.map((anuncio) => (
                    <tr key={anuncio.ml_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {anuncio.pictures && anuncio.pictures.length > 0 && (
                            <img
                              src={anuncio.pictures[0]}
                              alt={anuncio.title}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          )}
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 truncate">{anuncio.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono text-gray-600">{anuncio.ml_id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          R$ {parseFloat(anuncio.price).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{anuncio.available_quantity}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{anuncio.sold_quantity}</td>
                      <td className="px-4 py-4">{getStatusBadge(anuncio.status)}</td>
                      <td className="px-4 py-4">
                        <a
                          href={anuncio.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                        >
                          Ver <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
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
