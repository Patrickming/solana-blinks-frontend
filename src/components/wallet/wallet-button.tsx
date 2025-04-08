"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, LogOut, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WalletButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function WalletButton({ variant = "default", size = "default", className = "" }: WalletButtonProps) {
  const { connected, connecting, address, connect, disconnect, walletName } = useWallet()
  const { connectWallet } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      // 打开钱包连接模态框
      await connect()

      // 注意：我们不再在这里调用 connectWallet，
      // 因为这个操作已经在 wallet-context.tsx 和 auth-context.tsx 中的 useEffect 中处理了
    } catch (error) {
      console.error("Connection error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: "钱包已断开连接",
      description: "您的钱包已成功断开连接",
    })
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "地址已复制",
        description: "钱包地址已复制到剪贴板",
      })
    }
  }

  const openExplorer = () => {
    if (address) {
      const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"
      const explorerUrl =
        network === "mainnet-beta"
          ? `https://explorer.solana.com/address/${address}`
          : `https://explorer.solana.com/address/${address}?cluster=${network}`
      window.open(explorerUrl, "_blank")
    }
  }

  if (connected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            {walletName || "钱包"}: {address.slice(0, 4)}...{address.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>钱包操作</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            复制地址
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openExplorer}>
            <ExternalLink className="mr-2 h-4 w-4" />
            在浏览器中查看
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            断开连接
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleConnect}
      disabled={connecting || isLoading}
    >
      {connecting || isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          连接中...
        </>
      ) : (
        "连接钱包"
      )}
    </Button>
  )
}

