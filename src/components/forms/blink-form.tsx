"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { blinkFormSchema } from "@/lib/validators"
import { AVAILABLE_TOKENS, AVAILABLE_CURRENCIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/context/language-context"
import { CalendarIcon, Info } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { X } from "lucide-react"
import React from "react"

/**
 * Blink表单属性接口
 */
interface BlinkFormProps {
  onSubmit: (values: z.infer<typeof blinkFormSchema>) => void // 表单提交处理函数
  onChange?: (values: z.infer<typeof blinkFormSchema>) => void // 表单变化处理函数
}

/**
 * Blink表单组件
 * 用于创建不同类型的Blink
 *
 * @param onSubmit - 表单提交处理函数
 * @param onChange - 表单变化处理函数
 * @returns Blink表单组件
 */
export function BlinkForm({ onSubmit, onChange }: BlinkFormProps) {
  const { t } = useLanguage()

  /**
   * 初始化表单
   * 使用zod验证器和默认值
   */
  const form = useForm<z.infer<typeof blinkFormSchema>>({
    resolver: zodResolver(blinkFormSchema),
    defaultValues: {
      type: "tipping", // 默认类型为捐赠(原打赏)
      tokenSwap: {
        fromToken: "",
        toToken: "",
        amount: "",
        slippage: 0.5,
        deadline: 10,
        autoExecute: true,
      },
      buyNft: {
        collectionAddress: "",
        nftId: "",
        price: "",
        currency: "SOL",
        expiryDate: "",
        message: "",
      },
      staking: {
        token: "",
        amount: "",
        period: 30,
        expectedYield: "",
        poolAddress: "",
        autoCompound: false,
      },
      custom: {
        name: "",
        description: "",
        instructions: "",
        parameters: "",
        requiresApproval: true,
      },
      tipping: {
        recipientAddress: "",
        token: "SOL",
        suggestedAmounts: ["5", "10", "20"],
        customAmount: true,
        message: "",
      },
    },
  })

  // 获取 Blink 表单类型
  const blinkType = form.watch("type")

  /**
   * 监听表单值变化
   * 当表单值变化时，调用onChange回调
   */
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      // 当表单值变化时，调用onChange回调
      if (onChange) {
        onChange(value as z.infer<typeof blinkFormSchema>)
      }
    })

    // 清理订阅
    return () => subscription.unsubscribe()
  }, [form, onChange])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t("blink.title")}</CardTitle>
            <CardDescription>{t("blink.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Blink类型选择已移至父组件，这里只保留隐藏字段 */}
            <input type="hidden" {...form.register("type")} />

            {/* 只保留质押和捐赠表单字段 */}

            {/* 质押表单字段 */}
            {blinkType === "staking" && (
              <>
                {/* 质押代币选择 */}
                <FormField
                  control={form.control}
                  name="staking.token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>质押代币 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择要质押的代币" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABLE_TOKENS.map((token) => (
                            <SelectItem key={token.value} value={token.value}>
                              {token.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>要质押的代币</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 质押金额 */}
                <FormField
                  control={form.control}
                  name="staking.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>质押金额 *</FormLabel>
                      <FormControl>
                        <Input placeholder="输入质押金额" {...field} />
                      </FormControl>
                      <FormDescription>要质押的代币数量</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 质押期限 */}
                <FormField
                  control={form.control}
                  name="staking.period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>质押期限: {field.value} 天</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={365}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                      <FormDescription>质押的时间长度（天）</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 预期收益率 */}
                <FormField
                  control={form.control}
                  name="staking.expectedYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预期收益率（可选）</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：5.2%" {...field} />
                      </FormControl>
                      <FormDescription>预期的年化收益率</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 质押池地址 */}
                <FormField
                  control={form.control}
                  name="staking.poolAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>质押池地址 *</FormLabel>
                      <FormControl>
                        <Input placeholder="输入质押池地址" {...field} />
                      </FormControl>
                      <FormDescription>质押池的 Solana 地址</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 自动复利开关 */}
                <FormField
                  control={form.control}
                  name="staking.autoCompound"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>自动复利</FormLabel>
                        <FormDescription>自动将收益重新质押以获得复利效应</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Solana 质押信息 */}
                <div className="rounded-md border p-4 mt-4 bg-muted/30">
                  <h4 className="text-sm font-medium mb-2">Solana 质押信息</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">当前网络质押率:</span>
                      <span className="ml-2">~7.2% APY</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">活跃验证者:</span>
                      <span className="ml-2">1,967</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">质押费用:</span>
                      <span className="ml-2">~0.000005 SOL</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">解质押周期:</span>
                      <span className="ml-2">~2-3 天</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 捐赠表单字段（原打赏） */}
            {blinkType === "tipping" && (
              <>
                {/* 接收地址 */}
                <FormField
                  control={form.control}
                  name="tipping.recipientAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>接收地址 *</FormLabel>
                      <FormControl>
                        <Input placeholder="输入接收捐赠的钱包地址" {...field} />
                      </FormControl>
                      <FormDescription>接收捐赠的 Solana 钱包地址</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 捐赠代币 - 固定为SOL */}
                <FormField
                  control={form.control}
                  name="tipping.token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>捐赠代币 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue="SOL" value="SOL">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择捐赠代币" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SOL">Solana (SOL)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>用于捐赠的代币</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 基础金额 */}
                <FormField
                  control={form.control}
                  name="tipping.baseAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>基础金额 (SOL) *</FormLabel>
                      <FormControl>
                              <Input
                          type="number"
                          placeholder="0.01" 
                          step="0.001"
                          min="0.001"
                          value={field.value || "0.01"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>基础金额将乘以1、5、10作为三个捐赠选项</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 图片URL */}
                <FormField
                  control={form.control}
                  name="tipping.imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图片URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://cryptologos.cc/logos/solana-sol-logo.png" 
                          value={field.value || "https://cryptologos.cc/logos/solana-sol-logo.png"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>Blink显示的图片URL</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 标题 */}
                <FormField
                  control={form.control}
                  name="tipping.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>标题</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="捐赠 SOL" 
                          value={field.value || "捐赠 SOL"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>Blink标题</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 描述 */}
                <FormField
                  control={form.control}
                  name="tipping.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="通过此Blink向指定地址捐赠SOL代币" 
                          className="resize-none" 
                          value={field.value || "通过此Blink向指定地址捐赠SOL代币"}
                          onChange={(e) => field.onChange(e.target.value)}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>Blink描述内容</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Solana 捐赠信息 */}
                <div className="rounded-md border p-4 mt-4 bg-muted/30">
                  <h4 className="text-sm font-medium mb-2">Solana 捐赠信息</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">交易费用:</span>
                      <span className="ml-2">~0.000005 SOL</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">确认时间:</span>
                      <span className="ml-2">~400ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">支持钱包:</span>
                      <span className="ml-2">Phantom, Solflare, 等</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SPL 代币支持:</span>
                      <span className="ml-2">是</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {t("blink.form.create")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

