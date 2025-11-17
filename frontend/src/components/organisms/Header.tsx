'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { Avatar } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
  sidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, sidebarCollapsed = false }) => {
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 w-96">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produtos, vendas, clientes..."
            className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
          aria-label="NotificaÃƒÂ§ÃƒÂµes"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error" />
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'UsuÃƒÂ¡rio'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'email@exemplo.com'}</p>
          </div>

          <Avatar
            src={undefined}
            alt={user?.name || 'User'}
            fallback={user?.name?.charAt(0) || 'U'}
            size="md"
            status="online"
          />

          <button
            onClick={logout}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
