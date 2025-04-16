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

## 主要模块与首页构成

本应用主要包含以下核心功能模块及首页：

### 1. Blink 创建模块

此模块负责让用户创建、配置和预览 Solana Blinks（可执行操作链接）、SPL 代币和 NFT。

*   **页面路由**: `src/app/blink/page.tsx`
*   **核心组件**:
    *   `src/app/components/blink/blink-creator-wrapper.tsx`: Blink 创建页面的顶层包装器。
    *   `src/app/components/blink/blink-creator.tsx`: 包含创建 Blink、代币、NFT 的 Tab 切换和主要逻辑。
    *   `src/app/components/forms/blink-form.tsx`: 创建 Blink 的具体表单。
    *   `src/app/components/forms/token-form.tsx`: "快速代币" 创建表单。
    *   `src/app/components/forms/nft-form.tsx`: "快速NFT" 创建表单。
    *   `src/app/components/blink/blink-preview.tsx`: 用于实时预览生成的 Blink。

### 2. 教程模块

提供关于 Solana Blinks 的使用指南、视频教程和常见问题解答。

*   **页面路由**: `src/app/tutorials/page.tsx`
*   **核心组件**:
    *   `src/app/components/pages/tutorials-content.tsx`: 教程页面的主内容区域，包含 Tab 切换（指南、视频、FAQ）、内容展示和反馈功能。

### 3. 案例展示模块

展示 Solana Blinks 的实际应用案例和成功故事。

*   **页面路由**:
    *   `src/app/showcase/page.tsx` (列表页)
    *   `src/app/showcase/[id]/page.tsx` (详情页 - 动态路由)
*   **核心组件**:
    *   `src/app/components/pages/showcase-content.tsx`: 案例展示页面的主内容，包含搜索、筛选、案例卡片列表和特色案例详情。

### 4. 社区论坛模块

提供用户交流、提问、分享经验的平台。

*   **页面路由**:
    *   `src/app/forum/page.tsx` (主论坛页)
    *   `src/app/forum/[id]/page.tsx` (话题详情页 - 动态路由)
*   **核心组件**:
    *   `src/app/components/pages/forum-content.tsx`: 论坛主页面的内容，包含话题列表、分类、搜索和创建新话题的功能。
    *   `src/app/components/pages/topic-detail-client.tsx`: 话题详情页的客户端组件，负责获取和展示话题内容及评论 (由 `src/app/forum/[id]/page.tsx` 加载)。

### 5. 首页

应用的入口页面，通常包含项目介绍、核心功能入口等。

*   **页面路由**: `src/app/page.tsx`
*   **核心组件**:
    *   `src/app/components/home/home-content-wrapper.tsx`: 首页内容的顶层包装器。
    *   `src/app/components/home/home-content.tsx`: 首页的具体内容展示。

## 文件结构与功能

### 核心配置文件
- `tailwind.config.ts` - Tailwind CSS配置文件，定义了项目的颜色、字体等样式
- `src/app/globals.css` - 全局CSS样式定义，包括主题变量和自定义样式
- `src/app/layout.tsx` - 应用的根布局组件，包含全局提供者和布局结构

### 上下文提供者 (Context Providers)
- `src/app/context/wallet-context.tsx` - 钱包上下文提供者，管理钱包连接状态
- `src/app/context/sidebar-context.tsx` - 侧边栏上下文提供者，管理侧边栏开关状态
- `src/app/context/auth-context.tsx` - 认证上下文提供者，管理用户登录状态
- `src/app/context/language-context.tsx` - 语言上下文提供者，管理多语言支持

### 页面组件
- `src/app/page.tsx` - 首页
- `src/app/login/page.tsx` - 登录页面（重定向到首页）
- `src/app/register/page.tsx` - 注册页面（重定向到首页）
- `src/app/profile/page.tsx` - 个人资料页面
- `src/app/settings/page.tsx` - 设置页面
- `src/app/blink/page.tsx` - Blink创建页面
- `src/app/showcase/page.tsx` - 案例展示页面
- `src/app/showcase/[id]/page.tsx` - 案例详情页面
- `src/app/tutorials/page.tsx` - 教程页面
- `src/app/forum/page.tsx` - 社区论坛页面

