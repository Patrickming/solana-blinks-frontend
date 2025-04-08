import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ActionError,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

// CAIP-2 格式的Solana区块链标识符
const blockchain = BLOCKCHAIN_IDS.devnet;

// 创建与Solana区块链的连接（使用Helius RPC服务）
const connection = new Connection("https://devnet.helius-rpc.com/?api-key=6e693598-a890-40f8-8777-117c3deacf51");

// 创建包含CAIP区块链ID的响应头
const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

/**
 * OPTIONS处理函数 - 用于CORS预检请求
 * 
 * 此端点对于CORS预检请求是必需的
 * 如果不添加此处理函数，Blink将无法正常渲染
 * 
 * @returns {Response} 带有CORS头的空响应
 */
export const OPTIONS = async () => {
  return new Response(null, { headers });
};

/**
 * GET处理函数 - 返回Blink元数据和UI配置
 * 
 * 提供Blink的显示信息和可用操作
 * 包括图标、标题、描述和可执行的操作列表
 * 
 * @param {Request} req - HTTP请求对象
 * @returns {Response} 包含Blink元数据的JSON响应
 */
export const GET = async (req: Request) => {
  // 获取URL参数
  const url = new URL(req.url);
  const recipient = url.searchParams.get("recipient") || "";
  const baseAmount = Number(url.searchParams.get("baseAmount") || "0.01");
  const imageUrl = url.searchParams.get("imageUrl") || "https://cryptologos.cc/logos/solana-sol-logo.png";
  const title = url.searchParams.get("title") || "捐赠 SOL";
  const description = url.searchParams.get("description") || 
    "通过此Blink向指定地址捐赠SOL代币";

  // 此JSON用于渲染Blink UI界面
  const response: ActionGetResponse = {
    type: "action",
    icon: imageUrl.startsWith("http") ? imageUrl : `${new URL(imageUrl, req.url).toString()}`,
    label: `${baseAmount} SOL`,
    title: title,
    description: description,
    // links用于定义多个操作选项或需要多个参数时使用
    links: {
      actions: [
        {
          // 定义这是一个区块链交易操作
          type: "transaction",
          label: `${baseAmount} SOL`,
          // 这是POST请求的端点URL，包含所有参数
          href: `/api/actions/donate-sol?amount=${baseAmount}&recipient=${recipient}`,
        },
        {
          type: "transaction",
          label: `${baseAmount * 5} SOL`,
          href: `/api/actions/donate-sol?amount=${baseAmount * 5}&recipient=${recipient}`,
        },
        {
          type: "transaction",
          label: `${baseAmount * 10} SOL`,
          href: `/api/actions/donate-sol?amount=${baseAmount * 10}&recipient=${recipient}`,
        },
        {
          // 自定义输入字段示例
          type: "transaction",
          href: `/api/actions/donate-sol?amount={amount}&recipient=${recipient}`,
          label: "捐赠",
          parameters: [
            {
              name: "amount",
              label: "输入自定义SOL数量",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // 返回带有适当头部的响应
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

/**
 * POST处理函数 - 处理实际交易创建
 * 
 * 根据请求参数创建Solana转账交易
 * 包括错误处理和参数验证
 * 
 * @param {Request} req - HTTP请求对象
 * @returns {Response} 包含序列化交易的JSON响应或错误信息
 */
export const POST = async (req: Request) => {
  try {
    // 步骤1: 从URL中提取参数
    const url = new URL(req.url);

    // 从URL参数中获取要转账的SOL数量和接收地址
    const amount = Number(url.searchParams.get("amount"));
    const recipient = url.searchParams.get("recipient");

    // 验证接收地址是否存在
    if (!recipient) {
      throw new Error("缺少接收地址参数");
    }

    // 验证接收地址是否有效
    try {
      new PublicKey(recipient);
    } catch (e) {
      throw new Error("接收地址格式无效");
    }

    // 从请求体中获取付款人公钥
    const request: ActionPostRequest = await req.json();
    const payer = new PublicKey(request.account);

    // 接收者是前端传入的地址
    const receiver = new PublicKey(recipient);

    // 步骤2: 准备交易
    const transaction = await prepareTransaction(
      connection,
      payer,
      receiver,
      amount
    );

    // 步骤3: 创建包含序列化交易的响应
    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
    };

    // 返回带有适当头部的响应
    return Response.json(response, { status: 200, headers });
  } catch (error) {
    // 记录并返回错误响应
    console.error("处理请求时出错:", error);

    // 错误信息
    const message =
      error instanceof Error ? error.message : "内部服务器错误";

    // 将消息包装在ActionError对象中，以便在Blink UI中显示
    const errorResponse: ActionError = {
      message,
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers,
    });
  }
};

/**
 * 准备Solana转账交易
 * 
 * 创建并配置一个Solana转账交易
 * 使用最新的区块哈希确保交易有效性
 * 
 * @param {Connection} connection - Solana网络连接
 * @param {PublicKey} payer - 付款人的公钥
 * @param {PublicKey} receiver - 接收者的公钥
 * @param {number} amount - 转账SOL数量
 * @returns {VersionedTransaction} 配置好的版本化交易
 */
const prepareTransaction = async (
  connection: Connection,
  payer: PublicKey,
  receiver: PublicKey,
  amount: number
) => {
  // 创建转账指令
  const instruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: receiver,
    lamports: amount * LAMPORTS_PER_SOL, // 将SOL转换为lamports单位
  });

  // 获取最新的区块哈希
  const { blockhash } = await connection.getLatestBlockhash();

  // 创建交易消息
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [instruction],
  }).compileToV0Message();

  // 创建并返回版本化交易
  return new VersionedTransaction(message);
}; 