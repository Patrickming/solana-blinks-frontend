import type React from "react"

// 钱包类型定义
export interface Wallet {
  connected: boolean
  connecting: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  select?: (walletName: string) => void
  wallets?: WalletInfo[]
  selectedWallet?: string | null
}

// 钱包提供者属性
export interface WalletProviderProps {
  children: React.ReactNode
}

// 支持的钱包类型
export interface SupportedWallet {
  name: string
  logo: string
}

// 钱包信息
export interface WalletInfo {
  name: string
  icon?: string
}

