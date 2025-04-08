// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

// 导入钱包和侧边栏上下文
import { useWallet } from "@/components/wallet-provider"
import { useSidebar } from "@/components/sidebar-provider"
// 导入 UI 组件
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// 导入图标
import { Menu, User, LogOut } from "lucide-react"
// 导入主题切换组件
import { ModeToggle } from "@/components/mode-toggle"
// 导入路由
import { useRouter } from "next/navigation"

// 定义 Header 组件的属性接口
interface HeaderProps {
  title: string // 页面标题
}

// 定义 Header 组件
export function Header({ title }: HeaderProps) {
  // 从钱包上下文获取状态和方法
  const { connected, address, disconnect } = useWallet()
  // 从侧边栏上下文获取切换方法
  const { toggleSidebar } = useSidebar()
  // 初始化路由器
  const router = useRouter()

  // 处理登出的函数
  const handleLogout = () => {
    disconnect() // 断开钱包连接
    router.push("/login") // 导航到登录页面
  }

  return (
    // 头部容器，使用 sticky 定位保持在顶部
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur px-4 md:px-6">
      {/* 左侧区域：标题和侧边栏切换按钮 */}
      <div className="flex items-center gap-2">
        {/* 侧边栏切换按钮，仅在移动设备上显示 */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        {/* 页面标题 */}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      {/* 右侧区域：主题切换和用户菜单 */}
      <div className="flex items-center gap-2">
        {/* 主题切换组件 */}
        <ModeToggle />

        {/* 根据钱包连接状态显示不同内容 */}
        {connected ? (
          // 已连接钱包：显示用户下拉菜单
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* 显示钱包地址（截断显示） */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
              </div>
              <DropdownMenuSeparator />
              {/* 个人资料链接 */}
              <DropdownMenuItem asChild>
                <a href="/profile">Profile</a>
              </DropdownMenuItem>
              {/* 设置链接 */}
              <DropdownMenuItem asChild>
                <a href="/settings">Settings</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* 登出选项 */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // 未连接钱包：显示登录按钮
          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        )}
      </div>
    </header>
  )
}

