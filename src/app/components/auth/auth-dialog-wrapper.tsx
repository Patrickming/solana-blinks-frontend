"use client"
import { AuthDialog } from "@/app/components/auth/auth-dialog"

/**
 * AuthDialogWrapper 组件属性接口
 * 与 AuthDialogProps 类似，定义了传递给 AuthDialog 的属性。
 */
interface AuthDialogWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "login" | "register" | "wallet" | "setup"
  redirectUrl?: string
}

/**
 * AuthDialogWrapper 组件
 * 这是一个简单的包装器组件，用于渲染 AuthDialog 并传递所有接收到的属性。
 * 可以用于简化 AuthDialog 在不同地方的使用，或者未来添加额外的逻辑层。
 *
 * @param {AuthDialogWrapperProps} props - 传递给 AuthDialog 的属性
 * @returns {JSX.Element} 渲染的 AuthDialog 组件
 */
export function AuthDialogWrapper(props: AuthDialogWrapperProps) {
  return <AuthDialog {...props} />
}

