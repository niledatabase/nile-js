/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    if (options.isServer) {
      config.externals = ['@tanstack/react-query', ...config.externals];
    }

    const reactQuery = path.resolve(require.resolve('@tanstack/react-query'));

    config.resolve.alias['@tanstack/react-query'] = reactQuery;
    return config;
  },
};

module.exports = nextConfig;
