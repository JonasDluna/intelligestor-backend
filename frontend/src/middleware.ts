import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isPublicRoute = request.nextUrl.pathname === '/' || isLoginPage;

  // Se está tentando acessar rota protegida sem token
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se está autenticado e tenta acessar login, redireciona para dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirecionar home para dashboard se autenticado
  if (request.nextUrl.pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirecionar home para login se não autenticado
  if (request.nextUrl.pathname === '/' && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/produtos/:path*',
    '/estoque/:path*',
    '/vendas/:path*',
    '/financeiro/:path*',
    '/clientes/:path*',
    '/mercado-livre/:path*',
    '/configuracoes/:path*',
    '/login',
  ],
};
