"use client"

import { SiteHeader } from "@/components/layout/site-header"
import { TutorialsContent } from "@/components/pages/tutorials-content"
import { useLanguage } from "@/context/language-context"

export default function TutorialsPage() {
  const { t } = useLanguage()

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <div className="glass-morphism rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{t("tutorials.title")}</h2>
          <p className="text-muted-foreground">{t("tutorials.description")}</p>
        </div>
        <TutorialsContent />
      </main>
    </>
  )
}

