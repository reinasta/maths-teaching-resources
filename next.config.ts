import type { Configuration as WebpackConfig } from 'webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports
  images: {
    unoptimized: true, // Required for static export
  },
  webpack: (config: WebpackConfig) => {
    // Handle D3.js imports
    config.resolve = config.resolve || {};
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    };
    return config;
  }
};

export default nextConfig;