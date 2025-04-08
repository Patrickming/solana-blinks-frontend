"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import { AuthDialog } from "@/components/auth-dialog"
import { useWallet } from "@/context/wallet-context"

/**
 * 需要认证的组件属性接口
 */
interface AuthRequiredProps {
  children: ReactNode // 子组件
  featureDescription?: string // 功能描述
  requireWallet?: boolean // 是否需要钱包
  preventRedirect?: boolean // 是否阻止重定向
}

/**
 * 需要认证的组件包装器
 * 确保用户已登录才能访问内容，否则显示认证对话框
 *
 * @param children - 子组件
 * @param featureDescription - 功能描述，用于显示在认证对话框中
 * @param requireWallet - 是否需要钱包连接
 * @param preventRedirect - 是否阻止认证失败时的重定向
 * @returns 包装后的组件
 */
export function AuthRequired({
  children,
  featureDescription = "使用此功能",
  requireWallet = false,
  preventRedirect = false,
}: AuthRequiredProps) {
  const { isAuthenticated, needsAccountSetup } = useAuth()
  const { connected } = useWallet()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [initialRender, setInitialRender] = useState(true)

  /**
   * 跳过初始渲染检查以防止闪烁
   * 如果用户未认证，显示认证对话框
   */
  useEffect(() => {
    if (initialRender) {
      setInitialRender(false)
      return
    }

    if (!isAuthenticated) {
      setShowAuthDialog(true)
    }
  }, [isAuthenticated, initialRender])

  /**
   * 如果用户已认证但需要完成账号设置，
   * 仅当他们来自钱包连接时才显示设置对话框
   */
  useEffect(() => {
    if (isAuthenticated && needsAccountSetup && connected) {
      setShowAuthDialog(true)
    }
  }, [isAuthenticated, needsAccountSetup, connected])

  return (
    <>
      {isAuthenticated ? children : null}

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        mode={needsAccountSetup && connected ? "setup" : "login"}
        requiredFeature={featureDescription}
        preventRedirect={preventRedirect}
      />
    </>
  )
}

