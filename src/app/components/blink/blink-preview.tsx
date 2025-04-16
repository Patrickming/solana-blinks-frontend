// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

// 导入 UI 组件
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { ArrowRight } from "lucide-react" // 导入箭头图标

/**
 * @interface BlinkPreviewProps
 * BlinkPreview 组件的属性。
 * @property {string} type - Blink 的类型 (例如 "swap", "nft")。
 * @property {string} link - Blink 的 URL。
 * @property {any} data - Blink 的相关数据对象 (例如，交换的代币、NFT 的 ID 等)。
 */
interface BlinkPreviewProps {
  type: string // Blink 类型，如 "swap" 或 "nft"
  link: string // Blink 链接
  data: any // Blink 数据，包含交易详情
}

/**
 * BlinkPreview 组件
 * 根据传入的 Blink 类型和数据，渲染一个预览卡片。
 * 目前支持 "swap" (代币交换) 和 "nft" (NFT 购买) 类型。
 *
 * @component
 * @param {BlinkPreviewProps} props - 组件属性
 * @returns {JSX.Element} Blink 预览卡片的 JSX 元素。
 */
export function BlinkPreview({ type, link, data }: BlinkPreviewProps) {
  /**
   * 根据代币符号（或简写）获取代币的显示名称。
   * @param {string} symbol - 代币符号 (例如 "sol", "usdc")。
   * @returns {string} 代币的完整名称或大写符号。
   */
  const getTokenName = (symbol: string) => {
    const tokens: Record<string, string> = {
      sol: "Solana",
      usdc: "USD Coin",
      bonk: "Bonk",
      orca: "Orca",
      jto: "Jito",
      wif: "Dogwifhat",
      pyth: "Pyth Network",
    }
    return tokens[symbol.toLowerCase()] || symbol.toUpperCase()
  }

  // 根据 Blink 类型渲染不同的预览
  if (type === "swap") {
    // 代币交换类型的预览
    return (
      <Card className="w-full border border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">代币交换</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Blink
            </Badge>
          </div>
          <CardDescription>在 Solana 上一键交换代币</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 代币交换信息展示 */}
          <div className="flex items-center justify-between py-4">
            {/* 源代币信息 */}
            <div className="text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center text-primary font-bold">
                {getTokenName(data.fromToken).substring(0, 1)}
              </div>
              <p className="font-medium">{getTokenName(data.fromToken)}</p>
              <p className="text-sm text-muted-foreground">{data.amount}</p>
            </div>

            {/* 箭头图标 */}
            <ArrowRight className="h-5 w-5 text-muted-foreground mx-2" />

            {/* 目标代币信息 */}
            <div className="text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center text-primary font-bold">
                {getTokenName(data.toToken).substring(0, 1)}
              </div>
              <p className="font-medium">{getTokenName(data.toToken)}</p>
              {/* 显示估计接收金额，这里简单地将输入金额乘以 1.2 作为模拟 */}
              <p className="text-sm text-muted-foreground">≈ {(Number.parseFloat(data.amount || "0") * 1.2).toFixed(2)}</p>
            </div>
          </div>

          {/* 交易参数信息 */}
          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <p>滑点: {data.slippage}%</p>
            <p>有效期: {data.deadline} 分钟</p>
          </div>
        </CardContent>
        <CardFooter>
          {/* 执行交换按钮 */}
          <Button className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">
            执行交换 (预览)
          </Button>
        </CardFooter>
      </Card>
    )
  } else {
    // NFT 购买类型的预览
    return (
      <Card className="w-full border border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">NFT 购买</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Blink
            </Badge>
          </div>
          <CardDescription>在 Solana 上一键购买 NFT</CardDescription>
        </CardHeader>
        <CardContent>
          {/* NFT 信息展示 */}
          <div className="flex flex-col items-center py-4">
            {/* NFT 图片占位符 */}
            <div className="h-32 w-32 bg-muted rounded-lg mb-4 flex items-center justify-center text-muted-foreground">
              NFT 图片
            </div>
            {/* NFT 集合信息 */}
            <p className="font-medium text-sm">
              集合: {data.collection?.substring(0, 6)}...{data.collection?.substring(data.collection.length - 4)}
            </p>
            {/* NFT 代币 ID */}
            <p className="text-sm text-muted-foreground">代币 ID: #{data.tokenId}</p>
            {/* NFT 价格 */}
            <div className="mt-4 font-bold text-lg">{data.price} {data.currency || "SOL"}</div>
          </div>
        </CardContent>
        <CardFooter>
          {/* 购买 NFT 按钮 */}
          <Button className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">
            购买 NFT (预览)
          </Button>
        </CardFooter>
      </Card>
    )
  }
}

