"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ThumbsUp, MessageSquare, ExternalLink, Filter } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"

export default function ShowcasePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { t } = useLanguage()

  // 定义类别，使用硬编码的中文名称而不是翻译键
  const categories = [
    { id: "all", name: "全部" },
    { id: "swap", name: "代币交换" },
    { id: "nft", name: "NFT 购买" },
    { id: "multisig", name: "多签交易" },
    { id: "dao", name: "DAO 投票" },
    { id: "airdrop", name: "空投领取" },
    { id: "gaming", name: "游戏道具" },
  ]

  // Mock data for case studies
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
      link: "/showcase/1",
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

  const filteredBlinks = blinks.filter(
    (blink) =>
      blink.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blink.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blink.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blink.author.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <div className="space-y-6">
          <div className="glass-morphism rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">{t("showcase.title")}</h2>
            <p className="text-muted-foreground">{t("showcase.description")}</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("showcase.search")}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t("showcase.filters")}
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="flex w-full overflow-auto pb-px">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <motion.div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {filteredBlinks.map((blink) => (
                  <motion.div key={blink.id} variants={item}>
                    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={blink.image || "/placeholder.svg"}
                          alt={blink.title}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                        <Badge className="absolute top-2 right-2 capitalize" variant="secondary">
                          {categories.find((c) => c.id === blink.category)?.name || blink.category}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{blink.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{blink.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={blink.authorAvatar} alt={blink.author} />
                            <AvatarFallback>{blink.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{blink.author}</p>
                            <p className="text-xs text-muted-foreground">{blink.date}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2 border-t">
                        <div className="flex space-x-4">
                          <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{blink.likes}</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>{blink.comments}</span>
                          </Button>
                        </div>
                        <Button asChild variant="outline" size="sm" className="flex items-center space-x-1">
                          <Link href={blink.link}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t("showcase.viewCase")}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {filteredBlinks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t("showcase.noResults")}</p>
                  <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                    {t("showcase.clearSearch")}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* 其他分类标签页内容结构类似 */}
            {categories.slice(1).map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-6">
                <motion.div
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {filteredBlinks
                    .filter((blink) => blink.category === category.id)
                    .map((blink) => (
                      <motion.div key={blink.id} variants={item}>
                        <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={blink.image || "/placeholder.svg"}
                              alt={blink.title}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                            <Badge className="absolute top-2 right-2 capitalize" variant="secondary">
                              {category.name}
                            </Badge>
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl">{blink.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{blink.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2 flex-grow">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={blink.authorAvatar} alt={blink.author} />
                                <AvatarFallback>{blink.author.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{blink.author}</p>
                                <p className="text-xs text-muted-foreground">{blink.date}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between pt-2 border-t">
                            <div className="flex space-x-4">
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
                                <ThumbsUp className="h-4 w-4" />
                                <span>{blink.likes}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>{blink.comments}</span>
                              </Button>
                            </div>
                            <Button asChild variant="outline" size="sm" className="flex items-center space-x-1">
                              <Link href={blink.link}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                查看详情
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>

                {filteredBlinks.filter((blink) => blink.category === category.id).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">未找到匹配的 {category.name} Blinks。</p>
                    <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
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

