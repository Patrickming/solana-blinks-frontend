/**
 * `AVAILABLE_TOKENS` - 可用的代币列表
 *
 * 这个常量数组定义了在应用程序中可供选择或交互的代币列表。
 * 通常用于代币选择下拉菜单、表单或其他需要显示代币选项的 UI 组件。
 *
 * 每个代币对象包含:
 * - `value`: 代币的唯一标识符。这通常是代币的 Mint 地址 (在 Solana 上) 或其标准符号。
 *   具体使用哪种标识符取决于应用程序的后端或智能合约交互方式。
 *   **重要:** 这里的 `value` 需要与应用程序处理代币逻辑时使用的标识符严格一致。
 * - `label`: 用户界面上显示的代币名称或描述，通常包含名称和符号，便于用户识别。
 *
 * @type {{value: string, label: string}[]}
 */
export const AVAILABLE_TOKENS = [
  { value: "SOL", label: "Solana (SOL)" }, // Solana 原生代币
  { value: "USDC", label: "USD Coin (USDC)" }, // USDC 稳定币 (示例使用符号)
  { value: "BONK", label: "Bonk (BONK)" }, // 社区代币示例
  { value: "JTO", label: "Jito (JTO)" }, // 流动性质押代币示例
  { value: "WIF", label: "Dogwifhat (WIF)" }, // Meme 代币示例
  { value: "PYTH", label: "Pyth Network (PYTH)" }, // 预言机代币示例
  // 可以根据需要添加更多代币，确保 value 与实际标识符匹配
];

/**
 * `AVAILABLE_CURRENCIES` - 可用的支付货币列表
 *
 * 这个常量数组定义了在特定场景下（例如 NFT 购买、服务支付等）可接受的货币。
 * 通常它会是 `AVAILABLE_TOKENS` 的一个子集，主要包含 SOL 和广泛接受的稳定币。
 *
 * 结构与 `AVAILABLE_TOKENS` 相同:
 * - `value`: 货币的唯一标识符 (符号或 Mint 地址)。
 * - `label`: 用户界面上显示的货币名称。
 *
 * @type {{value: string, label: string}[]}
 */
export const AVAILABLE_CURRENCIES = [
  { value: "SOL", label: "Solana (SOL)" }, // 通常接受 SOL
  { value: "USDC", label: "USD Coin (USDC)" }, // 通常接受主要的稳定币
  // 根据应用需求添加其他可接受的支付货币
];

/**
 * `SUPPORTED_WALLETS` - 支持的钱包列表
 *
 * 这个常量数组定义了应用程序明确支持并集成了适配器的 Solana 钱包列表。
 * 主要用于在 UI 中向用户展示可以选择哪些钱包进行连接，或者在文档中列出支持范围。
 *
 * 每个钱包对象包含:
 * - `name`: 钱包的名称。 **重要:** 这个名称应该与 `wallet-context.tsx` 中
 *   `SolanaWalletProvider` 的 `wallets` 数组中实例化的钱包适配器的 `.name` 属性完全匹配。
 *   例如，`new PhantomWalletAdapter().name` 返回 'Phantom'。
 * - `logo`: 指向钱包官方 Logo 图片的 URL，用于在 UI 中显示钱包图标。
 *
 * @type {{name: string, logo: string}[]}
 */
export const SUPPORTED_WALLETS = [
  {
    name: "Phantom", // 必须与 PhantomWalletAdapter 的 name 匹配
    logo: "https://phantom.app/img/logo_transparent.png", // 更新为透明背景 Logo URL (示例)
  },
  {
    name: "Solflare", // 必须与 SolflareWalletAdapter 的 name 匹配
    logo: "https://solflare.com/assets/logo-white-alpha.svg", // 更新为更清晰的 Logo URL (示例)
  },
  // 如果在 wallet-context.tsx 中添加了新的钱包适配器，例如 Torus:
  // { name: "Torus", logo: "<torus_logo_url>" },
  // 确保这里的 name 与 new TorusWalletAdapter().name 匹配。
];

