import { TopicDetailClient } from "@/app/components/pages/topic-detail-client"
import { SiteHeader } from "@/app/components/layout/site-header"

// 作为服务器组件处理params
export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const topicId = params.id
  
  return (
    <>
      <SiteHeader />
      <TopicDetailClient topicId={topicId} />
    </>
  )
} 