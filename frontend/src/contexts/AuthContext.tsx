'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  ml_user_id?: string;
  ml_connected: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  connectMercadoLivre: () => Promise<void>;
  checkMLConnection: () => Promise<boolean>;
  refreshMLToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, _password: string) => {
    try {
      // TODO: Implement actual login API call
      // For now, mock authentication
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        ml_connected: false,
      };

      localStorage.setItem('auth_token', 'mock_token_123');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
