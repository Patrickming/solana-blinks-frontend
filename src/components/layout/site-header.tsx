"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Menu, Sun, Moon, LogOut, User, Settings, X, Code, BookOpen, Layout, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useWallet } from "@/context/wallet-context"
import { useAuth } from "@/context/auth-context"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { AuthDialog } from "@/components/auth-dialog"
import { useLanguage } from "@/context/language-context"
import { WalletButton } from "@/components/wallet/wallet-button"

/**
 * 网站头部导航栏组件
 * 包含导航链接、用户菜单和主题切换
 *
 * @returns 网站头部导航栏组件
 */
export function SiteHeader() {
  // Hooks
  const pathname = usePathname() // 当前路径
  const router = useRouter() // 路由
  const { connected, address, disconnect } = useWallet() // 钱包状态
  const { user, isAuthenticated, logout, needsWalletConnection } = useAuth() // 认证状态
  const { theme, setTheme } = useTheme() // 主题
  const { toast } = useToast() // 提示组件
  const { t } = useLanguage() // 国际化

  // 状态管理
  const [isScrolled, setIsScrolled] = useState(false) // 是否已滚动
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // 移动菜单是否打开
  const [authDialogOpen, setAuthDialogOpen] = useState(false) // 认证对话框是否打开
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "register" | "wallet" | "setup">("login") // 认证对话框模式
  const [mounted, setMounted] = useState(false) // 用于处理水合问题

  // 导航路由配置
  const routes = [
    {
      name: "Blink创建", // 显示名称
      path: "/blink", // 路径
      key: "nav.blink", // 国际化键名
      icon: <Code className="mr-1.5 h-4 w-4" />, // 图标
    },
    {
      name: "教程",
      path: "/tutorials",
      key: "nav.tutorials",
      icon: <BookOpen className="mr-1.5 h-4 w-4" />,
    },
    {
      name: "案例展示",
      path: "/showcase",
      key: "nav.showcase",
      icon: <Layout className="mr-1.5 h-4 w-4" />,
    },
    {
      name: "社区",
      path: "/forum",
      key: "nav.forum",
      icon: <MessageSquare className="mr-1.5 h-4 w-4" />,
    },
  ]

  /**
   * 客户端挂载后设置mounted为true
   * 用于解决服务端渲染和客户端渲染不一致的问题
   */
  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * 监听滚动事件，更新导航栏样式
   * 当页面滚动超过10px时，添加阴影效果
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  /**
   * 路径变化时关闭移动菜单
   * 当用户导航到新页面时，自动关闭移动菜单
   */
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  /**
   * 处理登出
   * 调用认证上下文的登出方法
   */
  const handleLogout = () => {
    logout()
  }

  /**
   * 打开登录对话框
   * 设置认证对话框模式为登录并打开对话框
   */
  const openLoginDialog = () => {
    setAuthDialogMode("login")
    setAuthDialogOpen(true)
  }

  /**
   * 打开注册对话框
   * 设置认证对话框模式为注册并打开对话框
   */
  const openRegisterDialog = () => {
    setAuthDialogMode("register")
    setAuthDialogOpen(true)
  }

  /**
   * 打开钱包连接对话框
   * 设置认证对话框模式为钱包并打开对话框
   */
  const openWalletDialog = () => {
    setAuthDialogMode("wallet")
    setAuthDialogOpen(true)
  }

  /**
   * 切换主题
   * 在深色和浅色主题之间切换
   */
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // 为了避免水合错误，只在客户端显示正确的图标
  const ThemeIcon = () => {
    if (!mounted) {
      // 在服务端或者客户端挂载前，返回一个占位元素
      return <div className="h-5 w-5" />
    }

    // 客户端挂载后，根据当前主题决定显示哪个图标
    return theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 bg-background border-b border-border/40",
        isScrolled ? "shadow-sm" : "",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* 网站标志和名称 */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] flex items-center justify-center">
              <span className="font-bold text-white">SB</span>
            </div>
            <span className="hidden font-bold sm:inline-block">Solana Blinks</span>
          </Link>
        </div>

        {/* 导航栏右侧部分 */}
        <div className="flex items-center gap-4">
          {/* 桌面导航链接 */}
          <nav className="hidden md:flex md:items-center">
            <div className="bg-background/50 backdrop-blur-md rounded-full px-4 py-1 border border-border/30 shadow-sm">
              {routes.map((item, index) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary relative px-4 py-2 inline-flex items-center",
                    pathname === item.path ? "text-primary" : "text-foreground/70 hover:text-foreground",
                    index !== 0 && "border-l border-border/20",
                  )}
                >
                  {item.icon}
                  <span>{t(item.key) || item.name}</span>
                  {/* 当前页面指示器 */}
                  {pathname === item.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full"
                      layoutId="navbar-indicator"
                      style={{ width: "100%" }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* 搜索按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/60"
            onClick={() => {
              toast({
                title: t("search.title") || "搜索功能",
                description: t("search.description") || "搜索功能即将上线",
              })
            }}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">{t("search.label") || "搜索"}</span>
          </Button>

          {/* 主题切换按钮 */}
          <Button variant="ghost" size="icon" onClick={handleThemeToggle} className="text-foreground/60">
            <ThemeIcon />
            <span className="sr-only">{t("theme.toggle") || "切换主题"}</span>
          </Button>

          {/* 已登录用户菜单 */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* 需要连接钱包时显示钱包连接按钮 */}
              {needsWalletConnection && !connected && (
                <WalletButton variant="outline" size="sm" className="hidden md:flex" />
              )}

              {/* 用户下拉菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.username
                          ? user.username.charAt(0).toUpperCase()
                          : address
                            ? address.slice(0, 2).toUpperCase()
                            : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {user?.email || (user?.username ? `@${user.username}` : t("user.anonymous") || "用户")}
                  </div>
                  {user?.walletAddress && (
                    <div className="px-2 py-1.5 text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      {t("nav.profile") || "个人中心"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      {t("nav.settings") || "设置"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth.logout") || "退出登录"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* 未登录用户按钮 */
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden md:flex" onClick={openLoginDialog}>
                {t("auth.login") || "登录"}
              </Button>
              <WalletButton
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 hidden md:flex"
              />
            </div>
          )}

          {/* 移动端菜单按钮 */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 移动端菜单 - 使用AnimatePresence实现动画效果 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* 移动菜单头部 */}
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] flex items-center justify-center">
                  <span className="font-bold text-white">SB</span>
                </div>
                <span className="font-bold">Solana Blinks</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* 移动菜单内容 */}
            <div className="flex flex-col p-4 space-y-4">
              <nav className="flex flex-col space-y-4">
                {routes.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary py-2 border-b border-border/20 flex items-center",
                      pathname === item.path ? "text-primary" : "text-foreground/60",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {t(item.key) || item.name}
                  </Link>
                ))}
              </nav>
              {/* 移动菜单底部按钮 */}
              <div className="pt-4 space-y-4">
                {isAuthenticated ? (
                  <>
                    {needsWalletConnection && !connected && <WalletButton variant="outline" className="w-full" />}
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push("/profile")
                      }}
                    >
                      {t("nav.profile") || "个人中心"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      {t("auth.logout") || "退出登录"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        openLoginDialog()
                      }}
                    >
                      {t("auth.login") || "登录"}
                    </Button>
                    <WalletButton
                      className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 认证对话框 */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} mode={authDialogMode} />
    </header>
  )
}

