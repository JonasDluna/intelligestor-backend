// Frontend: src/lib/axios.ts
// Configuração do Axios para integração com o backend

import axios, { AxiosError } from 'axios';

// Base URL da API - sem /v1 pois o backend não usa esse prefixo
const IS_BROWSER = typeof window !== 'undefined';
const IS_DEV = process.env.NODE_ENV !== 'production';

// Base URL prioritiza produção para evitar CORS/localhost
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL_PRODUCTION ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://intelligestor-backend.onrender.com';

// Criar instância do axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição
axiosInstance.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = IS_BROWSER ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    if (IS_DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Interceptor de resposta
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (IS_DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Tratamento de erros específicos
    if (error.response?.status === 401) {
      // Limpar token e redirecionar para login
      if (IS_BROWSER) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Tipo para respostas da API
export interface ApiResponse<T = unknown> {
  status?: string;
  message?: string;
  data?: T;
  error?: string;
  detail?: string;
  // Campos específicos do ML
  success?: boolean;
  count?: number;
  anuncios?: unknown[];
  perguntas?: unknown[];
  vendas?: unknown[];
  items?: unknown[];
}

export default axiosInstance;
