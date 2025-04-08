"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

/**
 * 用户类型定义
 * 包含用户基本信息和社区相关字段
 */
type User = {
  id: string // 用户唯一标识符
  username: string // 用户名
  email: string // 电子邮箱
  walletAddress?: string | null // 钱包地址（可选）
  hasSetupAccount: boolean // 是否已完成账号设置
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
  user: User | null // 当前用户信息
  setUser: React.Dispatch<React.SetStateAction<User | null>> // 设置用户信息的函数
  isAuthenticated: boolean // 是否已认证
  isLoading: boolean // 加载状态
  needsWalletConnection: boolean // 是否需要连接钱包
  needsAccountSetup: boolean // 是否需要完成账号设置
  login: (email: string, password: string) => Promise<void> // 登录方法
  register: (email: string, username: string, password: string) => Promise<void> // 注册方法
  logout: () => void // 登出方法
  updateUser: (userData: Partial<User>) => Promise<boolean> // 更新用户信息
  completeAccountSetup: (email: string, password: string) => Promise<void> // 完成账号设置
  fetchUserProfile: () => Promise<boolean> // 获取用户资料
  connectWallet: (walletAddress: string) => Promise<boolean> // 连接钱包方法
  associateWallet: (walletAddress: string) => Promise<boolean> // 关联钱包方法
}

