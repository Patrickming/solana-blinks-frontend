"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

/**
 * 语言上下文类型
 * 定义了语言相关的状态和方法
 */
type LanguageContextType = {
  currentLanguage: string // 当前语言
  setLanguage: (lang: string) => void // 设置语言的方法
  t: (key: string) => string // 翻译文本的方法
}

/**
 * 翻译数据
 * 包含不同语言的翻译键值对
 */
const translations = {
  en: {
    // 导航
    "nav.home": "Home",
    "nav.blink": "Create Blink",
    "nav.showcase": "Showcase",
    "nav.profile": "Profile",
    "nav.tutorials": "Tutorials",
    "nav.forum": "Community",
    "nav.settings": "Settings",

    // 认证
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.signUp": "Sign Up",
    "auth.signIn": "Sign In",

    // 钱包
    "wallet.connect": "Connect Wallet",
    "wallet.disconnect": "Disconnect",
    "wallet.balance": "Balance",
    "wallet.copy": "Copy Address",
    "wallet.copied": "Copied!",

    // 设置
    "settings.title": "Settings",
    "settings.description": "Manage your account settings and preferences",
    "settings.profile": "Profile",
    "settings.account": "Account",
    "settings.appearance": "Appearance",
    "settings.language": "Language",
    "settings.notifications": "Notifications",
    "settings.security": "Security",
    "settings.theme": "Theme",
    "settings.save": "Save Changes",
    "settings.cancel": "Cancel",
    "settings.languageSelect": "Select Language",
    "settings.english": "English",
    "settings.chinese": "Chinese",
    "settings.japanese": "Japanese",
    "settings.korean": "Korean",
    "settings.russian": "Russian",
    "settings.spanish": "Spanish",
    "settings.themeSelect": "Select Theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",

    // 搜索
    "search.placeholder": "Search...",
    "search.noResults": "No results found",
    "search.clear": "Clear search",

    // 主题
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",

    // 教程页面
    "tutorials.title": "Tutorials & Documentation",
    "tutorials.description": "Learn how to use Solana Blinks with our comprehensive guides",
    "tutorials.tabs.guides": "Guides",
    "tutorials.tabs.videos": "Video Tutorials",
    "tutorials.tabs.faq": "FAQ",

    // 教程 - 指南
    "tutorials.guides.gettingStarted.title": "Getting Started with Blinks",
    "tutorials.guides.gettingStarted.description": "Learn the basics of creating and using Solana Blinks",
    "tutorials.guides.gettingStarted.whatAreBlinks.question": "What are Solana Blinks?",
    "tutorials.guides.gettingStarted.whatAreBlinks.answer1":
      "Solana Blinks are shareable links that encapsulate blockchain operations on the Solana network. They allow users to create pre-configured transactions that can be executed with a single click.",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCases": "Blinks can be used for various purposes, such as:",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase1": "Token swaps between any Solana tokens",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase2": "NFT purchases",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase3": "Token transfers",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase4": "Multi-step transactions",
    "tutorials.guides.gettingStarted.whatAreBlinks.answer2":
      "The main advantage of Blinks is that they simplify complex blockchain operations into shareable links that anyone can use, even without deep technical knowledge.",

    "tutorials.guides.gettingStarted.creatingFirstBlink.question": "Creating Your First Blink",
    "tutorials.guides.gettingStarted.creatingFirstBlink.intro": "To create your first Blink, follow these steps:",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step1": "Navigate to the Blink Creator page",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step2": "Select a template (Token Swap or Buy NFT)",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step3": "Fill in the required parameters",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step4": 'Click "Generate Blink"',
    "tutorials.guides.gettingStarted.creatingFirstBlink.step5": "Copy or share the generated link",
    "tutorials.guides.gettingStarted.creatingFirstBlink.conclusion":
      "When someone clicks your Blink link, they'll be presented with a simple interface to execute the transaction you've configured. All they need is a connected Solana wallet with sufficient funds.",

    "tutorials.guides.gettingStarted.advancedSettings.question": "Advanced Blink Settings",
    "tutorials.guides.gettingStarted.advancedSettings.intro":
      "Blinks support several advanced settings to customize your transactions:",
    "tutorials.guides.gettingStarted.advancedSettings.tokenSwapsTitle": "For Token Swaps:",
    "tutorials.guides.gettingStarted.advancedSettings.slippageLabel": "Slippage Tolerance:",
    "tutorials.guides.gettingStarted.advancedSettings.slippageDesc":
      "Maximum acceptable price change during transaction execution",
    "tutorials.guides.gettingStarted.advancedSettings.deadlineLabel": "Deadline:",
    "tutorials.guides.gettingStarted.advancedSettings.deadlineDesc": "Time limit for the transaction to be executed",
    "tutorials.guides.gettingStarted.advancedSettings.recipientLabel": "Recipient:",
    "tutorials.guides.gettingStarted.advancedSettings.recipientDesc":
      "Optional address to receive the swapped tokens (defaults to the executor's address)",
    "tutorials.guides.gettingStarted.advancedSettings.nftPurchasesTitle": "For NFT Purchases:",
    "tutorials.guides.gettingStarted.advancedSettings.maxPriceLabel": "Maximum Price:",
    "tutorials.guides.gettingStarted.advancedSettings.maxPriceDesc": "Maximum price you're willing to pay",
    "tutorials.guides.gettingStarted.advancedSettings.nftRecipientLabel": "Recipient:",
    "tutorials.guides.gettingStarted.advancedSettings.nftRecipientDesc":
      "Optional address to receive the NFT (defaults to the executor's address)",
    "tutorials.guides.gettingStarted.advancedSettings.conclusion":
      "These settings help ensure that transactions execute according to your expectations, even in volatile market conditions.",

    "tutorials.guides.technicalDocs.title": "Technical Documentation",
    "tutorials.guides.technicalDocs.description": "Detailed technical information for developers",
    "tutorials.guides.technicalDocs.urlStructure.question": "Blink URL Structure",
    "tutorials.guides.technicalDocs.urlStructure.intro":
      "Blink URLs follow a specific structure that encodes transaction parameters:",
    "tutorials.guides.technicalDocs.urlStructure.example": "For example, a token swap Blink might look like:",
    "tutorials.guides.technicalDocs.urlStructure.conclusion":
      "Parameters are encoded in the URL path and query string, making Blinks easy to share and parse.",

    "tutorials.guides.technicalDocs.dappIntegration.question": "Integration with dApps",
    "tutorials.guides.technicalDocs.dappIntegration.intro":
      "You can integrate Blinks into your decentralized applications using our JavaScript SDK:",
    "tutorials.guides.technicalDocs.dappIntegration.conclusion":
      "The SDK also provides methods for executing Blinks programmatically and listening for transaction events.",

    "tutorials.guides.technicalDocs.security.question": "Security Considerations",
    "tutorials.guides.technicalDocs.security.intro":
      "When working with Blinks, keep these security considerations in mind:",
    "tutorials.guides.technicalDocs.security.point1":
      "All Blink transactions require explicit wallet approval from the user",
    "tutorials.guides.technicalDocs.security.point2": "Blinks never store or transmit private keys",
    "tutorials.guides.technicalDocs.security.point3": "Parameters in Blink URLs are visible to anyone with the link",
    "tutorials.guides.technicalDocs.security.point4":
      "For sensitive transactions, consider using expiring Blinks with short deadlines",
    "tutorials.guides.technicalDocs.security.point5":
      "Always verify transaction details in your wallet before approving",
    "tutorials.guides.technicalDocs.security.conclusion":
      "Our platform uses secure, audited smart contracts for all operations, but users should always exercise caution when executing blockchain transactions.",

    // 教程 - 视频
    "tutorials.videos.intro.title": "Introduction to Solana Blinks",
    "tutorials.videos.intro.description": "A comprehensive overview of the Blinks platform",
    "tutorials.videos.intro.content":
      "This video covers the basics of Solana Blinks, including platform overview, key features, and use cases. Duration: 5:32",

    "tutorials.videos.tokenSwap.title": "Creating Token Swap Blinks",
    "tutorials.videos.tokenSwap.description": "Step-by-step guide to creating swap links",
    "tutorials.videos.tokenSwap.content":
      "Learn how to create token swap Blinks with advanced options like slippage tolerance and deadlines. Duration: 7:15",

    "tutorials.videos.nftPurchase.title": "NFT Purchase Blinks Tutorial",
    "tutorials.videos.nftPurchase.description": "How to create and share NFT purchase links",
    "tutorials.videos.nftPurchase.content":
      "This tutorial shows how to create Blinks for NFT purchases, including collection verification and price limits. Duration: 6:48",

    "tutorials.videos.developer.title": "Developer Integration Guide",
    "tutorials.videos.developer.description": "Technical walkthrough for developers",
    "tutorials.videos.developer.content":
      "Advanced tutorial for developers looking to integrate Blinks into their applications using our SDK. Duration: 12:20",

    // 教程 - FAQ
    "tutorials.faq.title": "Frequently Asked Questions",
    "tutorials.faq.description": "Common questions about Solana Blinks",

    "tutorials.faq.questions.free.question": "Are Blinks free to use?",
    "tutorials.faq.questions.free.answer":
      "Yes, creating and sharing Blinks is completely free. Users executing Blinks will only pay the standard Solana network transaction fees, which are typically less than $0.01.",

    "tutorials.faq.questions.expire.question": "Do Blinks expire?",
    "tutorials.faq.questions.expire.answer":
      "By default, Blinks do not expire and can be used indefinitely. However, when creating a Blink, you can set a deadline parameter for token swaps, after which the transaction will not execute unless regenerated.",

    "tutorials.faq.questions.cancel.question": "Can I cancel a Blink after creating it?",
    "tutorials.faq.questions.cancel.answer":
      "Once a Blink is created, it cannot be directly canceled or deleted. However, since all transactions require wallet approval, no one can execute your Blink without explicit permission. If you've shared a Blink that you no longer want used, we recommend creating a new one with updated parameters.",

    "tutorials.faq.questions.wallets.question": "Which wallets are supported?",
    "tutorials.faq.questions.wallets.answer": "Solana Blinks supports all major Solana wallets, including:",
    "tutorials.faq.questions.wallets.more": "And more...",

    "tutorials.faq.questions.limit.question": "Is there a limit to how many Blinks I can create?",
    "tutorials.faq.questions.limit.answer":
      "There is no limit to the number of Blinks you can create. Create as many as you need for your various use cases and projects.",

    "tutorials.faq.questions.security.question": "How secure are Blinks?",
    "tutorials.faq.questions.security.answer":
      "Blinks are designed with security as a priority. All transactions require explicit wallet approval, and no private keys or sensitive information are ever stored or transmitted. Our smart contracts have been audited by leading security firms, and we employ multiple layers of protection to ensure the safety of all operations.",

    // 教程 - 反馈
    "tutorials.feedback.title": "Feedback",
    "tutorials.feedback.description": "Help us improve our tutorials and documentation",
    "tutorials.feedback.placeholder": "Share your thoughts, suggestions, or report issues...",
    "tutorials.feedback.submit": "Submit Feedback",

    // 反馈消息
    "feedback.emptyTitle": "Empty Feedback",
    "feedback.emptyDescription": "Please enter your feedback before submitting",
    "feedback.successTitle": "Feedback Submitted",
    "feedback.successDescription": "Thank you for your feedback!",

    // 社区页面
    "forum.title": "Community Forum",
    "forum.description": "Join discussions, share experiences, and get help from the Solana Blinks community",

    // 社区 - 搜索
    "forum.search.placeholder": "Search topics...",
    "forum.search.noResults": "No topics found matching your search.",
    "forum.search.clear": "Clear search",

    // 社区 - 新话题
    "forum.newTopic.button": "New Topic",
    "forum.newTopic.title": "Create New Topic",
    "forum.newTopic.description": "Share your thoughts, questions, or showcase your Blinks with the community",

    // 社区 - 新话题表单
    "forum.newTopic.form.titleLabel": "Title",
    "forum.newTopic.form.titlePlaceholder": "Enter a descriptive title",
    "forum.newTopic.form.categoryLabel": "Category",
    "forum.newTopic.form.categoryPlaceholder": "Select a category",
    "forum.newTopic.form.contentLabel": "Content",
    "forum.newTopic.form.contentPlaceholder": "Share your thoughts, questions, or experiences...",
    "forum.newTopic.form.cancelButton": "Cancel",
    "forum.newTopic.form.submitButton": "Post Topic",

    // 社区 - 标签页
    "forum.tabs.all": "All Topics",
    "forum.tabs.discussion": "Discussion",
    "forum.tabs.help": "Help",
    "forum.tabs.showcase": "Showcase",
    "forum.tabs.announcement": "Announcements",

    // 社区 - 类别
    "forum.categories.discussion": "Discussion",
    "forum.categories.help": "Help & Support",
    "forum.categories.showcase": "Showcase",
    "forum.categories.feedback": "Feedback",
    "forum.categories.announcement": "Announcement",

    // 社区 - 徽章
    "forum.badges.hot": "Hot",
    "forum.badges.official": "Official",

    // 社区 - 操作
    "forum.actions.share": "Share",

    // 社区 - 验证和成功消息
    "forum.validation.title": "Validation Error",
    "forum.validation.description": "Please fill in all required fields",
    "forum.success.title": "Topic Created",
    "forum.success.description": "Your topic has been successfully posted to the forum",

    // 社区 - 话题示例
    "forum.topics.tokenSwap.title": "Best practices for token swap Blinks",
    "forum.topics.tokenSwap.content":
      "I've been experimenting with different slippage settings for token swaps. What values are you all using for different token pairs?",
    "forum.topics.tokenSwap.date": "2 days ago",

    "forum.topics.sdkAnnouncement.title": "Announcing Blinks SDK v2.0",
    "forum.topics.sdkAnnouncement.content":
      "We're excited to announce the release of Blinks SDK v2.0 with improved performance and new features.",
    "forum.topics.sdkAnnouncement.date": "1 week ago",

    "forum.topics.reactNative.title": "How to integrate Blinks with React Native?",
    "forum.topics.reactNative.content":
      "I'm building a mobile app and want to integrate Blinks. Has anyone done this with React Native?",
    "forum.topics.reactNative.date": "3 days ago",

    "forum.topics.nftCollection.title": "Showcase: NFT Collection using Blinks",
    "forum.topics.nftCollection.content":
      "Just launched my NFT collection using Blinks for purchases. Check it out and let me know what you think!",
    "forum.topics.nftCollection.date": "5 hours ago",

    // Blink创建页面
    "blink.title": "Create Blink",
    "blink.description": "All-in-one tool for creating Blinks, tokens, and NFTs",
    "blink.tabs.blink": "Create Blink",
    "blink.tabs.token": "Quick Token",
    "blink.tabs.nft": "Quick NFT",
    "blink.form.type": "Blink Type",
    "blink.form.typeDescription": "Select the type of Blink you want to create",
    "blink.form.sourceToken": "Source Token",
    "blink.form.targetToken": "Target Token",
    "blink.form.amount": "Amount",
    "blink.form.amountDescription": "Enter the amount of tokens to swap",
    "blink.form.slippage": "Slippage Tolerance",
    "blink.form.deadline": "Transaction Deadline",
    "blink.form.autoExecute": "Auto Execute",
    "blink.form.autoExecuteDescription": "Automatically execute transaction when recipient opens the link",
    "blink.form.create": "Create Blink",
    "blink.preview.title": "Blink Preview",
    "blink.preview.description": "Your Blink will look like this",
    "blink.preview.copyLink": "Copy Blink Link",
    "blink.preview.linkCopied": "Blink link copied to clipboard",
    "blink.preview.shareDescription":
      "After creating a Blink, you'll get a shareable link that recipients can use to execute this operation with one click.",

    // 案例展示页面
    "showcase.title": "Case Showcase",
    "showcase.description": "Explore real-world applications and success stories using Solana Blinks",
    "showcase.search": "Search case studies...",
    "showcase.filters": "Filters",
    "showcase.tabs.all": "All",
    "showcase.tabs.defi": "DeFi",
    "showcase.tabs.nft": "NFT",
    "showcase.tabs.dao": "DAO",
    "showcase.tabs.gaming": "Gaming",
    "showcase.noResults": "No case studies found matching your search.",
    "showcase.clearSearch": "Clear search",
    "showcase.featured": "Featured Case Study",
    "showcase.viewCase": "View Case Study",
    "showcase.share": "Share",

    // 设置页面
    "settings.title": "Settings",
    "settings.description": "Manage your account settings and preferences",
    "settings.tabs.appearance": "Appearance",
    "settings.tabs.notifications": "Notifications",
    "settings.tabs.security": "Security",
    "settings.appearance.language": "Language Settings",
    "settings.appearance.languageDescription": "Choose your preferred language",
    "settings.appearance.theme": "Theme Settings",
    "settings.appearance.themeDescription": "Choose your preferred theme",
    "settings.appearance.fontSize": "Font Size",
    "settings.appearance.fontSizeDescription": "Adjust interface font size",
    "settings.appearance.small": "Small",
    "settings.appearance.medium": "Medium",
    "settings.appearance.large": "Large",
    "settings.appearance.preview": "This is font size preview text",
    "settings.notifications.title": "Notification Settings",
    "settings.notifications.description": "Manage your notification preferences",
    "settings.notifications.enable": "Enable Notifications",
    "settings.notifications.enableDescription": "Receive all types of notifications",
    "settings.notifications.channels": "Notification Channels",
    "settings.notifications.email": "Email Notifications",
    "settings.notifications.emailDescription": "Receive notifications via email",
    "settings.notifications.types": "Notification Types",
    "settings.notifications.system": "System Notifications",
    "settings.notifications.systemDescription": "Receive system maintenance and security alerts",
    "settings.security.password": "Password Settings",
    "settings.security.passwordDescription": "Change your account password",
    "settings.security.currentPassword": "Current Password",
    "settings.security.newPassword": "New Password",
    "settings.security.confirmPassword": "Confirm New Password",
    "settings.security.privacy": "Privacy Settings",
    "settings.security.privacyDescription": "Manage your privacy preferences",
    "settings.security.publicProfile": "Public Profile",
    "settings.security.publicProfileDescription": "Allow other users to view your profile",
    "settings.security.showActivity": "Show Activity Status",
    "settings.security.showActivityDescription": "Show your online status to other users",
    "settings.save": "Save Settings",
    "settings.saving": "Saving...",
    "settings.saveSuccess": "Settings Saved",
    "settings.saveSuccessDescription": "Your settings have been successfully saved",
  },
  zh: {
    // 导航
    "nav.home": "首页",
    "nav.blink": "创建Blink",
    "nav.showcase": "案例展示",
    "nav.profile": "个人资料",
    "nav.tutorials": "教程",
    "nav.forum": "社区",
    "nav.settings": "设置",

    // 认证
    "auth.login": "登录",
    "auth.register": "注册",
    "auth.logout": "退出登录",
    "auth.email": "邮箱",
    "auth.password": "密码",
    "auth.forgotPassword": "忘记密码？",
    "auth.noAccount": "没有账号？",
    "auth.hasAccount": "已有账号？",
    "auth.signUp": "注册",
    "auth.signIn": "登录",

    // 钱包
    "wallet.connect": "连接钱包",
    "wallet.disconnect": "断开连接",
    "wallet.balance": "余额",
    "wallet.copy": "复制地址",
    "wallet.copied": "已复制！",

    // 设置
    "settings.title": "设置",
    "settings.description": "管理您的账户设置和偏好",
    "settings.profile": "个人资料",
    "settings.account": "账户",
    "settings.appearance": "外观",
    "settings.language": "语言",
    "settings.notifications": "通知",
    "settings.security": "安全",
    "settings.theme": "主题",
    "settings.save": "保存更改",
    "settings.cancel": "取消",
    "settings.languageSelect": "选择语言",
    "settings.english": "英文",
    "settings.chinese": "中文",
    "settings.japanese": "日文",
    "settings.korean": "韩文",
    "settings.russian": "俄文",
    "settings.spanish": "西班牙文",
    "settings.themeSelect": "选择主题",
    "settings.light": "浅色",
    "settings.dark": "深色",
    "settings.system": "跟随系统",

    // 搜索
    "search.placeholder": "搜索...",
    "search.noResults": "未找到结果",
    "search.clear": "清除搜索",

    // 主题
    "theme.light": "浅色",
    "theme.dark": "深色",
    "theme.system": "跟随系统",

    // 教程页面
    "tutorials.title": "教程与文档",
    "tutorials.description": "通过我们全面的指南学习如何使用Solana Blinks",
    "tutorials.tabs.guides": "指南",
    "tutorials.tabs.videos": "视频教程",
    "tutorials.tabs.faq": "常见问题",

    // 教程 - 指南
    "tutorials.guides.gettingStarted.title": "Blinks入门",
    "tutorials.guides.gettingStarted.description": "学习创建和使用Solana Blinks的基础知识",
    "tutorials.guides.gettingStarted.whatAreBlinks.question": "什么是Solana Blinks？",
    "tutorials.guides.gettingStarted.whatAreBlinks.answer1":
      "Solana Blinks是封装了Solana网络上区块链操作的可分享链接。它们允许用户创建预配置的交易，只需一次点击即可执行。",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCases": "Blinks可用于各种用途，例如：",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase1": "任何Solana代币之间的交换",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase2": "NFT购买",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase3": "代币转账",
    "tutorials.guides.gettingStarted.whatAreBlinks.useCase4": "多步骤交易",
    "tutorials.guides.gettingStarted.whatAreBlinks.answer2":
      "Blinks的主要优势是将复杂的区块链操作简化为可分享的链接，任何人都可以使用，即使没有深厚的技术知识。",

    "tutorials.guides.gettingStarted.creatingFirstBlink.question": "创建您的第一个Blink",
    "tutorials.guides.gettingStarted.creatingFirstBlink.intro": "要创建您的第一个Blink，请按照以下步骤操作：",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step1": "导航到Blink创建页面",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step2": "选择模板（代币交换或购买NFT）",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step3": "填写必要的参数",
    "tutorials.guides.gettingStarted.creatingFirstBlink.step4": '点击"生成Blink"',
    "tutorials.guides.gettingStarted.creatingFirstBlink.step5": "复制或分享生成的链接",
    "tutorials.guides.gettingStarted.creatingFirstBlink.conclusion":
      "当有人点击您的Blink链接时，他们将看到一个简单的界面来执行您配置的交易。他们只需要连接一个有足够资金的Solana钱包。",

    "tutorials.guides.gettingStarted.advancedSettings.question": "高级Blink设置",
    "tutorials.guides.gettingStarted.advancedSettings.intro": "Blinks支持多种高级设置来自定义您的交易：",
    "tutorials.guides.gettingStarted.advancedSettings.tokenSwapsTitle": "对于代币交换：",
    "tutorials.guides.gettingStarted.advancedSettings.slippageLabel": "滑点容忍度：",
    "tutorials.guides.gettingStarted.advancedSettings.slippageDesc": "交易执行期间可接受的最大价格变化",
    "tutorials.guides.gettingStarted.advancedSettings.deadlineLabel": "截止时间：",
    "tutorials.guides.gettingStarted.advancedSettings.deadlineDesc": "交易执行的时间限制",
    "tutorials.guides.gettingStarted.advancedSettings.recipientLabel": "接收者：",
    "tutorials.guides.gettingStarted.advancedSettings.recipientDesc": "接收交换代币的可选地址（默认为执行者的地址）",
    "tutorials.guides.gettingStarted.advancedSettings.nftPurchasesTitle": "对于NFT购买：",
    "tutorials.guides.gettingStarted.advancedSettings.maxPriceLabel": "最高价格：",
    "tutorials.guides.gettingStarted.advancedSettings.maxPriceDesc": "您愿意支付的最高价格",
    "tutorials.guides.gettingStarted.advancedSettings.nftRecipientLabel": "接收者：",
    "tutorials.guides.gettingStarted.advancedSettings.nftRecipientDesc": "接收NFT的可选地址（默认为执行者的地址）",
    "tutorials.guides.gettingStarted.advancedSettings.conclusion":
      "这些设置有助于确保交易按照您的预期执行，即使在市场波动的情况下。",

    "tutorials.guides.technicalDocs.title": "技术文档",
    "tutorials.guides.technicalDocs.description": "为开发者提供的详细技术信息",
    "tutorials.guides.technicalDocs.urlStructure.question": "Blink URL结构",
    "tutorials.guides.technicalDocs.urlStructure.intro": "Blink URL遵循特定的结构，编码交易参数：",
    "tutorials.guides.technicalDocs.urlStructure.example": "例如，代币交换Blink可能看起来像：",
    "tutorials.guides.technicalDocs.urlStructure.conclusion":
      "参数在URL路径和查询字符串中编码，使Blinks易于分享和解析。",

    "tutorials.guides.technicalDocs.dappIntegration.question": "与dApps集成",
    "tutorials.guides.technicalDocs.dappIntegration.intro":
      "您可以使用我们的JavaScript SDK将Blinks集成到您的去中心化应用程序中：",
    "tutorials.guides.technicalDocs.dappIntegration.conclusion":
      "SDK还提供了以编程方式执行Blinks和监听交易事件的方法。",

    "tutorials.guides.technicalDocs.security.question": "安全考虑",
    "tutorials.guides.technicalDocs.security.intro": "使用Blinks时，请记住以下安全注意事项：",
    "tutorials.guides.technicalDocs.security.point1": "所有Blink交易都需要用户明确的钱包批准",
    "tutorials.guides.technicalDocs.security.point2": "Blinks从不存储或传输私钥",
    "tutorials.guides.technicalDocs.security.point3": "Blink URL中的参数对拥有链接的任何人都是可见的",
    "tutorials.guides.technicalDocs.security.point4": "对于敏感交易，请考虑使用具有短期截止时间的过期Blinks",
    "tutorials.guides.technicalDocs.security.point5": "在批准之前，始终验证钱包中的交易详情",
    "tutorials.guides.technicalDocs.security.conclusion":
      "我们的平台为所有操作使用安全的、经过审计的智能合约，但用户在执行区块链交易时应始终保持谨慎。",

    // 教程 - 视频
    "tutorials.videos.intro.title": "Solana Blinks简介",
    "tutorials.videos.intro.description": "Blinks平台的全面概述",
    "tutorials.videos.intro.content":
      "本视频涵盖了Solana Blinks的基础知识，包括平台概述、主要功能和使用场景。时长：5:32",

    "tutorials.videos.tokenSwap.title": "创建代币交换Blinks",
    "tutorials.videos.tokenSwap.description": "创建交换链接的分步指南",
    "tutorials.videos.tokenSwap.content": "学习如何创建具有滑点容忍度和截止时间等高级选项的代币交换Blinks。时长：7:15",

    "tutorials.videos.nftPurchase.title": "NFT购买Blinks教程",
    "tutorials.videos.nftPurchase.description": "如何创建和分享NFT购买链接",
    "tutorials.videos.nftPurchase.content":
      "本教程展示了如何创建用于NFT购买的Blinks，包括收藏验证和价格限制。时长：6:48",

    "tutorials.videos.developer.title": "开发者集成指南",
    "tutorials.videos.developer.description": "面向开发者的技术演示",
    "tutorials.videos.developer.content":
      "面向希望使用我们的SDK将Blinks集成到其应用程序中的开发者的高级教程。时长：12:20",

    // 教程 - FAQ
    "tutorials.faq.title": "常见问题",
    "tutorials.faq.description": "关于Solana Blinks的常见问题",

    "tutorials.faq.questions.free.question": "Blinks使用是否免费？",
    "tutorials.faq.questions.free.answer":
      "是的，创建和分享Blinks完全免费。执行Blinks的用户只需支付标准的Solana网络交易费用，通常不到0.01美元。",

    "tutorials.faq.questions.expire.question": "Blinks会过期吗？",
    "tutorials.faq.questions.expire.answer":
      "默认情况下，Blinks不会过期，可以无限期使用。但是，在创建Blink时，您可以为代币交换设置截止时间参数，超过该时间后，除非重新生成，否则交易将不会执行。",

    "tutorials.faq.questions.cancel.question": "创建Blink后可以取消吗？",
    "tutorials.faq.questions.cancel.answer":
      "一旦创建了Blink，就不能直接取消或删除。但是，由于所有交易都需要钱包批准，没有人可以在没有明确许可的情况下执行您的Blink。如果您分享了一个不再希望使用的Blink，我们建议创建一个具有更新参数的新Blink。",

    "tutorials.faq.questions.wallets.question": "支持哪些钱包？",
    "tutorials.faq.questions.wallets.answer": "Solana Blinks支持所有主要的Solana钱包，包括：",
    "tutorials.faq.questions.wallets.more": "以及更多...",

    "tutorials.faq.questions.limit.question": "我可以创建的Blinks数量有限制吗？",
    "tutorials.faq.questions.limit.answer":
      "创建Blinks的数量没有限制。您可以根据各种用例和项目的需要创建任意数量的Blinks。",

    "tutorials.faq.questions.security.question": "Blinks的安全性如何？",
    "tutorials.faq.questions.security.answer":
      "Blinks的设计将安全性作为优先考虑因素。所有交易都需要明确的钱包批准，并且从不存储或传输私钥或敏感信息。我们的智能合约已经过领先安全公司的审计，我们采用多层保护来确保所有操作的安全。",

    // 教程 - 反馈
    "tutorials.feedback.title": "反馈",
    "tutorials.feedback.description": "帮助我们改进教程和文档",
    "tutorials.feedback.placeholder": "分享您的想法、建议或报告问题...",
    "tutorials.feedback.submit": "提交反馈",

    // 反馈消息
    "feedback.emptyTitle": "空反馈",
    "feedback.emptyDescription": "请在提交前输入您的反馈",
    "feedback.successTitle": "反馈已提交",
    "feedback.successDescription": "感谢您的反馈！",

    // 社区页面
    "forum.title": "社区论坛",
    "forum.description": "加入讨论，分享经验，从Solana Blinks社区获取帮助",

    // 社区 - 搜索
    "forum.search.placeholder": "搜索话题...",
    "forum.search.noResults": "未找到与您搜索匹配的话题。",
    "forum.search.clear": "清除搜索",

    // 社区 - 新话题
    "forum.newTopic.button": "新话题",
    "forum.newTopic.title": "创建新话题",
    "forum.newTopic.description": "与社区分享您的想法、问题或展示您的Blinks",

    // 社区 - 新话题表单
    "forum.newTopic.form.titleLabel": "标题",
    "forum.newTopic.form.titlePlaceholder": "输入描述性标题",
    "forum.newTopic.form.categoryLabel": "类别",
    "forum.newTopic.form.categoryPlaceholder": "选择类别",
    "forum.newTopic.form.contentLabel": "内容",
    "forum.newTopic.form.contentPlaceholder": "分享您的想法、问题或经验...",
    "forum.newTopic.form.cancelButton": "取消",
    "forum.newTopic.form.submitButton": "发布话题",

    // 社区 - 标签页
    "forum.tabs.all": "所有话题",
    "forum.tabs.discussion": "讨论",
    "forum.tabs.help": "帮助",
    "forum.tabs.showcase": "展示",
    "forum.tabs.announcement": "公告",

    // 社区 - 类别
    "forum.categories.discussion": "讨论",
    "forum.categories.help": "帮助与支持",
    "forum.categories.showcase": "展示",
    "forum.categories.feedback": "反馈",
    "forum.categories.announcement": "公告",

    // 社区 - 徽章
    "forum.badges.hot": "热门",
    "forum.badges.official": "官方",

    // 社区 - 操作
    "forum.actions.share": "分享",

    // 社区 - 验证和成功消息
    "forum.validation.title": "验证错误",
    "forum.validation.description": "请填写所有必填字段",
    "forum.success.title": "话题已创建",
    "forum.success.description": "您的话题已成功发布到论坛",

    // 社区 - 话题示例
    "forum.topics.tokenSwap.title": "代币交换Blinks的最佳实践",
    "forum.topics.tokenSwap.content": "我一直在尝试不同的代币交换滑点设置。大家对不同代币对使用什么值？",
    "forum.topics.tokenSwap.date": "2天前",

    "forum.topics.sdkAnnouncement.title": "宣布Blinks SDK v2.0发布",
    "forum.topics.sdkAnnouncement.content": "我们很高兴宣布Blinks SDK v2.0发布，具有改进的性能和新功能。",
    "forum.topics.sdkAnnouncement.date": "1周前",

    "forum.topics.reactNative.title": "如何将Blinks与React Native集成？",
    "forum.topics.reactNative.content": "我正在构建一个移动应用程序，想要集成Blinks。有人用React Native做过这个吗？",
    "forum.topics.reactNative.date": "3天前",

    "forum.topics.nftCollection.title": "展示：使用Blinks的NFT收藏",
    "forum.topics.nftCollection.content": "刚刚使用Blinks推出了我的NFT收藏用于购买。看看并告诉我你的想法！",
    "forum.topics.nftCollection.date": "5小时前",

    // Blink创建页面
    "blink.title": "创建Blink",
    "blink.description": "创建Blinks、代币和NFT的一体化工具",
    "blink.tabs.blink": "创建Blink",
    "blink.tabs.token": "快速代币",
    "blink.tabs.nft": "快速NFT",
    "blink.form.type": "Blink类型",
    "blink.form.typeDescription": "选择您要创建的Blink类型",
    "blink.form.sourceToken": "源代币",
    "blink.form.targetToken": "目标代币",
    "blink.form.amount": "金额",
    "blink.form.amountDescription": "输入要交换的代币金额",
    "blink.form.slippage": "滑点容忍度",
    "blink.form.deadline": "交易截止时间",
    "blink.form.autoExecute": "自动执行",
    "blink.form.autoExecuteDescription": "当接收者打开链接时自动执行交易",
    "blink.form.create": "创建Blink",
    "blink.preview.title": "Blink预览",
    "blink.preview.description": "您的Blink将如下所示",
    "blink.preview.copyLink": "复制Blink链接",
    "blink.preview.linkCopied": "Blink链接已复制到剪贴板",
    "blink.preview.shareDescription": "创建Blink后，您将获得一个可共享的链接，接收者可以使用该链接一键执行此操作。",

    // 案例展示页面
    "showcase.title": "案例展示",
    "showcase.description": "探索使用Solana Blinks的真实应用和成功案例",
    "showcase.search": "搜索案例研究...",
    "showcase.filters": "过滤器",
    "showcase.tabs.all": "全部",
    "showcase.tabs.defi": "DeFi",
    "showcase.tabs.nft": "NFT",
    "showcase.tabs.dao": "DAO",
    "showcase.tabs.gaming": "游戏",
    "showcase.noResults": "未找到与您搜索匹配的案例研究。",
    "showcase.clearSearch": "清除搜索",
    "showcase.featured": "特色案例研究",
    "showcase.viewCase": "查看案例研究",
    "showcase.share": "分享",

    // 设置页面
    "settings.title": "设置",
    "settings.description": "管理您的账户设置和偏好",
    "settings.tabs.appearance": "外观",
    "settings.tabs.notifications": "通知",
    "settings.tabs.security": "安全",
    "settings.appearance.language": "语言设置",
    "settings.appearance.languageDescription": "选择您的首选语言",
    "settings.appearance.theme": "主题设置",
    "settings.appearance.themeDescription": "选择您的首选主题",
    "settings.appearance.fontSize": "字体大小",
    "settings.appearance.fontSizeDescription": "调整界面字体大小",
    "settings.appearance.small": "小",
    "settings.appearance.medium": "中",
    "settings.appearance.large": "大",
    "settings.appearance.preview": "这是字体大小预览文本",
    "settings.notifications.title": "通知设置",
    "settings.notifications.description": "管理您的通知偏好",
    "settings.notifications.enable": "启用通知",
    "settings.notifications.enableDescription": "接收所有类型的通知",
    "settings.notifications.channels": "通知渠道",
    "settings.notifications.email": "电子邮件通知",
    "settings.notifications.emailDescription": "通过电子邮件接收通知",
    "settings.notifications.types": "通知类型",
    "settings.notifications.system": "系统通知",
    "settings.notifications.systemDescription": "接收系统维护和安全警报",
    "settings.security.password": "密码设置",
    "settings.security.passwordDescription": "更改您的账户密码",
    "settings.security.currentPassword": "当前密码",
    "settings.security.newPassword": "新密码",
    "settings.security.confirmPassword": "确认新密码",
    "settings.security.privacy": "隐私设置",
    "settings.security.privacyDescription": "管理您的隐私偏好",
    "settings.security.publicProfile": "公开个人资料",
    "settings.security.publicProfileDescription": "允许其他用户查看您的个人资料",
    "settings.security.showActivity": "显示活动状态",
    "settings.security.showActivityDescription": "向其他用户显示您的在线状态",
    "settings.save": "保存设置",
    "settings.saving": "正在保存...",
    "settings.saveSuccess": "设置已保存",
    "settings.saveSuccessDescription": "您的设置已成功保存",

    // 添加通用的是/否翻译
    "common.yes": "是",
    "common.no": "否",

    // 添加 Blink 表单相关的翻译
    "blink.form.typeSelect": "选择Blink类型",
    "blink.form.typeTokenSwap": "代币交换",
    "blink.form.typeBuyNft": "购买NFT",
    "blink.form.typeStaking": "质押",
    "blink.form.typeTipping": "打赏",
    "blink.form.typeCustom": "自定义",
    "blink.form.selectSourceToken": "选择源代币",
    "blink.form.selectTargetToken": "选择目标代币",
    "blink.form.amountPlaceholder": "输入交换金额",
    "blink.form.slippageDescription": "设置交易滑点容忍度百分比",
    "blink.form.deadlineDescription": "设置交易的有效时间",
    "blink.form.minutes": "分钟",

    // 添加 Blink 预览相关的翻译
    "blink.preview.sourceToken": "源代币",
    "blink.preview.targetToken": "目标代币",
    "blink.copied": "已复制",
    "blink.copyFailed": "复制失败",
    "blink.copyFailedDescription": "无法复制到剪贴板",
    "blink.success": "Blink已创建",
    "blink.successDescription": "您的Blink已成功创建",

    // 添加代币和NFT相关的翻译
    "token.success": "代币已创建",
    "token.successDescription": "您的代币已成功创建",
    "token.previewPlaceholder": "代币预览将在这里显示",
    "nft.success": "NFT已创建",
    "nft.successDescription": "您的NFT已成功创建",
    "nft.previewPlaceholder": "NFT预览将在这里显示",

    // Blink开发中提示
    "blink.comingSoon": "功能开发中",
    "blink.typeInDevelopment": "此Blink类型正在开发中，暂不可用。",
    "blink.tryTokenSwap": "请尝试使用代币交换类型的Blink，该功能已完全实现。",

    // 代币表单新增字段
    "token.advancedSettings": "高级设置",
    "token.initialDistribution": "初始分配",
    "token.initialDistributionDescription": "代币创建后的初始分配方式",
    "token.tokenType": "代币类型",
    "token.tokenTypeDescription": "代币的功能类型",
    "token.transferFee": "转账费率",
    "token.transferFeeDescription": "每次转账收取的费用百分比（0表示无费用）",
    "token.previewInfo": "预览生成信息",
    "token.address": "代币地址",
    "token.explorer": "区块链浏览器",
    "token.copied": "已复制",
    "token.copyFailed": "复制失败",

    // NFT表单新增字段
    "nft.maxSupply": "最大供应量",
    "nft.maxSupplyDescription": "如果创建NFT系列，请设置最大供应量",
    "nft.symbol": "符号",
    "nft.symbolDescription": "NFT的简短符号标识",
    "nft.externalUrl": "外部URL",
    "nft.externalUrlDescription": "NFT相关的外部网站",
    "nft.creatorShare": "创作者份额",
    "nft.creatorShareDescription": "创作者在二次销售中获得的份额百分比",
    "nft.previewInfo": "预览生成信息",
    "nft.mintAddress": "NFT铸造地址",
    "nft.metadataAddress": "元数据地址",
    "nft.explorer": "区块链浏览器",
  },
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "zh", // 默认为中文
  setLanguage: () => {},
  t: () => "",
})

