import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/app/components/theme-provider"
import { WalletProvider } from "@/app/context/wallet-context"
import { SidebarProvider } from "@/app/context/sidebar-context"
import { AuthProvider } from "@/app/context/auth-context"
import { LanguageProvider } from "@/app/context/language-context"
import { Toaster } from "@/app/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

// 定义网站元数据
export const metadata: Metadata = {
  title: "Solana Blinks",
  description: "基于 Solana 区块链的 Blinks 聚合系统",
    generator: 'v0.dev'
}

// 根布局组件，包含全局提供者和基本布局结构
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* Preload critical external CSS */}
        <link 
          rel="preload"
          href="https://unpkg.com/@dialectlabs/blinks/dist/index.css"
          as="style"
        />
        <link 
          rel="stylesheet"
          href="https://unpkg.com/@dialectlabs/blinks/dist/index.css"
          precedence="high"
        />
      </head>
      <body className={`${inter.className} antialiased min-h-screen`}>
        {/* 主题提供者 - 管理深色/浅色主题 */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {/* 钱包提供者 - 管理钱包连接状态 */}
          <WalletProvider>
            {/* 认证提供者 - 管理用户登录状态 */}
            <AuthProvider>
              {/* 语言提供者 - 管理多语言支持 */}
              <LanguageProvider>
                {/* 侧边栏提供者 - 管理侧边栏状态 */}
                <SidebarProvider>
                  <div className="relative min-h-screen">
                    {/* 背景元素 */}
                    <div className="fixed inset-0 -z-10 overflow-hidden">
                      {/* 紫色模糊圆形 */}
                      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                      {/* 绿色模糊圆形 */}
                      <div className="absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                    </div>

                    {children}
                    {/* 消息提示组件 */}
                    <Toaster />
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