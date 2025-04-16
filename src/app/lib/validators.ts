import { z } from "zod"

/**
 * Blink 创建表单的 Zod Schema
 * 定义了不同 Blink 类型（代币交换、购买 NFT、质押、自定义、打赏）及其各自所需的字段和验证规则。
 * 使用 Zod 进行强类型验证，确保表单数据的有效性。
 */
export const blinkFormSchema = z.object({
  // Blink 类型，必须是枚举中定义的值之一
  type: z.enum(["token-swap", "buy-nft", "staking", "custom", "tipping"], { required_error: "请选择 Blink 类型" }),
  
  // 代币交换类型的特定字段
  tokenSwap: z.object({
    fromToken: z.string().min(1, { message: "请选择源代币" }), // 源代币地址或标识符
    toToken: z.string().min(1, { message: "请选择目标代币" }), // 目标代币地址或标识符
    amount: z.string().min(1, { message: "请输入交换金额" }), // 交换的数量（字符串类型，以便处理大数或精度）
    slippage: z.number().min(0.1, { message: "滑点必须至少为 0.1%" }).max(5, { message: "滑点不能超过 5%" }).default(0.5), // 滑点容忍度（百分比）
    deadline: z.number().min(1, { message: "截止时间必须至少为 1 分钟" }).max(60, { message: "截止时间不能超过 60 分钟" }).default(5), // 交易截止时间（分钟）
    autoExecute: z.boolean().default(false), // 是否在接收者打开链接时自动执行交易
  }).optional(), // 设为可选，因为只有当 type 为 'token-swap' 时才需要

  // 购买 NFT 类型的特定字段
  buyNft: z.object({
    collectionAddress: z.string().min(1, { message: "请输入 NFT 集合地址" }), // NFT 集合的地址
    nftId: z.string().min(1, { message: "请输入 NFT ID 或 Mint 地址" }), // NFT 的唯一标识符或 Mint 地址
    price: z.string().min(1, { message: "请输入最高购买价格" }), // 用户愿意支付的最高价格
    currency: z.string().min(1, { message: "请选择支付货币" }), // 支付货币的地址或标识符
    expiryDate: z.string().datetime({ message: "请输入有效的截止日期和时间" }).optional(), // Blink 的可选失效日期
    message: z.string().max(280, { message: "消息不能超过 280 个字符" }).optional(), // 附加的可选消息
  }).optional(),

  // 质押类型的特定字段
  staking: z.object({
    token: z.string().min(1, { message: "请选择要质押的代币" }), // 质押代币的地址或标识符
    amount: z.string().min(1, { message: "请输入质押金额" }), // 质押数量
    period: z.number().min(1, { message: "请输入质押期限（天）" }).default(30), // 质押期限（例如，天数）
    expectedYield: z.string().optional(), // 预期的年化收益率 (APR/APY) (可选，仅供显示)
    poolAddress: z.string().min(1, { message: "请输入质押池地址" }), // 质押池的合约地址
    autoCompound: z.boolean().default(false), // 是否自动复投收益
  }).optional(),

  // 自定义交易类型的特定字段
  custom: z.object({
    name: z.string().min(1, { message: "请输入交易名称" }), // 自定义交易的名称
    description: z.string().optional(), // 交易描述 (可选)
    instructions: z.string().min(1, { message: "请输入交易指令或数据" }), // 交易指令或序列化数据
    parameters: z.string().optional(), // 其他参数 (例如 JSON 字符串) (可选)
    requiresApproval: z.boolean().default(true), // 是否需要用户钱包明确批准 (通常为 true)
  }).optional(),

  // 打赏类型的特定字段
  tipping: z.object({
    recipientAddress: z.string().min(1, { message: "请输入接收者地址" }), // 接收打赏的地址
    token: z.string().min(1, { message: "请选择打赏代币" }), // 打赏代币的地址或标识符
    suggestedAmounts: z.array(z.string().min(1)).min(1, { message: "至少需要一个建议金额" }).default(["1", "5", "10"]), // 建议的打赏金额列表
    customAmount: z.boolean().default(true), // 是否允许用户输入自定义金额
    message: z.string().max(280, { message: "消息不能超过 280 个字符" }).optional(), // 附加消息 (可选)
    baseAmount: z.string().optional(), // 基础金额 (可选，用于计算倍数等)
    imageUrl: z.string().url({ message: "请输入有效的图片 URL" }).optional(), // 显示的图片 URL (可选)
    title: z.string().max(100, { message: "标题不能超过 100 个字符" }).optional(), // Blink 标题 (可选)
    description: z.string().max(500, { message: "描述不能超过 500 个字符" }).optional(), // Blink 描述 (可选)
    allowAnonymous: z.boolean().optional(), // 是否允许匿名打赏 (可选)
    showLeaderboard: z.boolean().optional(), // 是否显示打赏排行榜 (可选)
  }).optional(),
})

/**
 * 代币创建表单的 Zod Schema
 * 定义了创建新 SPL 代币所需的字段和验证规则。
 */
export const tokenFormSchema = z.object({
  name: z.string().min(1, { message: "请输入代币名称" }), // 代币全名
  symbol: z.string().min(1, { message: "请输入代币符号" }).max(10, { message: "符号不能超过 10 个字符" }), // 代币简称/符号
  totalSupply: z.string().min(1, { message: "请输入总供应量" }), // 代币总供应量 (字符串处理大数)
  decimals: z.number().int({ message: "小数位数必须是整数" }).min(0).max(18, { message: "小数位数不能超过 18" }).default(9), // 代币精度的小数位数
  mintAuthority: z.string().optional(), // 铸币权限地址 (可选，默认为用户钱包)
  freezeAuthority: z.boolean().default(false), // 是否允许冻结账户
  // 代币元数据
  metadata: z.object({
    description: z.string().optional(), // 代币描述 (可选)
    image: z.string().url({ message: "请输入有效的图片 URL" }).optional(), // 代币图标 URL (可选)
    externalUrl: z.string().url({ message: "请输入有效的外部链接 URL" }).optional(), // 外部链接，例如项目网站 (可选)
  }).optional(),
})

/**
 * NFT 创建表单的 Zod Schema
 * 定义了创建新 NFT 所需的字段和验证规则。
 * 注意： image 字段使用 z.any()，因为文件上传通常在客户端处理，这里只做存在性检查，具体验证（如文件类型、大小）应在表单处理逻辑中进行。
 */
export const nftFormSchema = z.object({
  name: z.string().min(1, { message: "请输入 NFT 名称" }), // NFT 名称
  description: z.string().min(1, { message: "请输入 NFT 描述" }), // NFT 描述
  image: z.any().refine((file) => file instanceof File, { message: "请上传图片文件" }), // NFT 图片文件 (期望 File 对象)
  collection: z.string().optional(), // 所属集合的地址或名称 (可选)
  attributes: z.string().optional(), // NFT 属性 (通常是 JSON 字符串) (可选)
  royalty: z.number().min(0).max(100, { message: "版税必须在 0 到 100 之间" }).default(5), // 创作者版税百分比
  // Solana Metaplex 标准使用 sellerFeeBasisPoints (万分比)
  sellerFeeBasisPoints: z.number().int().min(0).max(10000, { message: "销售费基点必须在 0 到 10000 之间" }).default(500), // 销售费基点 (例如 500 表示 5%)
})

