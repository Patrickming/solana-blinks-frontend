"use client"

import React, { useState, useRef } from 'react';
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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// --- Static Course Data (Temporary) ---
// Replace with actual data or fetch from API later
const courses = [
  {
    slug: "intro-crypto-clients",
    title: "Introduction to cryptography and Solana clients",
    lessons: 6,
    description: "Learn the basics of how to interact with the Solana blockchain.",
    imageUrl: "/images/tutorials/course-placeholder-1.png" // Example placeholder
  },
  {
    slug: "tokens-nfts",
    title: "Tokens and NFTs on Solana",
    lessons: 4,
    description: "Create tokens and NFTs on Solana.",
    imageUrl: "/images/tutorials/course-placeholder-2.png"
  },
  {
    slug: "onchain-program-development",
    title: "Onchain program development",
    lessons: 6,
    description: "Build onchain programs (sometimes called 'smart contracts') with Anchor.",
    imageUrl: "/images/tutorials/course-placeholder-3.png"
  },
  {
    slug: "anchor-data-feeds",
    title: "Anchor data feeds",
    lessons: 2,
    description: "Connect to offchain data from inside your Anchor programs.",
    imageUrl: "/images/tutorials/course-placeholder-1.png"
  },
    {
    slug: "token-extensions",
    title: "Token extensions",
    lessons: 15,
    description: "Create tokens with features like non-transferability, transfer hooks, and more.",
    imageUrl: "/images/tutorials/course-placeholder-2.png"
  },
    {
    slug: "rust-program-development",
    title: "Rust program development",
    lessons: 9,
    description: "Learn how to build Solana programs without using Anchor.",
    imageUrl: "/images/tutorials/course-placeholder-3.png"
  },
  // Add more courses based on the image/link...
];

// --- Static Technical Document Data (Restored) ---
const technicalDocuments = [
    {
      id: "doc-1",
      title: "Solana Blinks API 参考文档",
      description: "完整的 Solana Blinks API 参考，包括所有端点和参数",
      author: "Solana 团队",
      authorAvatar: "/placeholder.svg?height=40&width=40&text=S",
      fileType: "pdf",
      fileSize: "2.4 MB",
      downloadUrl: "#",
      uploadDate: "2023-11-15",
      category: "api",
      version: "v1.2.0",
      downloads: 1245,
      tags: ["API", "参考", "开发者"],
    },
    {
      id: "doc-2",
      title: "Blinks SDK 开发指南",
      description: "使用 Blinks SDK 开发 Solana 应用的完整指南",
      author: "开发团队",
      authorAvatar: "/placeholder.svg?height=40&width=40&text=D",
      fileType: "pdf",
      fileSize: "3.8 MB",
      downloadUrl: "#",
      uploadDate: "2023-12-01",
      category: "sdk",
      version: "v2.0.1",
      downloads: 876,
      tags: ["SDK", "开发", "指南"],
    },
     {
       id: "doc-3",
       title: "Solana 交易结构详解",
       description: "深入解析 Solana 交易结构和签名机制",
       author: "技术专家",
       authorAvatar: "/placeholder.svg?height=40&width=40&text=T",
       fileType: "pdf",
       fileSize: "1.7 MB",
       downloadUrl: "#",
       uploadDate: "2024-01-10",
       category: "technical",
       version: "v1.0.0",
       downloads: 543,
       tags: ["交易", "技术", "深入"],
     },
];

/**
 * Redesigned TutorialsContent component.
 * Features Tabs for "文档" and "课程".
 * Displays course cards in a grid under the "课程" tab.
 */
