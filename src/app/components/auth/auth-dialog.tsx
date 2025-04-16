"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useToast } from "@/app/components/ui/use-toast"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useWallet } from "@/app/context/wallet-context"
import { useAuth } from "@/app/context/auth-context"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { WalletButton } from "@/app/components/wallet/wallet-button"

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
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      if (needsAccountSetup && user) {
        console.log("[AuthDialog] Needs account setup, forcing setup tab.")
        setActiveTab("setup")
        setFormData((prev) => ({
          ...prev,
          username: user.username || "",
        }))
      } else {
        const initialTab = mode === "wallet" && connected ? "login" : mode
        setActiveTab(initialTab)
        console.log(`[AuthDialog] Opened with mode: ${mode}, initial tab set to: ${initialTab}`)
      }
    } else {
      console.log("[AuthDialog] Dialog closed, resetting form data.")
      setFormData({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      })
      setShowPassword(false)
      setShowConfirmPassword(false)
      setIsLoading(false)
      setError(null)
    }
  }, [open, mode, needsAccountSetup, user, connected])

  /**
   * 处理输入变化
   * 更新表单数据状态
   *
   * @param field - 字段名
   * @param value - 字段值
   */
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (error) {
      setError(null)
    }
  }

  /**
   * 处理登录表单提交
   * 验证表单并调用登录方法
   *
   * @param e - 表单提交事件
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    console.log("[AuthDialog] Attempting login...")

    if (!formData.email || !formData.password) {
      const msg = "请填写邮箱和密码"
      setError(msg)
      toast({ title: "输入错误", description: msg, variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      await login(formData.email, formData.password)
      console.log("[AuthDialog] Login successful.")
      toast({ title: "登录成功", description: "欢迎回来！" })
      onOpenChange(false)

      if (redirectUrl && !preventRedirect) {
        console.log(`[AuthDialog] Redirecting to: ${redirectUrl}`)
        router.push(redirectUrl)
      }
    } catch (err: any) {
      const errorMsg = err.message || "登录时发生未知错误，请稍后重试"
      console.error("[AuthDialog] Login failed:", errorMsg)
      setError(errorMsg)
      toast({ title: "登录失败", description: errorMsg, variant: "destructive" })
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
    setError(null)
    console.log("[AuthDialog] Attempting registration...")

    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      const msg = "请填写所有必填项"
      setError(msg)
      toast({ title: "输入错误", description: msg, variant: "destructive" })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      const msg = "两次输入的密码不一致"
      setError(msg)
      toast({ title: "密码错误", description: msg, variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      await register(formData.email, formData.username, formData.password)
      console.log("[AuthDialog] Registration successful.")
      toast({ title: "注册成功", description: "欢迎加入！请登录。" })
      setActiveTab("login")
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }))
    } catch (err: any) {
      const errorMsg = err.message || "注册时发生未知错误，请稍后重试"
      console.error("[AuthDialog] Registration failed:", errorMsg)
      setError(errorMsg)
      toast({ title: "注册失败", description: errorMsg, variant: "destructive" })
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
    setError(null)
    console.log("[AuthDialog] Attempting account setup...")

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      const msg = "请填写邮箱和密码信息以完成设置"
      setError(msg)
      toast({ title: "输入错误", description: msg, variant: "destructive" })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      const msg = "两次输入的密码不一致"
      setError(msg)
      toast({ title: "密码错误", description: msg, variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      await completeAccountSetup(formData.email, formData.password)
      console.log("[AuthDialog] Account setup successful.")
      toast({ title: "账户设置成功", description: "您的账户信息已完善！" })
      onOpenChange(false)

      if (redirectUrl && !preventRedirect) {
        console.log(`[AuthDialog] Redirecting after setup to: ${redirectUrl}`)
        router.push(redirectUrl)
      }
    } catch (err: any) {
      const errorMsg = err.message || "账户设置时发生未知错误，请稍后重试"
      console.error("[AuthDialog] Account setup failed:", errorMsg)
      setError(errorMsg)
      toast({ title: "设置失败", description: errorMsg, variant: "destructive" })
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
    if (!isOpen && !preventRedirect && !isAuthenticated) {
      router.push("/")
    }
  }

  // 检查钱包连接状态，如果已连接则关闭对话框
  useEffect(() => {
    if (connected && address && activeTab === "wallet") {
      const timer = setTimeout(() => {
        onOpenChange(false)

        if (redirectUrl) {
          router.push(redirectUrl)
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [connected, address, activeTab, onOpenChange, redirectUrl, router])

  // 根据当前模式确定对话框标题和描述
  const getDialogTexts = () => {
    switch (activeTab) {
      case "register":
        return { title: "创建您的账户", description: "加入平台，开始探索 Solana Blinks！" }
      case "wallet":
        return { title: "连接您的钱包", description: "使用 Solana 钱包快速访问平台。" }
      case "setup":
        return { title: "完善账户信息", description: "请设置邮箱和密码以完成账户创建。" }
      case "login":
      default:
        return {
          title: requiredFeature ? `需要登录以访问 ${requiredFeature}` : "登录您的账户",
          description: requiredFeature ? "请登录或注册以继续。" : "欢迎回来！请输入您的凭据。",
        }
    }
  }

  const { title, description } = getDialogTexts()

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {updateDescription && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {activeTab === "setup" ? (
          <form onSubmit={handleAccountSetup} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="setup-username">用户名 (可选)</Label>
              <Input
                id="setup-username"
                type="text"
                placeholder="设置您的用户名"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup-email">邮箱 *</Label>
              <Input
                id="setup-email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="setup-password">密码 *</Label>
              <Input
                id="setup-password"
                type={showPassword ? "text" : "password"}
                placeholder="输入您的密码"
                required
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-[28px] h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="setup-confirm-password">确认密码 *</Label>
              <Input
                id="setup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="再次输入您的密码"
                required
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-[28px] h-7 w-7"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              完成设置
            </Button>
          </form>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
              <TabsTrigger value="wallet">钱包连接</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">邮箱</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="login-password">密码</Label>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="输入您的密码"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-[28px] h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  登录
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">邮箱 *</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-username">用户名 *</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="选择一个用户名"
                    required
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="register-password">密码 *</Label>
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="创建密码"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-[28px] h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="register-confirm-password">确认密码 *</Label>
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="再次输入密码"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-[28px] h-7 w-7"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "隐藏密码" : "显示密码"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  注册
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="wallet">
              <div className="space-y-4 text-center pt-6 pb-2">
                <p className="text-sm text-muted-foreground">
                  连接您的 Solana 钱包以快速登录或注册。
                </p>
                <WalletButton className="w-full" />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

