let userConfig = undefined
try {
  // 尝试首先导入 ESM 配置
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // 如果 ESM 失败，回退到 CJS 导入
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // 忽略内部错误
  }
}

/**
 * @type {import('next').NextConfig}
 * Next.js 配置文件
 * 此文件定义了 Next.js 应用的构建和运行时行为。
 * 它包括 ESLint 和 TypeScript 的配置、图片优化设置、实验性功能开关、编译器选项等。
 * 它还会尝试加载一个可选的用户自定义配置文件 (v0-user-next.config.mjs 或 v0-user-next.config.js)
 * 并将其合并到基础配置中，允许用户覆盖或扩展默认设置。
 */
const nextConfig = {
  eslint: {
    // 在构建期间忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在构建期间忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
  images: {
    // 禁用 Next.js 的内置图片优化 (可能用于静态导出或特定部署场景)
    unoptimized: true,
  },
  experimental: {
    // 启用实验性的 Webpack 构建工作线程 (可能提高构建性能)
    webpackBuildWorker: true,
    // 启用实验性的并行服务器构建跟踪
    parallelServerBuildTraces: true,
    // 启用实验性的并行服务器编译
    parallelServerCompiles: true,
  },
  compiler: {
    // 启用对 styled-components 的支持
    styledComponents: true,
  },
  // 设置输出模式为独立部署 (生成包含所有依赖的 .next/standalone 目录)
  output: 'standalone',
  webpack: (config) => {
    let existingWebpackConfig = config;
    
    if (userConfig && userConfig.default?.webpack || userConfig?.webpack) {
      // 不在此处修改，稍后将合并用户 Webpack 配置
    } else {
      // 为浏览器环境配置 Webpack 回退 (fallback)
      // 这对于某些期望 Node.js 核心模块的库是必需的
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        fs: false, // 禁用 'fs' 模块
        path: false, // 禁用 'path' 模块
        os: false // 禁用 'os' 模块
      };
    }
    
    return existingWebpackConfig;
  },
}

if (userConfig) {
  // ESM 导入会有 "default" 属性
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      // 合并对象类型的配置
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      // 直接覆盖其他类型的配置
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
