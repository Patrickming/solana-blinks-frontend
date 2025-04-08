"use client"

import { SiteHeader } from "@/components/layout/site-header"
import { ForumContent } from "@/components/pages/forum-content"
import { useLanguage } from "@/context/language-context"

export default function ForumPage() {
  const { t } = useLanguage()

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <div className="glass-morphism rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{t("forum.title")}</h2>
          <p className="text-muted-foreground">{t("forum.description")}</p>
        </div>
        <ForumContent />
      </main>
    </>
  )
}

