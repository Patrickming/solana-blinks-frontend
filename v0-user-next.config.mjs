/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, os: false };
    
    // Improve CSS loading priority and ordering in production builds
    if (process.env.NODE_ENV === 'production') {
      // Find the CSS rule
      const cssRule = config.module.rules.find(
        (rule) => rule.oneOf && rule.oneOf.some((r) => r.test && r.test.toString().includes('css'))
      );
      
      if (cssRule && cssRule.oneOf) {
        // Ensure external CSS is processed first 
        cssRule.oneOf.forEach((rule) => {
          if (rule.test && rule.test.toString().includes('css')) {
            rule.sideEffects = true;
          }
        });
      }
    }
    
    return config;
  },
  // Configure CSS optimization
  optimizeFonts: true,
  images: {
    domains: ['phantom.app', 'solflare.com', 'backpack.app', 'www.okx.com', 'raw.githubusercontent.com'],
  },
  // Add environment variables
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || '',
    NEXT_PUBLIC_DEPLOYMENT_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
  },
  // Enable outputStandalone for improved CSS handling
  output: 'standalone',
  // Improve CSS loading in production
  experimental: {
    optimizeCss: true,
  }
}

export default nextConfig;