export function TutorialsContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("courses"); // Default to 'courses'
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

  // Filter documents based on docSearchQuery
  const filteredDocuments = technicalDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(docSearchQuery.toLowerCase())),
  );

  // Filter courses based on courseSearchQuery
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      (course.description && 
         course.description.toLowerCase().includes(courseSearchQuery.toLowerCase()))
  );

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

  const handleDownload = (docId: string) => {
    const doc = technicalDocuments.find((d) => d.id === docId)
    if (!doc) return

    toast({
      title: "开始下载",
      description: `正在下载 ${doc.title}`,
    })
  }

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-full w-full text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-full w-full text-blue-500" />
      case "zip":
        return <FileCode className="h-full w-full text-yellow-500" />
      case "md":
        return <BookOpen className="h-full w-full text-green-500" />
      default:
        return <File className="h-full w-full text-gray-500" />
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
               <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                   <CardTitle>技术文档库</CardTitle>
                   <CardDescription>查找 API 参考、SDK 指南和技术文章。</CardDescription>
                 </div>
                 {/* Restore upload button if keeping upload functionality */}
                 {/* <Button>...</Button> */}
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
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">全部</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">API</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">SDK</Badge>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">技术</Badge>
                        {/* Add more filters as needed */}
                      </div>
                  </div>
                  
                  {/* Document List */}
                   <div className="space-y-3 mt-4">
                     {filteredDocuments.length > 0 ? (
                       filteredDocuments.map((doc) => (
                         <div
                           key={doc.id}
                           className="group relative flex flex-col bg-card/80 rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all"
                         >
                           <div className="flex p-4">
                             <div className="mr-4 flex-shrink-0">
                               <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                                 {getFileIcon(doc.fileType)}
                               </div>
                             </div>
                             <div className="flex-1 min-w-0">
                               <h4 className="text-base font-medium truncate">{doc.title}</h4>
                               <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{doc.description}</p>
                               <div className="flex flex-wrap gap-1 mt-2">
                                 {doc.tags.map((tag, idx) => (
                                   <Badge key={idx} variant="secondary" className="text-xs">
                                     {tag}
                                   </Badge>
                                 ))}
                               </div>
                             </div>
                           </div>
      
                           <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t">
                             <div className="flex items-center text-xs text-muted-foreground">
                               {/* Optional meta info */}
                               <div className="flex items-center mr-3">
                                 <Calendar className="h-3 w-3 mr-1" />
                                 <span>{format(new Date(doc.uploadDate), "yyyy-MM-dd")}</span>
                               </div>
                              <div className="flex items-center mr-3">
                                <FileText className="h-3 w-3 mr-1" />
                                 <span>{doc.fileType.toUpperCase()} · {doc.fileSize}</span>
                              </div>
                             </div>
      
                             <div className="flex items-center gap-2">
                               {/* Tooltip/External Link example */}
                               {/* <TooltipProvider> ... </TooltipProvider> */}
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-8 px-2 text-xs"
                                 onClick={() => handleDownload(doc.id)}
                               >
                                 <Download className="h-4 w-4 mr-1" />
                                 下载
                               </Button>
                             </div>
                           </div>
                             {/* Optional Version Badge */}
                            <div className="absolute top-0 right-0 p-2">
                              <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                                 {doc.version}
                               </Badge>
                             </div>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-12 border rounded-lg">
                         <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                         <p className="text-muted-foreground">未找到匹配的文档</p>
                         <Button variant="link" onClick={() => setDocSearchQuery("")} className="mt-2">
                           清除搜索
                         </Button>
                       </div>
                     )}
                   </div>
               </CardContent>
           </Card>

          {/* Restore Feedback Card if needed */}
          {/* <Card className="glass-morphism"> ... </Card> */}

        </TabsContent>

        <TabsContent value="courses">
          {/* Course Search and Upload Button */}
           <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative flex-grow w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="搜索课程..."
                      className="pl-8 w-full"
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                  />
              </div>
              <Button onClick={handleUploadCourse} variant="outline" className="w-full md:w-auto">
                  <Upload className="mr-2 h-4 w-4" /> 上传新课程
               </Button>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                      // Pass the edit handler down
                      <CourseCard 
                          key={course.slug} 
                          course={course} 
                          onEdit={handleEditCourse} // Pass the handler
                      /> 
                  ))
              ) : (
                   <div className="col-span-full text-center py-12 border rounded-lg">
                     <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <p className="text-muted-foreground">未找到匹配的课程</p>
                     <Button variant="link" onClick={() => setCourseSearchQuery("")} className="mt-2">
                       清除搜索
                     </Button>
                   </div>
              )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

