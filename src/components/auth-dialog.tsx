"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WalletButton } from "@/components/wallet/wallet-button"

/**
 * 认证对话框属性接口
 */
interface AuthDialogProps {
  open: boolean // 对话框是否打开
  onOpenChange: (open: boolean) => void // 对话框打开状态变化处理函数
  mode?: "login" | "register" | "wallet" | "setup" // 对话框模式
  redirectUrl?: string // 认证成功后重定向URL
  requiredFeature?: string // 需要认证的功能描述
  preventRedirect?: boolean // 是否阻止重定向
  updateDescription?: boolean // 是否更新描述
}

/**
 * 认证对话框组件
 * 处理登录、注册、钱包连接和账号设置
 *
 * @param props - 组件属性
 * @returns 认证对话框组件
 */
export function AuthDialog({
  open,
  onOpenChange,
  mode = "login",
  redirectUrl,
  requiredFeature,
  preventRedirect = false,
  updateDescription = true,
}: AuthDialogProps) {
  // 状态管理
  const [activeTab, setActiveTab] = useState(mode === "setup" ? "setup" : mode === "wallet" ? "wallet" : mode)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  // Hooks
  const { toast } = useToast()
  const router = useRouter()
  const { connected, address, openWalletModal } = useWallet()
  const { login, register, isAuthenticated, user, needsAccountSetup, completeAccountSetup } = useAuth()

  /**
   * 对话框打开/关闭时重置表单
   * 根据用户状态和对话框模式设置活动标签页
   */
  useEffect(() => {
    if (open) {
      // 如果用户需要账号设置，强制使用设置标签
      if (needsAccountSetup && user) {
        setActiveTab("setup")
        setFormData({
          ...formData,
          username: user.username || "",
        })
      } else {
        setActiveTab(mode === "wallet" ? "wallet" : mode)
      }
    } else {
      // 对话框关闭时重置表单数据
      setFormData({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      })
      // 重置密码可见性状态
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [open, mode, needsAccountSetup, user])

  /**
   * 处理输入变化
   * 更新表单数据状态
   *
   * @param field - 字段名
   * @param value - 字段值
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * 处理登录表单提交
   * 验证表单并调用登录方法
   *
   * @param e - 表单提交事件
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!formData.email || !formData.password) {
      toast({
        title: "输入错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await login(formData.email, formData.password)

      onOpenChange(false)

      if (redirectUrl) {
        router.push(redirectUrl)
      }
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message || "请检查您的凭据并重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理注册表单提交
   * 验证表单并调用注册方法
   *
   * @param e - 表单提交事件
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      toast({
        title: "输入错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码相同",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await register(formData.email, formData.username, formData.password)

      onOpenChange(false)

      if (redirectUrl) {
        router.push(redirectUrl)
      }
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message || "请检查您的输入并重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 处理账号设置表单提交
   * 为钱包优先用户完成账号设置
   * 验证表单并调用账号设置方法
   *
   * @param e - 表单提交事件
   */
  const handleAccountSetup = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证表单
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "输入错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码相同",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await completeAccountSetup(formData.email, formData.password)

      onOpenChange(false)

      if (redirectUrl) {
        router.push(redirectUrl)
      }
    } catch (error: any) {
      toast({
        title: "设置失败",
        description: error.message || "请检查您的输入并重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 连接钱包处理
   * 调用钱包连接方法
   */
  const handleConnectWallet = async () => {
    openWalletModal()
  }

  /**
   * 处理对话框关闭
   * 如果未认证且未设置阻止重定向，则重定向到首页
   *
   * @param isOpen - 对话框是否打开
   */
  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen)
    // 如果设置了阻止重定向，则不执行任何重定向操作
    if (!isOpen && !preventRedirect && !isAuthenticated) {
      router.push("/")
    }
  }

  // 检查钱包连接状态，如果已连接则关闭对话框
  useEffect(() => {
    if (connected && address && activeTab === "wallet") {
      // 给用户一点时间看到连接成功
      const timer = setTimeout(() => {
        onOpenChange(false)

        if (redirectUrl) {
          router.push(redirectUrl)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [connected, address, activeTab, onOpenChange, redirectUrl, router])

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{activeTab === "setup" ? "完成账号设置" : "账户访问"}</DialogTitle>
          <DialogDescription>
            {activeTab === "setup"
              ? "设置邮箱和密码可以让您在未来使用邮箱登录"
              : "登录或注册以访问更多功能，或直接连接您的钱包"}
          </DialogDescription>
        </DialogHeader>

        {/* 功能需求提示 */}
        {requiredFeature && (
          <Alert className="bg-primary/10 border-primary/20 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>您需要登录才能{requiredFeature}</AlertDescription>
          </Alert>
        )}

        {/* 标签页 */}
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={needsAccountSetup ? undefined : setActiveTab}
          className="mt-4"
        >
          <TabsList className={`grid w-full ${needsAccountSetup ? "hidden" : "grid-cols-3"}`}>
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
            <TabsTrigger value="wallet">钱包</TabsTrigger>
          </TabsList>

          {/* 登录标签页 */}
          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "隐藏密码" : "显示密码"}</span>
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  "登录"
                )}
              </Button>
            </form>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">没有账号？</span>{" "}
              <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                立即注册
              </Button>
            </div>
          </TabsContent>

          {/* 注册标签页 */}
          <TabsContent value="register" className="space-y-4 pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">邮箱</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username\">用户名</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">密码</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "隐藏密码" : "显示密码"}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认密码</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showConfirmPassword ? "隐藏密码" : "显示密码"}</span>
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    注册中...
                  </>
                ) : (
                  "注册"
                )}
              </Button>
            </form>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">已有账号？</span>{" "}
              <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                立即登录
              </Button>
            </div>
          </TabsContent>

          {/* 钱包标签页 */}
          <TabsContent value="wallet" className="space-y-4 pt-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">连接您的 Solana 钱包以访问所有功能</p>
              <p className="text-xs text-muted-foreground mt-2 mb-4">
                连接钱包后，您可以选择设置邮箱和密码，以便将来可以使用邮箱登录，但这不是必须的
              </p>

              <WalletButton className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90" />

              {connected && address && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs font-mono break-all">{address}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">还没有 Solana 钱包？</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.open("https://phantom.app/", "_blank")
                  }}
                >
                  创建钱包
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 账号设置标签页（钱包优先用户） */}
          <TabsContent value="setup" className="space-y-4 pt-4">
            <Alert className="bg-primary/10 border-primary/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>设置邮箱和密码可以让您在未来使用邮箱登录</AlertDescription>
            </Alert>
            <form onSubmit={handleAccountSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setup-email">邮箱</Label>
                <Input
                  id="setup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup-password">密码</Label>
                <div className="relative">
                  <Input
                    id="setup-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "隐藏密码" : "显示密码"}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setup-confirm-password">确认密码</Label>
                <div className="relative">
                  <Input
                    id="setup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showConfirmPassword ? "隐藏密码" : "显示密码"}</span>
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    设置中...
                  </>
                ) : (
                  "保存设置"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

