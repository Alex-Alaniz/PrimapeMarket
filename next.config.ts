import type { NextConfig } from "next";
// @ts-ignore - No type definitions available for next-pwa
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
})({
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Optimize chunking
    webpack: (config, { isServer }) => {
        // Only apply in client-side builds
        if (!isServer) {
            // Increase chunk size limit
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // Create a separate chunk for thirdweb
                    thirdweb: {
                        name: 'thirdweb',
                        test: /[\\/]node_modules[\\/](thirdweb)[\\/]/,
                        priority: 30,
                        reuseExistingChunk: true,
                    },
                    // Group common dependencies together
                    commons: {
                        name: 'commons',
                        minChunks: 2,
                        priority: 20,
                        reuseExistingChunk: true,
                    },
                    // Create a separate bundle for larger modules
                    lib: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                            return `npm.${packageName.replace('@', '')}`;
                        },
                        priority: 10,
                        minChunks: 1,
                        reuseExistingChunk: true,
                    },
                },
                maxInitialRequests: 25,
                minSize: 20000,
            };
        }
        return config;
    },
});

export default pwaConfig(nextConfig);