import { z } from "zod"

// Blink创建表单的schema
export const blinkFormSchema = z.object({
  type: z.enum(["token-swap", "buy-nft", "staking", "custom", "tipping"]),
  tokenSwap: z.object({
    fromToken: z.string().min(1, { message: "请选择源代币" }),
    toToken: z.string().min(1, { message: "请选择目标代币" }),
    amount: z.string().min(1, { message: "请输入金额" }),
    slippage: z.number().min(0.1).max(5),
    deadline: z.number().min(1).max(60),
    autoExecute: z.boolean().default(false),
  }),
  buyNft: z.object({
    collectionAddress: z.string().min(1, { message: "请输入集合地址" }),
    nftId: z.string().min(1, { message: "请输入 NFT ID" }),
    price: z.string().min(1, { message: "请输入价格" }),
    currency: z.string().min(1, { message: "请选择货币" }),
    expiryDate: z.string().optional(),
    message: z.string().optional(),
  }),
  staking: z.object({
    token: z.string().min(1, { message: "请选择质押代币" }),
    amount: z.string().min(1, { message: "请输入质押金额" }),
    period: z.number().min(1, { message: "请输入质押期限" }),
    expectedYield: z.string().optional(),
    poolAddress: z.string().min(1, { message: "请输入质押池地址" }),
    autoCompound: z.boolean().default(false),
  }),
  custom: z.object({
    name: z.string().min(1, { message: "请输入交易名称" }),
    description: z.string().optional(),
    instructions: z.string().min(1, { message: "请输入交易指令" }),
    parameters: z.string().optional(),
    requiresApproval: z.boolean().default(true),
  }),
  tipping: z.object({
    recipientAddress: z.string().min(1, { message: "请输入接收地址" }),
    token: z.string().min(1, { message: "请选择打赏代币" }),
    suggestedAmounts: z.array(z.string()).min(1, { message: "至少需要一个建议金额" }),
    customAmount: z.boolean().default(true),
    message: z.string().optional(),
    baseAmount: z.string().optional(),
    imageUrl: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    allowAnonymous: z.boolean().optional(),
    showLeaderboard: z.boolean().optional(),
  }),
})

// 代币创建表单的schema
export const tokenFormSchema = z.object({
  name: z.string().min(1, { message: "请输入代币名称" }),
  symbol: z.string().min(1, { message: "请输入代币符号" }),
  totalSupply: z.string().min(1, { message: "请输入总供应量" }),
  decimals: z.number().min(0).max(18).default(9),
  mintAuthority: z.string().optional(),
  freezeAuthority: z.boolean().default(false),
  metadata: z.object({
    description: z.string().optional(),
    image: z.string().url({ message: "请输入有效的图片 URL" }).optional(),
    externalUrl: z.string().url({ message: "请输入有效的外部 URL" }).optional(),
  }),
})

// NFT创建表单的schema
export const nftFormSchema = z.object({
  name: z.string().min(1, { message: "请输入 NFT 名称" }),
  description: z.string().min(1, { message: "请输入 NFT 描述" }),
  image: z.any(), // 接受File对象
  collection: z.string().optional(),
  attributes: z.string().optional(),
  royalty: z.number().min(0).max(100).default(5),
  sellerFeeBasisPoints: z.number().min(0).max(10000).default(500),
})

