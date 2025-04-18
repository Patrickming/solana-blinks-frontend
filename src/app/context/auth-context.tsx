"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "@/app/context/wallet-context"
import { useToast } from "@/app/components/ui/use-toast"
import { useRouter } from "next/navigation"

/**
 * AuthProvider 和 useAuth Hook
 * 提供用户认证状态管理和相关操作功能。
 * 包括用户登录、注册、登出、钱包连接/关联、用户信息获取/更新等。
 */

/**
 * 用户类型定义
 * 包含用户基本信息和社区相关字段
 */
type User = {
  id: string // 用户唯一标识符
  username: string // 用户名
  email: string // 电子邮箱
  walletAddress?: string | null // 钱包地址（可选）
  hasSetupAccount: boolean // 是否已完成账号设置 (例如，设置邮箱/密码)
  avatar?: string // 用户头像URL
  // 社区相关字段（均为可选）
  phone?: string // 电话号码
  qq?: string // QQ号码
  region?: string // 地区
  techStack?: string // 技术栈
  bio?: string // 个人简介
  github?: string // GitHub网址
  twitter?: string // Twitter网址
  website?: string // 个人网站
}

/**
 * 认证上下文类型定义
 * 包含用户状态和认证相关方法
 */
type AuthContextType = {
  user: User | null // 当前登录的用户信息，未登录则为 null
  setUser: React.Dispatch<React.SetStateAction<User | null>> // 更新用户信息的函数
  isAuthenticated: boolean // 用户是否已认证 (已登录)
  isLoading: boolean // 是否正在加载认证状态
  needsWalletConnection: boolean // 用户是否需要连接钱包 (例如，已登录但未绑定钱包)
  needsAccountSetup: boolean // 用户是否需要完成账号设置 (例如，通过钱包创建账号后)
  login: (email: string, password: string) => Promise<void> // 邮箱密码登录方法
  register: (email: string, username: string, password: string) => Promise<void> // 邮箱密码注册方法
  logout: () => void // 登出方法
  updateUser: (userData: Partial<User>) => Promise<boolean> // 更新用户资料方法
  completeAccountSetup: (email: string, password: string) => Promise<void> // 完成账号设置 (为钱包用户设置邮箱密码)
  fetchUserProfile: () => Promise<boolean> // 获取用户详细资料方法
  connectWallet: (walletAddress: string) => Promise<boolean> // 使用钱包地址登录或创建新用户
  associateWallet: (walletAddress: string) => Promise<boolean> // 将钱包地址关联到当前登录用户
}

