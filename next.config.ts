
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [],
  buildExcludes: [/middleware-manifest\.json$/],
  maximumFileSizeToCacheInBytes: 3000000, // 3MB limit for cached files
  // Fix for the 500.html file error
  fallbacks: {
    document: '/404',
  },
  disableDevLogs: true,
  // Add navigation handler for PWA
  navigationPreload: true
});

// Create manifest.json separately - PWA will use this from the public directory
const fs = require('fs');
const path = require('path');

// Ensure the manifest exists in the public directory
const manifestContent = {
  name: 'Primape',
  short_name: 'Primape',
  description: 'The premier prediction marketplace on ApeChain',
  display: 'standalone',
  start_url: '/',
  background_color: '#000000',
  theme_color: '#000000',
  icons: [
    {
      src: '/primape/pm-blk.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/primape/pm-blk.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/primape/pm-blk.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/primape/pm-blk.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
};

// This will create the manifest file during build time
try {
  fs.writeFileSync(
    path.join(__dirname, 'public', 'manifest.json'),
    JSON.stringify(manifestContent, null, 2)
  );
} catch (error) {
  console.error('Error writing manifest file:', error);
}

const nextConfig: NextConfig = {
  // Add output config to ensure proper Vercel deployment with Prisma
  output: 'standalone',
  // This includes files in the output trace
  outputFileTracingRoot: process.cwd(),
  // Ensure Prisma binaries are included
  outputFileTracingIncludes: {
    '/**': ['node_modules/@prisma/**/*', 'node_modules/.prisma/**/*']
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
  // Avoid large builds crashing
  staticPageGenerationTimeout: 120,
};

export default pwaConfig(nextConfig);
