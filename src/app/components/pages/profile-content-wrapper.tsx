"use client"

import { WalletProvider } from "@/app/context/wallet-context"
import { ProfileContent } from "@/app/components/pages/profile-content"

export function ProfileContentWrapper() {
  return (
    <WalletProvider>
      <ProfileContent />
    </WalletProvider>
  )
}

