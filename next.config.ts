// next.config.ts
import type { Configuration as WebpackConfig } from 'webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config: WebpackConfig) => {
    config.resolve = config.resolve || {};
    
    // Ensure single React instance
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    };

    // Handle TypeScript extensions
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx']
    };

    // Three.js specific settings
    config.module = config.module || { rules: [] };
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /three\/examples\/jsm/,
      resolve: {
        fullySpecified: false
      }
    });

    return config;
  }
};

export default nextConfig;