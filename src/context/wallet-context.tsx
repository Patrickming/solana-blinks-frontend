"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import {
  WalletAdapterNetwork,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base"
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider, useWalletModal } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl, Connection } from "@solana/web3.js"
import { useToast } from "@/components/ui/use-toast"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

// Define wallet context type
type WalletContextType = {
  connected: boolean
  connecting: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  publicKey: any
  wallet: any
  walletName: string | null
  openWalletModal: () => void
  error: string | null
  selectWallet: (walletName: string) => void
}

// Create wallet context
const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Wallet provider props
interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Get network from environment variable or default to devnet
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet

  // Get RPC URL from environment variable or use default cluster API URL
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)

  // Configure wallet adapters - only using the definitely available ones
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [network])

  // Create a connection object to test the RPC endpoint
  const connection = useMemo(() => new Connection(endpoint, "confirmed"), [endpoint])

  // Test the connection to make sure the RPC endpoint is working
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Simple test to get the latest blockhash
        await connection.getLatestBlockhash()
        console.log("Solana RPC connection successful")
      } catch (error) {
        console.error("Solana RPC connection failed:", error)
      }
    }

    testConnection()
  }, [connection])

  // Wrap the children with Solana wallet providers
  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <WalletContextWrapper>{children}</WalletContextWrapper>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

function WalletContextWrapper({ children }: { children: ReactNode }) {
  const {
    publicKey,
    connected,
    connecting,
    wallet,
    disconnect: solanaDisconnect,
    select,
    connect: solanaConnect,
  } = useSolanaWallet()
  const { setVisible, visible } = useWalletModal()
  const { toast } = useToast()
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Update address when publicKey changes
  useEffect(() => {
    if (publicKey) {
      setAddress(publicKey.toString())
    } else {
      setAddress(null)
    }
  }, [publicKey])

  // Connect wallet function
  const connect = async () => {
    try {
      setError(null)
      console.log("Opening wallet modal...")

      // First try to connect directly if a wallet is already selected
      if (wallet) {
        try {
          console.log("Wallet already selected, trying to connect directly...")
          await solanaConnect()

          // 如果连接成功且有地址，立即尝试登录
          if (publicKey) {
            const walletAddress = publicKey.toString()
            console.log("Wallet connected, attempting to login with address:", walletAddress)
            // 这里不直接调用 connectWallet，因为我们需要等待 address 状态更新
          }
          return
        } catch (err) {
          console.error("Direct connection failed, opening modal instead:", err)
        }
      }

      // Open wallet modal to let user select a wallet
      setVisible(true)
      console.log("Wallet modal visibility set to:", true)
    } catch (error) {
      console.error("Failed to connect wallet:", error)

      let errorMessage = "无法连接到您的钱包，请重试"

      if (error instanceof WalletNotReadyError) {
        errorMessage = "钱包未准备好，请确保已安装钱包扩展"
      } else if (error instanceof WalletNotConnectedError) {
        errorMessage = "钱包未连接，请先连接钱包"
      } else if (error instanceof WalletError) {
        errorMessage = `钱包错误: ${error.message}`
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setError(errorMessage)

      toast({
        title: "连接失败",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Log when wallet modal visibility changes
  useEffect(() => {
    console.log("Wallet modal visible:", visible)
  }, [visible])

  // Function to select a specific wallet
  const selectWallet = (walletName: string) => {
    try {
      console.log("Selecting wallet:", walletName)
      if (select) {
        select(walletName)
      }
    } catch (error) {
      console.error("Failed to select wallet:", error)
      toast({
        title: "选择钱包失败",
        description: "无法选择指定的钱包，请重试",
        variant: "destructive",
      })
    }
  }

  // Disconnect wallet function
  const disconnect = () => {
    try {
      solanaDisconnect()
      setAddress(null)
      localStorage.removeItem("walletAddress")
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
      toast({
        title: "断开连接失败",
        description: "无法断开钱包连接，请重试",
        variant: "destructive",
      })
    }
  }

  // Save wallet address to localStorage when connected
  useEffect(() => {
    if (connected && address) {
      localStorage.setItem("walletAddress", address)
      console.log("Wallet connected:", address)

      // Show success toast
      toast({
        title: "钱包已连接",
        description: "您的钱包已成功连接",
      })
    }
  }, [connected, address, toast])

  // 监听钱包连接状态变化
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && address) {
        console.log("Wallet connected with address:", address)

        try {
          // 尝试使用钱包地址登录
          const authContext = window.authContext
          if (authContext && typeof authContext.connectWallet === "function") {
            console.log("Attempting to login with wallet address")
            await authContext.connectWallet(address)
          } else {
            console.log("Auth context not available or connectWallet not a function")
          }
        } catch (error) {
          console.error("Failed to login with wallet address:", error)
        }
      }
    }

    handleWalletConnection()
  }, [connected, address])

  // Get wallet name
  const walletName = wallet?.adapter?.name || null

  // Log wallet state changes
  useEffect(() => {
    console.log("Wallet state:", { connected, connecting, walletName })
  }, [connected, connecting, walletName])

  // Provide wallet context
  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        address,
        connect,
        disconnect,
        publicKey,
        wallet,
        walletName,
        openWalletModal: () => {
          console.log("Manually opening wallet modal")
          setVisible(true)
        },
        error,
        selectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// Custom hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

