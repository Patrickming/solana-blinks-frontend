// 导入网站头部包装器组件
import { SiteHeaderWrapper } from "@/app/components/layout/site-header-wrapper"
// 导入设置页面核心内容组件
import { SettingsContent } from "@/app/components/pages/settings-content"

/**
 * 设置页面组件 (`/settings`)
 * 负责渲染用户设置页面的整体布局。
 * 页面包含一个通用的网站头部和主要内容区域。
 * 主要内容由 `SettingsContent` 组件负责渲染，该组件包含外观、通知、安全等设置选项卡。
 * @returns {JSX.Element}
 */
export default function SettingsPage() {
  return (
    <>
      {/* 渲染网站头部 */}
      <SiteHeaderWrapper />
      {/* 主内容区域 */}
      <main className="container py-10">
        {/* 渲染设置页面的具体内容 */}
        <SettingsContent />
      </main>
    </>
  )
}

