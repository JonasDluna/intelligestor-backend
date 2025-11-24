import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Settings, LogOut, Bell, Store
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: Store, label: 'E-commerce', href: '/ecommerce' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export default function AppLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-600 via-indigo-600 to-purple-600 flex flex-col shadow-xl">
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
              <span className="text-indigo-600 font-bold text-base">IG</span>
            </div>
            <span className="text-xl font-bold text-white">IntelliGestor</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                  ${isActive 
                    ? 'bg-white text-indigo-600 shadow-lg font-semibold' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                  }
                `}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="px-4 py-4 space-y-2">
          <Link
            href="/configuracoes"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all font-medium"
          >
            <Settings size={22} />
            <span className="text-sm">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all font-medium"
          >
            <LogOut size={22} />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification */}
            <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user.name || 'Usuário'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 bg-[#F8F9FA]">
          {children}
        </main>
      </div>
    </div>
  );
}
