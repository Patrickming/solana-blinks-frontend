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
- `app/context/wallet-context.tsx` - 钱包上下文提供者，管理钱包连接状态
- `app/context/sidebar-context.tsx` - 侧边栏上下文提供者，管理侧边栏开关状态
- `app/context/auth-context.tsx` - 认证上下文提供者，管理用户登录状态
- `app/context/language-context.tsx` - 语言上下文提供者，管理多语言支持

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
- `app/components/layout/site-header.tsx` - 网站头部导航栏
- `app/components/layout/site-header-wrapper.tsx` - 头部导航栏包装器
- `app/components/layout/sidebar.tsx` - 侧边栏导航
- `app/components/layout/main-layout.tsx` - 主布局组件
- `app/components/layout/help-button.tsx` - 帮助按钮组件

### 认证组件
- `app/components/auth/auth-dialog.tsx` - 认证对话框
- `app/components/auth/auth-dialog-wrapper.tsx` - 认证对话框包装器
- `app/components/auth/auth-required.tsx` - 需要认证的组件包装器

### 页面内容组件
- `app/components/home/home-content.tsx` - 首页内容
- `app/components/home/home-content-wrapper.tsx` - 首页内容包装器
- `app/components/pages/profile-content.tsx` - 个人资料页面内容
- `app/components/pages/profile-content-wrapper.tsx` - 个人资料内容包装器
- `app/components/pages/settings-content.tsx` - 设置页面内容
- `app/components/pages/tutorials-content.tsx` - 教程页面内容
- `app/components/pages/forum-content.tsx` - 社区论坛内容
- `app/components/pages/showcase-content.tsx` - 案例展示内容

### Blink相关组件
- `app/components/blink/blink-creator.tsx` - Blink创建器组件
- `app/components/blink/blink-creator-wrapper.tsx` - Blink创建器包装器
- `app/components/blink/blink-preview.tsx` - Blink预览组件
- `app/components/blink/blink-preview-card.tsx` - Blink预览卡片

### 表单组件
- `app/components/forms/blink-form.tsx` - Blink创建表单
- `app/components/forms/token-form.tsx` - 代币创建表单
- `app/components/forms/nft-form.tsx` - NFT创建表单

### 通用组件
- `app/components/mode-toggle.tsx` - 主题切换组件
- `app/components/theme-provider.tsx` - 主题提供者组件
- `app/components/common/recent-activity.tsx` - 最近活动组件
- `app/components/common/solana-logo.tsx` - Solana标志组件

### 工具和类型定义
- `app/lib/utils.ts` - 通用工具函数
- `app/lib/constants.ts` - 常量定义
- `app/lib/validators.ts` - 表单验证器
- `app/types/blink.ts` - Blink相关类型定义
- `app/types/wallet.ts` - 钱包相关类型定义
- `app/hooks/use-mobile.ts` - 移动设备检测钩子

### API路由和Blink平台特定目录
- `app/api/actions/` - Blink平台要求的Server Actions目录（虽为后端逻辑，但Blink规定必须在前端）
- `app/actions.json/` - Blink平台定义的操作配置（虽为后端结构，但按Blink规范放置在前端）

## 文件关系图