### UI 基础组件 (src/app/components/ui/)
- `accordion.tsx` - 手风琴组件
- `alert-dialog.tsx` - 警告对话框组件
- `alert.tsx` - 警告提示组件
- `aspect-ratio.tsx` - 宽高比容器组件
- `avatar.tsx` - 用户头像组件
- `badge.tsx` - 徽章组件
- `breadcrumb.tsx` - 面包屑导航组件
- `button.tsx` - 按钮组件
- `calendar.tsx` - 日历选择器组件
- `card.tsx` - 卡片布局组件
- `carousel.tsx` - 轮播图组件
- `chart.tsx` - 图表组件 (基于 recharts)
- `checkbox.tsx` - 复选框组件
- `collapsible.tsx` - 可折叠内容组件
- `command.tsx` - 命令面板组件
- `context-menu.tsx` - 右键菜单组件
- `dialog.tsx` - 对话框组件
- `drawer.tsx` - 抽屉导航/内容组件
- `dropdown-menu.tsx` - 下拉菜单组件
- `form.tsx` - 表单相关的高阶组件 (基于 react-hook-form)
- `hover-card.tsx` - 悬浮卡片组件
- `input-otp.tsx` - 一次性密码输入框组件
- `input.tsx` - 输入框组件
- `label.tsx` - 表单标签组件
- `menubar.tsx` - 菜单栏组件
- `navigation-menu.tsx` - 导航菜单组件
- `pagination.tsx` - 分页组件
- `popover.tsx` - 弹出框组件
- `progress.tsx` - 进度条组件
- `radio-group.tsx` - 单选按钮组组件
- `resizable.tsx` - 可调整大小的面板组件
- `scroll-area.tsx` - 带滚动条的区域组件
- `select.tsx` - 下拉选择框组件
- `separator.tsx` - 分隔线组件
- `sheet.tsx` - 侧边弹出表单/面板组件
- `skeleton.tsx` - 骨架屏加载状态组件
- `slider.tsx` - 滑块选择器组件
- `sonner.tsx` - Toast 通知组件 (基于 sonner)
- `switch.tsx` - 开关组件
- `table.tsx` - 表格组件
- `tabs.tsx` - 标签页组件
- `textarea.tsx` - 多行文本输入框组件
- `toast.tsx` - Toast 基础组件
- `toaster.tsx` - Toast 容器组件
- `toggle-group.tsx` - 开关按钮组组件
- `toggle.tsx` - 开关按钮组件
- `tooltip.tsx` - 工具提示组件
- `use-toast.ts` / `use-toast.tsx` - Toast 钩子函数

### 布局组件
- `src/app/components/layout/site-header.tsx` - 网站头部导航栏
- `src/app/components/layout/site-header-wrapper.tsx` - 头部导航栏包装器
- `src/app/components/layout/sidebar.tsx` - 侧边栏导航
- `src/app/components/layout/main-layout.tsx` - 主布局组件
- `src/app/components/layout/help-button.tsx` - 帮助按钮组件

### 认证组件
- `src/app/components/auth/auth-dialog.tsx` - 认证对话框
- `src/app/components/auth/auth-dialog-wrapper.tsx` - 认证对话框包装器
- `src/app/components/auth/auth-required.tsx` - 需要认证的组件包装器

### 页面内容组件
- `src/app/components/home/home-content.tsx` - 首页内容
- `src/app/components/home/home-content-wrapper.tsx` - 首页内容包装器
- `src/app/components/pages/profile-content.tsx` - 个人资料页面内容
- `src/app/components/pages/profile-content-wrapper.tsx` - 个人资料内容包装器
- `src/app/components/pages/settings-content.tsx` - 设置页面内容
- `src/app/components/pages/tutorials-content.tsx` - 教程页面内容
- `src/app/components/pages/forum-content.tsx` - 社区论坛内容
- `src/app/components/pages/showcase-content.tsx` - 案例展示内容

### Blink相关组件
- `src/app/components/blink/blink-creator.tsx` - Blink创建器组件
- `src/app/components/blink/blink-creator-wrapper.tsx` - Blink创建器包装器
- `src/app/components/blink/blink-preview.tsx` - Blink预览组件
- `src/app/components/blink/blink-preview-card.tsx` - Blink预览卡片

### 表单组件
- `src/app/components/forms/blink-form.tsx` - Blink创建表单
- `src/app/components/forms/token-form.tsx` - 代币创建表单
- `src/app/components/forms/nft-form.tsx` - NFT创建表单

### 通用组件
- `src/app/components/mode-toggle.tsx` - 主题切换组件
- `src/app/components/theme-provider.tsx` - 主题提供者组件
- `src/app/components/common/recent-activity.tsx` - 最近活动组件
- `src/app/components/common/solana-logo.tsx` - Solana标志组件

### 工具和类型定义
- `src/app/lib/utils.ts` - 通用工具函数
- `src/app/lib/constants.ts` - 常量定义
- `src/app/lib/validators.ts` - 表单验证器
- `src/app/types/blink.ts` - Blink相关类型定义
- `src/app/types/wallet.ts` - 钱包相关类型定义
- `src/app/hooks/use-mobile.ts` - 移动设备检测钩子

