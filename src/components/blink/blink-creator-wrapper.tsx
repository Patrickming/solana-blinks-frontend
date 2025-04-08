"use client"

import { useState } from "react"
import { AuthRequired } from "@/components/auth/auth-required"
import BlinkCreator from "@/components/blink/blink-creator"
import { useWallet } from "@/context/wallet-context"
import { AuthDialog } from "@/components/auth-dialog"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { WalletButton } from "@/components/wallet/wallet-button"

export default function BlinkCreatorWrapper() {
  const { connected } = useWallet()
  const { isAuthenticated } = useAuth()
  const [showWalletDialog, setShowWalletDialog] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

  // 如果用户已登录但未连接钱包，显示连接钱包提示
  const needsWallet = isAuthenticated && !connected

  return (
    <>
      <div className="glass-morphism rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{t("blink.title")}</h2>
        <p className="text-muted-foreground">{t("blink.description")}</p>
      </div>

      <AuthRequired featureDescription={t("nav.blink")} preventRedirect={true}>
        {needsWallet ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{t("wallet.required")}</h2>
              <p className="text-muted-foreground">{t("wallet.requiredDescription")}</p>
            </div>
            <WalletButton className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90" />
            <AuthDialog open={showWalletDialog} onOpenChange={setShowWalletDialog} mode="wallet" />
          </div>
        ) : (
          <BlinkCreator />
        )}
      </AuthRequired>
    </>
  )
}

