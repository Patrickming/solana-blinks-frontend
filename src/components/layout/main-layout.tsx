// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

import type React from "react" // 导入 React 类型

// 导入 React hooks 和 Next.js 路由
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
// 导入组件
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useSidebar } from "@/components/sidebar-provider" // 导入侧边栏上下文
import { HelpButton } from "@/components/help-button" // 导入帮助按钮组件

// 定义 MainLayout 组件，作为应用的主要布局结构
export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar() // 从侧边栏上下文获取侧边栏是否打开的状态
  const pathname = usePathname() // 获取当前路径
  const [pageTitle, setPageTitle] = useState("Dashboard") // 页面标题状态，默认为 "Dashboard"

  // 根据当前路径设置页面标题
  useEffect(() => {
    // 从路径中提取第一段作为页面标题
    const path = pathname.split("/")[1]
    if (!path) {
      // 如果是根路径，设置标题为 "Dashboard"
      setPageTitle("Dashboard")
    } else {
      // 否则，将路径首字母大写作为标题
      setPageTitle(path.charAt(0).toUpperCase() + path.slice(1))
    }
  }, [pathname]) // 依赖于 pathname，当路径变化时重新计算

  // 对于认证页面（登录和注册），不渲染布局，直接返回子组件
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>
  }

  // 主布局结构
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏组件 */}
      <Sidebar />
      {/* 主内容区域 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 头部组件，传入页面标题 */}
        <Header title={pageTitle} />
        {/* 主内容，添加滚动和内边距 */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
      {/* 帮助按钮，固定在右侧 */}
      <HelpButton />
    </div>
  )
}

