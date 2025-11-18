import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'http2.mlstatic.com',
      'mla-s1-p.mlstatic.com', 
      'mla-s2-p.mlstatic.com',
      'mlstatic.com',
      'mercadolibre.com'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: http:",
              "font-src 'self'",
              "connect-src 'self' https://intelligestor-backend.onrender.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
