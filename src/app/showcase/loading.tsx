/**
 * Next.js Route Segment Loading Component (`loading.tsx`)
 * 用于在 `/showcase` 路由段（案例列表页）加载时显示即时加载状态。
 * 当前返回 `null`，表示不显示此路由段特定的加载 UI。
 * 可能是因为案例数据加载速度快，或者依赖父级布局的加载状态。
 * 如果需要为案例列表页添加骨架屏或加载指示器，可以在此实现。
 * @returns {null} - 不渲染任何内容。
 */
export default function Loading() {
  // 返回 null 表示在加载案例列表数据时，此部分不显示自定义加载界面。
  return null
}

