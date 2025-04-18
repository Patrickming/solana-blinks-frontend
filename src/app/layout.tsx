// 导入 React 的基本类型定义
import type React from "react"
// 导入 Next.js 的 Metadata 类型，用于定义页面元数据
import type { Metadata } from "next"
// 从 next/font/google 导入 Inter 字体，用于优化字体加载
import { Inter } from "next/font/google"
// 导入全局 CSS 样式表
import "./globals.css"
// 导入应用程序所需的各种上下文提供者和 UI 组件
import { ThemeProvider } from "@/app/components/theme-provider"
import { WalletProvider } from "@/app/context/wallet-context"
import { SidebarProvider } from "@/app/context/sidebar-context"
import { AuthProvider } from "@/app/context/auth-context"
import { LanguageProvider } from "@/app/context/language-context"
import { Toaster as SonnerToaster } from "sonner"

// 配置 Inter 字体，指定仅加载 latin 子集以减小体积
const inter = Inter({ subsets: ["latin"] })

/**
 * `metadata` 对象 - 定义应用程序的全局元数据。
 * 这些信息会被 Next.js 用来生成 HTML 的 `<head>` 中的 `<meta>` 标签。
 * 对于 SEO 和浏览器标签页显示非常重要。
 */
export const metadata: Metadata = {
  title: "Solana Blinks Platform", // 浏览器标签页和搜索结果中显示的标题
  description: "Create, share, and discover Solana Blinks | 构建、分享和发现 Solana Blinks", // 网站描述，用于搜索引擎
  // keywords: ["Solana", "Blinks", "Web3", "Blockchain", "Actions"], // (可选) 关键词，帮助搜索引擎理解内容
  // icons: { // (可选) 定义网站图标
  //   icon: "/favicon.ico",
  //   apple: "/apple-touch-icon.png",
  // },
  // openGraph: { // (可选) 配置 Open Graph 协议，用于社交媒体分享预览
  //   title: "Solana Blinks Platform",
  //   description: "Create, share, and discover Solana Blinks",
  //   url: "<your_website_url>", // 替换成你的网站 URL
  //   siteName: "Solana Blinks Platform",
  //   images: [
  //     {
  //       url: "<your_preview_image_url>", // 替换成你的预览图片 URL
  //       width: 1200,
  //       height: 630,
  //     },
  //   ],
  //   locale: "zh_CN", // 或 "en_US"
  //   type: "website",
  // },
}

/**
 * `RootLayout` 组件 - 应用程序的根布局。
 *
 * 这是所有页面共享的最外层布局结构。它负责：
 * 1. **设置 HTML 基本结构:** 定义 `<html>` 和 `<body>` 标签，设置语言、字体、基本样式。
 * 2. **包裹全局上下文提供者:** 将整个应用程序包裹在必要的 Context Provider 中
 *    （如 `ThemeProvider`, `WalletProvider`, `AuthProvider` 等），
 *    确保所有子组件都能访问这些全局状态和功能。
 * 3. **渲染子页面:** 通过 `children` prop 接收并渲染当前路由匹配到的页面组件。
 * 4. **加载全局资源:** 可能包含全局 CSS、字体或其他需要在所有页面加载的资源。
 * 5. **提供全局 UI 元素:** 例如使用 `<Toaster>` 组件来处理全局的通知显示。
 *
 * @param {Readonly<{ children: React.ReactNode }>} props - 包含子页面内容的 props 对象。
 * @returns {JSX.Element} 渲染后的根布局及嵌入的子页面。
 */
export default function RootLayout({
  children, // `children` 代表了 Next.js 根据当前路由渲染的具体页面组件
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // 定义 HTML 根元素
    // lang="zh" 设置页面语言为中文 (可根据默认语言调整)
    // suppressHydrationWarning={true} 抑制由于浏览器扩展等原因可能导致的 hydration 警告
    <html lang="zh" suppressHydrationWarning>
      {/* HTML 头部，Next.js 会根据 metadata 和页面级配置自动填充 */}
      <head>
        {/* 可以在这里添加不适合放入 metadata 的 <head> 内容，例如预加载链接 */}
        {/* 预加载 Dialect Blinks CSS 以提高感知性能 */}
        <link 
          rel="preload"
          href="https://unpkg.com/@dialectlabs/blinks/dist/index.css"
          as="style"
        />
        {/* 实际引入 Dialect Blinks CSS */}
        {/* precedence="high" 建议浏览器优先加载此样式表 */}
        <link 
          rel="stylesheet"
          href="https://unpkg.com/@dialectlabs/blinks/dist/index.css"
          precedence="high"
        />
      </head>
      {/* HTML Body 部分 */}
      {/* 应用 Inter 字体类名，并添加抗锯齿和最小高度样式 */}
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        {/* --- 全局上下文提供者嵌套 --- */}
        {/* 主题提供者 (next-themes)，管理明暗主题切换 */}
        {/* attribute="class" 表示通过在 html 标签上添加 class (如 'dark') 来切换主题 */}
        {/* defaultTheme="dark" 设置默认主题为暗色 */}
        {/* enableSystem 允许根据操作系统偏好设置主题 (如果需要) */}
        {/* disableTransitionOnChange 切换主题时不应用 CSS 过渡效果，防止闪烁 */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {/* Solana 钱包上下文提供者 */}
          <WalletProvider>
            {/* 用户认证上下文提供者 */}
            <AuthProvider>
              {/* 语言国际化上下文提供者 */}
              <LanguageProvider>
                {/* 侧边栏状态上下文提供者 */}
                <SidebarProvider>
                  {/* --- 主体内容和全局 UI 元素 --- */}
                  {/* 使用相对定位的 div 包裹，以便内部绝对/固定定位的元素可以相对于它 */}
                  <div className="relative flex flex-col min-h-screen">
                    {/* 可选的背景装饰元素 */}
                    {/* 使用固定定位和负 z-index 将其置于内容下方 */}
                    {/* <div className="fixed inset-0 -z-10 overflow-hidden">
                      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                      <div className="absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                    </div> */}

                    {/* 渲染当前页面的内容 (`children`) */}
                    {/* 这个 children 会被 MainLayout (如果路由匹配) 或特定页面组件替换 */}
                    <div className="flex-grow"> {/* 确保内容区域能正确填充 */} 
                       {children}
                    </div>
                    
                    {/* Global Toaster Component from Sonner */}
                    <SonnerToaster richColors position="top-right" theme="system" />
                  </div>
                </SidebarProvider>
              </LanguageProvider>
            </AuthProvider>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}