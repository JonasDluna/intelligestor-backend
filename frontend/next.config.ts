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

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: http:",
  "font-src 'self'",
  `connect-src 'self' ${backendOrigins.join(' ')}`,
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [
      'http2.mlstatic.com',
      'mla-s1-p.mlstatic.com',
      'mla-s2-p.mlstatic.com',
      'mlstatic.com',
      'mercadolibre.com',
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

export default nextConfig;
