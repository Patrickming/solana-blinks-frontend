"use client"

import { useState, useEffect, useMemo } from "react"
import { Blink, useBlink } from "@dialectlabs/blinks"
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import "@dialectlabs/blinks/index.css"
import { useWallet } from "@/app/context/wallet-context"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Card } from "@/app/components/ui/card"
import { useToast } from "@/app/components/ui/use-toast"
import { useLanguage } from "@/app/context/language-context"
import { Copy } from "lucide-react"

/**
 * Blink创建器组件
 * 包含捐赠SOL的Blink创建功能
 */
export default function BlinkCreator() {
  // 表单状态
  const [recipient, setRecipient] = useState("")
  const [baseAmount, setBaseAmount] = useState("0.01")
  const [imageUrl, setImageUrl] = useState("https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png")
  const [title, setTitle] = useState("捐赠 SOL")
  const [description, setDescription] = useState("通过此Blink向指定地址捐赠SOL代币")
  
  // 是否刷新Blink的状态
  const [refreshBlink, setRefreshBlink] = useState(0)
  const { toast } = useToast()
  const { connected, publicKey } = useWallet()
  const { t } = useLanguage()

  // Solana RPC端点 - 使用Helius提供的稳定端点
  const SOLANA_RPC_URL = "https://devnet.helius-rpc.com/?api-key=6e693598-a890-40f8-8777-117c3deacf51"

  // 构建API URL，包含所有参数
  const buildBlinkUrl = () => {
    const baseUrl = window.location.origin + "/api/actions/donate-sol"
    const params = new URLSearchParams()
    if (recipient) params.append("recipient", recipient)
    if (baseAmount) params.append("baseAmount", baseAmount)
    if (imageUrl) params.append("imageUrl", imageUrl)
    if (title) params.append("title", title)
    if (description) params.append("description", description)
    
    return `${baseUrl}?${params.toString()}`
  }

  // 构建Blink页面链接，分享给他人使用
  const buildBlinkPageUrl = () => {
    const baseUrl = window.location.origin
    const params = new URLSearchParams()
    if (recipient) params.append("recipient", recipient)
    if (baseAmount) params.append("baseAmount", baseAmount)
    if (imageUrl) params.append("imageUrl", imageUrl)
    if (title) params.append("title", title)
    if (description) params.append("description", description)
    
    return `${baseUrl}?${params.toString()}`
  }

  // 复制文本到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "复制成功",
          description: `${label}已复制到剪贴板`
        })
      })
      .catch(err => {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板，请手动复制",
          variant: "destructive"
        })
        console.error("复制失败:", err)
      })
  }

  // Blink API的URL地址，用于获取交易数据
  const blinkApiUrl = recipient ? buildBlinkUrl() : ""

  // 适配器，用于连接到钱包
  const { adapter } = useBlinkSolanaWalletAdapter(
    SOLANA_RPC_URL // 使用Helius的Solana开发网络RPC地址
  )

  // 我们想要执行的Blink，通过API获取
  const { blink, isLoading, refresh } = useBlink({ 
    url: blinkApiUrl
  })

  // 当参数变化时刷新Blink
  useEffect(() => {
    if (refreshBlink > 0 && recipient) {
      refresh()
    }
  }, [refreshBlink, refresh, recipient])

  /**
   * @effect Vercel 生产环境样式修复
   * 此 effect 专门用于解决在 Vercel 生产环境中，
   * @dialectlabs/blinks 组件的某些样式可能不正确或与项目主题冲突的问题。
   * 它通过动态创建 <style> 标签并注入覆盖样式，以及使用 MutationObserver 来确保样式应用于动态加载的元素。
   *
   * 注意：这是一种针对特定部署环境的 hacky 解决方案，如果库或环境发生变化，可能需要调整。
   */
  useEffect(() => {
    // 仅在 Vercel 生产环境应用修复 (通过检查 window.location.host)
    if (typeof window !== 'undefined' && window.location.host.includes('vercel.app')) {
      // 创建一个新的 style 元素
      const style = document.createElement('style');
      // 定义需要覆盖的样式规则
      style.textContent = `
        /* 覆盖 @dialectlabs/blinks 的警告信息样式 */
        .blink-warning {
          color: #eab308 !important; /* 使用更符合警告的颜色 */
          padding: 8px !important;
          border-radius: 4px !important;
          margin: 10px 0 !important;
          background-color: rgba(234, 179, 8, 0.1) !important; /* 使用带透明度的背景 */
        }
        
        /* 覆盖 @dialectlabs/blinks 的表单确认按钮样式 */
        .blink-form-button {
          background-color: #4ade80 !important; /* 使用更醒目的绿色 */
          color: black !important; /* 确保文本可见 */
          font-weight: 500 !important;
        }
        
        /* 覆盖 @dialectlabs/blinks 的表单取消按钮样式 */
        .blink-cancel-button {
          background-color: transparent !important;
          border: 1px solid #e2e8f0 !important; /* 使用边框代替背景色 */
        }
      `;
      
      // 将 style 元素添加到文档头部
      document.head.appendChild(style);
      
      // 定义一个函数，用于手动将样式应用到已存在的元素上
      const applyStyles = () => {
        const warningElements = document.querySelectorAll('.blink-warning');
        const formButtons = document.querySelectorAll('.blink-form-button');
        const cancelButtons = document.querySelectorAll('.blink-cancel-button');
        
        // 遍历并应用警告样式
        warningElements.forEach(el => {
          (el as HTMLElement).style.color = '#eab308';
          (el as HTMLElement).style.padding = '8px';
          (el as HTMLElement).style.borderRadius = '4px';
          (el as HTMLElement).style.margin = '10px 0';
          (el as HTMLElement).style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
        });
        
        // 遍历并应用确认按钮样式
        formButtons.forEach(el => {
          (el as HTMLElement).style.backgroundColor = '#4ade80';
          (el as HTMLElement).style.color = 'black';
          (el as HTMLElement).style.fontWeight = '500';
        });
        
        // 遍历并应用取消按钮样式
        cancelButtons.forEach(el => {
          (el as HTMLElement).style.backgroundColor = 'transparent';
          (el as HTMLElement).style.border = '1px solid #e2e8f0';
        });
      };
      
      // 页面加载后立即应用一次样式
      applyStyles();
      
      // 稍后再次应用，以捕获可能延迟渲染的元素
      setTimeout(applyStyles, 500);
      setTimeout(applyStyles, 1000);
      
      // 设置 MutationObserver 来监听 DOM 变化，并对新添加或修改的元素应用样式
      const observer = new MutationObserver((mutations) => {
        let shouldApplyStyles = false;
        
        mutations.forEach(mutation => {
          // 检查是否有节点被添加
          if (mutation.addedNodes.length > 0) {
            shouldApplyStyles = true;
          }
          
          // 检查是否有相关元素的 class 属性发生变化
          if (mutation.type === 'attributes' && 
              ((mutation.target as Element).classList?.contains('blink-warning') ||
               (mutation.target as Element).classList?.contains('blink-form-button') ||
               (mutation.target as Element).classList?.contains('blink-cancel-button'))) {
            shouldApplyStyles = true;
          }
        });
        
        // 如果检测到需要应用样式，则调用 applyStyles
        if (shouldApplyStyles) {
          applyStyles();
        }
      });
      
      // 开始监听 document.body 的子节点、子树和属性变化
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'] // 只关心 class 属性的变化
      });
      
      // 清理函数：组件卸载时断开监听并移除 style 标签
      return () => {
        observer.disconnect();
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []); // 空依赖数组，确保此 effect 只运行一次

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient) {
      toast({
        title: "请输入接收地址",
        description: "接收地址是必填项",
        variant: "destructive"
      })
      return
    }
    setRefreshBlink(prev => prev + 1)
    toast({
      title: "Blink已更新",
      description: "捐赠Blink已成功更新"
    })
  }

  // 渲染UI组件
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
      {/* 左侧表单部分 */}
      <div className="space-y-6">
        <Card className="p-6 border-primary/20">
          <h2 className="text-xl font-bold mb-6">Solana 捐赠应用</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                接收地址 <span className="text-primary">*</span>
              </label>
              <Input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="输入Solana钱包地址"
                className="border-primary/20 focus:border-primary"
                required
              />
              <p className="text-xs text-muted-foreground">
                接收捐赠的Solana钱包地址
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                基础金额 (SOL)
              </label>
              <Input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                placeholder="0.01"
                step="0.001"
                min="0.001"
                className="border-primary/20 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                基础金额将乘以1、5、10作为三个捐赠选项
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                图片URL
              </label>
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="输入图片完整URL地址"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                标题
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="输入捐赠标题"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                描述
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入捐赠描述"
                rows={3}
                className="border-primary/20 focus:border-primary resize-none"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
            >
              更新Blink
            </Button>
          </form>
        </Card>

        <Card className="p-6 border-primary/20 bg-card/60">
          <h3 className="text-lg font-medium mb-4">分享链接</h3>
          
          <div className="space-y-4">
            {/* Action API 链接 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Action API 链接</h4>
              </div>
              <div className="relative">
                <div className="flex items-center">
                  <Input 
                    value={buildBlinkUrl()}
                    readOnly
                    className="pr-16 bg-muted/50 text-xs truncate"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-12 text-primary hover:text-primary/70"
                    onClick={() => copyToClipboard(buildBlinkUrl(), "Action API 链接")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">用于直接访问Blink API</p>
            </div>
            
            {/* Blink 页面链接 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Blink 页面链接</h4>
              </div>
              <div className="relative">
                <div className="flex items-center">
                  <Input 
                    value={buildBlinkPageUrl()}
                    readOnly
                    className="pr-16 bg-muted/50 text-xs truncate"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-12 text-primary hover:text-primary/70"
                    onClick={() => copyToClipboard(buildBlinkPageUrl(), "Blink 页面链接")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">可分享给他人的捐赠页面链接</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 右侧Blink交互界面 */}
      <div className="flex items-center justify-center p-6 bg-card rounded-lg border border-primary/20">
        {!connected ? (
          <div className="text-center p-6">
            <p className="text-lg font-medium mb-2">请连接钱包</p>
            <p className="text-sm text-muted-foreground mb-4">
              需要连接Solana钱包才能使用此功能
            </p>
            <Button 
              className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
              onClick={() => document.querySelector<HTMLButtonElement>('.wallet-adapter-button')?.click()}
            >
              连接钱包
            </Button>
          </div>
        ) : !recipient ? (
          <div className="text-center p-6">
            <p className="text-lg font-medium mb-2">请输入接收地址</p>
            <p className="text-sm text-muted-foreground">
              在左侧表单中填写接收地址和其他信息以创建Blink
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-primary rounded-full border-t-transparent animate-spin mb-2"></div>
            <span className="text-primary">加载中...</span>
          </div>
        ) : !blink ? (
          <div className="text-center p-6">
            <p className="text-lg font-medium mb-2">Blink加载失败</p>
            <p className="text-sm text-muted-foreground">
              请检查接收地址格式是否正确
            </p>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <Blink
              blink={blink}
              adapter={adapter}
              securityLevel="all"
              stylePreset="x-dark"
            />
          </div>
        )}
      </div>
    </div>
  )
}

