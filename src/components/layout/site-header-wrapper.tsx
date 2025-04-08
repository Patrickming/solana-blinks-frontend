"use client"

import { WalletProvider } from "@/context/wallet-context"
import { SiteHeader } from "@/components/layout/site-header"

export function SiteHeaderWrapper() {
  return (
    <WalletProvider>
      <SiteHeader />
    </WalletProvider>
  )
}

