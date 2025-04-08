// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

// 导入 Next.js 组件和路由
import Link from "next/link"
import { usePathname } from "next/navigation"
// 导入侧边栏上下文
import { useSidebar } from "@/components/sidebar-provider"
// 导入 UI 组件
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
// 导入图标
import { Home, Link2, BookOpen, Layers, MessageSquare, User, Settings, Menu, X } from "lucide-react"
// 导入工具函数
import { cn } from "@/lib/utils"

// 定义 Sidebar 组件
export function Sidebar() {
  const pathname = usePathname() // 获取当前路径
  const { isOpen, toggleSidebar } = useSidebar() // 从侧边栏上下文获取状态和方法

  // 定义导航路由
  const routes = [
    {
      name: "Dashboard", // 显示名称
      path: "/", // 路径
      icon: Home, // 图标组件
    },
    {
      name: "Blink Creator",
      path: "/blink",
      icon: Link2,
    },
    {
      name: "Tutorials",
      path: "/tutorials",
      icon: BookOpen,
    },
    {
      name: "Showcase",
      path: "/showcase",
      icon: Layers,
    },
    {
      name: "Forum",
      path: "/forum",
      icon: MessageSquare,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      {/* 移动设备上的遮罩层，仅在侧边栏打开时显示 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar} // 点击遮罩层关闭侧边栏
        />
      )}

      {/* 侧边栏主体 */}
      <aside
        className={cn(
          // 基础样式：固定定位、全高、左侧、z-index、宽度、变换、背景色、边框
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-solana-blue border-r border-border/50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          // 条件样式：根据 isOpen 状态决定是否显示
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* 侧边栏头部 */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
          {/* Logo 和标题链接 */}
          <Link href="/" className="flex items-center space-x-2">
            {/* Logo 圆形背景 */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] flex items-center justify-center">
              <span className="font-bold text-white">SB</span>
            </div>
            {/* 标题文本 */}
            <span className="font-bold text-lg">Solana Blinks</span>
          </Link>
          {/* 关闭按钮，仅在移动设备上显示 */}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 侧边栏内容区域，使用 ScrollArea 组件实现滚动 */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            {/* 导航菜单 */}
            <nav className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    // 基础样式：布局、内边距、圆角、字体、过渡效果
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    // 条件样式：当前路径匹配时使用渐变背景和白色文本，否则使用次要文本颜色
                    pathname === route.path
                      ? "bg-solana-gradient text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {/* 路由图标 */}
                  <route.icon className="mr-3 h-5 w-5" />
                  {/* 路由名称 */}
                  {route.name}
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>

      {/* 移动设备上的侧边栏切换按钮，固定在右下角 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary shadow-lg md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}

