// Frontend: src/lib/axios.ts
// Configuração do Axios para integração com o backend

import axios, { AxiosError } from 'axios';

// Base URL da API - sem /v1 pois o backend não usa esse prefixo
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    // Tratamento de erros específicos
    if (error.response?.status === 401) {
      // Limpar token e redirecionar para login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Tipo para respostas da API
export interface ApiResponse<T = any> {
  status?: string;
  message?: string;
  data?: T;
  error?: string;
  detail?: string;
  // Campos específicos do ML
  success?: boolean;
  count?: number;
  anuncios?: any[];
  perguntas?: any[];
  vendas?: any[];
  items?: any[];
}

export default axiosInstance;
