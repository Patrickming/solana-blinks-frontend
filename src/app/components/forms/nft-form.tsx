"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Upload, Image, X, Trash2, ExternalLink } from "lucide-react"
import { Label } from "@/app/components/ui/label"
import { Slider } from "@/app/components/ui/slider"
import { toast } from "@/app/components/ui/use-toast"
import { Copy, UploadCloud } from "lucide-react"

/**
 * NFTForm 组件
 * 提供一个表单用于创建和配置新的 NFT。
 * 包含 NFT 名称、符号、描述、图片上传、版税、属性等设置。
 */

/**
 * NFT 创建表单的 Zod 验证 schema。
 * 定义了创建 NFT 所需的各个字段及其验证规则。
 */
const nftFormSchema = z.object({
  name: z.string().min(1, { message: "请输入 NFT 名称" }),
  symbol: z.string().min(1, { message: "请输入 NFT 符号" }).max(10, { message: "符号不能超过 10 个字符" }),
  description: z.string().min(1, { message: "请输入 NFT 描述" }),
  image: z.instanceof(File).nullable().optional(),
  collection: z.string().optional(),
  attributes: z.string().optional(),
  royalty: z.number().min(0).max(100, { message: "版税必须在 0 到 100 之间" }).default(5),
  sellerFeeBasisPoints: z.number().int().min(0).max(10000).default(500),
  maxSupply: z.string().optional(),
  externalUrl: z.string().url({ message: "请输入有效的外部 URL" }).optional(),
  creatorShare: z.number().min(0).max(100).default(100),
})

// 推断表单值的类型
type NftFormValues = z.infer<typeof nftFormSchema>;

/**
 * NFTForm 组件的属性接口。
 * @property {function} onSubmit - 表单成功提交时的回调函数。
 * @property {any} [form] - 可选的外部 react-hook-form 实例。
 * @property {function} [setSelectedImage] - 可选的回调函数，用于将选中的图片文件传递给父组件。
 */
interface NftFormProps {
  onSubmit: (values: NftFormValues) => void; // 明确使用推断出的类型
  form?: any; // 保持any以兼容外部传入的form实例
  setSelectedImage?: (image: File | null) => void;
}

/**
 * NFTForm 组件
 * 提供一个表单用于创建和配置新的 NFT。
 *
 * @component
 * @param {NftFormProps} props - 组件属性
 * @returns {JSX.Element} NFTForm 组件的 JSX 元素。
 */
