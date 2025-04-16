"use client"

import { SiteHeader } from "@/app/components/layout/site-header"
import { TutorialsContent } from "@/app/components/pages/tutorials-content"
import { useLanguage } from "@/app/context/language-context"

/**
 * 教程页面组件 (`/tutorials`)
 * 负责渲染教程和文档页面的布局。
 * 包含网站头部、页面标题/描述区域和具体教程内容。
 * 页面标题和描述使用了 `useLanguage` hook 进行国际化。
 * @returns {JSX.Element}
 */
export default function TutorialsPage() {
  const { t } = useLanguage()

  return (
    <>
      {/* 渲染网站头部 */}
      <SiteHeader />
      {/* 主内容区域 */}      
      <main className="container py-10">
        {/* 页面标题和描述区域，使用玻璃拟态效果 */}        
        <div className="glass-morphism rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{t("tutorials.title")}</h2>
          <p className="text-muted-foreground">{t("tutorials.description")}</p>
        </div>
        {/* 渲染教程页面的具体内容 (指南、视频、FAQ 等) */}
        <TutorialsContent />
      </main>
    </>
  )
}

