"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import { AuthDialog } from "@/components/auth-dialog"
import { useWallet } from "@/context/wallet-context"
import { useAuth } from "@/context/auth-context"
import { useLanguage } from "@/context/language-context"
import { SUPPORTED_WALLETS } from "@/lib/constants"

export function HomeContent() {
  // State management
  const [currentSlide, setCurrentSlide] = useState(0)
  const statsRef = useRef(null)
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 })
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const router = useRouter()

  // Auth dialog state
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [authDialogMode, setAuthDialogMode] = useState<"login" | "register" | "wallet" | "setup">("login")

  // Get auth state
  const { connected } = useWallet()
  const { isAuthenticated, needsWalletConnection } = useAuth()
  const { t } = useLanguage()

  // Carousel content
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

  // Auto carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  // Statistics data
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

  // Blinks categories
  const categories = [
    { name: "代币交换", count: 4328, color: "from-purple-500 to-blue-500" },
    { name: "NFT 购买", count: 2156, color: "from-blue-500 to-cyan-500" },
    { name: "多签交易", count: 1089, color: "from-cyan-500 to-emerald-500" },
    { name: "DAO 投票", count: 876, color: "from-emerald-500 to-yellow-500" },
    { name: "空投领取", count: 1432, color: "from-yellow-500 to-orange-500" },
    { name: "游戏道具", count: 987, color: "from-orange-500 to-red-500" },
  ]

  const openLoginDialog = () => {
    setAuthDialogMode("login")
    setAuthDialogOpen(true)
  }

  const openWalletDialog = () => {
    setAuthDialogMode("wallet")
    setAuthDialogOpen(true)
  }

  return (
    <main>
      {/* Hero section with animation effects */}
      <section className="relative overflow-hidden bg-background/30 py-20 md:py-32">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(153,69,255,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(20,241,149,0.15),transparent_50%)]"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Purple blur circle with animation */}
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
          {/* Green blur circle with animation */}
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

        {/* Main content */}
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            {/* Title with entrance animation */}
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              一键操作 Solana 区块链
            </motion.h1>
            {/* Description text with entrance animation */}
            <motion.p
              className="mt-6 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Blinks 让区块链操作变得简单。创建、分享、执行 —— 无需编码，一键完成。
            </motion.p>
            {/* Button group with entrance animation */}
            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Create Blink button */}
              <Button
                asChild
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 px-8 py-6 text-base"
              >
                <Link href="/blink">创建 Blink</Link>
              </Button>
              {/* Learn more button */}
              <Button asChild variant="outline" className="px-8 py-6 text-base">
                <Link href="/tutorials">了解更多</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Supported wallets section */}
      <section className="border-t border-border/40 py-12 bg-background/50">
        <div className="container">
          <p className="mb-8 text-center text-sm text-muted-foreground">支持多种 Solana 钱包，轻松连接</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
            {/* Map through wallet list with entrance animation */}
            {SUPPORTED_WALLETS.map((wallet, index) => (
              <motion.div
                key={wallet.name}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Wallet icon */}
                <div className="h-10 w-10 rounded-full bg-background/80 p-1 shadow-md">
                  <img src={wallet.logo || "/placeholder.svg"} alt={wallet.name} className="h-full w-full" />
                </div>
                {/* Wallet name */}
                <span className="mt-2 text-xs font-medium">{wallet.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News carousel section */}
      <section className="py-16 bg-background/30">
        <div className="container">
          <div className="relative overflow-hidden rounded-xl border border-border/50 glass-morphism shadow-lg">
            <div className="flex h-full">
              {/* Map through carousel slides */}
              {slides.map((slide, index) => (
                <motion.div
                  key={index}
                  className="relative min-w-full"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: currentSlide === index ? 1 : 0,
                    x: `${(index - currentSlide) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left side: text content */}
                    <div className="flex flex-col justify-center p-8 md:p-12">
                      {/* Tag */}
                      <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {slide.tag}
                      </span>
                      {/* Title */}
                      <h3 className="mb-4 text-2xl font-bold md:text-3xl">{slide.title}</h3>
                      {/* Description */}
                      <p className="mb-6 text-muted-foreground">{slide.description}</p>
                      {/* Link button */}
                      <div>
                        <Button asChild variant="outline" className="group">
                          <Link href={slide.link}>
                            了解更多
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    {/* Right side: image, only shown on non-mobile devices */}
                    <div className="hidden md:block">
                      <img
                        src={slide.image || "/placeholder.svg"}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add left/right arrow buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full shadow-md hover:bg-background"
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">上一张</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full shadow-md hover:bg-background"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">下一张</span>
            </Button>

            {/* Carousel indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    currentSlide === index ? "w-8 bg-primary" : "bg-primary/30"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics section */}
      <section ref={statsRef} className="py-20 md:py-32 bg-gradient-to-b from-background/30 to-background/50">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Map through statistics data */}
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="glass-morphism rounded-lg p-8 transition-all hover:shadow-xl"
                initial={{ opacity: 0, y: 50 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isStatsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                >
                  {/* Statistic value */}
                  <div className="text-4xl font-bold text-primary md:text-5xl">{stat.value}</div>
                  {/* Statistic label */}
                  <div className="mt-2 text-xl font-medium">{stat.label}</div>
                  {/* Statistic description */}
                  <div className="mt-4 text-muted-foreground">{stat.description}</div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section className="py-16 md:py-24 bg-background/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">探索 Blinks 类别</h2>
            <p className="mt-4 text-lg text-muted-foreground">浏览不同类型的 Blinks，找到适合您需求的解决方案</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Map through categories */}
            {categories.map((category, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-lg glass-morphism p-6 transition-all hover:shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Top gradient bar */}
                <div className={`h-2 bg-gradient-to-r ${category.color} absolute top-0 left-0 right-0`} />
                <div className="pt-2">
                  {/* Category name */}
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  {/* Category count */}
                  <p className="mt-2 text-sm text-muted-foreground">{category.count.toLocaleString()} 个活跃 Blinks</p>
                  {/* Browse link */}
                  <div className="mt-4">
                    <Button variant="link" size="sm" className="group-hover:text-primary px-0">
                      浏览 {category.name} <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background/30 to-background/50">
        <div className="container">
          <div className="glass-morphism rounded-2xl p-8 shadow-lg md:p-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
              {/* Left side: text content */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">准备好开始了吗？</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  立即注册并开始使用 Solana Blinks，体验简洁、去中心化的链上操作。
                </p>
                {/* Show different buttons based on authentication state */}
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  {isAuthenticated ? (
                    // Buttons for authenticated users
                    <>
                      <Button className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90" asChild>
                        <Link href="/blink">立即创建</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/tutorials">了解更多</Link>
                      </Button>
                    </>
                  ) : (
                    // Buttons for unauthenticated users
                    <>
                      <Button
                        className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
                        onClick={() => {
                          setAuthDialogMode("register")
                          setAuthDialogOpen(true)
                        }}
                      >
                        立即注册
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAuthDialogMode("login")
                          setAuthDialogOpen(true)
                        }}
                      >
                        登录
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {/* Right side: decorative content */}
              <div className="flex items-center justify-center">
                <div className="relative h-64 w-64">
                  {/* Background gradient */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] opacity-80 blur-2xl" />
                  </div>
                  {/* Foreground content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-xl glass-morphism p-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold">Blinks</div>
                        <div className="mt-2 text-sm text-muted-foreground">一键操作 Solana 区块链</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} mode={authDialogMode} />
    </main>
  )
}

