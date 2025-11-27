'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import axiosInstance, { ApiResponse } from '@/lib/axios';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  ml_user_id?: string;
  ml_connected: boolean;
}

interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  empresa?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  connectMercadoLivre: () => Promise<void>;
  checkMLConnection: () => Promise<boolean>;
  refreshMLToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthSuccessPayload {
  access_token: string;
  token_type?: string;
  user: {
    id: string;
    name?: string;
    email: string;
    ml_user_id?: string;
    ml_connected?: boolean;
  };
}

const unwrapAuthData = (
  payload: ApiResponse<AuthSuccessPayload> | AuthSuccessPayload
): AuthSuccessPayload => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<AuthSuccessPayload>).data ?? (payload as AuthSuccessPayload);
  }
  return payload as AuthSuccessPayload;
};

const buildAuthError = (action: 'login' | 'register', error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new Error(
        action === 'login'
          ? 'Não foi possível conectar ao servidor. Verifique o endereço da API e tente novamente.'
          : 'Não foi possível conectar ao servidor para registrar. Confirme o backend e tente novamente.'
      );
    }

    const detail = (error.response.data as { detail?: string; message?: string }) ?? {};
    const message =
      detail.detail ||
      detail.message ||
      error.response.data?.error ||
      error.response.data?.message ||
      (action === 'login' ? 'Falha no login. Verifique suas credenciais.' : 'Falha no registro. Dados inválidos.');
    return new Error(message);
  }

  return error instanceof Error
    ? error
    : new Error(action === 'login' ? 'Erro inesperado no login.' : 'Erro inesperado no registro.');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post<ApiResponse<AuthSuccessPayload>>(
        '/auth/login',
        { email, password }
      );
      const { access_token, user: remoteUser } = unwrapAuthData(response.data);

      if (!access_token || !remoteUser) {
        throw new Error('Resposta inválida do servidor de autenticação');
      }

      const userData: User = {
        id: remoteUser.id,
        name: remoteUser.name || remoteUser.email.split('@')[0],
        email: remoteUser.email,
        ml_user_id: remoteUser.ml_user_id,
        ml_connected: Boolean(remoteUser.ml_connected),
      };

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Login realizado:', userData);
    } catch (error) {
      const normalized = buildAuthError('login', error);
      console.error('Login error:', normalized);
      throw normalized;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await axiosInstance.post<ApiResponse<AuthSuccessPayload>>(
        '/auth/register',
        {
          email: data.email,
          password: data.senha,
          nome: data.nome,
          empresa: data.empresa,
        }
      );

      const { access_token, user: remoteUser } = unwrapAuthData(response.data);

      if (!access_token || !remoteUser) {
        throw new Error('Resposta inválida do servidor de registro');
      }

      const userData: User = {
        id: remoteUser.id,
        name: remoteUser.name || remoteUser.email.split('@')[0],
        email: remoteUser.email,
        ml_user_id: remoteUser.ml_user_id,
        ml_connected: Boolean(remoteUser.ml_connected),
      };

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Registro realizado:', userData);
    } catch (error) {
      const normalized = buildAuthError('register', error);
      console.error('Register error:', normalized);
      throw normalized;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const connectMercadoLivre = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Inicia o fluxo OAuth do Mercado Livre
      const response = await authApi.initiateOAuth();
      
      if (response.data && response.data.auth_url) {
        // Redireciona para a página de autorização do ML
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      console.error('ML OAuth initiation error:', error);
      throw error;
    }
  };

  const checkMLConnection = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await authApi.getStatus(user.id);
      const isConnected = response.data?.connected || false;
      
      // Update user ML connection status
      setUser((prev) => prev ? { ...prev, ml_connected: isConnected } : null);
      
      return isConnected;
    } catch (error) {
      console.error('ML connection check error:', error);
      return false;
    }
  };

  const refreshMLToken = async () => {
    if (!user) throw new Error('User not authenticated');

    try {
      await authApi.refreshToken(user.id);
      console.log('ML token refreshed successfully');
    } catch (error) {
      console.error('ML token refresh error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        connectMercadoLivre,
        checkMLConnection,
        refreshMLToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
