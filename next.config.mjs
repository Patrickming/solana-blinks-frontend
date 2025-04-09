let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  compiler: {
    styledComponents: true,
  },
  output: 'standalone',
  optimizeFonts: true,
  // Add critters for CSS optimization
  optimizeCss: true,
  webpack: (config) => {
    let existingWebpackConfig = config;
    
    if (userConfig && userConfig.default?.webpack || userConfig?.webpack) {
      // Don't modify here, will be merged later
    } else {
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        fs: false, 
        path: false, 
        os: false 
      };
    }
    
    return existingWebpackConfig;
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
