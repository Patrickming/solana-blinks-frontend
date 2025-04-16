import { cn } from "@/app/lib/utils"

/**
 * 骨架屏组件
 * 用于在内容加载时显示占位符。
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
