"use client"

import { WalletProvider } from "@/context/wallet-context"
import { ProfileContent } from "@/components/pages/profile-content"

export function ProfileContentWrapper() {
  return (
    <WalletProvider>
      <ProfileContent />
    </WalletProvider>
  )
}

