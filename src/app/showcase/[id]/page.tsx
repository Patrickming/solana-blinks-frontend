"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { SiteHeader } from "@/components/layout/site-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ThumbsUp, MessageSquare, Share2, Copy, ArrowLeft, Eye, Code, Users } from "lucide-react"
import Link from "next/link"

export default function BlinkDetailPage() {
  const params = useParams()
  const { id } = params
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)

  // Mock data for the blink detail
  const blink = {
    id: Number(id),
    title: "SOL/USDC 快速交换",
    description: "一键完成 SOL 和 USDC 之间的交换，支持自定义滑点设置",
    longDescription:
      "这个 Blink 允许用户快速完成 SOL 和 USDC 之间的代币交换。用户可以设置自定义滑点，确保在市场波动时获得最佳价格。此外，还支持设置交易截止时间，保证交易在指定时间内完成。",
    image: "/placeholder.svg?height=400&width=800&text=SOL/USDC",
    category: "swap",
    author: "Elena M.",
    authorAvatar: "/placeholder.svg?height=40&width=40",
    date: "2023-11-15",
    likes: 42,
    comments: [
      {
        id: 1,
        author: "John Doe",
        authorAvatar: "/placeholder.svg?height=40&width=40",
        date: "3 天前",
        content: "这个 Blink 非常实用，我已经用它交换了几次代币，体验很流畅！",
      },
      {
        id: 2,
        author: "Alice Smith",
        authorAvatar: "/placeholder.svg?height=40&width=40",
        date: "1 周前",
        content: "滑点设置功能很棒，让我在市场波动时也能安心交易。",
      },
    ],
    link: "https://blinks.solana.com/swap/sol-usdc",
    usage: 156,
    createdAt: "2023-11-15",
    parameters: {
      fromToken: "SOL",
      toToken: "USDC",
      slippage: "0.5%",
      deadline: "10 分钟",
    },
    code: `{
"action": "swap",
"params": {
  "fromToken": "SOL",
  "toToken": "USDC",
  "slippage": 0.5,
  "deadline": 10,
  "referrer": "elena_m"
}
}`,
  }

  const handleCommentSubmit = () => {
    if (!comment.trim()) {
      toast({
        title: "评论不能为空",
        description: "请输入评论内容后再提交",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "评论已提交",
      description: "您的评论已成功提交",
    })
    setComment("")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(blink.link)
    toast({
      title: "链接已复制",
      description: "Blink 链接已复制到剪贴板",
    })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast({
      title: isLiked ? "已取消点赞" : "已点赞",
      description: isLiked ? "您已取消对此 Blink 的点赞" : "感谢您对此 Blink 的支持",
    })
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/showcase">
                <ArrowLeft className="h-4 w-4" />
                返回案例展示
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={blink.image || "/placeholder.svg"}
                    alt={blink.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{blink.title}</CardTitle>
                      <CardDescription className="mt-2">{blink.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      代币交换
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">详情</TabsTrigger>
                      <TabsTrigger value="parameters">参数</TabsTrigger>
                      <TabsTrigger value="code">代码</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="mt-4 space-y-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p>{blink.longDescription}</p>
                        <h3>使用场景</h3>
                        <ul>
                          <li>快速交换 SOL 和 USDC</li>
                          <li>设置自定义滑点保护</li>
                          <li>指定交易截止时间</li>
                          <li>一键分享交换链接给他人</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="parameters" className="mt-4">
                      <div className="rounded-md border">
                        <div className="grid grid-cols-2 gap-4 p-4">
                          {Object.entries(blink.parameters).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                              <div className="text-xs text-muted-foreground">{key}</div>
                              <div className="font-medium">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="code" className="mt-4">
                      <pre className="rounded-md bg-muted p-4 overflow-x-auto">
                        <code className="text-sm">{blink.code}</code>
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex space-x-4">
                    <Button
                      variant={isLiked ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={handleLike}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{isLiked ? blink.likes + 1 : blink.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{blink.comments.length}</span>
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制链接
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      分享
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>评论 ({blink.comments.length})</CardTitle>
                  <CardDescription>分享您对这个 Blink 的看法</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {blink.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                          <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{comment.date}</p>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="添加评论..."
                      className="min-h-[80px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      onClick={handleCommentSubmit}
                      className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
                    >
                      发表评论
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>创建者</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={blink.authorAvatar} alt={blink.author} />
                      <AvatarFallback>{blink.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{blink.author}</p>
                      <p className="text-sm text-muted-foreground">Blink 创建者</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">创建的 Blinks</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-2xl font-bold">1.2k</p>
                      <p className="text-xs text-muted-foreground">总点赞数</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      查看创建者主页
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blink 统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>浏览量</span>
                      </div>
                      <span className="font-medium">2,547</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>使用次数</span>
                      </div>
                      <span className="font-medium">{blink.usage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span>创建日期</span>
                      </div>
                      <span className="font-medium">{blink.createdAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>使用此 Blink</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-md bg-muted">
                    <div className="truncate text-sm font-mono">{blink.link}</div>
                    <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">
                    立即使用
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>相关 Blinks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-start space-x-3">
                        <div className="h-12 w-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={`/placeholder.svg?height=48&width=48&text=${item}`}
                            alt={`Related Blink ${item}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <Link href={`/showcase/${item}`} className="font-medium text-sm hover:underline">
                            {item === 1 ? "USDC/USDT 交换" : item === 2 ? "SOL/BONK 交换" : "多代币交换"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {item === 1 ? "稳定币快速交换" : item === 2 ? "SOL 与 Meme 代币交换" : "一次交换多种代币"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

