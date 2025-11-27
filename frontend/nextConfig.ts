import type { NextConfig } from 'next';

const backendOrigins = Array.from(
  new Set(
    [
      'http://localhost:8000',
      'https://intelligestor-backend.onrender.com',
      process.env.NEXT_PUBLIC_API_URL ?? '',
    ].filter(Boolean),
  ),
);

export const cspDirectives = [
  "default-src 'self'",
  // Endurecer scripts: evitar inline/eval; manter blob para funcionalidades necessárias
  "script-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  `connect-src 'self' ${backendOrigins.join(' ')} ws: wss:`,
];

export const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'http2.mlstatic.com' },
      { protocol: 'https', hostname: 'mla-s1-p.mlstatic.com' },
      { protocol: 'https', hostname: 'mla-s2-p.mlstatic.com' },
      { protocol: 'https', hostname: '**.mlstatic.com' },
      { protocol: 'https', hostname: '**.mercadolibre.com' },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'none'; sandbox;",
  },
  // Silencia o warning do Turbopack sobre root
  turbopack: {
    root: __dirname.replace(/\\/g, '/'),
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
          },
        ],
      },
    ];
  },
};
