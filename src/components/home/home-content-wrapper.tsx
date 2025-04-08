"use client"

import { WalletProvider } from "@/context/wallet-context"
import { AuthProvider } from "@/context/auth-context"
import { HomeContent } from "@/components/home/home-content"

export function HomeContentWrapper() {
  return (
    <WalletProvider>
      <AuthProvider>
        <HomeContent />
      </AuthProvider>
    </WalletProvider>
  )
}

