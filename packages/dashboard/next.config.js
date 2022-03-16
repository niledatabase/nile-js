/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  // TODO remove - for use with github pages, using vercel for now
  // assetPrefix: isProd ? "/nile-js/" : "",
};

module.exports = nextConfig;
