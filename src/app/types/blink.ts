// 定义Blink类型
export interface Blink {
  id: string
  type: BlinkType
  createdAt: Date
  updatedAt: Date
  creatorAddress: string
  data: BlinkData
}

// Blink类型枚举
export type BlinkType = "token-swap" | "buy-nft" | "staking" | "custom" | "tipping"

// Blink数据联合类型
export type BlinkData = TokenSwapData | BuyNftData | StakingData | CustomData | TippingData

// 代币交换数据
export interface TokenSwapData {
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  deadline: number
  autoExecute: boolean
}

// NFT购买数据
export interface BuyNftData {
  collectionAddress: string
  nftId: string
  price: string
  currency: string
  expiryDate?: string
  message?: string
}

// 质押数据
export interface StakingData {
  token: string
  amount: string
  period: number
  expectedYield?: string
  poolAddress: string
  autoCompound: boolean
}

// 自定义交易数据
export interface CustomData {
  name: string
  description?: string
  instructions: string
  parameters?: string
  requiresApproval: boolean
}

// 打赏数据
export interface TippingData {
  recipientAddress: string
  token: string
  suggestedAmounts: string[]
  customAmount: boolean
  message?: string
}

// 代币类型
export interface Token {
  value: string
  label: string
}

// NFT类型
export interface NFT {
  name: string
  description: string
  image: File | null
  collection?: string
  attributes?: string
  royalty: number
  sellerFeeBasisPoints: number
}

