import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button, Spinner } from '@/components/atoms';
import { useGerarDescricao } from '@/lib/hooks';

interface IADescriptionGeneratorProps {
  produtoNome: string;
  categoria?: string;
  caracteristicas?: string[];
  onDescriptionGenerated: (description: string) => void;
  onClose?: () => void;
}

export const IADescriptionGenerator: React.FC<IADescriptionGeneratorProps> = ({
  produtoNome,
  categoria,
  caracteristicas = [],
  onDescriptionGenerated,
  onClose,
}) => {
  const [prompt, setPrompt] = React.useState('');
  const [showResult, setShowResult] = React.useState(false);
  
  const gerarDescricao = useGerarDescricao();

  const handleGenerate = async () => {
    try {
      const result = await gerarDescricao.mutateAsync({
        titulo: produtoNome,
        categoria,
        caracteristicas: caracteristicas.join(', '),
      });

      if (result.data?.descricao) {
        setShowResult(true);
      }
    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
    }
  };

  const handleUseDescription = () => {
    if (gerarDescricao.data?.data?.descricao) {
      onDescriptionGenerated(gerarDescricao.data.data.descricao);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Gerador de DescriÃƒÂ§ÃƒÂµes IA</h2>
              <p className="text-sm text-purple-100">Powered by GPT-4</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* InformaÃƒÂ§ÃƒÂµes do Produto */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Produto:</span>
              <span className="text-sm text-gray-900 ml-2">{produtoNome}</span>
            </div>
            {categoria && (
              <div>
                <span className="text-sm font-medium text-gray-700">Categoria:</span>
                <span className="text-sm text-gray-900 ml-2">{categoria}</span>
              </div>
            )}
            {caracteristicas.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">CaracterÃƒÂ­sticas:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {caracteristicas.map((car, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {car}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prompt Adicional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              InstruÃƒÂ§ÃƒÂµes Adicionais (Opcional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Enfatizar durabilidade, mencionar garantia de 2 anos, tom profissional..."
              className="w-full h-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              disabled={gerarDescricao.isPending}
            />
          </div>

          {/* BotÃƒÂ£o Gerar */}
          {!showResult && (
            <Button
              onClick={handleGenerate}
              disabled={gerarDescricao.isPending}
              variant="primary"
              icon={gerarDescricao.isPending ? <Spinner size="sm" /> : <Sparkles />}
              className="w-full"
            >
              {gerarDescricao.isPending ? 'Gerando descriÃƒÂ§ÃƒÂ£o...' : 'Gerar DescriÃƒÂ§ÃƒÂ£o com IA'}
            </Button>
          )}

          {/* Resultado */}
          {gerarDescricao.data?.data && (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  DescriÃƒÂ§ÃƒÂ£o Gerada
                </h3>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {gerarDescricao.data.data.descricao}
                  </p>
                </div>
              </div>

              {/* SugestÃƒÂµes de SEO */}
              {gerarDescricao.data.data.sugestoes_seo && gerarDescricao.data.data.sugestoes_seo.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Palavras-chave sugeridas para SEO:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gerarDescricao.data.data.sugestoes_seo.map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contagem de caracteres */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {gerarDescricao.data.data.descricao.length} caracteres
                </span>
                <span>
                  {gerarDescricao.data.data.descricao.split(' ').length} palavras
                </span>
              </div>

              {/* AÃƒÂ§ÃƒÂµes */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleUseDescription}
                  variant="primary"
                  className="flex-1"
                >
                  Usar esta DescriÃƒÂ§ÃƒÂ£o
                </Button>
                <Button
                  onClick={() => {
                    setShowResult(false);
                    gerarDescricao.reset();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Gerar Nova
                </Button>
              </div>
            </div>
          )}

          {/* Erro */}
          {gerarDescricao.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800">Erro ao gerar descriÃƒÂ§ÃƒÂ£o</p>
              <p className="text-xs text-red-600 mt-1">
                {gerarDescricao.error instanceof Error
                  ? gerarDescricao.error.message
                  : 'Tente novamente em alguns instantes'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