/**
 * 获取翻译的辅助函数
 * 根据语言和键名获取对应的翻译文本
 *
 * @param translations - 翻译数据
 * @param key - 翻译键名
 * @param language - 语言
 * @returns 翻译文本
 */
const getTranslation = (translations: any, key: string, language: string): string => {
  // 首先尝试获取指定语言的翻译
  const langTranslations = translations[language as keyof typeof translations] || translations.zh

  // 如果找到了翻译，返回它
  if ((langTranslations as any)[key]) {
    return (langTranslations as any)[key]
  }

  // 如果没有找到翻译，返回键名
  return key
}

/**
 * 翻译函数
 * 根据键名和语言获取翻译文本
 *
 * @param key - 翻译键名
 * @param language - 语言
 * @returns 翻译文本
 */
const t = (key: string, language: string): string => {
  // 获取当前语言的翻译
  return getTranslation(translations, key, language)
}

/**
 * 语言提供者组件
 * 管理应用的语言设置和翻译功能
 *
 * @param children - 子组件
 * @returns 包含语言上下文的提供者组件
 */
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState("zh") // 默认为中文

  /**
   * 从本地存储加载语言设置
   * 并设置HTML的lang属性
   */
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }

    // 设置HTML的lang属性
    document.documentElement.lang = currentLanguage
  }, [currentLanguage])

  /**
   * 设置语言方法
   * 更新当前语言并保存到本地存储
   *
   * @param lang - 要设置的语言
   */
  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang)
    // 保存到本地存储
    localStorage.setItem("language", lang)
    // 更新HTML的lang属性
    document.documentElement.lang = lang
  }

  /**
   * 翻译文本方法
   * 根据键名获取当前语言的翻译文本
   *
   * @param key - 翻译键名
   * @returns 翻译文本
   */
  const translateText = (key: string): string => {
    // 获取当前语言的翻译
    const langTranslations = translations[currentLanguage as keyof typeof translations] || translations.zh

    // 返回翻译，如果没有找到则返回键名
    return (langTranslations as any)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t: translateText }}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * 自定义hook，用于访问语言上下文
 *
 * @returns 语言上下文
 */
export const useLanguage = () => useContext(LanguageContext)

