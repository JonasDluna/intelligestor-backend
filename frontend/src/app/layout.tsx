import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: 'Intelligestor',
  title: {
    default: 'Intelligestor - Sistema de Gestão Inteligente',
    template: '%s | Intelligestor',
  },
  description:
    'Sistema inteligente de gestão de estoque e vendas integrado ao Mercado Livre.',
  keywords: [
    'intelligestor',
    'mercado livre',
    'gestão de vendas',
    'automação',
    'inteligência artificial',
  ],
  authors: [{ name: 'Equipe Intelligestor' }],
};

export const viewport: Viewport = {
  themeColor: '#030712',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
