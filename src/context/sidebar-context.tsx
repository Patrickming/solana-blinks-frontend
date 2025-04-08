"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"

// 定义侧边栏上下文类型
type SidebarContextType = {
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

// 创建侧边栏上下文
const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

// 定义侧边栏提供者组件
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()
  const pathname = usePathname()

  // 在移动设备上导航时关闭侧边栏
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  // 根据屏幕大小设置默认状态
  useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])

  // 切换侧边栏开关状态的方法
  const toggleSidebar = () => setIsOpen(!isOpen)
  // 关闭侧边栏的方法
  const closeSidebar = () => setIsOpen(false)

  // 提供侧边栏上下文值
  return <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>{children}</SidebarContext.Provider>
}

// 自定义 hook，用于在组件中访问侧边栏上下文
export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

