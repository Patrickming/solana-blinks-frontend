"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
// @ts-ignore
import Markdown from "markdown-to-jsx"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Textarea } from "@/app/components/ui/textarea"
import { Separator } from "@/app/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { useToast } from "@/app/components/ui/use-toast"
import { MessageCircle, ThumbsUp, Share2, ArrowLeft, Eye, Edit } from "lucide-react"
import { useLanguage } from "@/app/context/language-context"

interface TopicDetailProps {
  topicId: string
}

/**
 * 话题详情组件
 * 用于显示论坛话题的详细内容和评论。
 */
export function TopicDetail({ topicId }: TopicDetailProps) {
  const [commentText, setCommentText] = useState("")
  const { t } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()

  // In a real app, you would fetch the topic by ID from an API
  // For this example, we'll use the static data
  const topic = getTopicById(parseInt(topicId))
  
  // Mock comments data
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "专业开发者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content: "这是一个非常有用的分享，我已经在我的项目中用上了你提到的方法。**特别是第二点**非常实用！",
      date: "1天前",
      likes: 7
    },
    {
      id: 2,
      author: "区块链爱好者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content: "能否详细解释一下如何处理多币种转换的部分？\n\n我在实现类似功能时遇到了以下问题：\n1. 流动性池不足\n2. 价格波动较大时滑点计算\n3. Gas费用优化",
      date: "20小时前",
      likes: 3
    },
    {
      id: 3,
      author: "Solana新手",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content: "感谢分享！对新手非常友好的教程。\n\n我按照代码示例实现了一个简单版本：\n```js\nconst swap = async () => {\n  // 实现基本交换逻辑\n};\n```\n还需要继续完善错误处理部分。",
      date: "5小时前",
      likes: 2
    }
  ])

  const handleSubmitComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "评论不能为空",
        description: "请输入您的评论内容",
        variant: "destructive"
      })
      return
    }

    // Add new comment
    const newComment = {
      id: comments.length + 1,
      author: "当前用户",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      content: commentText,
      date: "刚刚",
      likes: 0
    }

    setComments([...comments, newComment])
    setCommentText("")
    
    toast({
      title: "评论已发布",
      description: "您的评论已成功发布"
    })
  }

  // Handle back to forum
  const handleBack = () => {
    router.push("/forum")
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-4">话题不存在</h3>
        <p className="text-muted-foreground mb-6">
          您请求的话题不存在或已被删除
        </p>
        <Button 
          onClick={handleBack}
          className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
        >
          返回论坛
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="gap-1 mb-4" 
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4" />
        返回论坛
      </Button>

      {/* Topic detail card */}
      <Card className="glass-morphism">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{topic.title}</CardTitle>
                {topic.isHot && (
                  <Badge variant="secondary" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                    {t("forum.badges.hot")}
                  </Badge>
                )}
                {topic.isOfficial && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                    {t("forum.badges.official")}
                  </Badge>
                )}
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {t(`forum.categories.${topic.category}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={topic.authorAvatar} alt={topic.author} />
              <AvatarFallback>{topic.author.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{topic.author}</p>
              <p className="text-xs text-muted-foreground">{topic.date}</p>
            </div>
          </div>

          {/* Topic content */}
          <div className="prose prose-invert max-w-none markdown-content">
            <Markdown options={{
              overrides: {
                h1: {
                  props: {
                    className: "text-2xl font-bold mt-6 mb-4",
                  },
                },
                h2: {
                  props: {
                    className: "text-xl font-bold mt-5 mb-3",
                  },
                },
                h3: {
                  props: {
                    className: "text-lg font-bold mt-4 mb-2",
                  },
                },
                p: {
                  props: {
                    className: "mb-4 leading-relaxed",
                  },
                },
                ul: {
                  props: {
                    className: "list-disc pl-6 mb-4",
                  },
                },
                ol: {
                  props: {
                    className: "list-decimal pl-6 mb-4",
                  },
                },
                li: {
                  props: {
                    className: "mb-1",
                  },
                },
                a: {
                  props: {
                    className: "text-primary hover:underline",
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                },
                blockquote: {
                  props: {
                    className: "border-l-4 border-primary/30 pl-4 italic my-4",
                  },
                },
                code: {
                  props: {
                    className: "bg-muted px-1 py-0.5 rounded text-sm",
                  },
                },
                pre: {
                  props: {
                    className: "bg-muted p-4 rounded-md overflow-x-auto mb-4 text-sm",
                  },
                },
              },
            }}>
              {topic.content}
            </Markdown>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{topic.likes}</span>
            </Button>
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-1">
            <Share2 className="h-4 w-4 mr-1" />
            {t("forum.actions.share")}
          </Button>
        </CardFooter>
      </Card>

      {/* Comments section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{comments.length}个评论</h3>
        
        {/* Comment list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorAvatar} alt={comment.author} />
                    <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">{comment.date}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex items-center h-7">
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">{comment.likes}</span>
                      </Button>
                    </div>
                    <div className="prose prose-invert max-w-none markdown-content text-sm">
                      <Markdown options={{
                        overrides: {
                          h1: { props: { className: "text-lg font-bold mt-3 mb-2" } },
                          h2: { props: { className: "text-base font-bold mt-2 mb-1" } },
                          h3: { props: { className: "text-sm font-bold mt-1 mb-1" } },
                          p: { props: { className: "mb-2 leading-relaxed" } },
                          ul: { props: { className: "list-disc pl-4 mb-2" } },
                          ol: { props: { className: "list-decimal pl-4 mb-2" } },
                          li: { props: { className: "mb-1" } },
                          a: { props: { className: "text-primary hover:underline", target: "_blank", rel: "noopener noreferrer" } },
                          blockquote: { props: { className: "border-l-2 border-primary/30 pl-2 italic my-2" } },
                          code: { props: { className: "bg-muted px-1 py-0.5 rounded text-xs" } },
                          pre: { props: { className: "bg-muted p-2 rounded-md overflow-x-auto mb-2 text-xs" } },
                        },
                      }}>
                        {comment.content}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add comment form */}
        <div className="pt-4">
          <h4 className="text-base font-medium mb-3">发表评论</h4>
          <div className="space-y-4">
            <Card className="border border-muted">
              <Tabs defaultValue="write" className="w-full">
                <CardHeader className="pb-2 pt-2">
                  <TabsList className="grid w-60 grid-cols-2">
                    <TabsTrigger value="write" className="flex items-center gap-1">
                      <Edit className="h-3.5 w-3.5" />
                      编写
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      预览
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="write" className="mt-0">
                    <Textarea 
                      placeholder="分享您的想法... (支持Markdown格式)" 
                      className="min-h-[150px] border-0 focus-visible:ring-0 p-0"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="mt-0 min-h-[150px]">
                    {commentText ? (
                      <div className="prose prose-invert max-w-none markdown-content">
                        <Markdown options={{
                          overrides: {
                            h1: { props: { className: "text-xl font-bold mt-4 mb-2" } },
                            h2: { props: { className: "text-lg font-bold mt-3 mb-2" } },
                            h3: { props: { className: "text-md font-bold mt-2 mb-1" } },
                            p: { props: { className: "mb-3 leading-relaxed" } },
                            ul: { props: { className: "list-disc pl-5 mb-3" } },
                            ol: { props: { className: "list-decimal pl-5 mb-3" } },
                            li: { props: { className: "mb-1" } },
                            a: { props: { className: "text-primary hover:underline", target: "_blank", rel: "noopener noreferrer" } },
                            blockquote: { props: { className: "border-l-4 border-primary/30 pl-3 italic my-3" } },
                            code: { props: { className: "bg-muted px-1 py-0.5 rounded text-sm" } },
                            pre: { props: { className: "bg-muted p-3 rounded-md overflow-x-auto mb-3 text-sm" } },
                          },
                        }}>
                          {commentText}
                        </Markdown>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">在此处预览您的评论...</div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
            <div className="flex items-start justify-between">
              <div className="text-xs text-muted-foreground">
                支持 <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Markdown</a> 格式
              </div>
              <Button 
                onClick={handleSubmitComment}
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
              >
                发表评论
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock function to get topic by ID
function getTopicById(id: number) {
  const topics = [
    {
      id: 1,
      title: "代币交换 Blinks 的最佳实践",
      content: `# 代币交换 Blinks 的最佳实践

在过去的几个月里，我一直在使用 Blinks SDK 开发代币交换应用，积累了一些经验想与大家分享。

## 最佳实践总结

以下是我总结的一些最佳实践：

1. **优化用户体验**：使用多步骤表单而不是单个长表单，这样可以降低用户放弃交易的概率。

2. **加入详细的代币信息**：显示代币图标、当前市场价值和预计交换金额，增加用户信任度。

3. **错误处理**：一定要优雅地处理所有可能的错误情况，包括流动性不足、价格滑点过大等。

4. **交易状态管理**：实现实时更新的交易状态指示器，让用户清楚了解当前进度。

## 代码示例

实现一个基本的代币交换界面：

\`\`\`jsx
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { swapTokens } from '@/lib/token-swap';

function TokenSwapForm() {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  
  const handleSwap = async () => {
    if (!publicKey) return;
    
    try {
      const result = await swapTokens(publicKey, amount);
      console.log('Swap successful', result);
    } catch (error) {
      console.error('Swap failed', error);
    }
  };
  
  return (
    <div>
      <input 
        type="number" 
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="输入交换金额"
      />
      <button onClick={handleSwap}>交换代币</button>
    </div>
  );
}
\`\`\`

希望这些建议对大家有所帮助！如果你有其他好的实践，欢迎在评论区分享。`,
      author: "币圈爱好者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "2 天前",
      category: "discussion",
      replies: 12,
      likes: 24,
      isHot: true,
      isOfficial: false,
    },
    {
      id: 2,
      title: "Blinks SDK v2.0 发布公告",
      content: `# Blinks SDK v2.0 正式发布！🎉

我们很高兴地宣布 Blinks SDK v2.0 正式发布！这是一次重大更新，带来了许多新功能和性能改进。

## 主要更新内容

1. **多链支持**：现在可以在 Solana、Ethereum 和 Polygon 上创建和执行 Blinks。

2. **性能优化**：交易确认时间缩短了约 40%，API 响应速度提升了 60%。

3. **新的 UI 组件库**：包含超过 30 个预设组件，与流行的前端框架无缝集成。

4. **安全增强**：改进了签名验证机制，添加了更多的安全检查。

5. **文档更新**：完全重写的文档站点，包含更多的教程和示例代码。

## 更新示例

使用 v2.0 创建 Blink 的示例代码：

\`\`\`typescript
import { createBlink } from '@dialectlabs/blinks/v2';

// 创建一个新的 Blink
const newBlink = await createBlink({
  type: 'tip',
  recipientAddress: 'solana-address-here',
  amount: 1.5,
  token: 'SOL',
  message: '感谢您的帮助！',
  expiresIn: '7d',
});

// 获取可分享的链接
const shareableLink = newBlink.shareableLink;
console.log(shareableLink);
\`\`\`

> 注意：v2.0 版本与 v1.x 版本不完全兼容，请查看迁移指南了解如何升级您的应用。

详细更新日志请查看我们的[官方文档](https://example.com/docs)。如有任何问题，欢迎在此留言或联系技术支持团队。`,
      author: "Solana团队",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "1 周前",
      category: "announcement",
      replies: 8,
      likes: 42,
      isHot: true,
      isOfficial: true,
    },
    {
      id: 3,
      title: "如何在 React Native 中集成 Blinks？",
      content: `# React Native 集成 Blinks 问题求助

我正在开发一个使用 React Native 的移动应用，想要集成 Blinks 功能，但遇到了一些问题。

## 目前尝试的步骤

目前我遵循了官方文档的指南：
1. 安装了 @dialectlabs/blinks 包
2. 导入并设置了 BlinkProvider
3. 尝试渲染 Blink 组件

## 遇到的错误

但在 Android 设备上出现了以下错误：
\`\`\`
Error: Unrecognized font family 'Roboto'
\`\`\`

iOS 设备上则是白屏，控制台没有任何错误信息。

## 我的代码

以下是我的集成代码：

\`\`\`javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlinkProvider, Blink } from '@dialectlabs/blinks/react-native';

export default function BlinkScreen() {
  return (
    <View style={styles.container}>
      <BlinkProvider
        environment="production"
        config={{
          solana: {
            walletConnectMethod: 'manual',
          }
        }}
      >
        <Blink
          id="my-blink-id"
          type="tip"
          orientation="horizontal"
        />
      </BlinkProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
\`\`\`

有谁成功在 React Native 项目中集成了 Blinks 吗？有什么特殊的配置需要注意的？或者有替代方案可以在移动应用中使用 Blinks 功能？

感谢任何帮助或建议！`,
      author: "移动开发者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "3 天前",
      category: "help",
      replies: 5,
      likes: 7,
      isHot: false,
      isOfficial: false,
    },
    {
      id: 4,
      title: "展示：使用 Blinks 的 NFT 收藏品",
      content: `# CryptoPixels: 基于 Blinks 的 NFT 收藏品

![CryptoPixels 预览](https://via.placeholder.com/800x400)

我想向大家展示我最近使用 Blinks 开发的 NFT 收藏品项目。

## 项目简介

**项目名称**: CryptoPixels

这是一个像素艺术 NFT 收藏品，通过 Blinks 实现了以下创新功能：

## 主要功能

1. **实时铸造**：用户可以直接在界面上创建和定制自己的像素艺术，然后通过 Blink 一键铸造为 NFT。

2. **社交分享**：每个 NFT 都有一个独特的 Blink 链接，可以直接分享到社交媒体，让接收者直接通过链接查看和购买 NFT。

3. **批量赠送**：创作者可以生成多个 Blink 链接，用于向粉丝批量赠送限量版 NFT。

4. **二级市场整合**：直接从 Blink 界面访问 NFT 的二级市场数据和交易功能。

## 技术实现

项目使用了以下技术栈：
* React + Next.js 前端
* Solana 区块链
* Dialect Blinks SDK
* IPFS 存储

## 用户反馈

> "这是我见过的最简单的 NFT 铸造体验" - NFT 收藏家

> "社交分享功能大大提高了我作品的曝光度" - 数字艺术家

项目链接：[CryptoPixels](https://example.com)

欢迎大家体验并提供反馈！如果您也有使用 Blinks 的创意项目，请在评论中分享。`,
      author: "NFT创作者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "5 小时前",
      category: "showcase",
      replies: 3,
      likes: 15,
      isHot: false,
      isOfficial: false,
    },
  ]
  
  return topics.find(topic => topic.id === id) || null
} 