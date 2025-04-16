// 导入网站头部组件
import { SiteHeader } from "@/app/components/layout/site-header"
// 导入个人资料内容包装器组件，用于展示用户资料相关内容
import { ProfileContentWrapper } from "@/app/components/pages/profile-content-wrapper"

// 定义并导出个人资料页面组件 (`/profile`)
export default function ProfilePage() {
  return (
    // 使用 React Fragment 包裹
    <>
      {/* 渲染通用网站头部 */}
      <SiteHeader />
      {/* 主内容区域 */}      
      <main className="container py-10">
        {/* 渲染个人资料页面的核心内容 */}
        <ProfileContentWrapper />
      </main>
    </>
  )
}

