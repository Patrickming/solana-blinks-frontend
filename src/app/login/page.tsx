// 导入 Next.js 的 redirect 函数，用于服务器端重定向
import { redirect } from "next/navigation"

/**
 * 登录页面组件 (`/login`)
 * 此页面当前不显示任何内容，而是直接将用户重定向到首页 (`/`)。
 * 这是因为实际的登录流程已通过模态对话框 (`AuthDialog`) 实现，该对话框可以在任何页面触发。
 * 保留此路由可能用于兼容旧链接或特定的访问入口，但最终用户会被导向首页。
 */
export default function LoginPage() {
  // 调用 redirect 函数，将用户从 /login 路径重定向到 / 路径
  redirect("/")
  // 注意: redirect() 会抛出一个特殊的 NEXT_REDIRECT 错误，终止当前组件渲染并触发重定向。
  // 因此，此函数实际上不会返回任何 JSX。
}

