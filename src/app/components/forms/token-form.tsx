"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Slider } from "@/app/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Label } from "@/app/components/ui/label"
import { toast } from "@/app/components/ui/use-toast"
import { useEffect, useState } from "react"
import { Copy } from "lucide-react"

/**
 * 代币创建表单的 Zod 验证 schema。
 * 定义了创建代币所需的各个字段及其验证规则。
 */
const tokenFormSchema = z.object({
  name: z.string().min(1, { message: "请输入代币名称" }), // 代币全名
  symbol: z.string().min(1, { message: "请输入代币符号" }), // 代币符号/简称
  totalSupply: z.string().min(1, { message: "请输入总供应量" }), // 总供应量 (字符串以处理大数)
  decimals: z.number().min(0, { message: "小数位数不能小于0" }).max(18, { message: "小数位数不能超过18" }).default(9), // 代币精度
  mintAuthority: z.string().optional(), // 铸币权限地址 (可选，默认为创建者)
  freezeAuthority: z.boolean().default(false), // 是否允许冻结账户 (可选)
  initialDistribution: z.enum(["all-to-creator", "airdrop", "liquidity-pool"]).default("all-to-creator"), // 初始分配方式
  tokenType: z.enum(["standard", "mintable", "burnable"]).default("standard"), // 代币特性
  transferFee: z.number().min(0).max(5, { message: "转账费率不能超过5%" }).default(0), // 转账费率 (百分比)
  // 代币元数据 (可选)
  metadata: z.object({
    description: z.string().optional(), // 代币描述
    image: z.string().url({ message: "请输入有效的图片 URL" }).optional(), // 代币图标 URL
    externalUrl: z.string().url({ message: "请输入有效的外部 URL" }).optional(), // 外部链接，如项目网站
  }),
})

/**
 * TokenForm 组件的属性接口。
 * @property {function} onSubmit - 表单成功提交时的回调函数。
 * @property {any} [form] - 可选的外部 react-hook-form 实例。
 */
interface TokenFormProps {
  onSubmit: (values: z.infer<typeof tokenFormSchema>) => void
  form?: any
}

/**
 * 生成一个模拟的 Solana 地址。
 * 仅用于预览目的。
 * @returns {string} 模拟的 Base58 地址字符串。
 */
const generateMockAddress = () => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 将文本复制到剪贴板。
 * @param {string} text - 要复制的文本。
 * @param {string} message - 复制成功时显示的提示信息。
 */
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

/**
 * TokenForm 组件
 * 提供一个表单用于创建和配置新的 SPL 代币。
 *
 * @component
 * @param {TokenFormProps} props - 组件属性
 * @returns {JSX.Element} TokenForm 组件的 JSX 元素。
 */
export function TokenForm({ onSubmit, form: externalForm }: TokenFormProps) {
  // 状态，用于确保只在客户端渲染，避免水合错误
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 初始化 react-hook-form，如果外部传入了 form 实例则使用外部的
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

  // 模拟生成的代币地址，用于预览
  const mockTokenAddress = isClient ? generateMockAddress() : ""

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>快速发币</CardTitle>
            <CardDescription>在 Solana 区块链上创建您自己的代币</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 代币名称字段 */}
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

            {/* 代币符号字段 */}
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

            {/* 总供应量字段 */}
            <FormField
              control={form.control}
              name="totalSupply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>总供应量 *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="例如：1000000" {...field} />
                  </FormControl>
                  <FormDescription>代币的总发行量</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 小数位数字段 */}
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

            {/* 高级设置区域 */}
            <div className="space-y-4 border-t pt-4 mt-6">
              <h3 className="text-lg font-medium">高级设置</h3>

              {/* 初始分配方式字段 */}
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
                        <SelectItem value="airdrop">空投给指定地址 (暂不支持)</SelectItem>
                        <SelectItem value="liquidity-pool">创建流动性池 (暂不支持)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>代币创建后的初始分配方式</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 代币类型字段 */}
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
                        <SelectItem value="mintable">可增发代币 (暂不支持)</SelectItem>
                        <SelectItem value="burnable">可销毁代币 (暂不支持)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>代币的功能类型</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 转账费率字段 */}
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

              {/* 铸币权限地址字段 */}
              <FormField
                control={form.control}
                name="mintAuthority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>铸币权限地址（可选）</FormLabel>
                    <FormControl>
                      <Input placeholder="留空则默认为您的钱包地址" {...field} />
                    </FormControl>
                    <FormDescription>拥有增发权限的地址</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 冻结权限开关字段 (隐藏，因为默认值为 false) */}
              {/* <FormField
                control={form.control}
                name="freezeAuthority"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>允许冻结账户</FormLabel>
                      <FormDescription>是否允许冻结持有此代币的账户</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              /> */}
            </div>

            {/* 元数据设置区域 */}
            <div className="space-y-4 border-t pt-4 mt-6">
              <h3 className="text-lg font-medium">元数据（可选）</h3>

              {/* 代币描述字段 */}
              <FormField
                control={form.control}
                name="metadata.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Input placeholder="您的代币的简短描述" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 代币图标 URL 字段 */}
              <FormField
                control={form.control}
                name="metadata.image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图标 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://.../icon.png" {...field} />
                    </FormControl>
                    <FormDescription>代币的 Logo 或图标链接</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 外部链接 URL 字段 */}
              <FormField
                control={form.control}
                name="metadata.externalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>外部链接</FormLabel>
                    <FormControl>
                      <Input placeholder="https://.../project-website" {...field} />
                    </FormControl>
                    <FormDescription>项目网站或其他相关链接</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          {/* 预览生成信息区域 */}
          <div className="px-6 pb-6 mt-6 space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">预览生成信息</h3>

            <div className="rounded-lg border bg-muted/30 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 border-b">
                <p className="text-sm font-medium text-center">代币信息概览</p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">代币地址:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono truncate max-w-[180px]">{mockTokenAddress}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => copyToClipboard(mockTokenAddress, "模拟代币地址已复制")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">预估创建费用:</span>
                  <span className="font-medium">~0.002 SOL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">创建者地址:</span>
                  <span className="font-medium">您的钱包地址</span>
                </div>
              </div>
            </div>
          </div>

          <CardFooter>
            <Button type="submit" className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">
              创建代币
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

