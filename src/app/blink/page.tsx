// 导入网站头部组件
import { SiteHeader } from "@/app/components/layout/site-header"
// 导入 Blink 创建器包装器组件，这是此页面的核心内容
import BlinkCreatorWrapper from "@/app/components/blink/blink-creator-wrapper"

// 定义此页面的元数据 (用于 SEO 和浏览器标签页)
export const metadata = {
  title: "创建 Blink | Solana Blinks", // 页面标题
  description: "创建 Blink、发行代币和 NFT 的一站式工具", // 页面描述
}

/**
 * Blink 创建页面组件
 * 负责渲染创建 Blink 功能的页面布局。
 */
export default function BlinkPage() {
  return (
    // 使用 React Fragment 包裹多个顶级元素
    <>
      {/* 渲染网站通用头部 */}
      <SiteHeader />
      {/* 主内容区域，使用 container 样式进行居中和最大宽度限制 */}
      <main className="container py-10">
        {/* 渲染 Blink 创建器的核心内容 */}
        <BlinkCreatorWrapper />
      </main>
    </>
  )
}

