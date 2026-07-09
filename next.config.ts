import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Optimized image handling
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compiler options
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Security: prevent server-side env vars from leaking to the client
  // Only NEXT_PUBLIC_ prefixed vars are exposed
  experimental: {},
};

export default nextConfig;
