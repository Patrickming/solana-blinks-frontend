/**
 * Blink 核心接口
 * 定义了一个 Blink 对象的基本结构。
 */
export interface Blink {
  id: string; // Blink 的唯一标识符
  type: BlinkType; // Blink 的类型，决定了 data 字段的结构
  createdAt: Date; // 创建时间
  updatedAt: Date; // 最后更新时间
  creatorAddress: string; // 创建者的 Solana 地址
  data: BlinkData; // Blink 的具体数据，根据 type 不同而不同
}

/**
 * Blink 类型枚举
 * 定义了所有支持的 Blink 类型。
 */
export type BlinkType = "token-swap" | "buy-nft" | "staking" | "custom" | "tipping";

/**
 * Blink 数据联合类型
 * 表示 Blink.data 字段可以包含的各种数据结构。
 */
export type BlinkData = TokenSwapData | BuyNftData | StakingData | CustomData | TippingData;

/**
 * 代币交换 Blink 的数据结构
 */
export interface TokenSwapData {
  fromToken: string; // 源代币地址或标识符
  toToken: string; // 目标代币地址或标识符
  amount: string; // 交换数量 (字符串以处理精度)
  slippage: number; // 滑点容忍度 (百分比, 例如 0.5 代表 0.5%)
  deadline: number; // 交易有效时间 (分钟)
  autoExecute: boolean; // 是否自动执行
}

/**
 * 购买 NFT Blink 的数据结构
 */
export interface BuyNftData {
  collectionAddress: string; // NFT 集合地址
  nftId: string; // NFT ID 或 Mint 地址
  price: string; // 最高购买价格 (字符串以处理精度)
  currency: string; // 支付货币地址或标识符
  expiryDate?: string; // 失效日期 (ISO 格式字符串，可选)
  message?: string; // 附加消息 (可选)
}

/**
 * 质押 Blink 的数据结构
 */
export interface StakingData {
  token: string; // 质押代币地址或标识符
  amount: string; // 质押数量 (字符串以处理精度)
  period: number; // 质押期限 (例如，天数)
  expectedYield?: string; // 预期收益率 (显示用，可选)
  poolAddress: string; // 质押池合约地址
  autoCompound: boolean; // 是否自动复投
}

/**
 * 自定义交易 Blink 的数据结构
 */
export interface CustomData {
  name: string; // 交易名称
  description?: string; // 交易描述 (可选)
  instructions: string; // 序列化的交易指令或数据
  parameters?: string; // 其他参数 (例如 JSON 字符串，可选)
  requiresApproval: boolean; // 是否需要用户钱包批准
}

/**
 * 打赏 Blink 的数据结构
 */
export interface TippingData {
  recipientAddress: string; // 接收者地址
  token: string; // 打赏代币地址或标识符
  suggestedAmounts: string[]; // 建议金额列表
  customAmount: boolean; // 是否允许自定义金额
  message?: string; // 附加消息 (可选)
  // 可能还包含 tipping 特有的其他字段，如 baseAmount, imageUrl, title, description 等
}

/**
 * 代币信息接口 (常用于下拉选择)
 */
export interface Token {
  value: string; // 代币的内部值 (例如 Mint 地址或符号)
  label: string; // 代币的用户友好显示名称 (例如 "Solana (SOL)")
}

/**
 * NFT 创建表单的数据结构接口
 * 注意：这可能与后端或链上存储的 NFT 元数据结构略有不同，特别是 image 字段。
 */
export interface NFT {
  name: string; // NFT 名称
  description: string; // NFT 描述
  image: File | null; // NFT 图片文件对象 (用于表单上传)，或为 null
  collection?: string; // 所属集合地址或名称 (可选)
  attributes?: string; // 属性 (JSON 字符串格式，可选)
  royalty: number; // 版税百分比 (0-100)
  sellerFeeBasisPoints: number; // 销售费基点 (0-10000，例如 500 代表 5%)
}

