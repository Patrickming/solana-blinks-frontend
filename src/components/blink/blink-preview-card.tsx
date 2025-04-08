"use client"
import type { z } from "zod"
import type { blinkFormSchema } from "@/lib/validators"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Copy } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { AVAILABLE_TOKENS } from "@/lib/constants"

/**
 * Blink预览属性接口
 */
interface BlinkPreviewProps {
  formValues: z.infer<typeof blinkFormSchema> // 表单值
}

/**
 * Blink预览组件
 * 用于预览不同类型的Blink
 *
 * @param formValues - 表单值
 * @returns Blink预览组件
 */
export function BlinkPreview({ formValues }: BlinkPreviewProps) {
  const { toast } = useToast()
  const { t } = useLanguage()

  /**
   * 获取代币名称
   * 根据代币符号获取完整名称
   *
   * @param symbol - 代币符号
   * @returns 代币名称
   */
  const getTokenName = (symbol: string) => {
    if (!symbol) return ""
    // 查找匹配的代币
    const token = AVAILABLE_TOKENS.find((t) => t.value.toLowerCase() === symbol.toLowerCase())
    // 如果找到则返回名称，否则返回大写的符号
    return token ? token.label : symbol.toUpperCase()
  }

  /**
   * 获取代币符号
   * 根据代币符号获取完整符号
   *
   * @param symbol - 代币符号
   * @returns 代币符号
   */
  const getTokenSymbol = (symbol: string) => {
    if (!symbol) return ""
    return symbol.toUpperCase()
  }

  /**
   * 生成Blink链接
   * 根据表单值生成可分享的链接
   *
   * @returns Blink链接
   */
  const generateBlinkLink = () => {
    const baseUrl = "https://solana-blinks.vercel.app/blink/"
    const params = new URLSearchParams()

    if (formValues.type === "tipping" && formValues.tipping.recipientAddress) {
      params.append("type", "tipping")
      params.append("recipient", formValues.tipping.recipientAddress)
      params.append("baseAmount", formValues.tipping.baseAmount || "0.01")
      params.append("token", formValues.tipping.token)
      
      // 添加新的捐赠SOL相关参数
      if (formValues.tipping.imageUrl) {
        params.append("imageUrl", formValues.tipping.imageUrl)
      }
      
      if (formValues.tipping.title) {
        params.append("title", formValues.tipping.title)
      }
      
      if (formValues.tipping.description) {
        params.append("description", formValues.tipping.description)
      }
      
      return `${baseUrl}?${params.toString()}`
    }

    if (formValues.type === "staking" && formValues.staking.poolAddress) {
      params.append("type", "staking")
      params.append("pool", formValues.staking.poolAddress)
      params.append("token", formValues.staking.token)
      return `${baseUrl}?${params.toString()}`
    }

    return baseUrl
  }

  /**
   * 复制文本到剪贴板
   * 复制成功后显示提示
   *
   * @param text - 要复制的文本
   * @param message - 成功提示消息
   */
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: t("blink.copied"),
          description: message,
        })
      })
      .catch((err) => {
        toast({
          title: t("blink.copyFailed"),
          description: t("blink.copyFailedDescription"),
          variant: "destructive",
        })
      })
  }

  /**
   * 渲染预览内容
   * 根据表单类型显示不同的预览
   *
   * @returns 预览内容
   */
  const renderPreviewContent = () => {
    switch (formValues.type) {
      case "staking":
        return (
          <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">质押预览</h3>
              {!formValues.staking.token && (
                <p className="text-xs text-muted-foreground mt-1">请选择质押代币和填写质押信息</p>
              )}
            </div>
            {formValues.staking.token && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">质押代币:</span>
                  <span className="text-sm font-medium">{getTokenName(formValues.staking.token)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">质押金额:</span>
                  <span className="text-sm font-medium">
                    {formValues.staking.amount || "未指定"} {getTokenSymbol(formValues.staking.token)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">质押期限:</span>
                  <span className="text-sm font-medium">{formValues.staking.period} 天</span>
                </div>
                {formValues.staking.expectedYield && (
                  <div className="flex justify-between">
                    <span className="text-sm">预期收益率:</span>
                    <span className="text-sm font-medium">{formValues.staking.expectedYield}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">自动复利:</span>
                  <span className="text-sm font-medium">{formValues.staking.autoCompound ? "是" : "否"}</span>
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">交易费用:</span>
                <span className="text-xs">~0.000005 SOL</span>
              </div>
            </div>
          </div>
        )

      case "tipping":
        return (
          <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">{formValues.tipping.title || "捐赠预览"}</h3>
              {!formValues.tipping.recipientAddress && (
                <p className="text-xs text-muted-foreground mt-1">请输入接收捐赠的钱包地址</p>
              )}
            </div>
            {formValues.tipping.recipientAddress && (
              <div className="space-y-4">
                {/* 图示部分 - 显示三个捐赠金额条 */}
                <div className="py-4">
                  <div className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-md mb-4"></div>
                  <div className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-md mb-4"></div>
                  <div className="w-full h-12 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-md"></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">接收地址:</span>
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {formValues.tipping.recipientAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">捐赠代币:</span>
                  <span className="text-sm font-medium">{getTokenName(formValues.tipping.token)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">基础金额:</span>
                  <span className="text-sm font-medium">
                    {formValues.tipping.baseAmount || "0.01"} {getTokenSymbol(formValues.tipping.token)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">捐赠选项:</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded">
                      {formValues.tipping.baseAmount || "0.01"} SOL
                    </span>
                    <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded">
                      {Number(formValues.tipping.baseAmount || 0.01) * 5} SOL
                    </span>
                    <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded">
                      {Number(formValues.tipping.baseAmount || 0.01) * 10} SOL
                    </span>
                  </div>
                </div>
                {formValues.tipping.description && (
                  <div className="pt-2">
                    <span className="text-sm">描述:</span>
                    <p className="text-sm text-muted-foreground mt-1 bg-muted p-2 rounded">
                      {formValues.tipping.description}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">交易费用:</span>
                <span className="text-xs">~0.000005 SOL</span>
              </div>
            </div>
            <div className="py-3 mt-3 flex items-center justify-center bg-yellow-100/10 border border-yellow-400/20 rounded-md">
              <span className="text-xs text-yellow-400">此 Action 尚未注册。须信任来源后才能执行。</span>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">请选择Blink类型</p>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("blink.preview.title")}</CardTitle>
        <CardDescription>{t("blink.preview.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-6">{renderPreviewContent()}</div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 w-full">
        <p className="text-sm text-muted-foreground">{t("blink.preview.shareDescription")}</p>
        <div className="flex items-center justify-between w-full p-3 rounded-md bg-muted">
          <code className="text-xs truncate max-w-[80%]">{generateBlinkLink()}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(generateBlinkLink(), t("blink.preview.linkCopied"))}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => copyToClipboard(generateBlinkLink(), t("blink.preview.linkCopied"))}
        >
          <Copy className="h-4 w-4 mr-2" />
          {t("blink.preview.copyLink")}
        </Button>
      </CardFooter>
    </Card>
  )
}


