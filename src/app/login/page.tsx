import { redirect } from "next/navigation"

export default function LoginPage() {
  // 重定向到主页，因为我们现在使用弹窗登录
  redirect("/")
}

