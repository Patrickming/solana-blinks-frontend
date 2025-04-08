/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, os: false };
    return config;
  },
  images: {
    domains: ['phantom.app', 'solflare.com', 'backpack.app', 'www.okx.com'],
  },
}

export default nextConfig;

