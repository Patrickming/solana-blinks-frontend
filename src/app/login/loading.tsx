/**
 * Next.js Route Segment Loading Component (`loading.tsx`)
 * 用于在 `/login` 路由段加载时显示即时加载状态。
 * 当前返回 `null`，表示不显示此路由段特定的加载 UI。
 * 应用程序可能会依赖父级布局 (`app/layout.tsx`) 中定义的 Suspense 边界或全局加载指示器。
 * 如果需要为登录页面添加特定的加载动画或骨架屏，可以在此组件中实现。
 * @returns {null} - 不渲染任何内容。
 */
export default function Loading() {
  // 返回 null 意味着在页面加载期间，此特定部分不会显示任何自定义加载 UI。
  return null
}