// 创建认证上下文，初始值为 undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * 认证提供者组件
 * 管理用户认证状态，处理登录、注册、登出和用户信息更新
 *
 * @param children - 子组件
 * @returns 包含认证上下文的提供者组件
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // 状态管理
  const [user, setUser] = useState<User | null>(null) // 当前用户信息
  const [isLoading, setIsLoading] = useState(true) // 初始加载状态
  const [needsWalletConnection, setNeedsWalletConnection] = useState(false) // 是否提示用户连接钱包
  const [needsAccountSetup, setNeedsAccountSetup] = useState(false) // 是否提示用户完成账号设置

  // Hooks
  const { connected, address, disconnect } = useWallet() // 从钱包上下文获取状态和方法
  const { toast } = useToast() // 用于显示提示信息
  const router = useRouter() // 用于页面跳转

  /**
   * 登出方法
   * 清理用户状态、本地存储，并断开钱包连接
   */
  const logout = () => {
    console.log("执行 logout")
    setUser(null) // 清空用户状态
    localStorage.removeItem("user") // 清除本地存储的用户信息
    localStorage.removeItem("authToken") // 清除本地存储的认证 token
    setNeedsWalletConnection(false) // 重置提示状态
    setNeedsAccountSetup(false) // 重置提示状态

    // 如果钱包当前是连接状态，则断开连接
    if (connected) {
      console.log("登出时断开钱包连接。")
      disconnect()
    }

    // 显示登出成功提示
    toast({
      title: "已退出登录",
      description: "您已成功退出登录。",
    })

    // 可以选择性地跳转到首页或其他页面
    // router.push('/')
  }

  /**
   * 获取用户详细资料方法
   * 从后端获取当前登录用户的最新资料并更新本地状态
   *
   * @returns Promise<boolean> - 获取并更新成功返回 true，否则返回 false
   */
  const fetchUserProfile = async (): Promise<boolean> => {
    console.log("执行 fetchUserProfile")
    const token = localStorage.getItem("authToken")
    // 如果没有 token 或当前没有 user 状态 (例如刚打开应用但 token 无效)，则无法获取
    if (!token) {
      console.log("无法获取用户资料：缺少 token。")
      return false
    }

    if (!user) {
      console.log("无法获取用户资料：用户未登录状态。")
      return false
    }

    try {
      console.log("开始获取用户资料，使用 token:", token.substring(0, 10) + "...")
      
      // 调用后端获取用户资料 API
      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("获取用户资料 API 响应状态:", response.status)

      if (!response.ok) {
        // 尝试获取错误信息
        let errorMessage = `获取用户资料失败 (状态码: ${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
          console.error("API 错误详情:", errorData)
        } catch (e) {
          console.error("无法解析 API 错误详情")
        }

        // 如果获取失败 (例如 token 过期)，可能需要登出用户
        if (response.status === 401 || response.status === 403) {
          console.warn("获取用户资料失败 (认证无效)，执行登出。")
          logout()
        }
        throw new Error(errorMessage)
      }

      // 添加超时处理
      const profileData = await Promise.race([
        response.json(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("获取用户资料超时")), 10000)
        )
      ]) as any;
      
      console.log("获取用户资料 API 响应:", profileData)

      // 使用获取到的最新资料更新本地用户状态
      // 合并现有 user 状态和 profileData，确保所有字段都更新
      const updatedUser: User = {
        ...user, // 保留 id 等基础信息
        username: profileData.username || user.username, // 优先使用 profile 数据
        email: profileData.email || user.email,
        walletAddress: profileData.walletAddress || user.walletAddress,
        hasSetupAccount: profileData.hasSetupAccount ?? user.hasSetupAccount,
        avatar: profileData.avatar,
        phone: profileData.phone,
        qq: profileData.qq,
        region: profileData.region,
        techStack: profileData.techStack,
        bio: profileData.bio,
        github: profileData.github,
        twitter: profileData.twitter,
        website: profileData.website,
      }

      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // 根据更新后的资料，重新判断是否需要连接钱包或设置账号
      setNeedsWalletConnection(!updatedUser.walletAddress)
      setNeedsAccountSetup(!updatedUser.hasSetupAccount)

      console.log("用户资料已更新。")
      return true
    } catch (error) {
      console.error("获取用户资料失败:", error)
      // 记录更详细的错误信息，帮助调试
      if (error instanceof Error) {
        console.error("错误详情:", error.message)
        console.error("错误堆栈:", error.stack)
      } else {
        console.error("未知错误类型:", error)
      }
      
      // 尝试重新获取 token，可能是 token 格式问题
      const currentToken = localStorage.getItem("authToken")
      console.log("当前 token 状态:", currentToken ? `存在 (长度: ${currentToken.length})` : "不存在")
      
      // 获取失败不一定需要提示用户，除非是关键操作
      return false
    }
  }

  /**
   * 连接钱包方法 (由用户主动触发或钱包连接事件触发)
   * 使用钱包地址登录。如果地址未注册，则自动创建新用户。
   *
   * @param walletAddress - 钱包地址
   * @returns Promise<boolean> - 指示操作是否成功 (API 调用成功并获取到用户数据)
   */
  const connectWallet = async (walletAddress: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("执行 connectWallet，地址:", walletAddress)
    try {
      // 调用后端 API 进行钱包登录或注册
      const response = await fetch("/api/users/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        // API 返回错误状态
        const errorData = await response.json().catch(() => ({})) // 尝试解析错误信息
        throw new Error(errorData.message || `钱包登录/注册失败 (状态码: ${response.status})`)
      }

      // API 调用成功，解析返回的用户数据和 token
      const userData = await response.json()
      console.log("钱包登录/注册 API 响应:", userData)

      // 保存认证 token 到 localStorage
      localStorage.setItem("authToken", userData.token)

      // 构建用户对象 (User 类型)
      const newUser: User = {
        id: userData.id,
        username: userData.username || `User_${walletAddress.substring(0, 6)}`, // 如果没有用户名，生成一个默认的
        email: userData.email || ``, // 邮箱可能为空
        walletAddress: userData.walletAddress,
        // 如果后端明确告知是新用户，或者邮箱为空，则认为需要设置账号 (完善邮箱/密码)
        // 但钱包用户并非强制要求设置邮箱密码，所以 hasSetupAccount 初始可以为 true
        hasSetupAccount: userData.hasSetupAccount ?? true,
        avatar: userData.avatar, // 头像 URL
        // 其他社区字段可以从 userData 中获取，如果存在的话
        phone: userData.phone,
        qq: userData.qq,
        region: userData.region,
        techStack: userData.techStack,
        bio: userData.bio,
        github: userData.github,
        twitter: userData.twitter,
        website: userData.website,
      }

      // 更新用户状态
      setUser(newUser)
      // 钱包已连接，清除需要连接钱包的提示
      setNeedsWalletConnection(false)
      // 钱包用户不强制要求设置邮箱密码，所以清除需要设置账号的提示
      setNeedsAccountSetup(false)
      // 保存用户信息到 localStorage
      localStorage.setItem("user", JSON.stringify(newUser))

      // 根据是新用户还是老用户显示不同的提示
      toast({
        title: userData.isNewUser ? "钱包账户已创建并登录" : "钱包登录成功",
        description: userData.isNewUser ? `欢迎，${newUser.username}！您的账户已通过钱包创建。` : `欢迎回来，${newUser.username}！`,
      })

      return true // 操作成功
    } catch (error) {
      console.error("钱包连接/登录失败:", error)
      // 显示错误提示
      toast({
        title: "钱包连接失败",
        description: error instanceof Error ? error.message : "无法使用钱包地址登录/注册，请稍后重试。",
        variant: "destructive",
      })
      // 清理可能存在的无效 token 或用户信息
      logout()
      return false // 操作失败
    } finally {
      setIsLoading(false) // 结束加载状态
    }
  }

  /**
   * 关联钱包方法 (通常由用户主动点击按钮触发)
   * 将指定的钱包地址关联到当前已登录的用户账号。
   *
   * @param walletAddress - 要关联的钱包地址
   * @returns Promise<boolean> - 指示操作是否成功 (API 调用成功并更新了用户信息)
   */
  const associateWallet = async (walletAddress: string): Promise<boolean> => {
    // 必须先登录才能关联钱包
    if (!user) {
      toast({ title: "请先登录", description: "登录后才能关联钱包地址。", variant: "destructive" })
      return false
    }
    // 如果用户已经有关联的钱包地址，则不允许再次关联
    if (user.walletAddress) {
      toast({ title: "已绑定钱包", description: "您的账号已绑定钱包地址，如需更换请联系支持。", variant: "destructive" })
      return false
    }

    console.log("执行 associateWallet，地址:", walletAddress)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("未找到认证令牌，请重新登录。")
      }

      // 调用后端 API 关联钱包
      const response = await fetch("/api/users/profile/wallet", {
        method: "POST", // 使用 POST 请求将钱包地址发送到用户 profile 下的 wallet 端点
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 需要认证
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        // API 返回错误
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `钱包关联失败 (状态码: ${response.status})`)
      }

      // API 调用成功，解析返回的数据 (可能包含更新后的钱包地址)
      const responseData = await response.json()
      console.log("钱包关联 API 响应:", responseData)

      // 更新本地用户状态
      const updatedUser: User = { ...user, walletAddress: responseData.walletAddress || walletAddress }
      setUser(updatedUser)
      setNeedsWalletConnection(false) // 钱包已关联，清除提示
      localStorage.setItem("user", JSON.stringify(updatedUser))

      // 显示成功提示
      toast({
        title: "钱包已成功绑定",
        description: "您的账号已与钱包地址关联，下次可直接使用钱包登录。",
      })

      return true // 操作成功
    } catch (error) {
      console.error("钱包关联失败:", error)
      // 显示错误提示
      toast({
        title: "钱包关联失败",
        description: error instanceof Error ? error.message : "无法关联钱包地址，该地址可能已被其他账号绑定，请检查或稍后重试。",
        variant: "destructive",
      })
      return false // 操作失败
    }
  }

  // 提供一个全局引用，以便 WalletContext 可以访问 AuthContext 的 connectWallet 和 associateWallet 方法
  // 注意: 这是一种不太推荐的跨上下文通信方式，更好的方法可能是将 AuthProvider 嵌套在 WalletProvider 内部或使用其他状态管理库
  useEffect(() => {
    // @ts-ignore - 忽略 TypeScript 检查，因为 window 对象上没有预定义 authContext
    window.authContext = {
      connectWallet,
      associateWallet,
    }

    // 组件卸载时清理全局引用
    return () => {
      // @ts-ignore
      delete window.authContext
    }
  }, [connectWallet, associateWallet]) // 依赖项确保函数引用是最新的

  /**
   * 检查用户认证状态 (挂载时执行)
   * 尝试从 localStorage 读取用户信息和 token，并验证 token 有效性
   */
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const storedUser = localStorage.getItem("user") // 读取本地存储的用户信息
      const token = localStorage.getItem("authToken") // 读取本地存储的认证 token

      if (storedUser && token) {
        // 如果本地存在用户信息和 token，则验证 token 是否有效
        try {
          // 调用后端 API 验证 token
          const response = await fetch("/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`, // 在请求头中携带 token
            },
          })

          if (response.ok) {
            // Token 验证成功
            const parsedUser: User = JSON.parse(storedUser) // 解析本地存储的用户信息
            setUser(parsedUser) // 设置用户状态

            // 检查是否需要提示连接钱包 (已登录但未绑定钱包)
            if (!parsedUser.walletAddress) {
              // setNeedsWalletConnection(true) // 暂时注释掉，避免强制要求连接钱包
            }

            // 检查是否需要完成账号设置 (例如，上次通过钱包登录，但未设置邮箱密码)
            if (!parsedUser.hasSetupAccount) {
              setNeedsAccountSetup(true)
            }

            // 登录成功后，主动获取一次最新的用户资料
            fetchUserProfile()
          } else {
            // Token 无效或已过期，清除本地存储
            console.warn("Auth token validation failed, clearing local storage.")
            logout() // 调用 logout 清理状态
          }
        } catch (error) {
          // 网络错误或其他异常，清除本地存储
          console.error("Error validating auth token:", error)
          logout() // 调用 logout 清理状态
        }
      }
      setIsLoading(false) // 加载完成
    }

    checkAuth()
  }, []) // 空依赖数组，确保只在组件挂载时执行一次

  /**
   * 监控钱包连接状态变化
   * 当钱包连接 (`connected`) 且获取到地址 (`address`) 时触发
   */
  useEffect(() => {
    const handleWalletConnection = async () => {
      // 确保钱包已连接且地址有效
      if (connected && address) {
        console.log("钱包连接事件触发 (AuthContext)")
        if (user) {
          // 场景1: 用户已登录
          if (!user.walletAddress) {
            // 子场景 1.1: 用户已登录，但未绑定钱包地址 -> 尝试自动关联钱包
            console.log("用户已登录但未绑定钱包，尝试自动关联钱包地址:", address)
            associateWallet(address)
              .then((success) => {
                if (success) {
                  toast({
                    title: "钱包已自动关联",
                    description: "您的账号已成功绑定当前连接的钱包地址。",
                  })
                }
                // 关联失败的提示在 associateWallet 函数内部处理
              })
              .catch((error) => {
                // 此处的 catch 主要用于捕获 associateWallet 内部未处理的异常
                console.error("自动关联钱包时发生未预期错误:", error)
              })
          } else if (user.walletAddress.toLowerCase() !== address.toLowerCase()) {
            // 子场景 1.2: 用户已登录，且已绑定钱包，但当前连接的钱包地址与绑定的不符 -> 提示错误并断开连接
            console.warn("连接的钱包地址与账号绑定的不符。已绑定:", user.walletAddress, "当前连接:", address)
            toast({
              title: "钱包不匹配",
              description: `您连接的钱包地址 (${address.substring(0, 6)}...) 与账号绑定的地址 (${user.walletAddress.substring(0, 6)}...) 不符，已自动断开连接。`,
              variant: "destructive",
              duration: 7000,
            })
            disconnect() // 断开错误的钱包连接
          } else {
            // 子场景 1.3: 用户已登录，连接的钱包地址与绑定的相符 -> 无需操作
            console.log("连接的钱包地址与账号绑定的相符，无需操作。")
          }
        } else {
          // 场景 2: 用户未登录 -> 尝试使用钱包地址自动登录
          console.log("用户未登录，尝试使用钱包地址自动登录:", address)
          connectWallet(address)
            .then((success) => {
              if (success) {
                console.log("使用钱包地址自动登录成功。")
                // 登录成功的提示在 connectWallet 函数内部处理
              } else {
                // 如果 connectWallet 返回 false (例如 API 错误)，提示用户
                toast({
                  title: "钱包自动登录失败",
                  description: "尝试使用钱包地址登录时出错，请稍后重试或手动登录。",
                  variant: "destructive",
                })
              }
            })
            .catch((error) => {
              // 此处的 catch 主要用于捕获 connectWallet 内部未处理的异常
              console.error("使用钱包地址自动登录时发生未预期错误:", error)
              toast({
                title: "钱包自动登录出错",
                description: "处理钱包连接时发生未知错误。",
                variant: "destructive",
              })
            })
        }
      }
    }

    handleWalletConnection()
    // 依赖项包含 connected 和 address，以及需要调用的函数
  }, [connected, address, user, associateWallet, connectWallet, disconnect, toast])

  /**
   * 邮箱密码登录方法
   *
   * @param email - 用户邮箱
   * @param password - 用户密码
   * @returns Promise<void> - 登录成功则 resolve，失败则 reject
   */
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    console.log("执行 login，邮箱:", email)
    try {
      // 调用后端登录 API
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `登录失败 (状态码: ${response.status})`)
      }

      const loginData = await response.json() // login API 可能只返回 token 和基本信息
      console.log("登录 API 响应:", loginData)
      localStorage.setItem("authToken", loginData.token)

      // 创建基本用户对象 (不管 fetchUserProfile 是否成功，都确保有用户数据)
      const basicUser: User = {
        id: loginData.id,
        username: loginData.username,
        email: loginData.email,
        walletAddress: loginData.walletAddress || null,
        hasSetupAccount: true,
      }
      
      // 先设置基本用户信息，确保登录状态
      setUser(basicUser)
      localStorage.setItem("user", JSON.stringify(basicUser))
      
      // 尝试最多三次获取完整的用户资料
      let profileFetched = false;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (!profileFetched && retryCount <= maxRetries) {
        try {
          console.log(`尝试获取用户资料 (尝试 ${retryCount + 1}/${maxRetries + 1})`)
          // 登录成功后，获取完整的用户资料
          profileFetched = await fetchUserProfile()
          if (profileFetched) {
            console.log("成功获取用户资料")
            break;
          }
        } catch (e) {
          console.error(`获取用户资料失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, e)
        }
        
        retryCount++;
        if (!profileFetched && retryCount <= maxRetries) {
          // 在重试之前等待一段时间
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (profileFetched && user) { // 确保 fetchUserProfile 成功且 user 状态已更新
        // 根据获取到的用户资料判断是否需要连接钱包
        if (!user.walletAddress) {
          // setNeedsWalletConnection(true) // 暂时注释掉，避免强制要求
          toast({
            title: "登录成功",
            description: "欢迎回来！您可以选择性地在个人资料页面绑定钱包地址。",
          })
        } else {
          setNeedsWalletConnection(false)
          toast({
            title: "登录成功",
            description: "欢迎回来！",
          })
        }
        setNeedsAccountSetup(false) // 邮箱密码登录的用户，账号肯定是设置好的
      } else {
        // 如果获取用户资料失败，使用基本信息
        setNeedsAccountSetup(false)
        setNeedsWalletConnection(!basicUser.walletAddress)
        
        // 记录获取资料失败的问题
        console.warn("登录成功，但获取详细资料失败。使用登录API返回的基本信息。")
        
        toast({ 
          title: "登录成功", 
          description: "欢迎回来！" 
        })
      }

      return Promise.resolve()
    } catch (error) {
      console.error("登录失败:", error)
      toast({ title: "登录失败", description: error instanceof Error ? error.message : "邮箱或密码错误，请重试。", variant: "destructive" })
      logout() // 登录失败时也清理状态
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 邮箱密码注册方法
   *
   * @param email - 用户邮箱
   * @param username - 用户名
   * @param password - 用户密码
   * @returns Promise<void> - 注册成功则 resolve，失败则 reject
   */
  const register = async (email: string, username: string, password: string): Promise<void> => {
    setIsLoading(true)
    console.log("执行 register，邮箱:", email, "用户名:", username)
    try {
      // 调用后端注册 API
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword: password, // 后端需要确认密码
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `注册失败 (状态码: ${response.status})`)
      }

      const registerData = await response.json() // 注册 API 通常会返回新用户信息和 token
      console.log("注册 API 响应:", registerData)
      localStorage.setItem("authToken", registerData.token)

      // 构建用户对象
      const newUser: User = {
        id: registerData.id,
        username: registerData.username,
        email: registerData.email,
        walletAddress: registerData.walletAddress || null,
        hasSetupAccount: true, // 邮箱密码注册的用户，账号视为已设置
        avatar: registerData.avatar,
      }

      setUser(newUser)
      setNeedsAccountSetup(false)
      setNeedsWalletConnection(!newUser.walletAddress)
      localStorage.setItem("user", JSON.stringify(newUser))

      // 提示注册成功，并告知可以绑定钱包
      toast({
        title: "注册成功",
        description: "欢迎加入！您可以选择性地在个人资料页面绑定钱包地址。",
      })

      return Promise.resolve()
    } catch (error) {
      console.error("注册失败:", error)
      toast({ title: "注册失败", description: error instanceof Error ? error.message : "无法完成注册，请检查信息或稍后重试。", variant: "destructive" })
      logout() // 注册失败时清理状态
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 完成账号设置方法 (为通过钱包首次登录的用户设置邮箱/密码)
   * 注意：此方法在当前逻辑下可能不会被直接调用，因为钱包用户不强制设置邮箱密码
   * 但保留此方法以备将来需要
   *
   * @param email - 用户设置的邮箱
   * @param password - 用户设置的密码
   * @returns Promise<void> - 设置成功则 resolve，失败则 reject
   */
  const completeAccountSetup = async (email: string, password: string): Promise<void> => {
    if (!user) return Promise.reject(new Error("用户未找到"))
    if (!user.walletAddress) return Promise.reject(new Error("非钱包用户无需此操作"))

    setIsLoading(true)
    console.log("执行 completeAccountSetup，邮箱:", email)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) throw new Error("未找到认证令牌")

      // 调用后端 API 更新用户信息 (假设有一个专门的端点或 register 端点可以处理)
      // 这里假设调用 /api/users/profile PUT 来更新邮箱和标记 hasSetupAccount
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email, // 更新邮箱
          // 可能需要后端支持更新密码，或者有单独的设置密码接口
          // 这里假设后端会自动处理密码设置或忽略密码字段
          hasSetupAccount: true, // 标记账号已设置
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `账号设置失败 (状态码: ${response.status})`)
      }

      const updatedProfileData = await response.json()
      console.log("账号设置 API 响应:", updatedProfileData)

      // 更新本地用户状态
      const updatedUser: User = {
        ...user,
        email, // 更新邮箱
        hasSetupAccount: true, // 标记已设置
      }

      setUser(updatedUser)
      setNeedsAccountSetup(false) // 清除需要设置的提示
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "账号设置完成",
        description: "您已成功设置邮箱，现在可以使用邮箱密码登录。",
      })

      return Promise.resolve()
    } catch (error) {
      console.error("账号设置失败:", error)
      toast({ title: "账号设置失败", description: error instanceof Error ? error.message : "无法完成账号设置，请稍后重试。", variant: "destructive" })
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 更新用户资料方法
   *
   * @param userData - 包含要更新的字段的部分 User 对象
   * @returns Promise<boolean> - 更新成功返回 true，失败返回 false
   */
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) {
      toast({ title: "请先登录", description: "登录后才能更新个人资料。", variant: "destructive" })
      return false
    }

    console.log("执行 updateUser，更新数据:", userData)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("未找到认证令牌，请重新登录。")
      }

      // 准备发送到 API 的数据 (移除 id, walletAddress, hasSetupAccount 等不应由用户直接修改的字段)
      const profileData: Partial<User> = { ...userData }
      delete profileData.id
      delete profileData.walletAddress // 钱包地址通过 associateWallet 管理
      delete profileData.hasSetupAccount

      // 调用后端更新资料 API
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `更新资料失败 (状态码: ${response.status})`)
      }

      const updatedProfile = await response.json() // API 应返回更新后的完整或部分资料
      console.log("更新资料 API 响应:", updatedProfile)

      // 更新本地用户状态 (合并现有 user 和 API 返回的更新)
      // 注意：API 可能只返回更新成功的字段，也可能返回完整的 profile
      const updatedUser: User = { ...user, ...updatedProfile }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({ title: "个人资料已更新", description: "您的信息已成功保存。" })
      return true
    } catch (error) {
      console.error("更新用户资料失败:", error)
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "更新个人资料时出错，请稍后重试。",
        variant: "destructive",
      })
      return false
    }
  }

  // 将所有状态和方法通过 AuthContext.Provider 提供给子组件
  return (
    <AuthContext.Provider
      value={{
        user,                 // 当前用户信息
        setUser,              // 设置用户信息的函数 (主要供内部使用或特殊场景)
        isAuthenticated: !!user, // 是否已认证 (简单判断 user 是否存在)
        isLoading,            // 加载状态
        needsWalletConnection,// 是否需要连接钱包
        needsAccountSetup,   // 是否需要完成账号设置
        login,                // 登录方法
        register,             // 注册方法
        logout,               // 登出方法
        updateUser,           // 更新用户信息方法
        completeAccountSetup, // 完成账号设置方法
        fetchUserProfile,     // 获取用户资料方法
        connectWallet,        // 连接钱包方法
        associateWallet,      // 关联钱包方法
      }}
    >
      {children} {/* 渲染被包裹的子组件 */}
    </AuthContext.Provider>
  )
}

/**
 * 自定义 hook: useAuth
 * 方便组件访问 AuthContext 提供的认证状态和方法。
 *
 * @returns AuthContextType - 认证上下文对象
 * @throws Error - 如果在 AuthProvider 外部使用此 hook，则抛出错误
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // 确保开发者正确使用了 AuthProvider
    throw new Error("useAuth 必须在 AuthProvider 内部使用")
  }
  return context
}

