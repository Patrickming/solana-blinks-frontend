"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react"
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
import { useToast } from "@/app/components/ui/use-toast"
import type { WalletName } from '@solana/wallet-adapter-base'

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

/**
 * @typedef {Object} WalletContextType - 定义钱包上下文类型
 * @property {boolean} connected - 钱包是否已连接
 * @property {boolean} connecting - 钱包是否正在连接中
 * @property {string | null} address - 连接钱包的地址字符串，未连接时为null
 * @property {() => Promise<void>} connect - 连接钱包的函数
 * @property {() => void} disconnect - 断开钱包连接的函数
 * @property {any} publicKey - 连接钱包的公钥对象
 * @property {any} wallet - 当前选择的钱包适配器实例
 * @property {string | null} walletName - 当前选择的钱包名称，未选择时为null
 * @property {() => void} openWalletModal - 打开钱包选择模态框的函数
 * @property {string | null} error - 连接或操作钱包时发生的错误信息
 * @property {(walletName: string) => void} selectWallet - 选择特定钱包的函数
 */

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

/**
 * WalletProvider 组件
 *
 * 这个组件是应用中 Solana 钱包功能的核心设置层。
 * 它整合了 @solana/wallet-adapter 库的多个提供者，
 * 并为整个应用或特定部分提供统一的钱包上下文。
 *
 * 主要职责:
 * 1. **配置网络和 RPC 端点:** 从环境变量读取 Solana 网络 (Devnet, Mainnet) 和 RPC URL。
 * 2. **初始化钱包适配器:** 配置支持的钱包列表 (例如 Phantom, Solflare)。
 * 3. **设置连接:** 使用 `ConnectionProvider` 提供 Solana `Connection` 实例。
 * 4. **管理钱包状态:** 使用 `SolanaWalletProvider` 管理钱包连接、断开、选择等核心逻辑。
 * 5. **提供钱包模态框:** 使用 `WalletModalProvider` 提供标准的钱包选择 UI。
 * 6. **包裹自定义上下文:** 将上述提供者与自定义的 `WalletContextWrapper` 结合，
 *    提供一个简化的、包含更多状态 (如地址字符串、错误处理) 的 `WalletContext`。
 *
 * @param {WalletProviderProps} props - 包含子组件的属性对象。
 * @returns {JSX.Element} 返回嵌套了所有必要 Solana 钱包提供者的 JSX 结构。
 */
export function WalletProvider({ children }: WalletProviderProps) {
  // Get network from environment variable or default to devnet
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet
  console.log(`使用 Solana 网络: ${network}`)

  // Get RPC URL from environment variable or use default cluster API URL
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
  console.log(`使用 RPC 端点: ${endpoint}`)

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
        console.log("✅ Solana RPC 连接成功")
      } catch (error) {
        console.error("❌ Solana RPC 连接失败:", error)
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
      const addr = publicKey.toString()
      setAddress(addr)
      console.log(`钱包地址已更新: ${addr}`)
    } else {
      setAddress(null)
    }
  }, [publicKey])

  // Connect wallet function
  const connect = async () => {
    try {
      setError(null)
      console.log("尝试连接钱包...")

      // First try to connect directly if a wallet is already selected
      if (wallet && solanaConnect) {
        try {
          console.log(`钱包 '${wallet.adapter.name}' 已选择，尝试直接连接...`)
          await solanaConnect()
          console.log(`${wallet.adapter.name} 直接连接成功`)
          return
        } catch (err) {
          console.warn("直接连接失败或被取消，将打开模态框:", err)
        }
      }

      // Open wallet modal to let user select a wallet
      console.log("打开钱包模态框供用户选择。")
      setVisible(true)
    } catch (error) {
      console.error("连接过程中发生错误:", error)

      let errorMessage = "连接钱包失败，请重试。"

      if (error instanceof WalletNotReadyError) {
        errorMessage = "钱包未准备好。请确保已安装并启用钱包扩展。"
      } else if (error instanceof WalletNotConnectedError) {
        errorMessage = "钱包未连接。"
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
    console.log("钱包模态框可见性变化:", visible)
  }, [visible])

  // Function to select a specific wallet
  const selectWallet = (walletName: string) => {
    try {
      console.log("选择钱包:", walletName)
      if (select) {
        select(walletName as WalletName)
      } else {
        console.warn("select 函数在 useSolanaWallet 中不可用")
      }
    } catch (error) {
      console.error("选择钱包时出错:", error)
      const msg = error instanceof Error ? error.message : "选择钱包时发生未知错误"
      setError(msg)
      toast({ title: "选择钱包失败", description: msg, variant: "destructive" })
    }
  }

  // Disconnect wallet function
  const disconnect = async () => {
    try {
      setError(null)
      console.log("尝试断开钱包连接...")
      await solanaDisconnect()
      setAddress(null)
      console.log("钱包已断开连接")
      toast({ title: "钱包已断开", description: "您已成功断开钱包连接。" })
    } catch (error) {
      console.error("断开钱包连接时出错:", error)
      const msg = error instanceof Error ? error.message : "断开连接时发生未知错误"
      setError(msg)
      toast({ title: "断开连接失败", description: msg, variant: "destructive" })
    }
  }

  // Save wallet address to localStorage when connected
  useEffect(() => {
    if (connected && address) {
      localStorage.setItem("walletAddress", address)
      console.log("Wallet connected, address saved to localStorage:", address)
    }
  }, [connected, address])

  // 监听钱包连接状态变化
  useEffect(() => {
    const handleWalletLogin = async () => {
      if (connected && address) {
        console.log("钱包已连接，检查认证状态...")
        try {
          // 访问全局挂载的 AuthContext (或者通过 useContext 获取，如果结构允许)
          // 注意：这种全局访问方式 (window.authContext) 不是最佳实践，
          // 更推荐的方式是在 AuthProvider 中提供一个方法，并在 WalletProvider 中通过 useContext 访问。
          // 但根据现有代码结构，暂时保留此方式。
          // @ts-ignore 暂时忽略类型检查，因为 window 上没有预定义 authContext
          const authContext = window.authContext

          if (authContext && typeof authContext.connectWallet === "function") {
            console.log("AuthContext found, attempting login with wallet address:", address)
            await authContext.connectWallet(address)
            console.log("connectWallet function called successfully.")
          } else {
            console.warn("AuthContext not available or connectWallet is not a function on window.authContext")
          }
        } catch (error) {
          console.error("Error during wallet login attempt:", error)
          // 可能需要显示一个登录失败的 Toast 通知
        }
      }
    }

    // 延迟一小段时间执行，确保 AuthContext 可能已经初始化
    const timer = setTimeout(handleWalletLogin, 100);

    return () => clearTimeout(timer); // 清理定时器

  }, [connected, address])

  // Get wallet name
  const walletName = wallet?.adapter?.name || null

  // Log wallet state changes
  useEffect(() => {
    console.log("Wallet Core State Update:", { connected, connecting, walletName, address, error })
  }, [connected, connecting, walletName, address, error])

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

