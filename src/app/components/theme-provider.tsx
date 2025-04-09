// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"
// 导入 next-themes 提供的主题提供者
import { ThemeProvider as NextThemesProvider } from "next-themes"
// 导入 Next.js 类型
import type { ThemeProviderProps } from "next-themes"

// 定义 ThemeProvider 组件，包装 next-themes 提供的 ThemeProvider
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

