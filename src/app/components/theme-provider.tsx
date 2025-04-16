// 'use client' 指令表明这是一个客户端组件。
// 主题管理通常需要在客户端访问 localStorage 和 DOM 来应用和持久化主题设置。
"use client"

// 从 'next-themes' 库导入核心的 ThemeProvider 组件，并将其重命名为 NextThemesProvider 以避免与我们自定义的封装组件名称冲突。
import { ThemeProvider as NextThemesProvider } from "next-themes"
// 从 'next-themes/dist/types' 明确导入 ThemeProviderProps 类型定义。
// 这提供了传递给 NextThemesProvider 的所有可用属性的类型信息。
import type { ThemeProviderProps } from "next-themes/dist/types"

/**
 * `ThemeProvider` - 自定义的主题提供者组件。
 *
 * 这个组件是对流行的 `next-themes` 库提供的 `ThemeProvider` 的一层简单封装。
 * 目的是为了在项目中提供一个一致且可能未来可扩展的主题管理入口点。
 *
 * 主要功能:
 * - **封装依赖:** 将对 `next-themes` 的直接依赖限制在此组件内。
 * - **传递属性:** 接收所有 `next-themes` 的 `ThemeProvider` 支持的属性 (通过 `...props`)
 *   并将它们原封不动地传递给底层的 `NextThemesProvider`。
 *   常见的属性包括：
 *     - `attribute`: 指定如何应用主题（例如 'class' 表示在 html 标签上添加类名）。
 *     - `defaultTheme`: 设置应用程序的默认主题（例如 'system', 'light', 'dark'）。
 *     - `enableSystem`: 是否允许根据用户的操作系统偏好设置主题。
 *     - `storageKey`: 用于在 localStorage 中存储主题偏好的键名。
 *     - `disableTransitionOnChange`: 切换主题时是否禁用 CSS 过渡效果以防止闪烁。
 * - **包裹子组件:** 通过 `children` prop 接收应用程序的其他部分，使其能够访问主题状态和切换功能 (通过 `useTheme` Hook)。
 *
 * 通常在根布局文件 (`app/layout.tsx`) 中使用，包裹整个应用程序或其主要部分。
 *
 * @param {ThemeProviderProps} props - 组件属性，直接继承自 `next-themes` 的 `ThemeProviderProps`。
 *   包含 `children` 以及所有 `NextThemesProvider` 支持的其他配置属性。
 * @returns {JSX.Element} 返回渲染后的 `NextThemesProvider`，包裹着 `children`。
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // 将所有接收到的属性 (包括 children 和其他配置如 attribute, defaultTheme 等)
  // 透传给 next-themes 提供的核心 ThemeProvider 组件。
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

