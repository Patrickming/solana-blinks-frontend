"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import {
  User,
  Mail,
  Phone,
  Key,
  Loader2,
  AlertCircle,
  Camera,
  Settings,
  Globe,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthDialog } from "@/components/auth-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export function ProfileContent() {
  const { user, needsAccountSetup, updateUser, fetchUserProfile } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=96&width=96")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    qq: "",
    region: "none", // 默认值改为 "none" 而不是空字符串
    techStack: "none", // 默认值改为 "none" 而不是空字符串
    bio: "",
    github: "",
    twitter: "",
    website: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<{
    username?: string
    email?: string
    phone?: string
    qq?: string
    region?: string
    techStack?: string
    bio?: string
    github?: string
    twitter?: string
    website?: string
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  // 中国地区列表
  const regions = [
    { value: "none", label: "选择地区" }, // 改为 "none" 而不是空字符串
    { value: "beijing", label: "北京" },
    { value: "shanghai", label: "上海" },
    { value: "guangdong", label: "广东" },
    { value: "jiangsu", label: "江苏" },
    { value: "zhejiang", label: "浙江" },
    { value: "sichuan", label: "四川" },
    { value: "hubei", label: "湖北" },
    { value: "fujian", label: "福建" },
    { value: "overseas", label: "海外" },
    { value: "other", label: "其他" },
  ]

  // 技术栈选项
  const techStacks = [
    { value: "none", label: "选择主要技术栈" }, // 改为 "none" 而不是空字符串
    { value: "solana", label: "Solana" },
    { value: "ethereum", label: "Ethereum" },
    { value: "rust", label: "Rust" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "python", label: "Python" },
    { value: "go", label: "Go" },
    { value: "java", label: "Java" },
    { value: "other", label: "其他" },
  ]

  // Load user data only on initial load
  useEffect(() => {
    // 只在初始加载或用户变为 null 时更新表单数据
    if (user && isInitialLoad) {
      setProfileData((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        qq: user.qq || "",
        region: user.region || "none",
        techStack: user.techStack || "none",
        bio: user.bio || "",
        github: user.github || "",
        twitter: user.twitter || "",
        website: user.website || "",
      }))

      // 设置头像 URL
      if (user.avatar) {
        setAvatarUrl(`https://dkynujeaxjjr.sealoshzh.site${user.avatar}`)
      } else {
        setAvatarUrl("/placeholder.svg?height=96&width=96")
      }

      // 标记初始加载已完成
      setIsInitialLoad(false)
    } else if (!user) {
      // 如果用户为 null，重置为初始加载状态
      setIsInitialLoad(true)
    }
  }, [user, isInitialLoad])

  // Fetch user profile only on initial load
  useEffect(() => {
    // 只在初始加载时获取用户资料
    if (user && isInitialLoad) {
      fetchUserProfile().then((success) => {
        if (success) {
          console.log("User profile fetched successfully")
        }
      })
    }
  }, [user, fetchUserProfile, isInitialLoad])

  // Show setup dialog if needed
  useEffect(() => {
    if (needsAccountSetup) {
      setShowSetupDialog(true)
    }
  }, [needsAccountSetup])

  const handleInputChange = (field: string, value: string) => {
    setIsFormDirty(true)
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  // 从GitHub URL中提取用户名
  const extractGithubUsername = (url: string): string => {
    if (!url) return ""

    // 如果已经是用户名格式，直接返回
    if (/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(url)) {
      return url
    }

    // 从URL中提取用户名
    const match = url.match(/github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})/)
    return match ? match[1] : url
  }

  // 从Twitter URL中提取用户名
  const extractTwitterUsername = (url: string): string => {
    if (!url) return ""

    // 如果已经是用户名格式，直接返回
    if (/^[a-zA-Z0-9_]{1,15}$/.test(url)) {
      return url
    }

    // 从URL中提取用户名
    const match = url.match(/x\.com\/([a-zA-Z0-9_]{1,15})/)
    return match ? match[1] : url
  }

  // Update the validateProfileForm function to change the validation for GitHub and Twitter URLs
  const validateProfileForm = () => {
    const newErrors: {
      username?: string
      email?: string
      phone?: string
      qq?: string
      website?: string
      github?: string
      twitter?: string
    } = {}

    if (!profileData.username) {
      newErrors.username = "用户名不能为空"
    }

    if (!profileData.email) {
      newErrors.email = "邮箱不能为空"
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "邮箱格式不正确"
    }

    if (profileData.phone && !/^\+?[0-9\s\-()]+$/.test(profileData.phone)) {
      newErrors.phone = "手机号码格式不正确"
    }

    if (profileData.qq && !/^[1-9][0-9]{4,}$/.test(profileData.qq)) {
      newErrors.qq = "QQ号码格式不正确"
    }

    if (
      profileData.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(profileData.website)
    ) {
      newErrors.website = "网站地址格式不正确"
    }

    // 修改GitHub验证，同时接受用户名和URL格式
    if (
      profileData.github &&
      !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(profileData.github) &&
      !/^https?:\/\/github\.com\/[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(profileData.github)
    ) {
      newErrors.github = "GitHub格式不正确，请输入用户名或完整URL"
    }

    // 修改Twitter验证，同时接受用户名和URL格式
    if (
      profileData.twitter &&
      !/^[a-zA-Z0-9_]{1,15}$/.test(profileData.twitter) &&
      !/^https?:\/\/x\.com\/[a-zA-Z0-9_]{1,15}$/.test(profileData.twitter)
    ) {
      newErrors.twitter = "Twitter(X)格式不正确，请输入用户名或完整URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the validatePasswordForm function to change the minimum password length from 8 to 6
  const validatePasswordForm = () => {
    const newErrors: {
      newPassword?: string
      confirmPassword?: string
    } = {}

    if (!profileData.newPassword) {
      newErrors.newPassword = "请输入新密码"
    } else if (profileData.newPassword.length < 6) {
      newErrors.newPassword = "密码长度至少为6个字符"
    }

    if (!profileData.confirmPassword) {
      newErrors.confirmPassword = "请确认新密码"
    } else if (profileData.newPassword !== profileData.confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 修改handleUpdateProfile方法，确保包含用户名和邮箱字段
  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) {
      return
    }

    setIsLoading(true)

    try {
      // 提取GitHub和Twitter用户名
      const githubUsername = extractGithubUsername(profileData.github)
      const twitterUsername = extractTwitterUsername(profileData.twitter)

      console.log("Extracted GitHub username:", githubUsername)
      console.log("Extracted Twitter username:", twitterUsername)
      console.log("Updating username:", profileData.username)
      console.log("Updating email:", profileData.email)

      // 使用更新后的updateUser方法
      const success = await updateUser({
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
        qq: profileData.qq,
        region: profileData.region !== "none" ? profileData.region : undefined,
        techStack: profileData.techStack !== "none" ? profileData.techStack : undefined,
        bio: profileData.bio,
        github: githubUsername,
        twitter: twitterUsername,
        website: profileData.website,
      })

      if (success) {
        toast({
          title: "个人资料已更新",
          description: "您的个人资料已成功更新",
        })
        setIsFormDirty(false)
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: "更新个人资料时出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("未找到认证令牌")
      }

      // 调用更改密码API - 修改为正确的API路径
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword: profileData.newPassword,
          confirmPassword: profileData.confirmPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "密码更改失败")
      }

      toast({
        title: "密码已更改",
        description: "您的密码已成功更改",
      })

      // Reset password fields
      setProfileData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      toast({
        title: "密码更改失败",
        description: error instanceof Error ? error.message : "更改密码时出现错误，请重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      })
      return
    }

    // Create temporary URL for preview
    const objectUrl = URL.createObjectURL(file)
    setAvatarUrl(objectUrl)

    // Start upload process
    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("未找到认证令牌")
      }

      // Create form data
      const formData = new FormData()
      formData.append("avatar", file)

      // Upload avatar to server
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "上传头像失败")
      }

      const data = await response.json()

      // 更新用户数据
      if (user) {
        const updatedUser = { ...user, avatar: data.avatar }
        localStorage.setItem("user", JSON.stringify(updatedUser))

        // 不要立即刷新用户资料，只更新本地状态
        setAvatarUrl(`https://dkynujeaxjjr.sealoshzh.site${data.avatar}`)
      }

      toast({
        title: "头像已更新",
        description: "您的头像已成功更新",
      })
    } catch (error) {
      console.error("Avatar upload failed:", error)
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "上传头像时出现错误",
        variant: "destructive",
      })

      // Revert to previous avatar if upload fails
      if (user?.avatar) {
        setAvatarUrl(`https://dkynujeaxjjr.sealoshzh.site${user.avatar}`)
      } else {
        setAvatarUrl("/placeholder.svg?height=96&width=96")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Add a function to delete avatar
  const handleDeleteAvatar = async () => {
    if (!user?.avatar) return

    setIsLoading(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("未找到认证令牌")
      }

      // Delete avatar from server
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/profile/avatar", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "删除头像失败")
      }

      // 更新用户数据
      if (user) {
        const updatedUser = { ...user, avatar: "" }
        localStorage.setItem("user", JSON.stringify(updatedUser))

        // 不要立即刷新用户资料，只更新本地状态
        setAvatarUrl("/placeholder.svg?height=96&width=96")
      }

      toast({
        title: "头像已删除",
        description: "您的头像已成功删除",
      })
    } catch (error) {
      console.error("Avatar deletion failed:", error)
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "删除头像时出现错误",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取用于显示的GitHub链接
  const getGithubDisplayUrl = (value: string): string => {
    if (!value) return ""
    return value.includes("github.com") ? value : `https://github.com/${value}`
  }

  // 获取用于显示的Twitter链接
  const getTwitterDisplayUrl = (value: string): string => {
    if (!value) return ""
    return value.includes("x.com") ? value : `https://x.com/${value}`
  }

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">个人中心</h2>
        <p className="text-muted-foreground">管理您的账号信息和个人资料</p>
      </div>

      {needsAccountSetup && (
        <Alert className="bg-primary/10 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>建议完成账号设置以便使用邮箱登录</AlertDescription>
        </Alert>
      )}

      {isFormDirty && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            您有未保存的更改，请点击"更新个人资料"按钮保存
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-morphism md:col-span-1">
          <CardHeader>
            <CardTitle>账号信息</CardTitle>
            <CardDescription>您的个人和账号详情</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            {/* Avatar upload */}
            <div className="relative group">
              <Avatar
                className="h-24 w-24 mb-4 cursor-pointer group-hover:opacity-80 transition-opacity"
                onClick={handleAvatarClick}
              >
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                <div className="bg-black/50 rounded-full p-2">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {user?.avatar && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-background hover:bg-destructive hover:text-white"
                  onClick={handleDeleteAvatar}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <h3 className="text-xl font-bold">{user?.username || "用户"}</h3>
            <p className="text-sm text-muted-foreground mb-2">{user?.email || "未设置邮箱"}</p>

            {user?.walletAddress && (
              <div className="mt-2 w-full">
                <p className="text-xs text-muted-foreground mb-1">已连接钱包</p>
                <div className="bg-muted p-2 rounded-md text-xs font-mono break-all">{user.walletAddress}</div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {user?.walletAddress ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  已连接钱包
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  未连接钱包
                </Badge>
              )}

              {user?.email ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  已设置邮箱
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  未设置邮箱
                </Badge>
              )}
            </div>

            {/* 社交媒体链接 */}
            {(profileData.github || profileData.twitter || profileData.website) && (
              <div className="flex justify-center gap-3 mt-4">
                {profileData.github && (
                  <a
                    href={getGithubDisplayUrl(profileData.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                  </a>
                )}
                {profileData.twitter && (
                  <a
                    href={getTwitterDisplayUrl(profileData.twitter)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
                )}
                {profileData.website && (
                  <a
                    href={
                      profileData.website.startsWith("http") ? profileData.website : `https://${profileData.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-morphism md:col-span-2">
          <CardHeader>
            <CardTitle>个人资料设置</CardTitle>
            <CardDescription>更新您的个人信息和安全设置</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  个人资料
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Key className="mr-2 h-4 w-4" />
                  修改密码
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        className="pl-8"
                        value={profileData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-solana-error-red text-sm animate-shake">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-8"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-solana-error-red text-sm animate-shake">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号码（可选）</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-8"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    {errors.phone && <p className="text-solana-error-red text-sm animate-shake">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qq">QQ号码（可选）</Label>
                    <Input
                      id="qq"
                      type="text"
                      value={profileData.qq}
                      onChange={(e) => handleInputChange("qq", e.target.value)}
                    />
                    {errors.qq && <p className="text-solana-error-red text-sm animate-shake">{errors.qq}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">地区</Label>
                    <Select value={profileData.region} onValueChange={(value) => handleInputChange("region", value)}>
                      <SelectTrigger id="region">
                        <SelectValue placeholder="选择地区" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="techStack">主要技术栈</Label>
                    <Select
                      value={profileData.techStack}
                      onValueChange={(value) => handleInputChange("techStack", value)}
                    >
                      <SelectTrigger id="techStack">
                        <SelectValue placeholder="选择技术栈" />
                      </SelectTrigger>
                      <SelectContent>
                        {techStacks.map((tech) => (
                          <SelectItem key={tech.value} value={tech.value}>
                            {tech.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    placeholder="介绍一下自己..."
                    className="min-h-[100px]"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub (用户名)</Label>
                    <Input
                      id="github"
                      type="text"
                      placeholder="ID/https://github.com/ID"
                      value={profileData.github}
                      onChange={(e) => handleInputChange("github", e.target.value)}
                    />
                    {errors.github && <p className="text-solana-error-red text-sm animate-shake">{errors.github}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter(X) (用户名)</Label>
                    <Input
                      id="twitter"
                      type="text"
                      placeholder="ID/https://x.com/ID"
                      value={profileData.twitter}
                      onChange={(e) => handleInputChange("twitter", e.target.value)}
                    />
                    {errors.twitter && <p className="text-solana-error-red text-sm animate-shake">{errors.twitter}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">个人网站（可选）</Label>
                    <Input
                      id="website"
                      type="text"
                      placeholder="https://example.com"
                      value={profileData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                    {errors.website && <p className="text-solana-error-red text-sm animate-shake">{errors.website}</p>}
                  </div>
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    "更新个人资料"
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      className="pl-8"
                      value={profileData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showNewPassword ? "隐藏密码" : "显示密码"}</span>
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-solana-error-red text-sm animate-shake">{errors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      className="pl-8"
                      value={profileData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
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
                  {errors.confirmPassword && (
                    <p className="text-solana-error-red text-sm animate-shake">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    "更改密码"
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            进入设置页面
          </Link>
        </Button>
      </div>

      {/* Account setup dialog */}
      <AuthDialog open={showSetupDialog} onOpenChange={setShowSetupDialog} mode="setup" />
    </div>
  )
}

