import { TopicDetailClient } from "@/app/components/pages/topic-detail-client"
import { SiteHeader } from "@/app/components/layout/site-header"

/**
 * 论坛话题详情页面 (服务器组件)
 * 路径: `/forum/[id]`
 * 这个组件作为服务器组件运行，主要职责是：
 * 1. 从路由参数 `params` 中提取话题 `id`。
 * 2. 渲染页面基本布局（例如网站头部）。
 * 3. 将提取到的 `topicId` 传递给客户端组件 `TopicDetailClient`。
 * 实际的话题数据获取、交互和渲染逻辑由 `TopicDetailClient` 处理。
 *
 * @param params - Next.js 自动注入的路由参数对象，包含动态段 `id`。
 * @returns {JSX.Element}
 */
export default function TopicDetailPage({ params }: { params: { id: string } }) {
  // 从路由参数中获取话题 ID
  const topicId = params.id
  
  return (
    <>
      {/* 渲染网站通用头部 */}
      <SiteHeader />
      {/* 
        渲染客户端组件 TopicDetailClient，并将 topicId 作为 prop 传入。
        TopicDetailClient 组件内部将负责根据此 ID 获取和显示话题的具体内容、评论等。
      */}
      <TopicDetailClient topicId={topicId} />
    </>
  )
} 