import type { NextConfig } from 'next';
import path from 'node:path';
const config: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};
export default config;
