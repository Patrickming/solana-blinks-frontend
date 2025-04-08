"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  PlayCircle,
  FileText,
  MessageSquare,
  File,
  X,
  Check,
  AlertTriangle,
  Download,
  ExternalLink,
  Search,
  Eye,
  Calendar,
  BookOpen,
  FileCode,
  FilePlus,
} from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function TutorialsContent() {
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()
  const { t, currentLanguage } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")

  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      name: string
      size: number
      type: string
      progress: number
      status: "uploading" | "success" | "error"
      errorMessage?: string
    }>
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // 预设的技术文档列表
  const technicalDocuments = [
    {
      id: "doc-1",
      title: "Solana Blinks API 参考文档",
      description: "完整的 Solana Blinks API 参考，包括所有端点和参数",
      author: "Solana 团队",
      authorAvatar: "/placeholder.svg?height=40&width=40&text=S",
      fileType: "pdf",
      fileSize: "2.4 MB",
      downloadUrl: "#",
      uploadDate: "2023-11-15",
      category: "api",
      version: "v1.2.0",
      downloads: 1245,
      tags: ["API", "参考", "开发者"],
    },
    {
      id: "doc-2",
      title: "Blinks SDK 开发指南",
      description: "使用 Blinks SDK 开发 Solana 应用的完整指南",
      author: "开发团队",
      authorAvatar: "/placeholder.svg?height=40&width=40&text=D",
      fileType: "pdf",
      fileSize: "3.8 MB",
      downloadUrl: "#",
      uploadDate: "2023-12-01",
      category: "sdk",
      version: "v2.0.1",
      downloads: 876,
      tags: ["SDK", "开发", "指南"],
    },
    {
      id: "doc-3",
      title: "Solana 交易结构详解",
      description: "深入解析 Solana 交易结构和签名机制",
      author: "技术专家",
      authorAvatar: "/placeholder.svg?height=40&width=40&text=T",
      fileType: "pdf",
      fileSize: "1.7 MB",
      downloadUrl: "#",
      uploadDate: "2024-01-10",
      category: "technical",
      version: "v1.0.0",
      downloads: 543,
      tags: ["交易", "技术", "深入"],
    },
    {
      id: "doc-4",
      title: "Blinks 安全最佳实践",
      description: "使用 Solana Blinks 的安全最佳实践和注意事项",
      author: "安全团队",
      authorAvatar: "/placeholder.svg?height=40&width=40&text=S",
      fileType: "pdf",
      fileSize: "1.2 MB",
      downloadUrl: "#",
      uploadDate: "2024-02-05",
      category: "security",
      version: "v1.1.0",
      downloads: 921,
      tags: ["安全", "最佳实践", "指南"],
    },
    {
      id: "doc-5",
      title: "Blinks 集成示例代码",
      description: "各种语言和框架的 Blinks 集成示例代码",
      author: "社区贡献者",
      authorAvatar: "/placeholder.svg?height=40&width=40&text=C",
      fileType: "zip",
      fileSize: "4.5 MB",
      downloadUrl: "#",
      uploadDate: "2024-02-20",
      category: "code",
      version: "v1.0.2",
      downloads: 1532,
      tags: ["代码", "示例", "集成"],
    },
  ]

  // 根据搜索过滤文档
  const filteredDocuments = technicalDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      toast({
        title: t("feedback.emptyTitle"),
        description: t("feedback.emptyDescription"),
        variant: "destructive",
      })
      return
    }

    toast({
      title: t("feedback.successTitle"),
      description: t("feedback.successDescription"),
    })
    setFeedback("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Process each file
    Array.from(files).forEach((file) => {
      // Add file to state with uploading status
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "uploading",
        },
      ])

      // Simulate upload progress
      const fileIndex = uploadedFiles.length
      const interval = setInterval(() => {
        setUploadedFiles((prev) => {
          const newFiles = [...prev]
          if (newFiles[fileIndex]) {
            if (newFiles[fileIndex].progress < 100) {
              newFiles[fileIndex].progress += 10
            } else {
              clearInterval(interval)
              newFiles[fileIndex].status = "success"
              setIsUploading(false)
            }
          }
          return newFiles
        })
      }, 300)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePublishDocuments = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "没有文件",
        description: "请先上传教程文档",
        variant: "destructive",
      })
      return
    }

    if (uploadedFiles.some((file) => file.status === "uploading")) {
      toast({
        title: "上传中",
        description: "请等待所有文件上传完成",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "文档已发布",
      description: `成功发布了 ${uploadedFiles.length} 个教程文档`,
    })
  }

  const handleDownload = (docId: string) => {
    const doc = technicalDocuments.find((d) => d.id === docId)
    if (!doc) return

    toast({
      title: "开始下载",
      description: `正在下载 ${doc.title}`,
    })
  }

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-full w-full text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-full w-full text-blue-500" />
      case "zip":
        return <FileCode className="h-full w-full text-yellow-500" />
      case "md":
        return <BookOpen className="h-full w-full text-green-500" />
      default:
        return <File className="h-full w-full text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="guides">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="guides">
            <FileText className="mr-2 h-4 w-4" />
            {t("tutorials.tabs.guides")}
          </TabsTrigger>
          <TabsTrigger value="videos">
            <PlayCircle className="mr-2 h-4 w-4" />
            {t("tutorials.tabs.videos")}
          </TabsTrigger>
          <TabsTrigger value="faq">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t("tutorials.tabs.faq")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>{t("tutorials.guides.gettingStarted.title")}</CardTitle>
              <CardDescription>{t("tutorials.guides.gettingStarted.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{t("tutorials.guides.gettingStarted.whatAreBlinks.question")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{t("tutorials.guides.gettingStarted.whatAreBlinks.answer1")}</p>
                      <p>{t("tutorials.guides.gettingStarted.whatAreBlinks.useCases")}</p>
                      <ul>
                        <li>{t("tutorials.guides.gettingStarted.whatAreBlinks.useCase1")}</li>
                        <li>{t("tutorials.guides.gettingStarted.whatAreBlinks.useCase2")}</li>
                        <li>{t("tutorials.guides.gettingStarted.whatAreBlinks.useCase3")}</li>
                        <li>{t("tutorials.guides.gettingStarted.whatAreBlinks.useCase4")}</li>
                      </ul>
                      <p>{t("tutorials.guides.gettingStarted.whatAreBlinks.answer2")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    {t("tutorials.guides.gettingStarted.creatingFirstBlink.question")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{t("tutorials.guides.gettingStarted.creatingFirstBlink.intro")}</p>
                      <ol>
                        <li>{t("tutorials.guides.gettingStarted.creatingFirstBlink.step1")}</li>
                        <li>{t("tutorials.guides.gettingStarted.creatingFirstBlink.step2")}</li>
                        <li>{t("tutorials.guides.gettingStarted.creatingFirstBlink.step3")}</li>
                        <li>{t("tutorials.guides.gettingStarted.creatingFirstBlink.step4")}</li>
                        <li>{t("tutorials.guides.gettingStarted.creatingFirstBlink.step5")}</li>
                      </ol>
                      <p>{t("tutorials.guides.gettingStarted.creatingFirstBlink.conclusion")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>{t("tutorials.guides.gettingStarted.advancedSettings.question")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{t("tutorials.guides.gettingStarted.advancedSettings.intro")}</p>
                      <h4>{t("tutorials.guides.gettingStarted.advancedSettings.tokenSwapsTitle")}</h4>
                      <ul>
                        <li>
                          <strong>{t("tutorials.guides.gettingStarted.advancedSettings.slippageLabel")}</strong>{" "}
                          {t("tutorials.guides.gettingStarted.advancedSettings.slippageDesc")}
                        </li>
                        <li>
                          <strong>{t("tutorials.guides.gettingStarted.advancedSettings.deadlineLabel")}</strong>{" "}
                          {t("tutorials.guides.gettingStarted.advancedSettings.deadlineDesc")}
                        </li>
                        <li>
                          <strong>{t("tutorials.guides.gettingStarted.advancedSettings.recipientLabel")}</strong>{" "}
                          {t("tutorials.guides.gettingStarted.advancedSettings.recipientDesc")}
                        </li>
                      </ul>
                      <h4>{t("tutorials.guides.gettingStarted.advancedSettings.nftPurchasesTitle")}</h4>
                      <ul>
                        <li>
                          <strong>{t("tutorials.guides.gettingStarted.advancedSettings.maxPriceLabel")}</strong>{" "}
                          {t("tutorials.guides.gettingStarted.advancedSettings.maxPriceDesc")}
                        </li>
                        <li>
                          <strong>{t("tutorials.guides.gettingStarted.advancedSettings.nftRecipientLabel")}</strong>{" "}
                          {t("tutorials.guides.gettingStarted.advancedSettings.nftRecipientDesc")}
                        </li>
                      </ul>
                      <p>{t("tutorials.guides.gettingStarted.advancedSettings.conclusion")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("tutorials.guides.technicalDocs.title")}</CardTitle>
                <CardDescription>{t("tutorials.guides.technicalDocs.description")}</CardDescription>
              </div>
              <Button variant="outline" className="gap-1" onClick={() => fileInputRef.current?.click()}>
                <FilePlus className="h-4 w-4" />
                上传文档
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.md,.txt,.zip"
                multiple
                onChange={handleFileChange}
              />
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full mb-6">
                <AccordionItem value="tech-1">
                  <AccordionTrigger>{t("tutorials.guides.technicalDocs.urlStructure.question")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{t("tutorials.guides.technicalDocs.urlStructure.intro")}</p>
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        https://blinks.solana.com/[action]/[parameters]
                      </pre>
                      <p>{t("tutorials.guides.technicalDocs.urlStructure.example")}</p>
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        https://blinks.solana.com/swap/sol-usdc?amount=1&slippage=0.5
                      </pre>
                      <p>{t("tutorials.guides.technicalDocs.urlStructure.conclusion")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech-2">
                  <AccordionTrigger>{t("tutorials.guides.technicalDocs.dappIntegration.question")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{t("tutorials.guides.technicalDocs.dappIntegration.intro")}</p>
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                        {`import { createBlink } from '@solana-blinks/sdk';

const blink = createBlink({
 action: 'swap',
 params: {
   fromToken: 'SOL',
   toToken: 'USDC',
   amount: '1',
   slippage: '0.5'
 }
});

console.log(blink.url); // 可分享的Blink链接
`}
                      </pre>
                      <p>{t("tutorials.guides.technicalDocs.dappIntegration.conclusion")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tech-3">
                  <AccordionTrigger>{t("tutorials.guides.technicalDocs.security.question")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p>{t("tutorials.guides.technicalDocs.security.intro")}</p>
                      <ul>
                        <li>{t("tutorials.guides.technicalDocs.security.point1")}</li>
                        <li>{t("tutorials.guides.technicalDocs.security.point2")}</li>
                        <li>{t("tutorials.guides.technicalDocs.security.point3")}</li>
                        <li>{t("tutorials.guides.technicalDocs.security.point4")}</li>
                        <li>{t("tutorials.guides.technicalDocs.security.point5")}</li>
                      </ul>
                      <p>{t("tutorials.guides.technicalDocs.security.conclusion")}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* 技术文档库 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">技术文档库</h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="搜索文档..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* 文档分类标签 */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                    全部
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                    API
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                    SDK
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                    技术
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                    安全
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                    代码
                  </Badge>
                </div>

                {/* 文档列表 */}
                <div className="space-y-3 mt-4">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="group relative flex flex-col bg-card rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all"
                      >
                        <div className="flex p-4">
                          <div className="mr-4 flex-shrink-0">
                            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                              {getFileIcon(doc.fileType)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium truncate">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{doc.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <div className="flex items-center mr-3">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{format(new Date(doc.uploadDate), "yyyy-MM-dd")}</span>
                            </div>
                            <div className="flex items-center mr-3">
                              <FileText className="h-3 w-3 mr-1" />
                              <span>
                                {doc.fileType.toUpperCase()} · {doc.fileSize}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              <span>{doc.downloads}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => window.open(doc.downloadUrl, "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>在新窗口打开</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs"
                              onClick={() => handleDownload(doc.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              下载
                            </Button>
                          </div>
                        </div>

                        <div className="absolute top-0 right-0 p-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {doc.version}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border rounded-lg">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">未找到匹配的文档</p>
                      <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                        清除搜索
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 上传文件区域 */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3 mt-6 border-t pt-6">
                  <h4 className="text-sm font-medium">待发布文档</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <File className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {file.status === "uploading" ? (
                          <div className="w-24">
                            <Progress value={file.progress} className="h-2" />
                          </div>
                        ) : file.status === "success" ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-1" />
                            <span className="text-xs text-amber-500">{file.errorMessage || "上传失败"}</span>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
                    onClick={handlePublishDocuments}
                    disabled={isUploading || uploadedFiles.length === 0}
                  >
                    {isUploading ? "上传中..." : "发布文档"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle>{t("tutorials.videos.intro.title")}</CardTitle>
                <CardDescription>{t("tutorials.videos.intro.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{t("tutorials.videos.intro.content")}</p>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle>{t("tutorials.videos.tokenSwap.title")}</CardTitle>
                <CardDescription>{t("tutorials.videos.tokenSwap.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{t("tutorials.videos.tokenSwap.content")}</p>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle>{t("tutorials.videos.nftPurchase.title")}</CardTitle>
                <CardDescription>{t("tutorials.videos.nftPurchase.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{t("tutorials.videos.nftPurchase.content")}</p>
              </CardContent>
            </Card>

            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle>{t("tutorials.videos.developer.title")}</CardTitle>
                <CardDescription>{t("tutorials.videos.developer.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{t("tutorials.videos.developer.content")}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>{t("tutorials.faq.title")}</CardTitle>
              <CardDescription>{t("tutorials.faq.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>{t("tutorials.faq.questions.free.question")}</AccordionTrigger>
                  <AccordionContent>
                    <p>{t("tutorials.faq.questions.free.answer")}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger>{t("tutorials.faq.questions.expire.question")}</AccordionTrigger>
                  <AccordionContent>
                    <p>{t("tutorials.faq.questions.expire.answer")}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger>{t("tutorials.faq.questions.cancel.question")}</AccordionTrigger>
                  <AccordionContent>
                    <p>{t("tutorials.faq.questions.cancel.answer")}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger>{t("tutorials.faq.questions.wallets.question")}</AccordionTrigger>
                  <AccordionContent>
                    <p>{t("tutorials.faq.questions.wallets.answer")}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Phantom</li>
                      <li>Solflare</li>
                      <li>Backpack</li>
                      <li>Glow</li>
                      <li>Sollet</li>
                      <li>Slope</li>
                      <li>{t("tutorials.faq.questions.wallets.more")}</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5">
                  <AccordionTrigger>{t("tutorials.faq.questions.limit.question")}</AccordionTrigger>
                  <AccordionContent>
                    <p>{t("tutorials.faq.questions.limit.answer")}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6">
                  <AccordionTrigger>{t("tutorials.faq.questions.security.question")}</AccordionTrigger>
                  <AccordionContent>
                    <p>{t("tutorials.faq.questions.security.answer")}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle>{t("tutorials.feedback.title")}</CardTitle>
              <CardDescription>{t("tutorials.feedback.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={t("tutorials.feedback.placeholder")}
                className="min-h-[100px]"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <Button
                onClick={handleFeedbackSubmit}
                className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
              >
                {t("tutorials.feedback.submit")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

