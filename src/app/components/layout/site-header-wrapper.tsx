"use client"

import { WalletProvider } from "@/app/context/wallet-context"
import { SiteHeader } from "@/app/components/layout/site-header"

/**
 * SiteHeaderWrapper 组件
 * 为 SiteHeader 组件提供 WalletProvider 上下文。
 */
export function SiteHeaderWrapper() {
  return (
    <WalletProvider>
      <SiteHeader />
    </WalletProvider>
  )
}

