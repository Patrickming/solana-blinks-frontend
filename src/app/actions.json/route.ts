import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

/**
 * GET 请求处理函数
 * 
 * 定义Solana Actions的路由规则，将请求映射到对应的API端点
 * 这是Blink功能的核心配置文件，用于路由管理
 * 
 * @returns {Response} 包含路由规则的JSON响应
 */
export const GET = async () => {
  // 定义路由规则配置
  const payload: ActionsJson = {
    rules: [
      // 将所有根级路由映射到Blink
      {
        pathPattern: "/*",
        apiPath: "/api/actions/*",
      },
      // 作为后备的幂等规则，确保API请求正确路由
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };

  // 返回带有CORS头的JSON响应
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

// 请勿忘记包含 `OPTIONS` HTTP 方法
// 这将确保CORS对Blinks正常工作
// 对于预检请求(preflight requests)是必需的
export const OPTIONS = GET; 