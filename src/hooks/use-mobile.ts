// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

import { useState, useEffect } from "react" // 导入 React hooks

// 自定义 hook，用于检测当前设备是否为移动设备
export const useMobile = () => {
  // 状态管理，默认假设不是移动设备
  const [isMobile, setIsMobile] = useState(false)

  // 使用 useEffect 在组件挂载和窗口大小变化时检测设备类型
  useEffect(() => {
    // 处理窗口大小变化的函数
    const handleResize = () => {
      // 根据窗口宽度判断是否为移动设备，这里使用 768px 作为断点
      setIsMobile(window.innerWidth < 768) // 调整断点可根据需要
    }

    // 设置初始值
    handleResize()

    // 添加窗口大小变化事件监听器
    window.addEventListener("resize", handleResize)

    // 组件卸载时移除事件监听器，防止内存泄漏
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // 返回当前设备是否为移动设备的状态
  return isMobile
}

