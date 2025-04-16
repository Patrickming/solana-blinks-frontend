// 导入 Next.js 的 redirect 函数，用于服务器端重定向
import { redirect } from "next/navigation"

/**
 * 注册页面组件 (`/register`)
 * 与登录页面类似，此页面当前不显示任何内容，而是直接将用户重定向到首页 (`/`)。
 * 实际的注册流程已通过模态对话框 (`AuthDialog`) 实现，可以在任何页面触发。
 * 保留此路由可能用于兼容旧链接或特定的访问入口。
 */
export default function RegisterPage() {
  // 调用 redirect 函数，将用户从 /register 路径重定向到 / 路径
  redirect("/")
  // redirect() 会抛出错误终止渲染并触发重定向，因此无 JSX 返回。
}

