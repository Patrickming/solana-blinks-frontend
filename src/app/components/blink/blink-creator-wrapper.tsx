"use client"

import { useState } from "react"
import { AuthRequired } from "@/app/components/auth/auth-required"
import BlinkCreator from "@/app/components/blink/blink-creator"
import { useWallet } from "@/app/context/wallet-context"
import { AuthDialog } from "@/app/components/auth/auth-dialog"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/app/context/language-context"
import { WalletButton } from "@/app/components/wallet/wallet-button"

/**
 * BlinkCreatorWrapper 组件
 * 包装 BlinkCreator 组件，处理认证和钱包连接状态。
 * 如果用户未认证，会显示认证对话框。
 * 如果用户已认证但未连接钱包，会提示用户连接钱包。
 * 只有在用户既已认证又已连接钱包时，才显示 BlinkCreator。
 *
 * @component
 * @returns {JSX.Element} BlinkCreatorWrapper 组件的 JSX 元素。
 */
export default function BlinkCreatorWrapper() {
  const { connected } = useWallet() // 获取钱包连接状态
  const { isAuthenticated } = useAuth() // 获取用户认证状态
  const [showWalletDialog, setShowWalletDialog] = useState(false) // 控制钱包对话框的显示状态（虽然未使用，但保留可能用于未来扩展）
  const router = useRouter() // Next.js 路由 hook
  const { t } = useLanguage() // 国际化 hook

  // 判断是否需要连接钱包：用户已认证但钱包未连接
  const needsWallet = isAuthenticated && !connected

  return (
    <>
      {/* 页面标题和描述区域 */}
      <div className="glass-morphism rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{t("blink.title")}</h2>
        <p className="text-muted-foreground">{t("blink.description")}</p>
      </div>

      {/* 使用 AuthRequired 包裹，确保用户已认证 */}
      <AuthRequired featureDescription={t("nav.blink")} preventRedirect={true}>
        {/* 如果需要连接钱包 */}
        {needsWallet ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{t("wallet.required")}</h2>
              <p className="text-muted-foreground">{t("wallet.requiredDescription")}</p>
            </div>
            {/* 显示连接钱包按钮 */}
            <WalletButton className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90" />
            {/* 钱包认证对话框 (目前未使用，但保留) */}
            <AuthDialog open={showWalletDialog} onOpenChange={setShowWalletDialog} mode="wallet" />
          </div>
        ) : (
          /* 如果用户已认证且钱包已连接，则显示 BlinkCreator */
          <BlinkCreator />
        )}
      </AuthRequired>
    </>
  )
}

