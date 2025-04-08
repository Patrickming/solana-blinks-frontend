"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import { Bell, Globe, Moon, User, Loader2, Lock, Shield } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useLanguage } from "@/context/language-context"

/**
 * 设置内容组件
 * 包含外观、通知和安全设置的选项卡式界面
 */
export function SettingsContent() {
  const { theme, setTheme } = useTheme()
  const { t, currentLanguage, setLanguage } = useLanguage()
  const { toast } = useToast()

  // 通知设置状态
  const [notifications, setNotifications] = useState({
    enabled: true,
    email: true,
    system: true,
  })

  // 保存设置的加载状态
  const [isSaving, setIsSaving] = useState(false)

  // 字体大小状态
  const [fontSize, setFontSize] = useState(1) // 0: 小, 1: 中, 2: 大

  /**
   * 处理保存设置
   * 模拟API调用并显示成功消息
   */
  const handleSaveSettings = () => {
    setIsSaving(true)

    // 模拟API调用
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: t("settings.saveSuccess"),
        description: t("settings.saveSuccessDescription"),
      })
    }, 1000)
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* 设置页面标题 */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.description")}</p>
      </div>

      {/* 设置选项卡 */}
      <Tabs defaultValue="appearance">
        <div className="flex overflow-auto pb-2">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>{t("settings.tabs.appearance")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>{t("settings.tabs.notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>{t("settings.tabs.security")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 外观设置 */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          {/* 语言设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("settings.appearance.language")}
              </CardTitle>
              <CardDescription>{t("settings.appearance.languageDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={currentLanguage}
                onValueChange={(value) => setLanguage(value as "zh" | "en")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="zh" id="zh" className="peer sr-only" />
                  <Label
                    htmlFor="zh"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span>🇨🇳</span>
                    <span className="mt-2">中文</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="en" id="en" className="peer sr-only" />
                  <Label
                    htmlFor="en"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span>🇺🇸</span>
                    <span className="mt-2">英文</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 主题设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                {t("settings.appearance.theme")}
              </CardTitle>
              <CardDescription>{t("settings.appearance.themeDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme || "system"}
                onValueChange={(value) => setTheme(value)}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span>☀️</span>
                    <span className="mt-2">浅色模式</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span>🌙</span>
                    <span className="mt-2">深色模式</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="system" className="peer sr-only" />
                  <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span>💻</span>
                    <span className="mt-2">跟随系统</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 字体大小设置 - 新增 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("settings.appearance.fontSize")}
              </CardTitle>
              <CardDescription>{t("settings.appearance.fontSizeDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t("settings.appearance.fontSize")}</Label>
                  <span className="text-sm text-muted-foreground">
                    {fontSize === 0
                      ? t("settings.appearance.small")
                      : fontSize === 1
                        ? t("settings.appearance.medium")
                        : t("settings.appearance.large")}
                  </span>
                </div>
                <Slider min={0} max={2} step={1} value={[fontSize]} onValueChange={(value) => setFontSize(value[0])} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("settings.appearance.small")}</span>
                  <span>{t("settings.appearance.medium")}</span>
                  <span>{t("settings.appearance.large")}</span>
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <p className={`${fontSize === 0 ? "text-sm" : fontSize === 1 ? "text-base" : "text-lg"}`}>
                  {t("settings.appearance.preview")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("settings.notifications.title")}
              </CardTitle>
              <CardDescription>{t("settings.notifications.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications-enabled">{t("settings.notifications.enable")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.notifications.enableDescription")}</p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={notifications.enabled}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, enabled: checked })}
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium">{t("settings.notifications.channels")}</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">{t("settings.notifications.email")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.notifications.emailDescription")}</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    disabled={!notifications.enabled}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium">{t("settings.notifications.types")}</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-notifications">{t("settings.notifications.system")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.notifications.systemDescription")}</p>
                  </div>
                  <Switch
                    id="system-notifications"
                    checked={notifications.system}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, system: checked })}
                    disabled={!notifications.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t("settings.security.password")}
              </CardTitle>
              <CardDescription>{t("settings.security.passwordDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t("settings.security.currentPassword")}</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("settings.security.newPassword")}</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("settings.security.confirmPassword")}</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("settings.security.privacy")}
              </CardTitle>
              <CardDescription>{t("settings.security.privacyDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public-profile">{t("settings.security.publicProfile")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.security.publicProfileDescription")}</p>
                </div>
                <Switch id="public-profile" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-activity">{t("settings.security.showActivity")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.security.showActivityDescription")}</p>
                </div>
                <Switch id="show-activity" defaultChecked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("settings.saving")}
            </>
          ) : (
            t("settings.save")
          )}
        </Button>
      </div>
    </div>
  )
}

