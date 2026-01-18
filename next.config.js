/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  outputFileTracingRoot: require('path').join(__dirname),
  images: {
    unoptimized: true, // Required for static export
  },
  transpilePackages: ['react-native-body-highlighter'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'react-native$': 'react-native-web',
        'react-native-svg$': 'react-native-svg-web',
      };
      config.resolve.extensions = [
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        ...config.resolve.extensions,
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
