"use client"

import { WalletProvider } from "@/app/context/wallet-context"
import { AuthProvider } from "@/app/context/auth-context"
import { HomeContent } from "@/app/components/home/home-content"

export function HomeContentWrapper() {
  return (
    <WalletProvider>
      <AuthProvider>
        <HomeContent />
      </AuthProvider>
    </WalletProvider>
  )
}

