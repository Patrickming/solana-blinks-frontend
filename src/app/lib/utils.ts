// 导入 clsx 和 tailwind-merge 库，用于处理 CSS 类名
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 定义 cn 函数，用于条件性地合并 CSS 类名
// 这个函数结合了 clsx 的条件类名功能和 tailwind-merge 的类名合并功能
// 使用方式：cn('base-class', condition && 'conditional-class', 'another-class')
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

