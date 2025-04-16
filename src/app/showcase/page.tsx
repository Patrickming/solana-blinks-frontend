"use client"

// 导入 React Hooks
import { useState } from "react"
// 导入布局和 UI 组件
import { SiteHeader } from "@/app/components/layout/site-header"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Badge } from "@/app/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
// 导入图标库
import { Search, ThumbsUp, MessageSquare, ExternalLink, Filter } from "lucide-react"
// 导入动画库
import { motion } from "framer-motion"
// 导入 Next.js Link 组件
import Link from "next/link"
// 导入语言上下文 Hook
import { useLanguage } from "@/app/context/language-context"

/**
 * Showcase 页面组件 (`/showcase`)
 * 用于展示 Solana Blinks 的应用案例列表。
 * 提供搜索和按类别筛选功能。
 */
export default function ShowcasePage() {
  // 搜索查询状态
  const [searchQuery, setSearchQuery] = useState("")
  // 获取翻译函数
  const { t } = useLanguage()

  // 定义案例类别
  // 注意：这里直接使用了中文，理想情况下应使用翻译键 t('showcase.tabs.swap') 等
  const categories = [
    { id: "all", name: "全部" },
    { id: "swap", name: "代币交换" },
    { id: "nft", name: "NFT 购买" },
    { id: "multisig", name: "多签交易" },
    { id: "dao", name: "DAO 投票" },
    { id: "airdrop", name: "空投领取" },
    { id: "gaming", name: "游戏道具" },
  ]

  // 模拟的案例数据 (应替换为实际 API 获取的数据)
  const blinks = [
    {
      id: 1,
      title: "SOL/USDC 快速交换",
      description: "一键完成 SOL 和 USDC 之间的交换，支持自定义滑点设置",
      image: "/placeholder.svg?height=200&width=400&text=SOL/USDC",
      category: "swap",
      author: "Elena M.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "2 天前",
      likes: 42,
      comments: 8,
      link: "/showcase/1", // 指向详情页的链接
    },
    {
      id: 2,
      title: "Solana Monkeys NFT 购买",
      description: "一键购买 Solana Monkeys NFT 系列，支持设置最高价格",
      image: "/placeholder.svg?height=200&width=400&text=NFT",
      category: "nft",
      author: "Michael K.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "1 周前",
      likes: 36,
      comments: 5,
      link: "/showcase/2",
    },
    {
      id: 3,
      title: "DAO 投票 Blink",
      description: "简化 DAO 投票流程，一键完成提案投票",
      image: "/placeholder.svg?height=200&width=400&text=DAO",
      category: "dao",
      author: "Sarah J.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "3 天前",
      likes: 29,
      comments: 12,
      link: "/showcase/3",
    },
    {
      id: 4,
      title: "游戏道具购买",
      description: "为 Solana 游戏提供一键购买游戏道具的功能",
      image: "/placeholder.svg?height=200&width=400&text=Gaming",
      category: "gaming",
      author: "David L.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "5 天前",
      likes: 51,
      comments: 7,
      link: "/showcase/4",
    },
    {
      id: 5,
      title: "多签交易 Blink",
      description: "简化多签钱包交易流程，支持多人批准",
      image: "/placeholder.svg?height=200&width=400&text=Multisig",
      category: "multisig",
      author: "Alex R.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "1 周前",
      likes: 33,
      comments: 9,
      link: "/showcase/5",
    },
    {
      id: 6,
      title: "空投领取 Blink",
      description: "一键领取 Solana 生态项目空投代币",
      image: "/placeholder.svg?height=200&width=400&text=Airdrop",
      category: "airdrop",
      author: "Jessica T.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "2 周前",
      likes: 47,
      comments: 14,
      link: "/showcase/6",
    },
  ]

  // 根据搜索查询过滤案例
  const filteredBlinks = blinks.filter(
    (blink) =>
      blink.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blink.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // 确保类别名称搜索也有效
      (categories.find((c) => c.id === blink.category)?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      blink.author.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Framer Motion 动画变体定义 (容器)
  const container = {
    hidden: { opacity: 0 }, // 初始状态：隐藏
    show: {
      opacity: 1, // 显示状态：完全可见
      transition: {
        staggerChildren: 0.1, // 子元素交错动画延迟
      },
    },
  }

  // Framer Motion 动画变体定义 (列表项)
  const item = {
    hidden: { opacity: 0, y: 20 }, // 初始状态：隐藏且向下偏移 20px
    show: { opacity: 1, y: 0 }, // 显示状态：完全可见且回到原位
  }

  return (
    <>
      {/* 渲染网站头部 */}
      <SiteHeader />
      {/* 主内容区域 */}      
      <main className="container py-10">
        <div className="space-y-6">
          {/* 页面标题和描述区域，带有玻璃拟态效果 */}
          <div className="glass-morphism rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">{t("showcase.title")}</h2>
            <p className="text-muted-foreground">{t("showcase.description")}</p>
          </div>

          {/* 搜索和过滤区域 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* 搜索输入框 */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("showcase.search")}
                className="pl-8" // 为图标留出空间
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // 更新搜索状态
              />
            </div>

            {/* 过滤按钮 (当前无实际功能) */}
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t("showcase.filters")}
            </Button>
          </div>

          {/* 标签页组件，用于按类别筛选 */}
          <Tabs defaultValue="all">
            {/* 标签页列表 */}
            <TabsList className="flex w-full overflow-x-auto pb-px">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0">
                  {category.name} {/* 直接使用类别名称 */}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* "全部" 标签页内容 */}
            <TabsContent value="all" className="mt-6">
              {/* 使用 Framer Motion 实现列表动画 */}
              <motion.div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" // 响应式网格布局
                variants={container} // 应用容器动画变体
                initial="hidden" // 初始状态
                animate="show" // 动画到显示状态
              >
                {/* 遍历过滤后的案例数据 */}                
                {filteredBlinks.map((blink) => (
                  <motion.div key={blink.id} variants={item}> {/* 每个卡片应用列表项动画 */}                    
                    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 ease-in-out"> {/* 卡片基础样式 */}                      
                      {/* 卡片图片区域 */}
                      <div className="aspect-video relative overflow-hidden group"> {/* 固定宽高比 */}                        
                        <img
                          src={blink.image || "/placeholder.svg"} // 使用案例图片或占位符
                          alt={blink.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" // 图片缩放效果
                        />
                        {/* 类别徽章 */}
                        <Badge className="absolute top-2 right-2 capitalize" variant="secondary">
                          {categories.find((c) => c.id === blink.category)?.name || blink.category} {/* 显示类别名称 */}
                        </Badge>
                      </div>
                      {/* 卡片头部：标题和描述 */}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">{blink.title}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{blink.description}</CardDescription> {/* 限制描述行数 */}                        
                      </CardHeader>
                      {/* 卡片内容：作者信息 */}
                      <CardContent className="pb-4 flex-grow"> {/* flex-grow 使得作者信息部分占据剩余空间，将底部推到底部 */}                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={blink.authorAvatar} alt={blink.author} />
                            <AvatarFallback>{blink.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{blink.author}</p>
                            <p className="text-xs text-muted-foreground leading-none pt-1">{blink.date}</p>
                          </div>
                        </div>
                      </CardContent>
                      {/* 卡片底部：点赞、评论和查看详情按钮 */}
                      <CardFooter className="flex justify-between items-center pt-4 pb-4 border-t mt-auto"> {/* mt-auto 将底部固定 */}                        
                        <div className="flex space-x-2">
                          {/* 点赞按钮 */}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="ml-1 text-xs">{blink.likes}</span>
                          </Button>
                          {/* 评论按钮 */}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <MessageSquare className="h-4 w-4" />
                            <span className="ml-1 text-xs">{blink.comments}</span>
                          </Button>
                        </div>
                        {/* 查看详情按钮 */}
                        <Button asChild variant="outline" size="sm" className="flex items-center space-x-1">
                          <Link href={blink.link}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t("showcase.viewCase")} {/* 使用翻译 */}                            
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* 如果没有搜索结果，显示提示信息 */}
              {filteredBlinks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("showcase.noResults")}</p>
                  <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                    {t("showcase.clearSearch")}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* 渲染其他分类的标签页内容 */}            
            {categories.slice(1).map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                {/* 动画容器 */}
                <motion.div
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {/* 过滤并映射当前分类的案例 */}
                  {filteredBlinks
                    .filter((blink) => blink.category === category.id)
                    .map((blink) => (
                      <motion.div key={blink.id} variants={item}>
                        {/* 卡片结构与 "全部" 标签页中的类似 */}
                        <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 ease-in-out">
                          <div className="aspect-video relative overflow-hidden group">
                            <img
                              src={blink.image || "/placeholder.svg"}
                              alt={blink.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <Badge className="absolute top-2 right-2 capitalize" variant="secondary">
                              {category.name} {/* 显示当前分类名称 */}
                            </Badge>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">{blink.title}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground line-clamp-2">{blink.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-4 flex-grow">
                            <div className="flex items-center space-x-2 pt-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={blink.authorAvatar} alt={blink.author} />
                                <AvatarFallback>{blink.author.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium leading-none">{blink.author}</p>
                                <p className="text-xs text-muted-foreground leading-none pt-1">{blink.date}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between items-center pt-4 pb-4 border-t mt-auto">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="ml-1 text-xs">{blink.likes}</span>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <MessageSquare className="h-4 w-4" />
                                <span className="ml-1 text-xs">{blink.comments}</span>
                              </Button>
                            </div>
                            <Button asChild variant="outline" size="sm" className="flex items-center space-x-1">
                              <Link href={blink.link}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                {/* 注意：这里的 "查看详情" 是硬编码的，应该使用 t("showcase.viewCase") */}
                                查看详情 
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>

                {/* 如果当前分类没有结果，显示提示 */}
                {filteredBlinks.filter((blink) => blink.category === category.id).length === 0 && (
                  <div className="text-center py-12">
                    {/* 注意：这里的提示是硬编码的，应该使用翻译 */}
                    <p className="text-muted-foreground">未找到匹配的 {category.name} Blinks。</p>
                    <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                      {/* 注意：这里的 "清除搜索" 是硬编码的，应该使用 t("showcase.clearSearch") */}
                      清除搜索
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </>
  )
}

