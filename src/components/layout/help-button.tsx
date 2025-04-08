// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

// 导入 Next.js 路由
import { useRouter } from "next/navigation"
// 导入 UI 组件
import { Button } from "@/components/ui/button"
// 导入图标
import { HelpCircle } from "lucide-react"
// 导入提示组件
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 定义 HelpButton 组件，提供快速访问教程的悬浮按钮
export function HelpButton() {
  const router = useRouter() // 初始化路由器

  return (
    // 提示组件提供者
    <TooltipProvider>
      <Tooltip>
        {/* 提示触发器，使用按钮作为子元素 */}
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            // 样式：固定位置、圆形、半透明背景、模糊效果
            className="fixed right-4 top-20 z-50 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-md"
            // 点击时导航到教程页面
            onClick={() => router.push("/tutorials")}
          >
            <HelpCircle className="h-5 w-5" />
            {/* 屏幕阅读器辅助文本 */}
            <span className="sr-only">Help</span>
          </Button>
        </TooltipTrigger>
        {/* 提示内容 */}
        <TooltipContent>
          <p>Need help? Click for tutorials</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

