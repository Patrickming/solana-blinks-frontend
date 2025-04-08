"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { AuthDialogWrapper } from "@/components/auth-dialog-wrapper" // 使用包装组件
import { useWallet } from "@/context/wallet-context"
import { SUPPORTED_WALLETS } from "@/lib/constants"

export function HomeContentInner() {
  // 状态管理
  const [currentSlide, setCurrentSlide] = useState(0)
  const statsRef = useRef(null)
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 })
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const router = useRouter()

  // 认证对话框状态
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "register" | "wallet">("login")

  // 轮播图内容
  const slides = [
    {
      title: "Solana Blinks 创建器",
      description: "使用我们的创建器快速生成 Solana 区块链操作链接，一键分享给任何人",
      image: "/placeholder.svg?height=400&width=600&text=Solana+Blinks+Creator",
      link: "/blink",
      tag: "核心功能",
    },
    {
      title: "多链支持",
      description: "Solana Blinks 现已支持多链操作，包括 Solana、Ethereum 和 Polygon",
      image: "/placeholder.svg?height=400&width=600&text=Multi-chain+Support",
      link: "/tutorials",
      tag: "新功能",
    },
    {
      title: "NFT 购买链接",
      description: "创建一键购买 NFT 的链接，简化 NFT 销售流程",
      image: "/placeholder.svg?height=400&width=600&text=NFT+Purchase+Links",
      link: "/showcase",
      tag: "热门应用",
    },
  ]

  // 自动轮播效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  // 统计数据
  const stats = [
    {
      value: "1.2秒",
      label: "平均执行时间",
      description: "Blinks 的平均执行时间仅为 1.2 秒，让您的用户无需等待",
    },
    {
      value: "12,547",
      label: "活跃 Blinks",
      description: "已创建并活跃使用的 Blinks 总数，为用户提供便捷的区块链操作体验",
    },
    {
      value: "98%",
      label: "成功率",
      description: "Blinks 交易的成功率高达 98%，确保您的操作可靠执行",
    },
  ]

  // Blinks 类别
  const categories = [
    { name: "代币交换", count: 4328, color: "from-purple-500 to-blue-500" },
    { name: "NFT 购买", count: 2156, color: "from-blue-500 to-cyan-500" },
    { name: "多签交易", count: 1089, color: "from-cyan-500 to-emerald-500" },
    { name: "DAO 投票", count: 876, color: "from-emerald-500 to-yellow-500" },
    { name: "空投领取", count: 1432, color: "from-yellow-500 to-orange-500" },
    { name: "游戏道具", count: 987, color: "from-orange-500 to-red-500" },
  ]

  // 获取钱包连接状态
  const { connected } = useWallet()

  return (
    <main>
      {/* 英雄区域，带动画效果 */}
      <section className="relative overflow-hidden bg-background py-20 md:py-32">
        {/* 背景渐变效果 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(153,69,255,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(20,241,149,0.1),transparent_50%)]"></div>

        {/* 动画背景元素 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 紫色模糊圆形，带动画 */}
          <motion.div
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
          {/* 绿色模糊圆形，带动画 */}
          <motion.div
            className="absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: 1,
            }}
          />
        </div>

        {/* 主要内容 */}
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            {/* 标题，带入场动画 */}
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              一键操作 Solana 区块链
            </motion.h1>
            {/* 描述文本，带入场动画 */}
            <motion.p
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Blinks 让区块链操作变得简单。创建、分享、执行 —— 无需编码，一键完成。
            </motion.p>
            {/* 按钮组，带入场动画 */}
            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* 创建 Blink 按钮 */}
              <Button
                asChild
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 px-8 py-6 text-base"
              >
                <Link href="/blink">创建 Blink</Link>
              </Button>
              {/* 了解更多按钮 */}
              <Button asChild variant="outline" className="px-8 py-6 text-base">
                <Link href="/tutorials">了解更多</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 支持的钱包部分 */}
      <section className="border-t border-border/40 py-12">
        <div className="container">
          <p className="mb-8 text-center text-sm text-muted-foreground">支持多种 Solana 钱包，轻松连接</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
            {/* 遍历钱包列表，带入场动画 */}
            {SUPPORTED_WALLETS.map((wallet, index) => (
              <motion.div
                key={wallet.name}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* 钱包图标 */}
                <div className="h-10 w-10 rounded-full bg-background/80 p-1 shadow-md">
                  <img src={wallet.logo || "/placeholder.svg"} alt={wallet.name} className="h-full w-full" />
                </div>
                {/* 钱包名称 */}
                <span className="mt-2 text-xs font-medium">{wallet.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 其余部分省略，与之前相同 */}

      {/* 认证对话框 - 使用包装组件 */}
      <AuthDialogWrapper open={authDialogOpen} onOpenChange={setAuthDialogOpen} mode={authDialogMode} />
    </main>
  )
}

