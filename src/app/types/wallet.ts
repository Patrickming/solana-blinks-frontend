import type React from "react"

/**
 * 钱包上下文接口 (此接口可能与 wallet-context.tsx 中的 WalletContextType 重复或类似)
 * 定义了通过钱包上下文暴露给组件的状态和方法。
 * 注意：实际使用的可能是 wallet-context.tsx 中定义的 WalletContextType。
 * 此处定义可能用于简化或作为早期版本，建议与 wallet-context.tsx 保持一致。
 */
export interface Wallet {
  connected: boolean; // 钱包是否已连接
  connecting: boolean; // 是否正在连接中
  address: string | null; // 连接的钱包地址 (公钥字符串)，未连接则为 null
  connect: () => Promise<void>; // 连接钱包的函数
  disconnect: () => void; // 断开钱包连接的函数
  select?: (walletName: string) => void; // 选择特定钱包的函数 (可选)
  wallets?: WalletInfo[]; // 可用钱包列表 (可选)
  selectedWallet?: string | null; // 当前选择的钱包名称 (可选)
}

/**
 * WalletProvider 组件的 Props 类型定义
 * 主要用于指定 children，即需要被 WalletProvider 包裹的子组件。
 */
export interface WalletProviderProps {
  children: React.ReactNode; // React 子节点
}

/**
 * 支持的钱包信息接口 (与 constants.ts 中的类似)
 * 用于定义一个支持的钱包，通常包含名称和图标。
 */
export interface SupportedWallet {
  name: string; // 钱包名称 (例如 "Phantom")
  logo: string; // 钱包 Logo 图片的 URL
}

/**
 * 钱包信息接口 (可能由钱包适配器库提供)
 * 定义了一个可用钱包的基本信息，通常由钱包适配器库返回。
 */
export interface WalletInfo {
  name: string; // 钱包名称
  icon?: string; // 钱包图标 URL (可选)
}

