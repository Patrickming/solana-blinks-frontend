"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Image, X, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"

// NFT创建表单的schema
const nftFormSchema = z.object({
  name: z.string().min(1, { message: "请输入 NFT 名称" }),
  description: z.string().min(1, { message: "请输入 NFT 描述" }),
  image: z.any(), // 接受File对象
  collection: z.string().optional(),
  attributes: z.string().optional(),
  royalty: z.number().min(0).max(100).default(5),
  sellerFeeBasisPoints: z.number().min(0).max(10000).default(500),
  maxSupply: z.string().optional(),
  symbol: z.string().optional(),
  externalUrl: z.string().optional(),
  creatorShare: z.number().min(0).max(100).default(100),
})

interface NftFormProps {
  onSubmit: (values: z.infer<typeof nftFormSchema>) => void
  form?: any
  setSelectedImage?: (image: File | null) => void
}

export function NftForm({ onSubmit, form: externalForm, setSelectedImage: externalSetSelectedImage }: NftFormProps) {
  const [selectedImage, setSelectedImageInternal] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setSelectedImageFn = externalSetSelectedImage || setSelectedImageInternal

  // 生成模拟地址
  const generateMockAddress = () => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    let result = ""
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "已复制",
          description: message,
        })
      })
      .catch((err) => {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          variant: "destructive",
        })
      })
  }

  const [isExternalForm, setIsExternalForm] = useState(!!externalForm)

  const form = useForm<z.infer<typeof nftFormSchema>>({
    resolver: zodResolver(nftFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: null,
      collection: "",
      attributes: "",
      royalty: 5,
      sellerFeeBasisPoints: 500,
      maxSupply: "",
      symbol: "",
      externalUrl: "",
      creatorShare: 100,
    },

    // 只有当没有外部 form 传入时，才使用内部的 form 状态
    // 否则，使用外部传入的 form 状态
    mode: isExternalForm ? "onSubmit" : "onChange",
  })

  useEffect(() => {
    if (externalForm) {
      setIsExternalForm(true)
    }
  }, [externalForm])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>快速发 NFT</CardTitle>
            <CardDescription>在 Solana 区块链上创建您自己的 NFT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NFT 名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：My Awesome NFT" {...field} />
                  </FormControl>
                  <FormDescription>您的 NFT 的名称</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NFT 描述 *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="描述您的 NFT" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>详细描述您的 NFT</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>图片 *</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      {selectedImage ? (
                        <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border-2 border-dashed border-primary/50 bg-muted">
                          <img
                            src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                            alt="NFT Preview"
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-background/80 rounded-full h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedImageFn(null)
                              form.setValue("image", null)
                            }}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">移除图片</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full aspect-square max-w-[200px] rounded-lg border-2 border-dashed border-primary/50 bg-muted p-4">
                          <Image className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground text-center">点击选择图片或拖放图片到此处</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            fileInputRef.current?.click()
                          }}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          选择文件
                        </Button>
                        {selectedImage && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setSelectedImageFn(null)
                              form.setValue("image", null)
                            }}
                            className="flex items-center gap-2 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            移除
                          </Button>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setSelectedImageFn(file)
                            form.setValue("image", file)
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>NFT 图片 (支持 PNG、JPG、GIF 等格式)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxSupply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最大供应量（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="留空表示单个NFT，输入数字表示系列" {...field} />
                  </FormControl>
                  <FormDescription>如果创建NFT系列，请设置最大供应量</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>符号（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：MYNFT" {...field} />
                  </FormControl>
                  <FormDescription>NFT的简短符号标识</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>外部URL（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：https://myproject.com" {...field} />
                  </FormControl>
                  <FormDescription>NFT相关的外部网站</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="creatorShare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>创作者份额: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>创作者在二次销售中获得的份额百分比</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 其他字段省略以保持简洁 */}
          </CardContent>
          <div className="mt-6 space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">预览生成信息</h3>

            <div className="rounded-lg border bg-muted/30 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 border-b">
                <h4 className="font-medium flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
                    <line x1="8" y1="16" x2="8.01" y2="16"></line>
                    <line x1="8" y1="20" x2="8.01" y2="20"></line>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    <line x1="12" y1="22" x2="12.01" y2="22"></line>
                    <line x1="16" y1="16" x2="16.01" y2="16"></line>
                    <line x1="16" y1="20" x2="16.01" y2="20"></line>
                  </svg>
                  Solana NFT信息
                </h4>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">NFT铸造地址</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => copyToClipboard(generateMockAddress(), "NFT铸造地址已复制到剪贴板")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <Input readOnly value={generateMockAddress()} className="font-mono text-xs pl-10 bg-muted/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">元数据地址</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => copyToClipboard(generateMockAddress(), "元数据地址已复制到剪贴板")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <Input readOnly value={generateMockAddress()} className="font-mono text-xs pl-10 bg-muted/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">主集合地址</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => copyToClipboard(generateMockAddress(), "主集合地址已复制到剪贴板")}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        复制
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    </div>
                    <Input readOnly value={generateMockAddress()} className="font-mono text-xs pl-10 bg-muted/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">区块链浏览器</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() =>
                          window.open(`https://explorer.solana.com/address/${generateMockAddress()}`, "_blank")
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        查看
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <Input
                      readOnly
                      value={`https://explorer.solana.com/address/${generateMockAddress()}`}
                      className="font-mono text-xs pl-10 bg-muted/50"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-3 border-t">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">网络:</span>
                    <span className="ml-2 inline-flex items-center text-green-500">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                      Mainnet
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">铸造费:</span>
                    <span className="ml-2">~0.01 SOL</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">版税:</span>
                    <span className="ml-2">{form?.getValues("royalty") || 5}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">标准:</span>
                    <span className="ml-2">Metaplex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CardFooter>
            <Button type="submit" className="w-full">
              创建 NFT
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

