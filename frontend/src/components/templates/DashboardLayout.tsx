'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';
import { Header } from '@/components/organisms/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryProvider';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <QueryProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileSidebarOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={handleToggleMobileSidebar}
              />
              <div className="lg:hidden">
                <Sidebar collapsed={false} onToggle={handleToggleMobileSidebar} />
              </div>
            </>
          )}

          {/* Header */}
          <Header
            onMenuToggle={handleToggleMobileSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Main Content */}
          <main
            className={cn(
              'min-h-screen pt-16 transition-all duration-300',
              sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
            )}
          >
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </AuthProvider>
    </QueryProvider>
  );
};
