'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      // Sucesso na autenticação
      if (window.opener) {
        // Se abriu em popup, comunicar com janela pai
        window.opener.postMessage({ type: 'ML_AUTH_SUCCESS' }, window.location.origin);
        window.close();
      } else {
        // Se abriu na mesma aba, redirecionar
        window.location.href = '/ecommerce/mercado-livre';
      }
    } else if (error) {
      // Erro na autenticação
      if (window.opener) {
        window.opener.postMessage({ type: 'ML_AUTH_ERROR', error }, window.location.origin);
        window.close();
      } else {
        window.location.href = '/ecommerce/mercado-livre?error=' + encodeURIComponent(error);
      }
    } else {
      // Aguardar processamento
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage({ type: 'ML_AUTH_PROCESSING' }, window.location.origin);
          window.close();
        } else {
          window.location.href = '/ecommerce/mercado-livre';
        }
      }, 3000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                <svg className="h-8 w-8 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                Conectando ao Mercado Livre
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Processando sua autenticação...
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Esta janela será fechada automaticamente após a conclusão.
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => window.close()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Fechar manualmente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MLCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                  <svg className="h-8 w-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  Carregando...
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}