```
solana-blinks-frontend/
├── src/                          # 源代码目录
│   ├── app/                      # Next.js App Router 目录
│   │   ├── page.tsx              # 首页
│   │   ├── layout.tsx            # 根布局组件
│   │   ├── globals.css           # 全局样式
│   │   │
│   │   ├── api/                  # API 路由
│   │   │   └── actions/          # Blink平台要求的Server Actions目录
│   │   │       ├── donate-sol/   # SOL捐赠操作
│   │   │       │   └── route.ts  # SOL捐赠接口
│   │   │       └── other-actions/ # 其他Blink操作
│   │   │
│   │   ├── actions.json/         # Blink平台定义的操作配置目录
│   │   │   └── route.ts          # 操作配置导出
│   │   │
│   │   ├── components/           # 共享组件
│   │   │   ├── ui/               # UI 基础组件
│   │   │   │   ├── button.tsx    # 按钮组件
│   │   │   │   ├── dialog.tsx    # 对话框组件
│   │   │   │   └── ...           # 其他 UI 组件
│   │   │   │
│   │   │   ├── auth/             # 认证相关组件
│   │   │   │   ├── auth-dialog.tsx          # 认证对话框
│   │   │   │   ├── auth-dialog-wrapper.tsx  # 认证对话框包装器
│   │   │   │   └── auth-required.tsx        # 需要认证的包装器
│   │   │   │
│   │   │   ├── blink/            # Blink 相关组件
│   │   │   │   ├── blink-creator.tsx        # Blink 创建器
│   │   │   │   ├── blink-creator-wrapper.tsx # 创建器包装器
│   │   │   │   ├── blink-preview.tsx        # Blink 预览
│   │   │   │   └── blink-preview-card.tsx   # 预览卡片
│   │   │   │
│   │   │   ├── common/           # 通用组件
│   │   │   │   ├── recent-activity.tsx      # 最近活动
│   │   │   │   └── solana-logo.tsx          # Solana 标志
│   │   │   │
│   │   │   ├── forms/            # 表单组件
│   │   │   │   ├── blink-form.tsx           # Blink 表单
│   │   │   │   ├── token-form.tsx           # 代币表单
│   │   │   │   └── nft-form.tsx             # NFT 表单
│   │   │   │
│   │   │   ├── home/             # 首页组件
│   │   │   │   ├── home-content.tsx         # 首页内容
│   │   │   │   └── home-content-wrapper.tsx # 内容包装器
│   │   │   │
│   │   │   ├── layout/           # 布局组件
│   │   │   │   ├── site-header.tsx          # 网站头部
│   │   │   │   ├── site-header-wrapper.tsx  # 头部包装器
│   │   │   │   ├── sidebar.tsx              # 侧边栏
│   │   │   │   ├── main-layout.tsx          # 主布局
│   │   │   │   └── help-button.tsx          # 帮助按钮
│   │   │   │
│   │   │   ├── pages/            # 页面组件
│   │   │   │   ├── profile-content.tsx      # 个人资料内容
│   │   │   │   ├── profile-content-wrapper.tsx # 资料包装器
│   │   │   │   ├── settings-content.tsx     # 设置内容
│   │   │   │   ├── tutorials-content.tsx    # 教程内容
│   │   │   │   ├── forum-content.tsx        # 论坛内容
│   │   │   │   └── showcase-content.tsx     # 案例内容
│   │   │   │
│   │   │   ├── mode-toggle.tsx   # 主题切换组件
│   │   │   └── theme-provider.tsx # 主题提供者
│   │   │
│   │   ├── context/              # 上下文提供者
│   │   │   ├── wallet-context.tsx    # 钱包上下文
│   │   │   ├── sidebar-context.tsx   # 侧边栏上下文
│   │   │   ├── auth-context.tsx      # 认证上下文
│   │   │   └── language-context.tsx  # 语言上下文
│   │   │
│   │   ├── lib/                  # 工具库
│   │   │   ├── utils.ts          # 通用工具函数
│   │   │   ├── constants.ts      # 常量定义
│   │   │   └── validators.ts     # 表单验证器
│   │   │
│   │   ├── types/                # 类型定义
│   │   │   ├── blink.ts          # Blink 类型
│   │   │   └── wallet.ts         # 钱包类型
│   │   │
│   │   ├── hooks/                # React 钩子
│   │   │   └── use-mobile.ts     # 移动设备检测
│   │   │
│   │   ├── blink/                # Blink 页面
│   │   │   └── page.tsx          # Blink 创建页面
│   │   │
│   │   ├── login/                # 登录页面
│   │   │   └── page.tsx          # 登录页
│   │   │
│   │   ├── register/             # 注册页面
│   │   │   └── page.tsx          # 注册页
│   │   │
│   │   ├── profile/              # 个人资料页面
│   │   │   └── page.tsx          # 个人资料页
│   │   │
│   │   ├── settings/             # 设置页面
│   │   │   └── page.tsx          # 设置页
│   │   │
│   │   ├── showcase/             # 展示案例页面
│   │   │   ├── page.tsx          # 案例列表页
│   │   │   └── [id]/             # 动态路由
│   │   │       └── page.tsx      # 案例详情页
│   │   │
│   │   ├── tutorials/            # 教程页面
│   │   │   └── page.tsx          # 教程列表页
│   │   │
│   │   └── forum/                # 论坛页面
│   │       └── page.tsx          # 论坛页
│   │
│   └── public/                   # 静态资源（如有）
│
├── public/                       # 静态资源
│   ├── images/                   # 图片资源
│   │   └── logo.svg              # 项目标志
│   └── favicon.ico               # 网站图标
│
├── next.config.mjs               # Next.js 配置
├── package.json                  # 项目依赖和脚本
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.ts            # Tailwind CSS 配置
└── postcss.config.mjs            # PostCSS 配置
```

## 组件关系图

```
app/layout.tsx                  # 根布局，包含所有全局提供者
 ├── app/context/wallet-context.tsx  # 钱包连接提供者
 ├── app/context/auth-context.tsx    # 认证状态提供者
 ├── app/context/sidebar-context.tsx # 侧边栏状态提供者
 ├── app/context/language-context.tsx # 语言提供者
 ├── app/components/theme-provider.tsx # 主题提供者
 │
 └── app/components/layout/main-layout.tsx # 主布局
     ├── app/components/layout/site-header.tsx # 网站头部
     │   ├── app/components/mode-toggle.tsx    # 主题切换
     │   └── app/components/auth/auth-dialog.tsx # 认证对话框
     │
     ├── app/components/layout/sidebar.tsx     # 侧边栏
     │
     └── [页面内容] # 不同页面的内容
         ├── app/page.tsx → app/components/home/home-content.tsx # 首页
         ├── app/blink/page.tsx → app/components/blink/blink-creator.tsx # Blink创建
         ├── app/profile/page.tsx → app/components/pages/profile-content.tsx # 个人资料
         └── ... # 其他页面
```

## 数据流图

```
用户操作
  │
  ▼
组件事件
  │
  ├──► 本地状态 (useState) ──► 组件重新渲染
  │
  ├──► 上下文状态 (Context API)
  │     │
  │     ▼
  │     订阅上下文的组件重新渲染
  │
  └──► API请求
        │
        ▼
        数据获取/更新
        │
        ▼
        状态更新
        │
        ▼
        UI更新
```

## Blink平台特定说明

Solana Blinks前端项目中包含一些通常属于后端的文件夹和结构，这是因为Blink平台规范要求所有Blink行为必须遵循特定的目录结构和命名约定：

1. `app/actions.json/` - 这个目录是Blink平台规定的，用于定义可执行的操作。尽管看起来像是后端结构，但必须放在前端项目中以符合Blink平台规范。

2. `app/api/actions/` - 这个目录包含实际执行区块链操作的Server Actions。尽管这些通常应该是后端逻辑，但Blink平台要求将它们集成到前端项目中，以便于操作链接的生成和分享。

遵循这些约定是确保Blink功能正常工作的必要条件，尽管它们可能与常规的前端/后端分离原则有所不同。

