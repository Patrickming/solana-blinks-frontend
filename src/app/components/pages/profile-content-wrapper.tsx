"use client" // 指示这是一个客户端组件

import { WalletProvider } from "@/app/context/wallet-context" // 导入钱包上下文提供者
import { ProfileContent } from "@/app/components/pages/profile-content" // 导入个人资料内容组件

/**
 * ProfileContentWrapper 组件
 *
 * 这是一个简单的包装器组件 (Wrapper Component)，主要用于将 `ProfileContent` 组件
 * 包裹在 `WalletProvider` 上下文提供者之中。
 *
 * 目的:
 * - **提供上下文:** 确保 `ProfileContent` 组件及其所有子组件能够访问和使用
 *   通过 `WalletProvider` 提供的钱包连接状态、地址、连接/断开连接方法等功能。
 * - **组件结构清晰:** 将上下文的提供逻辑与页面内容的展示逻辑分离开来。
 *
 * @component
 * @returns {JSX.Element} 返回一个包含 `WalletProvider` 和 `ProfileContent` 的 JSX 结构。
 */
export function ProfileContentWrapper() {
  return (
    // 提供钱包相关的上下文给 ProfileContent 组件
    <WalletProvider>
      {/* 渲染实际的个人资料页面内容 */}
      <ProfileContent />
    </WalletProvider>
  )
}

