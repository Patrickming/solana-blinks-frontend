"use client"

import { SiteHeader } from "@/app/components/layout/site-header"
import { ForumContent } from "@/app/components/pages/forum-content"
import { useLanguage } from "@/app/context/language-context"

/**
 * 社区论坛页面组件 (`/forum`)
 * 负责渲染社区论坛主页面的布局。
 * 包含网站头部、页面标题/描述区域和论坛内容（帖子列表、搜索、分类等）。
 * 页面标题和描述使用了 `useLanguage` hook 进行国际化。
 * @returns {JSX.Element}
 */
export default function ForumPage() {
  const { t } = useLanguage()

  return (
    <>
      {/* 渲染网站头部 */}
      <SiteHeader />
      {/* 主内容区域 */}      
      <main className="container py-10">
        {/* 页面标题和描述区域，使用玻璃拟态效果 */}        
        <div className="glass-morphism rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{t("forum.title")}</h2>
          <p className="text-muted-foreground">{t("forum.description")}</p>
        </div>
        {/* 渲染论坛页面的具体内容 */}
        <ForumContent />
      </main>
    </>
  )
}

