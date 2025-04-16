"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { SiteHeader } from "@/app/components/layout/site-header"
import { Button } from "@/app/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Badge } from "@/app/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Textarea } from "@/app/components/ui/textarea"
import { useToast } from "@/app/components/ui/use-toast"
import { ThumbsUp, MessageSquare, Share2, Copy, ArrowLeft, Eye, Code, Users } from "lucide-react"
import Link from "next/link"

/**
 * Blink 详情页面组件 (`/showcase/[id]`)
 * 显示特定 Blink 案例的详细信息。
 * 从 URL 参数中获取 Blink ID，并加载（当前为模拟）对应的数据。
 */
export default function BlinkDetailPage() {
  const params = useParams()
  const { id } = params
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)

  // 模拟的 Blink 详情数据 (实际应通过 API 根据 id 获取)
  const blink = {
    id: Number(id),
    title: "SOL/USDC 快速交换",
    description: "一键完成 SOL 和 USDC 之间的交换，支持自定义滑点设置",
    longDescription:
      "这个 Blink 允许用户快速完成 SOL 和 USDC 之间的代币交换。用户可以设置自定义滑点，确保在市场波动时获得最佳价格。此外，还支持设置交易截止时间，保证交易在指定时间内完成。",
    image: `/placeholder.svg?height=400&width=800&text=SOL/USDC_${id}`,
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
    link: `https://blinks.example.com/swap/sol-usdc?id=${id}`,
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
      description: "您的评论已成功提交 (模拟)",
    })
    setComment("")
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(blink.link)
      .then(() => {
        toast({
          title: "链接已复制",
          description: "Blink 链接已复制到剪贴板",
        })
      })
      .catch(err => {
        console.error("复制链接失败: ", err)
        toast({
          title: "复制失败",
          description: "无法将链接复制到剪贴板",
          variant: "destructive",
        })
      })
  }

  const handleLike = () => {
    const newLikeState = !isLiked
    setIsLiked(newLikeState)
    blink.likes += newLikeState ? 1 : -1;

    toast({
      title: newLikeState ? "已点赞" : "已取消点赞",
      description: newLikeState ? "感谢您对此 Blink 的支持 (模拟)" : "您已取消对此 Blink 的点赞 (模拟)",
    })
  }

  if (!blink) {
    return <div>加载中或未找到 Blink...</div>;
  }

  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
              <Link href="/showcase">
                <ArrowLeft className="h-4 w-4" />
                返回案例展示
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={blink.image || "/placeholder.svg"}
                    alt={blink.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-2xl font-bold tracking-tight">{blink.title}</CardTitle>
                      <CardDescription className="mt-1 text-muted-foreground">{blink.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize self-start sm:self-center">
                      {blink.category === 'swap' ? '代币交换' : blink.category === 'nft' ? 'NFT 购买' : blink.category}
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
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                        <p>{blink.longDescription}</p>
                        <h3 className="text-foreground">使用场景</h3>
                        <ul>
                          <li>快速交换 SOL 和 USDC</li>
                          <li>设置自定义滑点保护</li>
                          <li>指定交易截止时间</li>
                          <li>一键分享交换链接给他人</li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="parameters" className="mt-4">
                      <div className="rounded-md border bg-muted/50">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-4">
                          {Object.entries(blink.parameters).map(([key, value]) => (
                            <div key={key} className="space-y-0.5">
                              <div className="text-xs font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                              <div className="font-medium text-sm text-foreground">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="code" className="mt-4">
                      <div className="relative">
                        <pre className="rounded-md bg-muted p-4 overflow-x-auto text-sm text-muted-foreground">
                          <code>{blink.code}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                  <div className="flex space-x-2">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-1.5"
                      onClick={handleLike}
                    >
                      <ThumbsUp className={`h-4 w-4 ${isLiked ? 'text-white' : 'text-muted-foreground'}`} />
                      <span>{blink.likes}</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 pointer-events-none">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{blink.comments.length}</span>
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={handleCopyLink}
                    >
                      <Copy className="h-4 w-4" />
                      复制链接
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
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
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {blink.comments.map((cmt) => (
                      <div key={cmt.id} className="flex gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarImage src={cmt.authorAvatar} alt={cmt.author} />
                          <AvatarFallback>{cmt.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground">{cmt.author}</p>
                            <p className="text-xs text-muted-foreground">· {cmt.date}</p>
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">{cmt.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 border-t pt-6">
                    <Textarea
                      placeholder="添加评论..."
                      className="min-h-[100px]"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={!comment.trim()}
                      className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white hover:opacity-90 disabled:opacity-50"
                    >
                      发表评论
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:sticky lg:top-24 self-start">
              <Card>
                <CardHeader>
                  <CardTitle>创建者信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={blink.authorAvatar} alt={blink.author} />
                      <AvatarFallback>{blink.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{blink.author}</p>
                      <p className="text-xs text-muted-foreground">Blink 创建者</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center text-sm">
                    <div className="rounded-md bg-muted p-3">
                      <p className="font-bold text-lg">12</p>
                      <p className="text-xs text-muted-foreground">创建 Blinks</p>
                    </div>
                    <div className="rounded-md bg-muted p-3">
                      <p className="font-bold text-lg">1.2k</p>
                      <p className="text-xs text-muted-foreground">总点赞</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    查看创建者主页
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blink 统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>浏览量</span>
                      </div>
                      <span className="font-medium text-foreground">2,547</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>使用次数</span>
                      </div>
                      <span className="font-medium text-foreground">{blink.usage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Code className="h-4 w-4" />
                        <span>创建日期</span>
                      </div>
                      <span className="font-medium text-foreground">{blink.createdAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>使用此 Blink</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2 p-3 rounded-md bg-muted">
                    <div className="truncate text-xs font-mono text-muted-foreground">{blink.link}</div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white hover:opacity-90">
                    立即使用 (待实现)
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
                      <div key={item} className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={`/placeholder.svg?height=48&width=48&text=Rel${item}`}
                            alt={`Related Blink ${item}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <Link href={`/showcase/${item}`} className="font-medium text-sm hover:underline text-foreground">
                            {item === 1 ? "USDC/USDT 交换" : item === 2 ? "SOL/BONK 交换" : "多代币交换"}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
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

