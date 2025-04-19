// 导入 clsx 库中的 ClassValue 类型和 clsx 函数，用于灵活处理 CSS 类名数组或对象
import { type ClassValue, clsx } from "clsx"
// 导入 tailwind-merge 库中的 twMerge 函数，用于合并 Tailwind CSS 类并解决冲突
import { twMerge } from "tailwind-merge"

/**
 * `cn` (类名 Class Names 的缩写) - 一个工具函数，用于优雅地合并 CSS 类名。
 *
 * 该函数结合了 `clsx` 和 `tailwind-merge` 两个库的功能：
 * 1. `clsx`: 允许你以多种方式传入类名，包括字符串、对象（用于条件类名）和数组。
 *    它会将这些输入转换成一个单一的类名字符串。
 *    例如: `clsx('base', { active: true, hidden: false }, ['extra', 'styles'])` 会输出 `'base active extra styles'`。
 * 2. `tailwind-merge`: 接收一个类名字符串 (通常是 `clsx` 的输出)，并智能地合并 Tailwind CSS 类。
 *    它会解决冲突的 Tailwind 类（例如，`px-2` 和 `px-4` 同时存在时，它会保留最后一个 `px-4`），
 *    并移除冗余的类（例如，`p-2` 和 `px-2 py-2`）。
 *
 * 这个组合使得在 React 组件中动态构建和管理复杂的 Tailwind 类名变得非常方便和健壮。
 *
 * @param {...ClassValue} inputs - 一个或多个参数，可以是：
 *   - 字符串: `'my-class'`
 *   - 对象: `{ 'conditional-class': someCondition, 'another-one': isActive }`
 *   - 数组: `['array-class', { 'nested-conditional': true }]`
 *   - 或以上类型的任意组合和嵌套。
 * @returns {string} 返回一个经过处理、合并优化后的最终 CSS 类名字符串。
 * @example
 * const isActive = true;
 * const hasError = false;
 * const classes = cn(
 *   "font-semibold", // 基础类
 *   "p-4",           // 基础类
 *   { "bg-blue-500 text-white": isActive }, // 条件类对象
 *   hasError ? "border border-red-500" : "border-transparent", // 条件类字符串
 *   ["m-2", isActive && "rounded-lg"] // 数组包含字符串和条件字符串
 * );
 * // 如果 isActive 为 true, hasError 为 false，则 classes 可能输出类似:
 * // "font-semibold p-4 bg-blue-500 text-white border-transparent m-2 rounded-lg"
 * // (tailwind-merge 会进一步优化，例如如果 m-2 与 p-4 冲突，则保留后面的)
 */
export function cn(...inputs: ClassValue[]): string {
  // 首先使用 clsx 处理所有输入，生成一个初步的类名字符串
  // 然后将结果传递给 twMerge 进行 Tailwind 类合并和优化
  return twMerge(clsx(inputs))
}

/**
 * `fetchApi` - 发起 API 请求的通用工具函数
 *
 * 该函数封装了 `fetch` 调用，提供了：
 * - 默认的 JSON 请求头 (`Content-Type: application/json`)。
 * - 自动从 localStorage 获取 authToken 并添加到 `Authorization` 请求头 (如果存在)。
 * - 对非 OK 响应 (状态码 >= 400) 进行错误处理，尝试解析 JSON 错误体。
 * - 对空响应 (例如 204 No Content) 的处理。
 * - 将错误信息记录到控制台。
 *
 * @template T 预期的响应数据类型。
 * @param {string} url API 端点 URL。
 * @param {RequestInit} [options={}] 可选的 fetch 配置项 (例如 method, body 等)。
 * @returns {Promise<T>} 返回一个 Promise，解析为 JSON 响应数据。
 * @throws {Error} 如果网络响应不 OK 或 JSON 解析失败，则抛出错误。
 */
export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  // 使用 Headers 对象来构建请求头
  const headers = new Headers(options.headers);

  // 设置默认 Content-Type (如果 options.headers 中没有设置)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 尝试从 localStorage 获取认证令牌并添加
  const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers: headers, // 直接使用 Headers 对象
  };

  // 如果请求体是对象且 Content-Type 是 JSON，则自动序列化
  if (config.body && typeof config.body === 'object' && 
      headers.get('Content-Type') === 'application/json') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage += ` - ${errorBody.message || JSON.stringify(errorBody)}`;
      } catch (e) {
        errorMessage += ` - ${response.statusText}`;
      }
      // 如果是 401 或 403 错误，可以考虑在这里触发全局登出逻辑，或者让调用者处理
      // if (response.status === 401 || response.status === 403) { ... }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
      return null as T;
    }

    return await response.json() as T;
  } catch (error) {
    console.error('API Fetch Error:', url, config.method || 'GET', error); // 记录更多信息
    throw error;
  }
}

