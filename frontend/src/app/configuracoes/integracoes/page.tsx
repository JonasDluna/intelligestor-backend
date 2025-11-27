'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/templates/AppLayout';
import ProtectedRoute from '@/components/templates/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms';
import { Plus, Plug, Unplug, Pencil, Trash, ExternalLink, RefreshCw } from 'lucide-react';
import { integrationService, type IntegrationRecord, type CreateIntegrationPayload } from '@/services/integrationService';
import { useAuth } from '@/contexts/AuthContext';

const defaultRedirect = 'https://intelligestor-frontend.vercel.app/integrations/ml/callback';

export default function IntegracoesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <IntegracoesContent />
      </AppLayout>
    </ProtectedRoute>
  );
}

function IntegracoesContent() {
  const { user } = useAuth();
  const [items, setItems] = useState<IntegrationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IntegrationRecord | null>(null);
  const [form, setForm] = useState<CreateIntegrationPayload>({
    user_id: user?.id || '',
    name: 'Mercado Livre',
    client_id: '',
    client_secret: '',
    redirect_uri: defaultRedirect,
  });

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await integrationService.list(user.id);
      setItems(res.data.integrations || []);
    } catch (err) {
      console.error('Erro ao listar integrações', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setForm((f) => ({ ...f, user_id: user.id }));
      loadData();
    }
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    if (!form.redirect_uri.startsWith('https://')) {
      alert('O endereço de redirect deve começar com https://');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await integrationService.update(editing.id, {
          name: form.name,
          client_id: form.client_id,
          client_secret: form.client_secret,
          redirect_uri: form.redirect_uri,
        });
      } else {
        await integrationService.create(form);
      }
      await loadData();
      setModalOpen(false);
      setEditing(null);
      setForm({
        user_id: user.id,
        name: 'Mercado Livre',
        client_id: '',
        client_secret: '',
        redirect_uri: defaultRedirect,
      });
    } catch (err) {
      console.error('Erro ao salvar integração', err);
      alert('Erro ao salvar integração. Verifique os dados.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async (id: string) => {
    if (!user) return;
    try {
      const res = await integrationService.getAuthUrl(id, user.id);
      const authUrl = res.data.auth_url;
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (err) {
      console.error('Erro ao iniciar conexão', err);
      alert('Não foi possível gerar o link de autorização.');
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!user) return;
    try {
      await integrationService.disconnect(id, user.id);
      await loadData();
    } catch (err) {
      console.error('Erro ao desconectar', err);
      alert('Falha ao desconectar.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover esta integração?')) return;
    try {
      await integrationService.remove(id);
      await loadData();
    } catch (err) {
      console.error('Erro ao deletar', err);
    }
  };

  const openEdit = (item: IntegrationRecord) => {
    setEditing(item);
    setForm({
      user_id: item.user_id,
      name: item.name,
      client_id: item.client_id,
      client_secret: item.client_secret,
      redirect_uri: item.redirect_uri,
    });
    setModalOpen(true);
  };

  const badge = useMemo(
    () => (status: IntegrationRecord['status']) =>
      status === 'connected' ? (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Conectado</span>
      ) : (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Desconectado</span>
      ),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrações Mercado Livre</h1>
          <p className="text-sm text-gray-600">Gerencie credenciais e conexões OAuth por cliente.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar integração
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-gray-500">Carregando integrações...</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">Nenhuma integração cadastrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ML User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Redirect URI</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.client_id}</div>
                      </td>
                      <td className="px-4 py-3">{badge(item.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.ml_user_id ? item.ml_user_id : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-sm truncate">{item.redirect_uri}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === 'connected' ? (
                            <Button variant="secondary" size="sm" onClick={() => handleDisconnect(item.id)} title="Desconectar">
                              <Unplug className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => handleConnect(item.id)} title="Conectar">
                              <Plug className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" onClick={() => openEdit(item)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="error" size="sm" onClick={() => handleDelete(item.id)} title="Deletar">
                            <Trash className="h-4 w-4" />
                          </Button>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editing ? 'Editar integração' : 'Nova integração'}
                </h3>
                <p className="text-sm text-gray-500">Cadastre suas credenciais do app Mercado Livre.</p>
              </div>
              <Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null); }}>
                Fechar
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mercado Livre"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">ML_CLIENT_ID</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    placeholder="App ID"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">ML_CLIENT_SECRET</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={form.client_secret}
                    onChange={(e) => setForm({ ...form, client_secret: e.target.value })}
                    placeholder="Secret"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ML_REDIRECT_URI</label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={form.redirect_uri}
                  onChange={(e) => setForm({ ...form, redirect_uri: e.target.value })}
                  placeholder={defaultRedirect}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Configure esta URL no painel do Mercado Livre (URIs de redirect / URL de retorno). O Mercado Livre só aceita HTTPS.{' '}
                  <a
                    href="https://developers.mercadolivre.com.br/devcenter"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Ver docs <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setModalOpen(false); setEditing(null); }}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar integração'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
