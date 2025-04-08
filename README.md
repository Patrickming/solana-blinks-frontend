# Solana Blinks

Solana Blinks 是一个基于Solana区块链的应用程序，允许用户创建和分享可执行区块链操作的链接。

## 项目结构
- **Blink创建**：创建可分享的区块链操作链接
- **代币交换**：一键完成Solana代币之间的交换
- **NFT购买**：简化NFT购买流程
- **多语言支持**：支持中文和英文界面
- **钱包集成**：支持多种Solana钱包连接
- **主题切换**：支持浅色/深色主题

## 技术栈
- **前端框架**：Next.js (App Router)
- **UI组件**：shadcn/ui + Tailwind CSS
- **状态管理**：React Context API
- **认证**：自定义认证系统 + 钱包连接
- **国际化**：自定义语言上下文
- **动画**：Framer Motion

## 文件结构与功能

### 核心配置文件
- `tailwind.config.ts` - Tailwind CSS配置文件，定义了项目的颜色、字体等样式
- `app/globals.css` - 全局CSS样式定义，包括主题变量和自定义样式
- `app/layout.tsx` - 应用的根布局组件，包含全局提供者和布局结构

### 上下文提供者 (Context Providers)
- `context/wallet-context.tsx` - 钱包上下文提供者，管理钱包连接状态
- `context/sidebar-context.tsx` - 侧边栏上下文提供者，管理侧边栏开关状态
- `context/auth-context.tsx` - 认证上下文提供者，管理用户登录状态
- `context/language-context.tsx` - 语言上下文提供者，管理多语言支持

### 页面组件
- `app/page.tsx` - 首页
- `app/login/page.tsx` - 登录页面（重定向到首页）
- `app/register/page.tsx` - 注册页面（重定向到首页）
- `app/profile/page.tsx` - 个人资料页面
- `app/settings/page.tsx` - 设置页面
- `app/blink/page.tsx` - Blink创建页面
- `app/showcase/page.tsx` - 案例展示页面
- `app/showcase/[id]/page.tsx` - 案例详情页面
- `app/tutorials/page.tsx` - 教程页面
- `app/forum/page.tsx` - 社区论坛页面

### 布局组件
- `components/layout/site-header.tsx` - 网站头部导航栏
- `components/layout/site-header-wrapper.tsx` - 头部导航栏包装器
- `components/layout/sidebar.tsx` - 侧边栏导航
- `components/layout/main-layout.tsx` - 主布局组件
- `components/layout/help-button.tsx` - 帮助按钮组件

### 认证组件
- `components/auth/auth-dialog.tsx` - 认证对话框
- `components/auth/auth-dialog-wrapper.tsx` - 认证对话框包装器
- `components/auth/auth-required.tsx` - 需要认证的组件包装器

### 页面内容组件
- `components/home/home-content.tsx` - 首页内容
- `components/home/home-content-wrapper.tsx` - 首页内容包装器
- `components/pages/profile-content.tsx` - 个人资料页面内容
- `components/pages/profile-content-wrapper.tsx` - 个人资料内容包装器
- `components/pages/settings-content.tsx` - 设置页面内容
- `components/pages/tutorials-content.tsx` - 教程页面内容
- `components/pages/forum-content.tsx` - 社区论坛内容
- `components/pages/showcase-content.tsx` - 案例展示内容

### Blink相关组件
- `components/blink/blink-creator.tsx` - Blink创建器组件
- `components/blink/blink-creator-wrapper.tsx` - Blink创建器包装器
- `components/blink/blink-preview.tsx` - Blink预览组件
- `components/blink/blink-preview-card.tsx` - Blink预览卡片

### 表单组件
- `components/forms/blink-form.tsx` - Blink创建表单
- `components/forms/token-form.tsx` - 代币创建表单
- `components/forms/nft-form.tsx` - NFT创建表单

### 通用组件
- `components/mode-toggle.tsx` - 主题切换组件
- `components/theme-provider.tsx` - 主题提供者组件
- `components/common/recent-activity.tsx` - 最近活动组件
- `components/common/solana-logo.tsx` - Solana标志组件

### 工具和类型定义
- `lib/utils.ts` - 通用工具函数
- `lib/constants.ts` - 常量定义
- `lib/validators.ts` - 表单验证器
- `types/blink.ts` - Blink相关类型定义
- `types/wallet.ts` - 钱包相关类型定义
- `hooks/use-mobile.ts` - 移动设备检测钩子

### API路由
- `app/api/blink/route.ts` - Blink API路由
- `app/api/token/route.ts` - 代币API路由
- `app/api/nft/route.ts` - NFT API路由

## 文件关系图

