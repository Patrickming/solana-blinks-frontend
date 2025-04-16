/**
 * @type {import('postcss-load-config').Config}
 * PostCSS 配置文件
 * 此文件用于配置 PostCSS 插件。
 * 在这个项目中，主要用于加载 Tailwind CSS 插件。
 */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
