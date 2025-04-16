// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

// 导入 UI 组件
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
// 导入图标
import { Check, Clock, Link, AlertCircle } from "lucide-react"

/**
 * @typedef {Object} Activity - 活动对象类型定义
 * @property {number} id - 活动的唯一标识符
 * @property {string} type - 活动类型 (例如 "Blink Created", "Forum Post")
 * @property {string} name - 活动的名称或描述
 * @property {string} timestamp - 活动发生的时间戳 (人类可读格式，例如 "2 hours ago")
 * @property {'completed' | 'pending' | 'failed'} status - 活动的状态
 * @property {string} link - 指向相关资源的链接
 */

/**
 * RecentActivity 组件
 * 显示用户最近活动列表的卡片。
 * 目前使用模拟数据进行展示。
 *
 * @component
 * @returns {JSX.Element} RecentActivity 组件的 JSX 元素。
 */
export function RecentActivity() {
  /**
   * 模拟的最近活动数据。
   * @type {Activity[]}
   */
  const activities = [
    {
      id: 1,
      type: "Blink Created", // 活动类型
      name: "Token Swap Blink", // 活动名称
      timestamp: "2 hours ago", // 时间戳
      status: "completed", // 状态：已完成
      link: "#", // 链接
    },
    {
      id: 2,
      type: "Blink Shared",
      name: "NFT Purchase Link",
      timestamp: "Yesterday",
      status: "completed",
      link: "#",
    },
    {
      id: 3,
      type: "Forum Post",
      name: "Best Practices for Blinks",
      timestamp: "3 days ago",
      status: "completed",
      link: "#",
    },
    {
      id: 4,
      type: "Blink Created",
      name: "Multi-token Swap",
      timestamp: "Just now",
      status: "pending", // 状态：待处理
      link: "#",
    },
  ]

  /**
   * 根据活动状态返回对应的图标组件。
   * @param {string} status - 活动状态 ('completed', 'pending', 'failed')
   * @returns {JSX.Element | null} 对应的 Lucide 图标组件或 null
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        // 已完成：绿色对勾图标
        return <Check className="h-4 w-4 text-green-500" />
      case "pending":
        // 待处理：黄色时钟图标
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        // 失败：红色警告图标
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    // 使用玻璃态效果的卡片组件
    <Card className="glass-morphism">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 遍历活动列表并渲染每个活动项 */}
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-md bg-background/50 hover:bg-background/80 transition-colors"
            >
              {/* 左侧：活动状态图标和详情 */}
              <div className="flex items-center space-x-4">
                {/* 状态图标容器 */}
                <div className="rounded-full p-2 bg-primary/10">{getStatusIcon(activity.status)}</div>
                <div>
                  {/* 活动名称 */}
                  <p className="font-medium">{activity.name}</p>
                  <div className="flex items-center space-x-2">
                    {/* 活动类型徽章 */}
                    <Badge variant="outline">{activity.type}</Badge>
                    {/* 时间戳 */}
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
              {/* 右侧：链接图标 */}
              <a href={activity.link} className="text-primary hover:underline">
                <Link className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

