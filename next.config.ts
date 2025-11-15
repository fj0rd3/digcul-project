import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (for dev mode)
  turbopack: {
    resolveAlias: {
      'buffer/': 'buffer/',
    },
  },
  
  // Webpack config (for production builds)
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Exclude problematic Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        buffer: false,
      };
      
      // Provide Buffer globally
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
