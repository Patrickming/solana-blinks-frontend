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

