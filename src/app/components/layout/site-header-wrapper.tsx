"use client"

import { WalletProvider } from "@/app/context/wallet-context"
import { SiteHeader } from "@/app/components/layout/site-header"

export function SiteHeaderWrapper() {
  return (
    <WalletProvider>
      <SiteHeader />
    </WalletProvider>
  )
}

