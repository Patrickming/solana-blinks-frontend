"use client"

import React from "react"
import { TopicDetail } from "@/components/pages/topic-detail"
import { useLanguage } from "@/context/language-context"

interface TopicDetailClientProps {
  topicId: string
}

export function TopicDetailClient({ topicId }: TopicDetailClientProps) {
  const { t } = useLanguage()

  return (
    <main className="container py-10">
      <div className="glass-morphism rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{t("forum.title")}</h2>
        <p className="text-muted-foreground">{t("forum.description")}</p>
      </div>
      <TopicDetail topicId={topicId} />
    </main>
  )
} 