### API路由和Blink平台特定目录
- `src/app/api/actions/` - Blink平台要求的Server Actions目录（虽为后端逻辑，但Blink规定必须在前端）
- `src/app/actions.json/` - Blink平台定义的操作配置（虽为后端结构，但按Blink规范放置在前端）

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
│   │   │           └── route.ts  # 示例：其他操作接口
│   │   │
│   │   ├── actions.json/         # Blink平台定义的操作配置目录
│   │   │   └── route.ts          # 操作配置导出
│   │   │
│   │   ├── components/           # 共享组件
│   │   │   ├── ui/               # UI 基础组件 (shadcn/ui)
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── hover-card.tsx
│   │   │   │   ├── input-otp.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── menubar.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── resizable.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── use-toast.ts
│   │   │   │   └── use-toast.tsx
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
│   │   │   ├── pages/            # 页面内容组件
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
│   └── public/                   # 静态资源（如有，Next.js 13+ 通常在 app 目录外）
│
├── public/                       # 公共静态资源
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
src/app/layout.tsx                  # 根布局，包含所有全局提供者
 ├── src/app/context/wallet-context.tsx  # 钱包连接提供者
 ├── src/app/context/auth-context.tsx    # 认证状态提供者
 ├── src/app/context/sidebar-context.tsx # 侧边栏状态提供者
 ├── src/app/context/language-context.tsx # 语言提供者
 ├── src/app/components/theme-provider.tsx # 主题提供者
 │
 └── src/app/components/layout/main-layout.tsx # 主布局
     ├── src/app/components/layout/site-header.tsx # 网站头部
     │   ├── src/app/components/mode-toggle.tsx    # 主题切换
     │   └── src/app/components/auth/auth-dialog.tsx # 认证对话框
     │
     ├── src/app/components/layout/sidebar.tsx     # 侧边栏
     │
     └── [页面内容] # 不同页面的内容，加载对应的 page.tsx
         ├── src/app/page.tsx → src/app/components/home/home-content.tsx # 首页
         ├── src/app/blink/page.tsx → src/app/components/blink/blink-creator.tsx # Blink创建
         ├── src/app/profile/page.tsx → src/app/components/pages/profile-content.tsx # 个人资料
         └── ... # 其他页面及其对应的 page.tsx 和内容组件
```

## 数据流图

```
用户操作
  │
  ▼
组件事件 (e.g., onClick, onChange)
  │
  ├──► 更新本地状态 (useState, useReducer) ──► 组件重新渲染
  │
  ├──► 调用上下文方法更新全局状态 (Context API)
  │     │
  │     ▼
  │     订阅该上下文的组件重新渲染
  │
  └──► 触发API请求 (e.g., fetch, Server Actions)
        │
        ├──► (Server Action) 后端逻辑 (app/api/actions/)
        │       │
        │       ▼
        │       与区块链交互 / 数据库操作
        │       │
        │       ▼
        │       返回结果
        │
        ├──► (Client-side Fetch) 前端请求后端API Endpoint
        │       │
        │       ▼
        │       后端处理
        │       │
        │       ▼
        │       返回数据
        │
        ▼
        根据返回结果更新状态 (本地或全局)
        │
        ▼
        UI更新以反映新数据/状态
```

## Blink平台特定说明

Solana Blinks前端项目中包含一些通常属于后端的文件夹和结构，这是因为Blink平台规范要求所有Blink行为必须遵循特定的目录结构和命名约定：

1. `src/app/actions.json/` - 这个目录是Blink平台规定的，用于定义可执行的操作（Actions）。它通常包含一个 `route.ts` 文件，该文件导出一个 JSON 对象，描述了 Blink 的元数据，如标题、图标、描述以及最重要的 `links.actions` 数组，其中定义了每个操作链接（如 SOL 捐赠）及其对应的 API 端点。

2. `src/app/api/actions/` - 这个目录包含实际执行区块链操作的 Next.js Server Actions 或 API Routes。`actions.json` 中定义的每个操作链接都会指向这个目录下的一个具体路由（例如 `src/app/api/actions/donate-sol/route.ts`）。这些路由处理 `GET` 请求（通常返回操作的基本信息）和 `POST` 请求（执行实际的交易逻辑，如构建和序列化交易）。

遵循这些约定是确保 Blink 功能（即可在支持 Blink 的平台如 Phantom 钱包中直接执行的操作链接）正常工作的必要条件，尽管它们可能与传统的前端/后端分离原则有所不同。这些特定结构使得 Blink 平台能够发现并正确解释你的应用提供的操作。

