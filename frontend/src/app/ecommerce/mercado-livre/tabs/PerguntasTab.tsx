'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms';
import { MessageCircle, RefreshCw, Send, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface Pergunta {
  id: number;
  text: string;
  status: string;
  date_created: string;
  item_id: string;
  answer: { text: string; date_created: string } | null;
  from_user_id: number;
}

export default function PerguntasTab() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'unanswered' | 'answered' | 'all'>('unanswered');
  const [respostaTexto, setRespostaTexto] = useState<Record<number, string>>({});
  const [respondendo, setRespondendo] = useState<number | null>(null);

  const loadPerguntas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.mlExtended.perguntas(statusFilter);
      if (response?.success && response?.perguntas) {
        setPerguntas(response.perguntas);
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadPerguntas();
  }, [loadPerguntas]);

  const handleResponder = useCallback(async (questionId: number) => {
    const resposta = respostaTexto[questionId];
    if (!resposta || !resposta.trim()) {
      alert('Digite uma resposta antes de enviar');
      return;
    }

    try {
      setRespondendo(questionId);
      await api.mlExtended.responderPergunta(questionId, resposta);
      setRespostaTexto((prev) => ({ ...prev, [questionId]: '' }));
      await loadPerguntas();
      alert('Resposta enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao responder:', error);
      alert('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setRespondendo(null);
    }
  }, [loadPerguntas, respostaTexto]);

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

  // Estatísticas
  const { pendentes, respondidas, total } = useMemo(() => {
    const pend = perguntas.filter((p) => p.status === 'UNANSWERED').length;
    const resp = perguntas.length - pend;
    return {
      pendentes: pend,
      respondidas: resp,
      total: perguntas.length,
    };
  }, [perguntas]);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-900">{pendentes}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Respondidas</p>
                <p className="text-3xl font-bold text-green-900">{respondidas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-blue-900">{total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <button
              onClick={() => setStatusFilter('unanswered')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'unanswered'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('answered')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'answered'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Respondidas
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={loadPerguntas}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Perguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas ({perguntas.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : perguntas.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma pergunta encontrada</h3>
              <p className="text-gray-600">
                {statusFilter === 'unanswered' ? 'Não há perguntas pendentes' : 'Não há perguntas neste filtro'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {perguntas.map((pergunta) => (
                <div key={pergunta.id} className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-gray-500">ID: {pergunta.id}</span>
                    <span className="text-xs text-gray-500">{formatDate(pergunta.date_created)}</span>
                  </div>
                  
                  <p className="text-gray-900 font-medium mb-2">{pergunta.text}</p>
                  
                  <p className="text-xs text-gray-500 mb-3">Item: {pergunta.item_id}</p>

                  {pergunta.answer ? (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-semibold text-green-800 mb-1">✓ Respondida:</p>
                      <p className="text-sm text-green-900">{pergunta.answer.text}</p>
                      <p className="text-xs text-green-600 mt-1">{formatDate(pergunta.answer.date_created)}</p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <textarea
                        placeholder="Digite sua resposta..."
                        value={respostaTexto[pergunta.id] || ''}
                        onChange={(e) => setRespostaTexto(prev => ({ ...prev, [pergunta.id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <button
                        onClick={() => handleResponder(pergunta.id)}
                        disabled={respondendo === pergunta.id}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        {respondendo === pergunta.id ? 'Enviando...' : 'Enviar Resposta'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
