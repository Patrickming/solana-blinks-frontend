"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

interface WalletConnectButtonProps {
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  fullWidth?: boolean
}

export function WalletConnectButton({
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
}: WalletConnectButtonProps) {
  const { connected, connecting, disconnect, address, connect } = useWallet()
  const { connectWallet } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Handle wallet connection/disconnection
  const handleWalletAction = async () => {
    if (connected) {
      disconnect()
    } else {
      setIsLoading(true)
      try {
        // 打开钱包连接模态框
        await connect()
        
        // 连接后不再手动调用connectWallet
        // 现在钱包连接状态变化会通过useEffect触发登录或关联操作
      } catch (error) {
        console.error("Connection error:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Get truncated wallet address for display
  const displayAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ""

  return (
    <Button
      variant={connected ? "outline" : variant}
      size={size}
      className={`${className} ${fullWidth ? "w-full" : ""}`}
      onClick={handleWalletAction}
      disabled={connecting || isLoading}
    >
      {connecting || isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          连接中...
        </>
      ) : connected ? (
        displayAddress
      ) : (
        "连接钱包"
      )}
    </Button>
  )
}

