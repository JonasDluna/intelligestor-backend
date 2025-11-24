'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Settings,
  Menu,
  X,
  ChevronLeft,
  Store,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  { icon: Store, label: 'E-commerce', href: '/ecommerce' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/ecommerce" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">IntelliGestor</span>
          </Link>
        )}
        
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto">
            <Store className="h-5 w-5 text-white" />
          </div>
        )}

        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'rounded-lg p-1.5 hover:bg-gray-100 transition-colors',
              collapsed && 'hidden'
            )}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-white')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle (Mobile) */}
      {!collapsed && (
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={onToggle}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Recolher menu</span>
          </button>
        </div>
      )}
    </aside>
  );
};