// 创建认证上下文
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
  const [user, setUser] = useState<User | null>(null) // 用户信息
  const [isLoading, setIsLoading] = useState(true) // 加载状态
  const [needsWalletConnection, setNeedsWalletConnection] = useState(false) // 是否需要连接钱包
  const [needsAccountSetup, setNeedsAccountSetup] = useState(false) // 是否需要完成账号设置

  // Hooks
  const { connected, address, disconnect } = useWallet() // 钱包上下文
  const { toast } = useToast() // 提示组件
  const router = useRouter() // 路由

  // 在 AuthProvider 函数的开头
  // 提供一个全局引用，以便 WalletContext 可以访问 AuthContext
  useEffect(() => {
    // @ts-ignore
    window.authContext = {
      connectWallet,
      associateWallet,
    }

    return () => {
      // @ts-ignore
      delete window.authContext
    }
  }, [])

  /**
   * 检查用户是否已登录
   * 从本地存储中获取用户信息并设置相应状态
   */
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("authToken")

      if (storedUser && token) {
        // 验证令牌有效性
        try {
          const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            // 令牌有效，设置用户状态
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)

            // 检查用户是否需要连接钱包
            if (!parsedUser.walletAddress) {
              setNeedsWalletConnection(true)
            }

            // 检查用户是否需要完成账号设置
            if (!parsedUser.hasSetupAccount) {
              setNeedsAccountSetup(true)
            }

            // 获取最新的用户资料
            fetchUserProfile()
          } else {
            // 令牌无效，清除存储的用户信息
            localStorage.removeItem("user")
            localStorage.removeItem("authToken")
          }
        } catch (error) {
          console.error("Token validation failed:", error)
          localStorage.removeItem("user")
          localStorage.removeItem("authToken")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  /**
   * 监控钱包连接状态
   * 当钱包连接状态变化时，尝试使用钱包地址登录或关联
   */
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && address) {
        console.log("Wallet connection detected in auth context")
        // 如果钱包已连接，尝试使用钱包地址登录或关联
        if (user) {
          // 如果用户已登录但没有钱包地址，尝试关联钱包
          if (!user.walletAddress) {
            console.log("User logged in but no wallet address, attempting to associate wallet")
            associateWallet(address)
              .then((success) => {
                if (success) {
                  toast({
                    title: "钱包已关联",
                    description: "您的账号已成功绑定钱包地址，下次可直接使用钱包登录",
                  })
                }
              })
              .catch((error) => {
                console.error("Failed to associate wallet:", error)
                toast({
                  title: "钱包关联失败",
                  description: "该钱包地址可能已绑定其他账号，请使用其他钱包地址",
                  variant: "destructive",
                })
              })
          } else if (user.walletAddress !== address) {
            // 如果用户已有钱包地址，但连接了不同的钱包，提示错误
            toast({
              title: "钱包不匹配",
              description: "您连接的钱包地址与账号绑定的地址不符，请连接正确的钱包",
              variant: "destructive",
            })
            // 断开当前钱包连接
            disconnect()
          }
        } else {
          // 如果用户未登录，尝试使用钱包地址登录
          console.log("User not logged in, attempting to login with wallet address")
          connectWallet(address)
            .then((success) => {
              if (success) {
                console.log("Successfully logged in with wallet address")
              }
            })
            .catch((error) => {
              console.error("Failed to connect wallet:", error)
            })
        }
      }
    }

    handleWalletConnection()
  }, [connected, address])

  /**
   * 连接钱包方法
   * 使用钱包地址登录或创建新用户
   * 如果是新用户，自动创建账号
   *
   * @param walletAddress - 钱包地址
   * @returns 是否成功连接
   */
  const connectWallet = async (walletAddress: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      console.log("Attempting to connect wallet with address:", walletAddress)

      // 调用钱包登录/注册API
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "钱包连接失败")
      }

      // 解析响应数据
      const userData = await response.json()
      console.log("Wallet login response:", userData)

      // 保存JWT令牌到localStorage
      localStorage.setItem("authToken", userData.token)

      // 创建用户对象
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email || `${walletAddress.substring(0, 8)}@wallet.user`,
        walletAddress: userData.walletAddress,
        hasSetupAccount: userData.email && userData.email.indexOf("@wallet.user") === -1, // 如果不是系统生成的邮箱，则认为已设置账号
        avatar: userData.avatar,
      }

      // 如果是新用户，设置为已经设置账号，因为不需要强制设置邮箱密码
      // 用户可以随时在个人资料中完善信息
      if (userData.isNewUser) {
        console.log("New user created with wallet address")
        // 这里不再设置needsAccountSetup，而是直接认为用户可以使用
        setNeedsAccountSetup(false)
      } else {
        setNeedsAccountSetup(false)
        console.log("Existing user logged in with wallet address")
      }

      setUser(user)
      setNeedsWalletConnection(false)
      localStorage.setItem("user", JSON.stringify(user))

      toast({
        title: userData.isNewUser ? "钱包账户已创建" : "钱包登录成功",
        description: userData.isNewUser ? "您已使用钱包地址创建新账户" : "您已使用钱包地址登录",
      })

      return true
    } catch (error) {
      console.error("Wallet connection failed:", error)
      toast({
        title: "钱包连接失败",
        description: error instanceof Error ? error.message : "无法使用钱包地址登录",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 关联钱包方法
   * 将钱包地址关联到当前登录的用户
   * 一旦关联成功，该地址将永久绑定到此账号
   *
   * @param walletAddress - 钱包地址
   * @returns 是否成功关联
   */
  const associateWallet = async (walletAddress: string): Promise<boolean> => {
    if (!user) return false

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("未找到认证令牌")
      }

      // 调用关联钱包API
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/profile/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "钱包关联失败")
      }

      // 解析响应数据
      const responseData = await response.json()

      // 更新用户信息
      const updatedUser = { ...user, walletAddress: responseData.walletAddress }
      setUser(updatedUser)
      setNeedsWalletConnection(false)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "钱包已绑定",
        description: "您的账号已成功绑定钱包地址，下次可直接使用钱包登录",
      })

      return true
    } catch (error) {
      console.error("Wallet association failed:", error)
      toast({
        title: "钱包关联失败",
        description: error instanceof Error ? error.message : "无法关联钱包地址",
        variant: "destructive",
      })
      return false
    }
  }

  // 修改login方法，确保正确处理API响应和获取用户资料
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // 调用登录API
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "登录失败")
      }

      // 解析响应数据
      const userData = await response.json()

      // 保存JWT令牌到localStorage
      localStorage.setItem("authToken", userData.token)

      // 获取用户详细资料
      const profileResponse = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/profile", {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      })

      if (!profileResponse.ok) {
        // 如果获取资料失败，仍然使用基本信息创建用户
        const user: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          walletAddress: userData.walletAddress || null,
          hasSetupAccount: true,
        }
        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        // 获取详细资料成功
        const profileData = await profileResponse.json()

        // 创建包含详细资料的用户对象
        const user: User = {
          id: userData.id,
          username: userData.username || profileData.username,
          email: userData.email || profileData.email,
          walletAddress: userData.walletAddress || profileData.walletAddress,
          hasSetupAccount: true,
          phone: profileData.phone,
          qq: profileData.qq,
          region: profileData.region,
          techStack: profileData.techStack,
          bio: profileData.bio,
          github: profileData.github,
          twitter: profileData.twitter,
          website: profileData.website,
          avatar: profileData.avatar,
        }

        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))
      }

      // 如果没有钱包地址，设置提示可以连接钱包
      // 但不强制要求用户连接钱包
      if (!userData.walletAddress) {
        // 告知用户可以连接钱包，但不设置needsWalletConnection
        // 这样就不会强制要求用户连接钱包
        toast({
          title: "登录成功",
          description: "您可以选择连接钱包以便下次直接使用钱包登录",
        })
      } else {
        setNeedsWalletConnection(false)
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        })
      }

      return Promise.resolve()
    } catch (error) {
      console.error("Login failed:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 修改register方法，确保正确处理API响应
  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true)
    try {
      // 调用注册API
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword: password, // 使用相同的密码作为确认密码
        }),
      })

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "注册失败")
      }

      // 解析响应数据
      const userData = await response.json()

      // 保存JWT令牌到localStorage
      localStorage.setItem("authToken", userData.token)

      // 创建用户对象
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        walletAddress: userData.walletAddress || null,
        hasSetupAccount: true,
      }

      setUser(user)

      // 如果没有钱包地址，提示可以连接钱包，但不强制
      if (!userData.walletAddress) {
        toast({
          title: "注册成功",
          description: "您可以选择连接钱包以便下次直接使用钱包登录",
        })
      } else {
        setNeedsWalletConnection(false)
        toast({
          title: "注册成功",
          description: "您的账号已创建成功！",
        })
      }

      localStorage.setItem("user", JSON.stringify(user))

      return Promise.resolve()
    } catch (error) {
      console.error("Registration failed:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 修改completeAccountSetup方法，确保正确处理API响应
  const completeAccountSetup = async (email: string, password: string) => {
    if (!user) return Promise.reject(new Error("No user found"))

    setIsLoading(true)
    try {
      // 调用注册API，使用当前用户名和提供的邮箱密码
      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user.username,
          email,
          password,
          confirmPassword: password, // 使用相同的密码作为确认密码
          walletAddress: user.walletAddress, // 传递钱包地址以关联账户
        }),
      })

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "账号设置失败")
      }

      // 解析响应数据
      const userData = await response.json()

      // 保存JWT令牌到localStorage
      localStorage.setItem("authToken", userData.token)

      // 更新用户邮箱并标记设置完成
      const updatedUser = {
        ...user,
        email,
        hasSetupAccount: true,
      }

      setUser(updatedUser)
      setNeedsAccountSetup(false)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      toast({
        title: "账号设置完成",
        description: "您现在可以使用所有功能",
      })

      return Promise.resolve()
    } catch (error) {
      console.error("Account setup failed:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 修改updateUser方法，确保正确调用API更新用户资料
  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          throw new Error("未找到认证令牌")
        }

        // 准备要发送到API的数据
        const profileData = {
          username: userData.username, // 添加用户名字段
          email: userData.email, // 添加邮箱字段
          phone: userData.phone,
          qq: userData.qq,
          region: userData.region,
          techStack: userData.techStack,
          bio: userData.bio,
          github: userData.github, // 直接使用github字段，不再使用githubUsername
          twitter: userData.twitter, // 直接使用twitter字段，不再使用twitterUsername
          website: userData.website,
        }

        // 调用更新资料API
        const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "更新资料失败")
        }

        // 更新本地用户状态
        const updatedUser = { ...user, ...userData }
        setUser(updatedUser)

        // 如果添加了钱包地址，清除需要钱包的标志
        if (userData.walletAddress) {
          setNeedsWalletConnection(false)
        }

        // 如果完成了账号设置，清除需要设置的标志
        if (userData.hasSetupAccount) {
          setNeedsAccountSetup(false)
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))

        return true
      } catch (error) {
        console.error("Failed to update user profile:", error)
        toast({
          title: "更新失败",
          description: error instanceof Error ? error.message : "更新个人资料时出现错误",
          variant: "destructive",
        })
        return false
      }
    }
    return false
  }

  // 添加一个新方法用于获取用户资料
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token || !user) {
        return false
      }

      const response = await fetch("https://dkynujeaxjjr.sealoshzh.site/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("获取用户资料失败")
      }

      const profileData = await response.json()

      // 更新用户信息
      const updatedUser = {
        ...user,
        walletAddress: profileData.walletAddress || user.walletAddress,
        avatar: profileData.avatar, // Add avatar field
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

      // 更新钱包连接需求状态
      if (updatedUser.walletAddress) {
        setNeedsWalletConnection(false)
      }

      return true
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      return false
    }
  }

  /**
   * 登出方法
   * 清除用户状态并断开钱包连接
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("authToken") // 清除JWT令牌

    // 如果已连接钱包，断开连接
    if (connected) {
      disconnect()
    }

    toast({
      title: "已退出登录",
      description: "您已成功退出登录",
    })
  }

  // 提供认证上下文值
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        needsWalletConnection,
        needsAccountSetup,
        login,
        register,
        logout,
        updateUser,
        completeAccountSetup,
        fetchUserProfile,
        connectWallet,
        associateWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * 自定义hook，用于访问认证上下文
 * 在组件中使用此hook可以访问用户认证状态和方法
 *
 * @returns 认证上下文
 * @throws 如果在AuthProvider外部使用则抛出错误
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

