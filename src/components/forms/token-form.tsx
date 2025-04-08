"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

// 代币创建表单的schema
const tokenFormSchema = z.object({
  name: z.string().min(1, { message: "请输入代币名称" }),
  symbol: z.string().min(1, { message: "请输入代币符号" }),
  totalSupply: z.string().min(1, { message: "请输入总供应量" }),
  decimals: z.number().min(0).max(18).default(9),
  mintAuthority: z.string().optional(),
  freezeAuthority: z.boolean().default(false),
  initialDistribution: z.enum(["all-to-creator", "airdrop", "liquidity-pool"]).default("all-to-creator"),
  tokenType: z.enum(["standard", "mintable", "burnable"]).default("standard"),
  transferFee: z.number().min(0).max(5).default(0),
  metadata: z.object({
    description: z.string().optional(),
    image: z.string().url({ message: "请输入有效的图片 URL" }).optional(),
    externalUrl: z.string().url({ message: "请输入有效的外部 URL" }).optional(),
  }),
})

interface TokenFormProps {
  onSubmit: (values: z.infer<typeof tokenFormSchema>) => void
  form?: any
}

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

export function TokenForm({ onSubmit, form: externalForm }: TokenFormProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const form =
    externalForm ||
    useForm<z.infer<typeof tokenFormSchema>>({
      resolver: zodResolver(tokenFormSchema),
      defaultValues: {
        name: "",
        symbol: "",
        totalSupply: "",
        decimals: 9,
        mintAuthority: "",
        freezeAuthority: false,
        initialDistribution: "all-to-creator",
        tokenType: "standard",
        transferFee: 0,
        metadata: {
          description: "",
          image: "",
          externalUrl: "",
        },
      },
    })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>快速发币</CardTitle>
            <CardDescription>在 Solana 区块链上创建您自己的代币</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>代币名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：My Token" {...field} />
                  </FormControl>
                  <FormDescription>您的代币的完整名称</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>代币符号 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：MTK" {...field} />
                  </FormControl>
                  <FormDescription>代币的简短符号（通常为 2-5 个字符）</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalSupply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>总供应量 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：1000000" {...field} />
                  </FormControl>
                  <FormDescription>代币的总发行量</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="decimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>小数位数: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={18}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>代币的小数位数（SOL 为 9，大多数代币为 6-9）</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">高级设置</h3>

              <FormField
                control={form.control}
                name="initialDistribution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>初始分配</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择初始分配方式" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all-to-creator">全部分配给创建者</SelectItem>
                        <SelectItem value="airdrop">空投给指定地址</SelectItem>
                        <SelectItem value="liquidity-pool">创建流动性池</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>代币创建后的初始分配方式</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>代币类型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择代币类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">标准代币</SelectItem>
                        <SelectItem value="mintable">可增发代币</SelectItem>
                        <SelectItem value="burnable">可销毁代币</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>代币的功能类型</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transferFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>转账费率: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={5}
                        step={0.1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>每次转账收取的费用百分比（0表示无费用）</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                  Solana区块链信息
                </h4>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">代币地址</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => copyToClipboard(generateMockAddress(), "代币地址已复制到剪贴板")}
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
                    <span className="text-muted-foreground">交易费:</span>
                    <span className="ml-2">~0.000005 SOL</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">确认时间:</span>
                    <span className="ml-2">~400ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">当前区块:</span>
                    <span className="ml-2">219,453,891</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CardFooter>
            <Button type="submit" className="w-full">
              创建代币
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

