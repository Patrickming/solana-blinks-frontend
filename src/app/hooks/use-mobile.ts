// 'use client' 指令确保此 hook 仅在客户端环境执行，因为它依赖于浏览器特有的 `window` 对象。
"use client"

// 导入 React 的 `useState` 和 `useEffect` Hooks。
import { useState, useEffect } from "react"

/**
 * `useMobile` - 自定义 React Hook，用于检测当前视图是否为移动端尺寸。
 *
 * 这个 Hook 通过监听浏览器窗口的宽度变化，并与一个可配置的断点进行比较，
 * 来判断当前是否应视为移动设备视图。
 * 这对于实现响应式布局和根据屏幕尺寸调整组件行为非常有用。
 *
 * @param {number} [breakpoint=768] - (可选) 判断为移动设备的宽度阈值（单位：像素）。
 *   如果窗口宽度严格小于此值，则 Hook 返回 `true`。
 *   默认值为 768px，这是一个常用的平板设备竖屏宽度。
 * @returns {boolean} 返回一个布尔值：
 *   - `true`: 表示当前窗口宽度小于指定的 `breakpoint`，应视为移动设备视图。
 *   - `false`: 表示当前窗口宽度大于或等于 `breakpoint`，视为桌面或平板横屏视图。
 *
 * @example
 * import { useMobile } from '@/app/hooks/use-mobile';
 *
 * function MyComponent() {
 *   const isMobileView = useMobile(); // 使用默认断点 768px
 *   // const isMobileView = useMobile(640); // 使用自定义断点 640px
 *
 *   return (
 *     <div>
 *       {isMobileView ? (
 *         <p>这是移动视图下显示的内容</p>
 *       ) : (
 *         <p>这是桌面视图下显示的内容</p>
 *       )}
 *     </div>
 *   );
 * }
 */
export const useMobile = (breakpoint: number = 768): boolean => {
  // 使用 useState 管理 `isMobile` 状态。
  // 初始状态通过一个函数计算，确保只在组件首次挂载时执行一次窗口宽度检查。
  const [isMobile, setIsMobile] = useState(() => {
    // 检查 `window` 对象是否存在，这是因为在服务器端渲染 (SSR) 或构建时，`window` 对象不存在。
    if (typeof window !== "undefined") {
      // 如果在浏览器环境，则比较当前窗口宽度和断点，设置初始状态。
      return window.innerWidth < breakpoint
    }
    // 如果不在浏览器环境（例如 SSR），则默认返回 false。
    return false
  })

  // 使用 useEffect 设置事件监听器，并处理窗口大小变化。
  useEffect(() => {
    // 再次检查 `window` 对象是否存在，确保只在客户端执行。
    if (typeof window === "undefined") {
      return // 如果不在浏览器环境，则不执行任何操作。
    }

    // 定义处理窗口大小调整事件的回调函数。
    const handleResize = () => {
      // 当窗口大小改变时，重新检查窗口宽度与断点的关系，并更新 `isMobile` 状态。
      setIsMobile(window.innerWidth < breakpoint)
    }

    // 在组件挂载后，向 `window` 对象添加 `resize` 事件的监听器。
    // 当窗口大小发生变化时，将调用 `handleResize` 函数。
    window.addEventListener("resize", handleResize)

    // 定义清理函数：当组件卸载时或 `breakpoint` 发生变化重新执行 Effect 之前，
    // 移除之前添加的事件监听器。这对于防止内存泄漏至关重要。
    return () => window.removeEventListener("resize", handleResize)

    // Effect 的依赖项数组。这意味着只有当 `breakpoint` 的值发生变化时，
    // useEffect 才会重新运行 (先执行清理函数，再执行新的 Effect 设置)。
    // 这确保了如果断点动态改变，Hook 也能正确响应。
  }, [breakpoint])

  // 返回当前的 `isMobile` 状态值。
  // 组件会因为 `isMobile` 状态的更新而重新渲染。
  return isMobile
}

