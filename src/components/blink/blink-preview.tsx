// 'use client' 指令标记这是一个客户端组件，可以使用浏览器 API 和 React hooks
"use client"

// 导入 UI 组件
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react" // 导入箭头图标

// 定义 BlinkPreview 组件的属性接口
interface BlinkPreviewProps {
  type: string // Blink 类型，如 "swap" 或 "nft"
  link: string // Blink 链接
  data: any // Blink 数据，包含交易详情
}

// 定义 BlinkPreview 组件
export function BlinkPreview({ type, link, data }: BlinkPreviewProps) {
  // 根据代币符号获取代币名称的辅助函数
  const getTokenName = (symbol: string) => {
    // 定义代币符号到名称的映射
    const tokens: Record<string, string> = {
      sol: "Solana",
      usdc: "USD Coin",
      bonk: "Bonk",
      orca: "Orca",
    }
    // 返回映射中的名称，如果不存在则返回大写的符号
    return tokens[symbol] || symbol.toUpperCase()
  }

  // 根据 Blink 类型渲染不同的预览
  if (type === "swap") {
    // 代币交换类型的预览
    return (
      <Card className="w-full border border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Token Swap</CardTitle>
            <Badge variant="outline" className="bg-primary/10">
              Blink
            </Badge>
          </div>
          <CardDescription>One-click token swap on Solana</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 代币交换信息展示 */}
          <div className="flex items-center justify-between py-4">
            {/* 源代币信息 */}
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                {data.fromToken.substring(0, 1).toUpperCase()}
              </div>
              <p className="font-medium">{getTokenName(data.fromToken)}</p>
              <p className="text-sm text-muted-foreground">{data.amount}</p>
            </div>

            {/* 箭头图标 */}
            <ArrowRight className="h-5 w-5 text-muted-foreground" />

            {/* 目标代币信息 */}
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                {data.toToken.substring(0, 1).toUpperCase()}
              </div>
              <p className="font-medium">{getTokenName(data.toToken)}</p>
              {/* 显示估计接收金额，这里简单地将输入金额乘以 1.2 作为模拟 */}
              <p className="text-sm text-muted-foreground">≈ {(Number.parseFloat(data.amount) * 1.2).toFixed(2)}</p>
            </div>
          </div>

          {/* 交易参数信息 */}
          <div className="text-xs text-muted-foreground mt-4">
            <p>Slippage: {data.slippage}%</p>
            <p>Expires in: {data.deadline} minutes</p>
          </div>
        </CardContent>
        <CardFooter>
          {/* 执行交换按钮 */}
          <Button className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">Execute Swap</Button>
        </CardFooter>
      </Card>
    )
  } else {
    // NFT 购买类型的预览
    return (
      <Card className="w-full border border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">NFT Purchase</CardTitle>
            <Badge variant="outline" className="bg-primary/10">
              Blink
            </Badge>
          </div>
          <CardDescription>One-click NFT purchase on Solana</CardDescription>
        </CardHeader>
        <CardContent>
          {/* NFT 信息展示 */}
          <div className="flex flex-col items-center py-4">
            {/* NFT 图片占位符 */}
            <div className="h-32 w-32 bg-primary/20 rounded-lg mb-4 flex items-center justify-center">NFT</div>
            {/* NFT 集合信息 */}
            <p className="font-medium">
              Collection: {data.collection.substring(0, 6)}...{data.collection.substring(data.collection.length - 4)}
            </p>
            {/* NFT 代币 ID */}
            <p className="text-sm text-muted-foreground">Token ID: #{data.tokenId}</p>
            {/* NFT 价格 */}
            <div className="mt-4 font-bold text-lg">{data.price} SOL</div>
          </div>
        </CardContent>
        <CardFooter>
          {/* 购买 NFT 按钮 */}
          <Button className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">Purchase NFT</Button>
        </CardFooter>
      </Card>
    )
  }
}

