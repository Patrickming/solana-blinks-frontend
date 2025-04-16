// 'use client' 指令标记这是一个客户端组件，因为它使用了客户端 Hook (useRouter)
"use client"

// 导入 Next.js 的 useRouter Hook，用于程序化导航
import { useRouter } from "next/navigation"
// 导入自定义的 Button 组件
import { Button } from "@/app/components/ui/button"
// 从 lucide-react 导入 HelpCircle 图标
import { HelpCircle } from "lucide-react"
// 导入类名合并工具函数
import { cn } from "@/app/lib/utils";
// 导入自定义的 Tooltip (提示) 组件及其相关部分
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip"

/**
 * `HelpButton` 组件 - 一个全局可用的悬浮帮助按钮。
 *
 * 该组件通常使用固定定位 (fixed positioning) 显示在屏幕的某个角落（例如右下角或右上角）。
 * 它提供一个带有问号图标的按钮，用户点击后会被导航到应用程序的帮助或教程页面。
 * 同时，当用户鼠标悬停在按钮上时，会显示一个提示信息。
 *
 * @component
 * @returns {JSX.Element} 渲染后的帮助按钮组件。
 */
export function HelpButton() {
  // 初始化 Next.js 路由器实例，用于后续的页面跳转
  const router = useRouter();

  // 使用 TooltipProvider 包裹整个组件，为内部的 Tooltip 提供必要的上下文
  return (
    <TooltipProvider>
      {/* Tooltip 组件本身 */} 
      <Tooltip>
        {/* TooltipTrigger 定义了触发提示显示的目标元素 */} 
        {/* `asChild` prop 允许我们将 Button 直接作为触发器，而不是让 TooltipTrigger 渲染额外的 div */}
        <TooltipTrigger asChild>
          {/* 实际的按钮元素 */} 
          <Button
            variant="outline" // 使用轮廓按钮样式
            size="icon" // 使用图标按钮尺寸
            // --- 样式 --- //
            className={cn( // 使用 cn 函数合并类名
              "fixed right-4 top-20 z-50", // 固定定位在右上角（可调整），设置层级
              "rounded-full", // 圆形按钮
              "bg-background/80 backdrop-blur-sm", // 半透明背景并带模糊效果
              "border border-border/50", // 边框样式
              "shadow-md", // 添加阴影
              "hover:bg-accent" // 悬停效果
            )}
            // --- 事件处理 --- //
            // 点击按钮时，使用 router.push() 导航到 /tutorials 页面
            onClick={() => router.push("/tutorials")}
            aria-label="打开帮助教程" // 为按钮添加可访问性标签
          >
            {/* 按钮内部的图标 */}
            <HelpCircle className="h-5 w-5" />
            {/* <span className="sr-only">帮助</span> */}
            {/* 屏幕阅读器文本，上面的 aria-label 更具体 */}
          </Button>
        </TooltipTrigger>
        {/* TooltipContent 定义了鼠标悬停时显示的提示内容 */} 
        <TooltipContent>
          <p>需要帮助？点击查看教程</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

