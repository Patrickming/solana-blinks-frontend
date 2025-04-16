// 导入网站头部包装器组件，用于展示顶部导航栏
import { SiteHeaderWrapper } from "@/app/components/layout/site-header-wrapper"
// 导入首页内容包装器组件，用于展示主页的具体内容
import { HomeContentWrapper } from "@/app/components/home/home-content-wrapper"

// 定义并导出首页组件
export default function Home() {
  return (
    // 使用 React Fragment (<>) 包裹多个顶级元素
    <>
      {/* 渲染网站头部 */}
      <SiteHeaderWrapper />
      {/* 渲染首页内容 */}
      <HomeContentWrapper />
    </>
  )
}

