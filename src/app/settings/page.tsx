import { SiteHeaderWrapper } from "@/components/layout/site-header-wrapper"
import { SettingsContent } from "@/components/pages/settings-content"

/**
 * 设置页面组件
 * 显示用户设置界面，包括外观、通知和安全设置
 */
export default function SettingsPage() {
  return (
    <>
      <SiteHeaderWrapper />
      <main className="container py-10">
        <SettingsContent />
      </main>
    </>
  )
}