export function NftForm({ onSubmit, form: externalForm, setSelectedImage: externalSetSelectedImage }: NftFormProps) {
  // 内部状态管理选中的图片文件
  const [selectedImageInternal, setSelectedImageInternalState] = useState<File | null>(null);
  // 文件输入元素的引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 优先使用外部传入的 setSelectedImage 函数，否则使用内部状态管理函数
  const setSelectedImageFn = externalSetSelectedImage || setSelectedImageInternalState;

  // 模拟生成 Solana 地址的函数 (仅用于预览，实际应由后端或链交互生成)
  const generateMockAddress = () => {
    const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 复制文本到剪贴板并显示提示
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "已复制",
          description: message,
        });
      })
      .catch((err) => {
        console.error("复制失败:", err); // 添加错误日志
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          variant: "destructive",
        });
      });
  };

  // 判断是否使用了外部传入的form实例
  const [isExternalForm, setIsExternalForm] = useState(!!externalForm);

  // 初始化 react-hook-form
  const form = useForm<NftFormValues>({
    resolver: zodResolver(nftFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      image: null, // 修正：默认值设为 null
      collection: "",
      attributes: "",
      royalty: 5,
      sellerFeeBasisPoints: 500,
      maxSupply: "",
      externalUrl: "",
      creatorShare: 100,
    },
    mode: isExternalForm ? "onSubmit" : "onChange", // 如果使用外部form，则在提交时验证，否则在变更时验证
  });

  // 监听外部 form 实例的变化
  useEffect(() => {
    if (externalForm) {
      setIsExternalForm(true);
    }
  }, [externalForm]);

  /**
   * 处理图片文件选择事件。
   * 当用户选择文件时，更新表单状态和预览。
   * @param {React.ChangeEvent<HTMLInputElement>} event - 文件输入变化事件。
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", file); // 设置文件对象
      setSelectedImageFn(file);
      // Optional: Preview image logic (commented out)
      // const reader = new FileReader();
      // reader.onloadend = () => {
      //   // setPreviewImage(reader.result as string);
      // };
      // reader.readAsDataURL(file);
    } else {
      form.setValue("image", null); // 修正：没有文件时设为 null
      setSelectedImageFn(null);
    }
  };

  /**
   * 移除当前选中的图片。
   * 清空表单中的图片字段和文件输入元素的值。
   */
  const removeImage = () => {
    form.setValue("image", null); // 修正：移除图片时设为 null
    setSelectedImageFn(null);
    // 清空文件输入元素的值，以便用户可以重新选择相同的文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 渲染表单UI
  return (
    <Form {...form}>
      {/* 将 react-hook-form 的 handleSubmit 包装 onSubmit 回调 */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>快速发 NFT</CardTitle>
            <CardDescription>在 Solana 区块链上创建您自己的 NFT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* NFT 名称字段 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NFT 名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：My Awesome NFT" {...field} />
                  </FormControl>
                  <FormDescription>您的 NFT 的名称</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NFT 描述字段 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NFT 描述 *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="描述您的 NFT" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>详细描述您的 NFT</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NFT 图片上传字段 */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => { // 确保 field 参数存在
                  // 使用 form.watch 获取实时值用于预览，因为 field.value 可能有延迟
                  const watchedImage = form.watch("image");
                  return (
                      <FormItem>
                          <FormLabel>图片 *</FormLabel>
                          <FormControl>
                              <div className="flex flex-col items-center gap-4">
                                  {/* 图片预览和移除按钮 */}
                                  {watchedImage instanceof File ? (
                                      <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border-2 border-dashed border-primary/50 bg-muted">
                                          <img
                                              src={URL.createObjectURL(watchedImage)} // 使用 watch 到的值
                                              alt="NFT Preview"
                                              className="h-full w-full object-cover"
                                          />
                                          <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="absolute top-2 right-2 bg-background/80 rounded-full h-8 w-8 p-0"
                                              onClick={(e) => {
                                                  e.stopPropagation(); // 阻止事件冒泡
                                                  removeImage(); // 调用移除图片函数
                                              }}
                                          >
                                              <X className="h-4 w-4" />
                                              <span className="sr-only">移除图片</span>
                                          </Button>
                                      </div>
                                  ) : (
                                      // 图片占位符/上传提示
                                      <div className="flex flex-col items-center justify-center w-full aspect-square max-w-[200px] rounded-lg border-2 border-dashed border-primary/50 bg-muted p-4">
                                          <Image className="h-10 w-10 text-muted-foreground mb-2" />
                                          <p className="text-sm text-muted-foreground text-center">点击选择图片或拖放图片到此处</p>
                                      </div>
                                  )}
                                  {/* 文件选择和移除按钮组 */}
                                  <div className="flex gap-2">
                                      <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => {
                                              // 触发隐藏的文件输入点击事件
                                              fileInputRef.current?.click();
                                          }}
                                          className="flex items-center gap-2"
                                      >
                                          <Upload className="h-4 w-4" />
                                          选择文件
                                      </Button>
                                      {/* 仅在选中图片时显示移除按钮 */}
                                      {watchedImage instanceof File && (
                                          <Button
                                              type="button"
                                              variant="ghost"
                                              onClick={removeImage}
                                              className="flex items-center gap-2 text-destructive"
                                          >
                                              <Trash2 className="h-4 w-4" />
                                              移除
                                          </Button>
                                      )}
                                  </div>
                                  {/* 隐藏的文件输入元素 */}
                                  <input
                                      type="file"
                                      ref={fileInputRef}
                                      className="hidden"
                                      accept="image/*" // 限制只接受图片文件
                                      // 直接将 file 对象传递给 field.onChange (react-hook-form v7+ 处理)
                                      // onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                                      onChange={handleImageChange} // 继续使用自定义处理程序
                                  />
                              </div>
                          </FormControl>
                          <FormDescription>NFT 图片 (支持 PNG、JPG、GIF 等格式)</FormDescription>
                          <FormMessage /> {/* 显示验证错误信息 */}
                      </FormItem>
                  );
              }}
            />

            {/* 最大供应量字段 */}
            <FormField
              control={form.control}
              name="maxSupply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>最大供应量（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="留空表示单个NFT，输入数字表示系列" {...field} />
                  </FormControl>
                  <FormDescription>如果创建NFT系列，请设置最大供应量</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NFT 符号字段 */}
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>符号 *</FormLabel> {/* 标记为必需，与schema对齐 */} 
                  <FormControl>
                    <Input placeholder="例如：MYNFT" {...field} />
                  </FormControl>
                  <FormDescription>NFT的简短符号标识（1-10个字符）</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 外部 URL 字段 */}
            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>外部URL（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：https://myproject.com" {...field} />
                  </FormControl>
                  <FormDescription>链接到与此 NFT 相关的外部网站</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 创作者份额/版税字段 */}
            <FormField
              control={form.control}
              name="creatorShare" // 注意：这里字段名是 creatorShare, Label 指的是版税，Description 指的是份额，需确认统一
              render={({ field }) => ( // 确保 field 参数存在
                <FormItem>
                  {/* 动态显示当前选择的百分比 */}
                  <FormLabel>创作者版税: {field.value ?? 0}%</FormLabel> {/* 处理 null/undefined */}
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1} // 步长设为1，允许更精细的调整
                      defaultValue={[field.value ?? 0]} // 提供默认值以防 field.value 是 null/undefined
                      // 将滑块的值更新到表单状态
                      onValueChange={(vals) => field.onChange(vals[0])}
                      aria-label="创作者版税滑块"
                    />
                  </FormControl>
                  <FormDescription>设置创作者在二次销售中获得的版税百分比 (0-100%)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TODO: 添加 NFT 属性 (Attributes) 字段 */}
            {/*
            <FormField
              control={form.control}
              name="attributes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>属性 (可选)</FormLabel>
                  <FormControl>
                    <Textarea placeholder='例如: [{"trait_type": "Color", "value": "Blue"}, {"trait_type": "Rarity", "value": "Rare"}]' {...field} />
                  </FormControl>
                  <FormDescription>以 JSON 格式定义 NFT 的属性</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}

            {/* TODO: 添加 NFT 集合 (Collection) 字段 */}
            {/*
            <FormField
              control={form.control}
              name="collection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>集合 (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder="输入集合的铸造地址" {...field} />
                  </FormControl>
                  <FormDescription>将此 NFT 添加到现有集合中</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            */}

          </CardContent>

          {/* 预览生成信息区域 */}
          <div className="mt-6 space-y-4 border-t pt-4 px-6 pb-6"> {/* 调整内边距 */}
            <h3 className="text-lg font-medium">预览生成信息 (模拟)</h3>
            <p className="text-sm text-muted-foreground">
              以下地址为模拟生成，仅用于预览效果。实际地址将在链上创建 NFT 后生成。
            </p>

            {/* 模拟 Solana NFT 信息卡片 */}
            <div className="rounded-lg border bg-muted/30 overflow-hidden">
              {/* 卡片头部 */}
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-3 border-b">
                <h4 className="font-medium flex items-center">
                  {/* Solana Cloud Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
                    <line x1="8" y1="16" x2="8.01" y2="16"></line>
                    <line x1="8" y1="20" x2="8.01" y2="20"></line>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    <line x1="12" y1="22" x2="12.01" y2="22"></line>
                    <line x1="16" y1="16" x2="16.01" y2="16"></line>
                    <line x1="16" y1="20" x2="16.01" y2="20"></line>
                  </svg>
                  模拟 Solana NFT 信息
                </h4>
              </div>

              {/* 卡片内容 - 模拟地址 */}
              <div className="p-4 space-y-4">
                {/* NFT 铸造地址 (模拟) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">NFT 铸造地址</Label>
                    {/* 复制按钮 */}
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => copyToClipboard(generateMockAddress(), "模拟 NFT 铸造地址已复制")}
                      >
                        <Copy className="h-4 w-4 mr-1" /> {/* 使用 Lucide Copy 图标 */}
                        复制
                      </Button>
                    </div>
                  </div>
                  {/* 地址输入框 (只读) */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Image className="h-4 w-4 text-muted-foreground" /> {/* 使用 Lucide Image 图标 */}
                    </div>
                    <Input readOnly value={generateMockAddress()} className="font-mono text-xs pl-10 bg-muted/50" />
                  </div>
                </div>

                {/* 元数据地址 (模拟) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">元数据地址</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => copyToClipboard(generateMockAddress(), "模拟元数据地址已复制")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        复制
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                       {/* FileText Icon for Metadata */}
                       <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <Input readOnly value={generateMockAddress()} className="font-mono text-xs pl-10 bg-muted/50" />
                  </div>
                </div>

                {/* 主版本/集合地址 (模拟) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">主版本地址</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => copyToClipboard(generateMockAddress(), "模拟主版本地址已复制")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        复制
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      {/* Package Icon for Master Edition/Collection */}
                       <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    </div>
                    <Input readOnly value={generateMockAddress()} className="font-mono text-xs pl-10 bg-muted/50" />
                  </div>
                </div>

                {/* 区块链浏览器链接 (模拟) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">区块链浏览器</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        // 在新标签页中打开 Solana Explorer (使用模拟地址)
                        onClick={() =>
                          window.open(`https://explorer.solana.com/address/${generateMockAddress()}?cluster=devnet`, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-1" /> {/* 使用 Lucide ExternalLink 图标 */}
                        查看 (Devnet)
                      </Button>
                    </div>
                  </div>
                  {/* 浏览器链接输入框 (只读) */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      {/* Globe Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                    </div>
                    <Input
                      readOnly
                      value={`https://explorer.solana.com/address/${generateMockAddress()}?cluster=devnet`}
                      className="font-mono text-xs pl-10 bg-muted/50"
                    />
                  </div>
                </div>
              </div>

              {/* 卡片底部 - 其他信息 */}
              <div className="bg-muted/30 p-3 border-t">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* 网络信息 */}
                  <div>
                    <span className="text-muted-foreground">网络:</span>
                    {/* 假设部署到 Devnet */}
                    <span className="ml-2 inline-flex items-center text-blue-500">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-1 animate-pulse"></span>
                      Devnet
                    </span>
                  </div>
                  {/* 预估铸造费用 */}
                  <div>
                    <span className="text-muted-foreground">预估铸造费:</span>
                    <span className="ml-2">~0.01 SOL</span> {/* 实际费用可能不同 */}
                  </div>
                  {/* 版税显示 */}
                  <div>
                    <span className="text-muted-foreground">版税:</span>
                    {/* 从表单状态动态获取版税值 */}
                    <span className="ml-2">{form?.getValues("creatorShare") ?? 0}%</span>
                  </div>
                  {/* NFT 标准 */}
                  <div>
                    <span className="text-muted-foreground">标准:</span>
                    <span className="ml-2">Metaplex Token Metadata</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 表单底部 - 提交按钮 */}
          <CardFooter>
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white">
              <UploadCloud className="mr-2 h-4 w-4" /> {/* 使用 Lucide UploadCloud 图标 */}
              创建 NFT (模拟) {/* 强调这是模拟操作 */}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

