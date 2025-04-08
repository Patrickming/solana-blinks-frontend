"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { SUPPORTED_WALLETS } from "@/lib/constants"

interface WalletSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletSelectModal({ open, onOpenChange }: WalletSelectModalProps) {
  const { connect, connecting, wallets, select, selectedWallet } = useWallet()
  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(selectedWallet)
  const [isConnecting, setIsConnecting] = useState(false)

  // 处理钱包选择
  const handleSelectWallet = (walletName: string) => {
    setSelectedWalletName(walletName)
    if (select) {
      select(walletName)
    }
  }

  // 处理钱包连接
  const handleConnectWallet = async () => {
    if (!selectedWalletName) return

    setIsConnecting(true)
    try {
      await connect()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  // 获取可用的钱包列表
  const availableWallets =
    wallets ||
    SUPPORTED_WALLETS.map((wallet) => ({
      name: wallet.name,
      icon: wallet.logo,
    }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>连接钱包</DialogTitle>
          <DialogDescription>选择一个钱包连接到Solana Blinks</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {availableWallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant={selectedWalletName === wallet.name ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-24 p-4 ${
                selectedWalletName === wallet.name ? "border-primary" : ""
              }`}
              onClick={() => handleSelectWallet(wallet.name)}
            >
              {wallet.icon && (
                <div className="w-10 h-10 mb-2">
                  {typeof wallet.icon === "string" ? (
                    <img src={wallet.icon || "/placeholder.svg"} alt={wallet.name} className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
                      {wallet.name.charAt(0)}
                    </div>
                  )}
                </div>
              )}
              <span>{wallet.name}</span>
            </Button>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleConnectWallet}
            disabled={!selectedWalletName || connecting || isConnecting}
            className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
          >
            {connecting || isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                连接中...
              </>
            ) : (
              "连接"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

