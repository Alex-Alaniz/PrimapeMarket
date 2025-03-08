
import type { NextConfig } from "next";
// @ts-ignore - No type definitions available for next-pwa
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true,
  // Improve build performance
  swcMinify: true,
  // Avoid large builds crashing
  staticPageGenerationTimeout: 120,
  // Increase memory limit for builds
  experimental: {
    memoryUsageWarningThreshold: 1024 * 1024 * 1024, // 1GB
  },
};

export default pwaConfig(nextConfig);
