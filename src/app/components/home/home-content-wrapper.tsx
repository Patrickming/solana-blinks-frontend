"use client" // 指示这是一个客户端组件

import { WalletProvider } from "@/app/context/wallet-context" // 导入钱包上下文提供者
import { AuthProvider } from "@/app/context/auth-context" // 导入认证上下文提供者
import { HomeContent } from "@/app/components/home/home-content" // 导入首页内容组件

/**
 * HomeContentWrapper 组件
 *
 * 这是一个包装组件 (Wrapper Component)，其主要职责是为 `HomeContent` 组件
 * 提供必要的 React 上下文 (Context)。具体来说，它包裹了 `HomeContent`，
 * 并向其注入 `WalletProvider` 和 `AuthProvider`。
 *
 * 这样做的好处是：
 * 1. **分离关注点 (Separation of Concerns):** `HomeContent` 组件可以专注于展示首页内容，
 *    而不需要关心上下文的设置和提供。
 * 2. **代码复用和维护:** 如果将来有其他组件也需要相同的上下文组合，可以复用这个 Wrapper，
 *    或者更容易地修改提供的上下文。
 * 3. **确保依赖注入:** 保证了 `HomeContent` 及其所有子组件在渲染时，
 *    能够访问到钱包状态 (`WalletProvider`) 和用户认证状态 (`AuthProvider`)。
 *
 * @component
 * @returns {JSX.Element} 返回一个包含上下文提供者和 `HomeContent` 组件的 JSX 结构。
 */
export function HomeContentWrapper() {
  return (
    // 提供钱包上下文
    <WalletProvider>
      {/* 在钱包上下文内提供认证上下文 */}
      <AuthProvider>
        {/* 渲染实际的首页内容组件 */}
        <HomeContent />
      </AuthProvider>
    </WalletProvider>
  )
}

