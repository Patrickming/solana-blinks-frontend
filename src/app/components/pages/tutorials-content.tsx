"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import Link from 'next/link';
import { CourseCard } from "@/app/components/tutorials/course-card"; // Assume this will be created
import { useLanguage } from "@/app/context/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";
import { Textarea } from "@/app/components/ui/textarea";
import { useToast } from "@/app/components/ui/use-toast";
import {
  PlayCircle,
  FileText,
  MessageSquare,
  File,
  X,
  Check,
  AlertTriangle,
  Download,
  ExternalLink,
  Search,
  Eye,
  Calendar,
  BookOpen,
  FileCode,
  FilePlus,
  Edit,
  Upload,
  Loader2,
  UploadCloud,
  PlusCircle,
  XCircle,
  FileImage,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/app/components/ui/pagination";
import { fetchApi } from '@/lib/utils';
import { useDebounce } from '../../../hooks/use-debounce';
import path from 'path'; // 需要 path 来处理文件名
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/app/components/ui/dialog";
import { useAuth } from "@/app/context/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

// --- Data Types ---

type Author = {
  id: number;
  username: string;
  avatar: string | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
};

type Tag = {
  id: number;
  name: string;
  slug: string;
};

type TutorialDocument = {
  id: number;
  title: string;
  description: string | null;
  file_type: string | null;
  file_size: number | null;
  version: string | null;
  download_count: number;
  created_at: string;
  updated_at: string;
  author: Author;
  category: Category;
  tags: Tag[];
  file_path: string | null;
};

// API 响应类型 (用于修复类型错误)
type DocumentsApiResponse = {
  documents: TutorialDocument[];
  totalCount: number;
  totalPages: number;
};

// Type for the courses data received as prop
type Course = {
  slug: string;
  title: string;
  lessons: number;
  description?: string;
  imageUrl?: string;
  firstLessonSlug: string;
};

// --- Removed Static Course Data ---
// const courses = [ ... ]; // This is now passed as a prop

// --- Removed Static Technical Document Data ---
// const technicalDocuments = [ ... ];

/**
 * Redesigned TutorialsContent component.
 * Now receives courses data as a prop.
 */
export function TutorialsContent({ courses }: { courses: Course[] }) { // Accept courses as a prop
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("docs");
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      name: string
      size: number
      type: string
      progress: number
      status: "uploading" | "success" | "error"
      errorMessage?: string
    }>
  >([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Determine the link for the main 'Start Learning' button
  const firstCourseSlug = courses.length > 0 ? courses[0].slug : '#';
  // TODO: Ideally link to the very first lesson, e.g., /tutorials/intro-crypto-clients/lesson-1
  // const startLearningLink = `/tutorials/${firstCourseSlug}`;

  // --- Document Tab State ---
  const [documents, setDocuments] = useState<TutorialDocument[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const debouncedDocSearch = useDebounce(docSearchQuery, 500); // Debounce search input
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // Use ID for filtering
  const [selectedTag, setSelectedTag] = useState<number | null>(null); // Use ID for filtering
  const [docsPage, setDocsPage] = useState(1);
  const [docsTotalPages, setDocsTotalPages] = useState(1);
  const DOCS_LIMIT = 10; // Documents per page

  // --- Dialog State ---
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    selectedTags: [] as number[],
    version: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTagName, setNewTagName] = useState(""); // 新标签名称输入状态
  const [isCreatingTag, setIsCreatingTag] = useState(false); // 创建标签加载状态

  // --- Delete Confirmation State ---
  const [isDeleting, setIsDeleting] = useState<number | null>(null); // 存储正在删除的文档 ID

  // --- Data Fetching Callbacks ---

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      // 明确指定 fetchApi 返回类型为 Category[] 或 null
      const data = await fetchApi<Category[] | null>('/api/tutorials/categories');
      setCategories(data || []); // 如果 data 为 null，设置为空数组
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      toast({ title: "无法加载分类", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  // Fetch Tags
  const fetchTags = useCallback(async () => {
    try {
      // 明确指定 fetchApi 返回类型为 Tag[] 或 null
      const data = await fetchApi<Tag[] | null>('/api/tutorials/tags');
      setTags(data || []); // 如果 data 为 null，设置为空数组
    } catch (error: any) {
      console.error("Failed to fetch tags:", error);
      toast({ title: "无法加载标签", description: error.message, variant: "destructive" });
    }
  }, [toast]);

  // Fetch Documents
  const fetchDocuments = useCallback(async (pageToFetch: number) => {
    setIsLoadingDocs(true);
    setDocsError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', pageToFetch.toString());
      params.set('limit', DOCS_LIMIT.toString());
      if (debouncedDocSearch) params.set('search', debouncedDocSearch);
      if (selectedCategory) params.set('categoryId', selectedCategory.toString());
      if (selectedTag) params.set('tagId', selectedTag.toString());

      // 明确指定 API 返回类型
      const data = await fetchApi<DocumentsApiResponse | null>(`/api/tutorials/documents?${params.toString()}`);
      
      // 安全地访问 data 的属性
      setDocuments(data?.documents || []);
      setDocsTotalPages(data?.totalPages || 1);
      setDocsPage(pageToFetch);

    } catch (error: any) {
      console.error("Failed to fetch documents:", error);
      setDocsError(`无法加载文档: ${error.message}`);
      setDocuments([]);
      setDocsTotalPages(1);
      toast({ title: "无法加载文档", description: error.message, variant: "destructive" });
    } finally {
      setIsLoadingDocs(false);
    }
  }, [toast, debouncedDocSearch, selectedCategory, selectedTag, DOCS_LIMIT]);

  // --- Effects ---

  // Fetch initial categories and tags
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  // Fetch documents when filters, search term, or page changes
  useEffect(() => {
    fetchDocuments(docsPage);
  }, [fetchDocuments, docsPage]); // fetchDocuments dependency covers search/filters
  
  // Reset page to 1 when search or filters change
  useEffect(() => {
      if (docsPage !== 1) {
         setDocsPage(1);
      } else {
          // If already on page 1, fetch immediately
          fetchDocuments(1);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDocSearch, selectedCategory, selectedTag]); // Don't include fetchDocuments here to avoid loop

  // --- Filtering Logic ---
  
  // Filter courses (Client-side, using the passed prop)
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      (course.description &&
         course.description.toLowerCase().includes(courseSearchQuery.toLowerCase()))
  );

  // --- Event Handlers ---

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedTag(null); // Reset tag filter when category changes
    setSelectedCategory(categoryId);
    // Fetching will be triggered by the useEffect watching selectedCategory
  };

  const handleTagFilter = (tagId: number | null) => {
     setSelectedCategory(null); // Reset category filter when tag changes
     setSelectedTag(tagId);
     // Fetching will be triggered by the useEffect watching selectedTag
  };
  
  const handleDocsPageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= docsTotalPages && newPage !== docsPage) {
          setDocsPage(newPage);
          // Fetching will be triggered by the useEffect watching docsPage
      }
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      toast({
        title: t("feedback.emptyTitle"),
        description: t("feedback.emptyDescription"),
        variant: "destructive",
      })
      return
    }

    toast({
      title: t("feedback.successTitle"),
      description: t("feedback.successDescription"),
    })
    setFeedback("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    // Process each file
    Array.from(files).forEach((file) => {
      // Add file to state with uploading status
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "uploading",
        },
      ])

      // Simulate upload progress
      const fileIndex = uploadedFiles.length
      const interval = setInterval(() => {
        setUploadedFiles((prev) => {
          const newFiles = [...prev]
          if (newFiles[fileIndex]) {
            if (newFiles[fileIndex].progress < 100) {
              newFiles[fileIndex].progress += 10
            } else {
              clearInterval(interval)
              newFiles[fileIndex].status = "success"
              setIsUploading(false)
            }
          }
          return newFiles
        })
      }, 300)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePublishDocuments = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "没有文件",
        description: "请先上传教程文档",
        variant: "destructive",
      })
      return
    }

    if (uploadedFiles.some((file) => file.status === "uploading")) {
      toast({
        title: "上传中",
        description: "请等待所有文件上传完成",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "文档已发布",
      description: `成功发布了 ${uploadedFiles.length} 个教程文档`,
    })
  }

  // --- 下载处理函数 (移除模拟提示) ---
  const handleDownload = (doc: TutorialDocument) => {
    if (!doc || !doc.file_path) {
        toast({ title: "无法下载", description: "未找到文件路径。", variant: "destructive" });
        return;
    }
    try {
        // 创建链接并点击以下载文件
        const link = document.createElement('a');
        link.href = doc.file_path;

        // 尝试生成友好的下载文件名
        let filename = doc.title;
        try {
            const url = new URL(doc.file_path, window.location.origin);
            const pathParts = url.pathname.split('/');
            const encodedFilename = pathParts[pathParts.length - 1];
            if (encodedFilename) {
                 filename = decodeURIComponent(encodedFilename) || (doc.title + path.extname(doc.file_path || '.bin'));
            } else {
                 filename = doc.title + path.extname(doc.file_path || '.bin');
            }
        } catch (e) {
            console.warn("无法从路径解析文件名，使用标题代替:", e);
            filename = doc.title + path.extname(doc.file_path || '.bin');
        }
        link.download = filename;

        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // --- 调用 API 增加 download_count (异步, 不阻塞) ---
        fetchApi(`/api/tutorials/documents/${doc.id}/download`, { method: 'POST' })
          .then(() => {
            console.log(`Incremented download count for doc ${doc.id}`);
            // 可以在这里触发文档列表的重新获取，以便实时更新下载次数
            // 但为了避免频繁刷新，暂时只在控制台记录
            fetchDocuments(docsPage); // 取消注释以启用实时刷新
          })
          .catch(error => {
            console.error(`Failed to increment download count for doc ${doc.id}:`, error);
            // 可以选择性地向用户显示一个非阻塞的错误提示
            // toast({ title: "提示", description: "更新下载次数失败，但不影响下载。", variant: "default" });
          });
        // --- 结束 API 调用 ---

        toast({ title: "开始下载", description: `正在准备下载 ${doc.title}` });

    } catch (error) {
         console.error("下载文件时出错:", error);
         toast({ title: "下载失败", description: "无法创建下载链接。", variant: "destructive" });
    }
  };

  // 获取文件图标 (优化)
  const getFileIcon = (fileType: string | null) => {
    const typeLower = fileType?.toLowerCase() || ''; // 转小写并处理 null

    if (typeLower.startsWith('image/')) {
      // 图片类型 (jpeg, png, gif, svg etc.)
      return <FileImage className="h-full w-full text-purple-500" />; // 使用紫色区分
    } 
    
    switch (typeLower) {
      case 'application/pdf':
        return <FileText className="h-full w-full text-red-500" />;
      case 'application/msword': // .doc
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': // .docx
        return <FileText className="h-full w-full text-blue-500" />;
      case 'application/zip':
      case 'application/x-zip-compressed':
        return <FileCode className="h-full w-full text-yellow-500" />;
      case 'text/markdown':
      case 'text/x-markdown': // 另一种可能的 MIME 类型
        return <BookOpen className="h-full w-full text-green-500" />;
      // 可以根据需要添加更多类型，例如表格 (excel), 演示文稿 (ppt) 等
      // case 'application/vnd.ms-excel':
      // case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      //  return <Sheet className="h-full w-full text-emerald-500" />;
      // case 'application/vnd.ms-powerpoint':
      // case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      //  return <Presentation className="h-full w-full text-orange-500" />;
      default:
        // 默认图标，可以考虑根据扩展名做最后判断 (如果 MIME 不明确)
        // const extension = fileType ? path.extname(fileType).toLowerCase() : ''; 
        // if (extension === '.md') return <BookOpen className="h-full w-full text-green-500" />;
        return <File className="h-full w-full text-gray-500" />;
    }
  }

  // Placeholder handlers for new actions
  const handleUploadCourse = () => {
      console.log("Trigger Upload New Course action...");
      toast({ title: "功能开发中", description: "上传新课程功能即将推出。" });
  };

  // This function would likely be passed down to CourseCard if the edit button is inside it
  const handleEditCourse = (slug: string) => {
      console.log(`Trigger Edit Course action for slug: ${slug}`);
      toast({ title: "功能开发中", description: `编辑课程 ${slug} 功能即将推出。` });
  };

  // --- 上传相关处理函数 (恢复/添加) ---
  const handleUploadInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadCategoryChange = (value: string) => {
    setUploadFormData(prev => ({ ...prev, categoryId: value }));
  };

  const handleUploadTagsChange = (tagId: number) => {
    setUploadFormData(prev => {
      const newSelectedTags = prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId) // 取消选择
        : [...prev.selectedTags, tagId]; // 添加选择
      return { ...prev, selectedTags: newSelectedTags };
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  // 处理创建新标签
  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      toast({ title: "标签名称无效", description: "请输入要创建的标签名称。", variant: "destructive" });
      return;
    }
    if (!user) {
        toast({ title: "需要登录", description: "请先登录再创建标签。", variant: "destructive" });
        return;
    }

    setIsCreatingTag(true);
    try {
      const newTag = await fetchApi<Tag>('/api/tutorials/tags', {
        method: 'POST',
        body: JSON.stringify({ name: trimmedName }),
      });

      if (newTag) {
        toast({ title: "标签创建成功!", description: `标签 "${newTag.name}" 已创建。` });
        setNewTagName(""); // 清空输入框
        await fetchTags(); // 重新获取标签列表以包含新标签
        // 自动选中新创建的标签
        setUploadFormData(prev => ({
             ...prev,
             selectedTags: [...prev.selectedTags, newTag.id]
         }));
      } else {
          // fetchApi 在 204 或非 JSON 响应时可能返回 null
          throw new Error("无法解析创建标签的响应");
      }

    } catch (error: any) {
      console.error("创建标签失败:", error);
      toast({ title: "创建标签失败", description: error.message || '发生未知错误', variant: "destructive" });
    } finally {
      setIsCreatingTag(false);
    }
  };

  // 处理上传提交 (修改：手动添加 Auth Token)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadFormData.title || !uploadFormData.categoryId || uploadFormData.selectedTags.length === 0) {
      toast({ title: "信息不完整", description: "请填写标题、选择分类、至少一个标签并选择文件。", variant: "destructive" });
      return;
    }
    if (!user) {
        toast({ title: "需要登录", description: "请先登录再上传文档。", variant: "destructive" });
        return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadFormData.title);
    formData.append('description', uploadFormData.description);
    formData.append('categoryId', uploadFormData.categoryId);
    formData.append('tagIds', uploadFormData.selectedTags.join(','));
    if (uploadFormData.version) {
        formData.append('version', uploadFormData.version);
    }

    // --- 手动添加认证 Token --- 
    const token = localStorage.getItem("authToken");
    const headers = new Headers(); // 创建 Headers 对象
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    } else {
        // 如果没有 token，理论上 user 不会存在，但作为保险措施
        toast({ title: "认证失败", description: "无法获取认证令牌，请重新登录。", variant: "destructive" });
        setIsUploading(false);
        return; 
    }
    // 注意：不要在这里设置 Content-Type，浏览器会为 FormData 自动处理
    // headers.append('Content-Type', 'multipart/form-data'); // <- 不要这样做

    try {
      const response = await fetch('/api/tutorials/documents/upload', {
        method: 'POST',
        body: formData,
        headers: headers, // 传递包含认证信息的 Headers 对象
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || '上传失败，请稍后重试');
      }
      toast({ title: "上传成功!", description: `文档 "${uploadFormData.title}" 已成功上传。` });
      setIsUploadDialogOpen(false);
      setUploadFormData({ title: '', description: '', categoryId: '', selectedTags: [], version: '' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocuments(1);

    } catch (error: any) {
      console.error("上传文档失败:", error);
      toast({ title: "上传失败", description: error.message || '发生未知错误', variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // --- 修改删除流程 ---
  // 2. 用户在对话框中确认后，执行实际删除 (接受 doc 参数)
  const confirmDeleteDocument = async (docToDelete: TutorialDocument) => {
    if (!docToDelete) return;

    setIsDeleting(docToDelete.id); // 开始删除，设置加载状态（使用 ID）
    console.log(`[confirmDeleteDocument] Deleting doc ID: ${docToDelete.id}`);

    try {
      await fetchApi(`/api/tutorials/documents/${docToDelete.id}`, {
        method: 'DELETE',
      });
      toast({ title: "删除成功", description: `文档 "${docToDelete.title}" 已被删除。` });
      fetchDocuments(docsPage); // 刷新列表

    } catch (error: any) {
      console.error(`[confirmDeleteDocument] API call failed for doc ID: ${docToDelete.id}:`, error);
      toast({ title: "删除失败", description: error.message || '发生未知错误', variant: "destructive" });
      // 对话框会自动关闭，错误已提示
    } finally {
      setIsDeleting(null); // 结束删除，清除加载状态
    }
  };

  return (
    <div>
      {/* Remove the top Call to Action Buttons block */}
      {/* 
      {activeTab === 'courses' && (
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
           <Button asChild size="lg" className="w-full sm:w-auto bg-gradient-to-r from-solana-purple to-solana-green hover:opacity-90">
             <Link href={startLearningLink}>{t("tutorials.startNow")}</Link>
           </Button>
           <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
             <Link href="#">
               {t("tutorials.bootcamp")} <span className="ml-1.5">►</span>
             </Link>
           </Button>
                    </div>
      )}
      */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="docs">文档</TabsTrigger>
          <TabsTrigger value="courses">课程</TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="space-y-6">
          {/* Guides Accordion (Optional - Restore if needed) */}
          {/* <Card className="glass-morphism"> ... </Card> */}
          
          {/* Technical Documents Section */}
          <Card className="glass-morphism">
               <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                   <CardTitle>技术文档库</CardTitle>
                   <CardDescription>查找 API 参考、SDK 指南和技术文章。</CardDescription>
              </div>
                 {/* --- 上传文档按钮和对话框 --- */}
                 <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                   <DialogTrigger asChild>
                     {/* 只有登录用户才能看到并点击上传按钮 */}
                     {user && (
                       <Button variant="outline">
                         <FilePlus className="mr-2 h-4 w-4" /> 上传文档
              </Button>
                     )}
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[600px]">
                     <form onSubmit={handleUploadSubmit}>
                       <DialogHeader>
                         <DialogTitle>上传新教程文档</DialogTitle>
                         {/* Removed DialogDescription */}
                         {/* 
                         <DialogDescription>
                           填写文档信息并选择要上传的文件。
                         </DialogDescription>
                         */}
                       </DialogHeader>
                       <div className="grid gap-6 py-4">
                         {/* 标题 */}
                         <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="title" className="text-right">标题 <span className="text-red-500">*</span></Label>
                           <Input id="title" name="title" value={uploadFormData.title} onChange={handleUploadInputChange} className="col-span-3" required />
                         </div>
                         {/* 描述 */}
                         <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="description" className="text-right">描述</Label>
                           <Textarea id="description" name="description" value={uploadFormData.description} onChange={handleUploadInputChange} className="col-span-3" rows={3} />
                         </div>
                         {/* 分类 */}
                         <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="categoryId" className="text-right">分类 <span className="text-red-500">*</span></Label>
                           <Select name="categoryId" value={uploadFormData.categoryId} onValueChange={handleUploadCategoryChange} required>
                             <SelectTrigger className="col-span-3">
                               <SelectValue placeholder="选择一个分类" />
                             </SelectTrigger>
                             <SelectContent>
                               {categories.map((cat) => (
                                 <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                         {/* 标签 (多选 + 新增) */}
                         <div className="grid grid-cols-4 items-start gap-4">
                           <Label className="text-right pt-2">标签 <span className="text-red-500">*</span></Label>
                           <div className="col-span-3 space-y-2">
                             <div className="flex flex-wrap gap-2 border rounded-md p-2 min-h-[60px]">
                               {tags.length > 0 ? tags.map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant={uploadFormData.selectedTags.includes(tag.id) ? "default" : "outline"}
                                    onClick={() => handleUploadTagsChange(tag.id)}
                                    className="cursor-pointer hover:bg-primary/10 transition-colors duration-150"
                                  >
                                    {tag.name}
                                  </Badge>
                               )) : <p className="text-sm text-muted-foreground p-2">暂无可用标签，请添加。</p>}
                             </div>
                             <div className="flex items-center gap-2">
                               <Input
                                 type="text"
                                 placeholder="输入新标签名称"
                                 value={newTagName}
                                 onChange={(e) => setNewTagName(e.target.value)}
                                 className="flex-grow h-9 text-sm"
                                 disabled={isCreatingTag}
                               />
                                {newTagName && (
                                   <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => setNewTagName("")} disabled={isCreatingTag}>
                                     <XCircle className="h-4 w-4" />
                                   </Button>
                                 )}
                               <Button
                                 type="button"
                                 onClick={handleCreateTag}
                                 disabled={!newTagName.trim() || isCreatingTag}
                                 size="sm"
                                 className="h-9 whitespace-nowrap"
                               >
                                 {isCreatingTag ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-1 h-4 w-4" />} 添加
                               </Button>
                             </div>
                           </div>
                         </div>
                         {/* 版本号 (可选) */}
                          <div className="grid grid-cols-4 items-center gap-4">
                           <Label htmlFor="version" className="text-right">版本号</Label>
                           <Input id="version" name="version" value={uploadFormData.version} onChange={handleUploadInputChange} className="col-span-3" placeholder="例如: v1.0.0 (可选)"/>
                         </div>
                         {/* 文件选择 (优化样式) */}
                         <div className="grid grid-cols-4 items-start gap-4"> {/* Changed items-center to items-start for better alignment */}
                           <Label htmlFor="file" className="text-right pt-3">文件 <span className="text-red-500">*</span></Label>
                           <div className="col-span-3">
                              <label
                                 htmlFor="file"
                                 className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
                              >
                                 <span className="flex items-center space-x-2">
                                    <UploadCloud className="w-6 h-6 text-gray-600" />
                                    <span className="font-medium text-gray-600">
                                       点击选择文件或
                                       <span className="text-primary underline">浏览</span>
                                    </span>
                                 </span>
                                 <span className="text-xs text-gray-500 mt-1">
                                    支持 PDF, DOCX, MD, ZIP, 图片等
                                 </span>
                              </label>
                              {/* Hidden actual file input */}
                              <Input
                                 id="file"
                                 name="file"
                type="file"
                                 onChange={handleFileSelect}
                                 className="sr-only" // Hide the default input
                ref={fileInputRef}
                                 required
                              />
                              {/* 显示已选文件信息 */}
                              {selectedFile && (
                                 <div className="mt-2 text-sm text-muted-foreground">
                                   已选择: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                              )}
                    </div>
                    </div>
                       </div>
                       <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="outline">取消</Button>
                         </DialogClose>
                         {/* 启用/禁用上传按钮 */}
                         <Button type="submit" disabled={isUploading}>
                           {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 上传
                         </Button>
                       </DialogFooter>
                     </form>
                   </DialogContent>
                 </Dialog>
               </CardHeader>
               <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                      <div className="relative flex-grow w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="搜索文档..."
                            className="pl-8 w-full"
                            value={docSearchQuery}
                            onChange={(e) => setDocSearchQuery(e.target.value)}
                    />
                  </div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge
                           variant={selectedCategory === null ? "default" : "outline"}
                           className="cursor-pointer hover:bg-primary/10"
                           onClick={() => handleCategoryFilter(null)}
                        >
                           全部分类
                  </Badge>
                        {categories.map(cat => (
                            <Badge
                                key={cat.id}
                                variant={selectedCategory === cat.id ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/10"
                                onClick={() => handleCategoryFilter(cat.id)}
                            >
                               {cat.name}
                  </Badge>
                        ))}
                      </div>
                </div>

                  {/* Content Area: Loading, Error, List, or No Results */}
                  <div className="mt-4"> { /* Wrapper for conditional content */ }
                     {isLoadingDocs ? (
                          <div className="flex justify-center items-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                      ) : docsError ? (
                          <div className="text-center py-12 text-red-500">
                              <p>{docsError}</p>
                              <Button variant="link" onClick={() => fetchDocuments(1)} className="mt-2">重试</Button>
                          </div>
                      ) : documents.length > 0 ? (
                        // Render list only if not loading, no error, and documents exist
                        <div className="space-y-3">
                           {documents.map((doc) => {
                              return (
                                <div key={doc.id} className="group relative flex flex-col bg-card/80 rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all">
                                  {/* Document Card Structure */}
                        <div className="flex p-4">
                                      {/* Icon */} 
                          <div className="mr-4 flex-shrink-0">
                                         <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">{getFileIcon(doc.file_type)}</div>
                            </div>
                                      {/* Text Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium truncate">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{doc.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                                            {doc.tags.map((tag) => (
                                               <Badge key={tag.id} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20" onClick={(e) => { e.stopPropagation(); handleTagFilter(tag.id); }}>{tag.name}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                                   {/* Footer */} 
                        <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t">
                          <div className="flex items-center text-xs text-muted-foreground">
                                         <div className="flex items-center mr-3"><Calendar className="h-3 w-3 mr-1" /><span>{format(new Date(doc.created_at), "yyyy-MM-dd")}</span></div>
                                         <div className="flex items-center mr-3"><FileText className="h-3 w-3 mr-1" /><span>{doc.file_type?.toUpperCase() || 'N/A'} · {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span></div>
                                         <div className="flex items-center"><Download className="h-3 w-3 mr-1" /><span>{doc.download_count}</span></div>
                            </div>
                                      <div className="flex items-center gap-1"> { /* 调整按钮间距 */ }
                                  <Button
                                    variant="ghost"
                                           size="icon" // 改为图标按钮
                                           className="h-8 w-8 text-xs"
                                           onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                                           disabled={!doc.file_path}
                                           title="下载" // 添加 tooltip 提示
                                         >
                                           <Download className="h-4 w-4" />
                                  </Button>
                                         {/* 删除按钮 - 条件渲染 + AlertDialog 结构 */}
                                         {user && Number(user.id) === doc.author.id && (
                                           <AlertDialog> {/* 每个按钮都有自己的 AlertDialog 上下文 */}
                                             <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                                                 size="icon"
                                                 className="h-8 w-8 text-xs text-red-500 hover:text-red-600"
                                                 onClick={(e) => { e.stopPropagation(); }}
                                                 disabled={isDeleting === doc.id} // 正在删除时禁用触发器
                                                 title="删除"
                                               >
                                                 {isDeleting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                                             </AlertDialogTrigger>
                                             {/* 对话框内容现在与触发器在同一个 AlertDialog 上下文中 */}
                                             <AlertDialogContent>
                                               <AlertDialogHeader>
                                                 <AlertDialogTitle>确认删除?</AlertDialogTitle>
                                                 <AlertDialogDescription>
                                                   您确定要删除文档 "<span className="font-semibold">{doc.title}</span>" 吗？
                                                   此操作将永久删除文档及其关联信息，无法恢复。
                                                 </AlertDialogDescription>
                                               </AlertDialogHeader>
                                               <AlertDialogFooter>
                                                 <AlertDialogCancel disabled={isDeleting === doc.id}>取消</AlertDialogCancel>
                                                 <AlertDialogAction
                                                   onClick={() => confirmDeleteDocument(doc)} // 直接传递当前 doc
                                                   disabled={isDeleting === doc.id}
                                                   className="bg-red-600 hover:bg-red-700"
                                                 >
                                                   {isDeleting === doc.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                   确认删除
                                                 </AlertDialogAction>
                                               </AlertDialogFooter>
                                             </AlertDialogContent>
                                           </AlertDialog>
                                         )}
                          </div>
                        </div>
                                   {/* Version Badge */} 
                                   {doc.version && (<div className="absolute top-0 right-0 p-2"><Badge variant="outline" className="bg-primary/10 text-primary text-xs">{doc.version}</Badge></div>)}
                        </div>
                              );
                           })}
                      </div>
                  ) : (
                         // Render no results only if not loading, no error, and documents array is empty
                    <div className="text-center py-12 border rounded-lg">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                           <p className="text-muted-foreground">
                              {docSearchQuery || selectedCategory || selectedTag ? "未找到匹配的文档" : "暂无文档"}
                           </p>
                              {(docSearchQuery || selectedCategory || selectedTag) && (
                                <Button variant="link" onClick={() => { setDocSearchQuery(''); handleCategoryFilter(null); handleTagFilter(null); }} className="mt-2">
                                  清除筛选/搜索
                      </Button>
                             )}
                          </div>
                        )}
                      </div>

                  {/* Pagination for Documents (...) */}
                   {!isLoadingDocs && docsTotalPages > 1 && (
                      <Pagination className="mt-8">
                          <PaginationContent>
                              {/* Pagination Items */} 
                              <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handleDocsPageChange(docsPage - 1); }} aria-disabled={docsPage <= 1} className={docsPage <= 1 ? 'pointer-events-none opacity-50' : ''}/></PaginationItem>
                              {[...Array(docsTotalPages)].map((_, i) => (
                                  <PaginationItem key={i}><PaginationLink href="#" isActive={docsPage === i + 1} onClick={(e) => { e.preventDefault(); handleDocsPageChange(i + 1); }}>{i + 1}</PaginationLink></PaginationItem>
                              ))}
                              <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); handleDocsPageChange(docsPage + 1); }} aria-disabled={docsPage >= docsTotalPages} className={docsPage >= docsTotalPages ? 'pointer-events-none opacity-50' : ''}/></PaginationItem>
                          </PaginationContent>
                      </Pagination>
              )}
            </CardContent>
          </Card>

          {/* Restore Feedback Card if needed */}
          {/* <Card className="glass-morphism"> ... </Card> */}

        </TabsContent>

        <TabsContent value="courses">
          {/* Course Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索课程..."
                className="pl-8 w-full"
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
              />
            </div>
            {/* Removed Upload New Course Button */}
            {/*
            <Button onClick={handleUploadCourse} variant="outline" className="w-full md:w-auto flex-shrink-0"> 
                <Upload className="mr-2 h-4 w-4" /> 上传新课程
            </Button>
            */}
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  // onEdit={handleEditCourse} // Pass the handler - Removed as button is removed
                />
              ))
            ) : (
             // ... No courses found JSX ...
             <div className="col-span-full text-center py-12 border rounded-lg">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{courseSearchQuery ? "未找到匹配的课程" : "暂无课程"}</p>
                {courseSearchQuery && (
                    <Button variant="link" onClick={() => setCourseSearchQuery("")} className="mt-2">
                      清除搜索
                    </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}

