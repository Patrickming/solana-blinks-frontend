// 'use client' 指令标记这是一个客户端组件，因为它使用了 Hooks (useState, useEffect, usePathname, useSidebar)
"use client"

import type React from "react" // 导入 React 类型定义，确保类型安全

// 导入 React 核心 Hooks 和 Next.js 导航 Hook
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation" // 用于获取当前 URL 路径

// 导入布局相关的子组件
import { Sidebar } from "./sidebar" // 侧边栏导航组件
import { SiteHeader } from "./site-header" // 顶部导航栏组件
// 导入侧边栏上下文 Hook
import { useSidebar } from "@/app/context/sidebar-context" // 注意：路径可能需要根据实际项目结构调整
// 导入其他 UI 组件
import { HelpButton } from "./help-button" // 帮助按钮组件

/**
 * `MainLayout` 组件 - 应用程序的核心布局结构。
 *
 * 该组件负责组织应用程序页面的整体框架，通常包含一个固定的侧边栏、
 * 一个固定的顶部导航栏，以及一个用于显示当前页面内容的主区域。
 * 它还可能包含其他全局 UI 元素，如浮动的帮助按钮。
 *
 * 主要职责:
 * 1. **结构定义:** 使用 Flexbox 或 Grid 布局来排列 `Sidebar`、`SiteHeader` 和主内容区域 (`children`)。
 * 2. **上下文集成:** 可能使用 `useSidebar` 等上下文 Hooks 来响应或影响布局状态 (例如，主内容区域是否需要根据侧边栏的展开/收缩调整边距)。
 * 3. **条件渲染:** 可能会根据当前路由 (`pathname`) 来决定是否渲染完整的布局 (例如，在登录/注册页面可能不需要侧边栏和头部)。
 * 4. **内容承载:** 通过 `children` prop 接收并渲染当前页面或路由匹配到的具体内容组件。
 *
 * @param {{ children: React.ReactNode }} props - 包含要渲染在主内容区域的子组件或页面内容。
 * @returns {JSX.Element | null} 返回渲染后的主布局结构，或者在特定条件下返回 `null` 或仅渲染 `children`。
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  // 从侧边栏上下文中获取侧边栏的当前状态 (可能用于调整主内容区的样式，但在此示例中未使用)
  // const { isOpen } = useSidebar();
  // 获取当前页面的路径名
  const pathname = usePathname();

  // 特殊页面处理：对于登录和注册页面，我们通常不希望显示主布局 (侧边栏和头部)
  // 直接返回页面内容本身。
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>; // 使用 React Fragment 包裹 children
  }

  // --- 主布局渲染 --- //
  return (
    // 使用 Flexbox 创建整体布局容器，高度占满屏幕，防止内容溢出屏幕
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 渲染侧边栏组件 */}
      {/* Sidebar 组件内部会处理自己的显示/隐藏逻辑 (基于 useSidebar) */}
      <Sidebar />

      {/* 主内容区域容器 */}
      {/* 使用 Flexbox 让其垂直排列 (flex-col)，并占据剩余空间 (flex-1) */}
      {/* overflow-hidden 防止内部内容溢出此容器 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 渲染顶部导航栏组件 */}
        {/* SiteHeader 通常是固定的 */}
        <SiteHeader />

        {/* 主内容区域 (`<main>`) */}
        {/* flex-1 使其填充剩余的垂直空间 */}
        {/* overflow-auto 允许内容超出时出现滚动条 */}
        {/* p-4 md:p-6 添加内边距，并在中等屏幕以上增大内边距 */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {children} {/* 渲染传递进来的页面内容 */}
        </main>
      </div>

      {/* 渲染全局帮助按钮 (如果需要) */}
      {/* HelpButton 可能使用 fixed 定位，不直接参与 Flex 布局 */}
      {/* <HelpButton /> */}
      {/* 注意：HelpButton 当前未在此布局中使用，如果需要全局显示，取消注释即可 */} 
    </div>
  );
}

