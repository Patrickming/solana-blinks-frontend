"use client"

import React, { useState, useEffect, useCallback, MouseEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { Checkbox } from "@/app/components/ui/checkbox"
import { MessageSquare, ThumbsUp, Share2, Search, Plus, MessageCircle, Tag, Loader2 } from "lucide-react"
import { useLanguage } from "@/app/context/language-context"
import { useAuth } from "@/app/context/auth-context"
import { toast } from "sonner"
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/app/components/ui/pagination"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// --- Types ---
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

type TagType = {
  id: number;
  name: string;
  slug: string;
  color_classes: string | null;
};

type Topic = {
  id: number;
  title: string;
  status: string;
  reply_count: number;
  like_count: number;
  created_at: string;
  last_activity_at: string;
  content_snippet?: string | null;
  author: Author;
  category: Category;
  tags: TagType[];
  content?: string;
};

// Generic fetch wrapper - gets token from localStorage if available
async function fetchApi(url: string, options: RequestInit = {}) {
    const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) }; 
    const method = options.method?.toUpperCase() || 'GET';

    if (typeof window !== 'undefined') { 
        const storedToken = localStorage.getItem('authToken'); 
        if (storedToken && !headers['Authorization']) { 
            headers['Authorization'] = `Bearer ${storedToken}`;
        }
    }

    if (['POST', 'PUT', 'PATCH'].includes(method) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            let errorData = { message: `Request failed with status ${response.status}` };
            try {
                errorData = await response.json();
            } catch (e) { /* Ignore json parse error */ }
            console.error("API Error Response:", errorData); // Log detailed error
            throw new Error(errorData.message || `API request failed: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (response.status === 204) { return null; } // Handle No Content response
        if (contentType && contentType.includes("application/json")) {
             try {
                 return await response.json();
             } catch (jsonError: any) {
                 console.error("Failed to parse JSON response:", jsonError);
                 // Attempt to return text if JSON parsing fails but response was ok (e.g., 200 OK with non-JSON body)
                 try {
                     const textResponse = await response.text();
                     console.warn("API returned non-JSON response:", textResponse);
                     // Depending on use case, you might want to return the text or throw a specific error
                     return { message: "Received non-JSON response", body: textResponse }; // Or throw new Error(...)
                 } catch (textError) {
                      throw new Error(`Invalid JSON response and failed to read as text: ${jsonError.message}`);
                 }
             }
        } else {
            try { 
                const text = await response.text(); 
                console.warn(`API returned non-JSON content type (${contentType}):`, text);
                return text; // Return text for non-JSON responses
            } catch (textError) { return null; }
        }
    } catch (networkError: any) {
        console.error("Network or fetch error:", networkError);
        throw new Error(`Network error: ${networkError.message}`);
    }
}

// Define available tags - Will be replaced by fetched tags
// const AVAILABLE_TAGS = [...] // Removed static tags

// --- Constants ---
const TOPICS_LIMIT = 15; // Define topics per page limit

export function ForumContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // --- State Variables ---
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTermDebounced, setSearchTermDebounced] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newTopicCategoryId, setNewTopicCategoryId] = useState<string>("");
  const [newTopicTagIds, setNewTopicTagIds] = useState<number[]>([]);

  const [selectedTopicTags, setSelectedTopicTags] = useState<{ [topicId: number]: number[] }>({});
  const [updatingTagsTopicId, setUpdatingTagsTopicId] = useState<number | null>(null);

  const [topicsPage, setTopicsPage] = useState(1);
  const [topicsTotalPages, setTopicsTotalPages] = useState(1);

  // State for Delete Confirmation Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [topicToDeleteId, setTopicToDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for deletion

  // --- Data Fetching ---

  // Fetch Initial Categories and Tags
  useEffect(() => {
    const fetchInitialData = async () => {
      // setError(null); // Reset error on initial load? Maybe not if list fails later
      try {
        const [categoriesData, tagsData] = await Promise.all([
          fetchApi('/api/forum/categories'),
          fetchApi('/api/forum/tags')
        ]);
        setCategories([{ id: 0, name: t('forum.tabs.all'), slug: 'all' }, ...categoriesData || []]);
        setTags(tagsData || []);
      } catch (err: any) {
        const errorMsg = `无法加载分类或标签: ${err.message}`;
        setError(errorMsg);
        toast.error('加载论坛初始数据失败', { description: err.message });
      }
      // Loading for topics list will be handled separately
    };
    fetchInitialData();
  }, [t]);

  // Fetch Topics List
  const fetchTopics = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching topics page: ${pageToFetch}, category: ${selectedCategory}, search: ${searchTermDebounced}`);

    const params = new URLSearchParams();
    params.set('page', pageToFetch.toString());
    params.set('limit', TOPICS_LIMIT.toString());
    
    if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category && category.id !== 0) {
            params.set('categoryId', category.id.toString());
        } else if (category?.slug && category.slug !== 'all') {
            console.warn(`Category slug '${selectedCategory}' found but ID is 0 or missing.`);
        }
    }
    if (searchTermDebounced.trim()) {
        params.set('search', searchTermDebounced.trim());
    }

    try {
      const data = await fetchApi(`/api/forum/topics?${params.toString()}`);
      setTopics(data?.topics || []);
      setTopicsTotalPages(data?.totalPages || 1);
      setTopicsPage(pageToFetch);

      const initialSelectedTags: { [topicId: number]: number[] } = {};
      (data?.topics || []).forEach((topic: Topic) => {
          if (topic.tags && topic.tags.length > 0) {
              initialSelectedTags[topic.id] = topic.tags.map(tag => tag.id);
          }
      });
      setSelectedTopicTags(prev => ({ ...prev, ...initialSelectedTags }));

    } catch (err: any) {
      const errorMsg = `无法加载主题列表: ${err.message}`;
      setError(errorMsg);
      setTopics([]); 
      setTopicsTotalPages(1);
      toast.error('加载主题列表失败', { description: err.message });
    } finally { setIsLoading(false); }
  }, [selectedCategory, searchTermDebounced, categories, t]);

  // Debounce search term
   useEffect(() => {
    const handler = setTimeout(() => {
        setSearchTermDebounced(searchQuery);
        if (topicsPage !== 1) {
            setTopicsPage(1);
        } else {
             if (categories.length > 0) {
                 fetchTopics(1);
             }
        }
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [searchQuery, categories.length]);

  // Fetch topics when category or debounced search term changes
  useEffect(() => {
    if (categories.length > 0) {
        fetchTopics(topicsPage);
    }
  }, [topicsPage, selectedCategory, searchTermDebounced, categories]);

  // --- Event Handlers ---

  // 处理点击话题导航到详情页
  const handleTopicClick = (topicId: number) => {
    router.push(`/forum/${topicId}`);
  };

  // Handle category selection from Tabs
  const handleCategoryChange = (categorySlug: string) => {
    setTopicsPage(1);
    setSelectedCategory(categorySlug);
  };

  // Handle Tag Selection Change - Now includes API call and immediate UI update
  const handleTagSelectionChange = async (topicId: number, tagId: number, checked: boolean | "indeterminate") => {
    if (!user) {
        toast.error("请先登录以修改标签");
        return;
    }
    
    // 1. Prepare the new tag IDs array based on the change
    let newTagIds: number[] = [];
    const currentClientTags = selectedTopicTags[topicId] || [];
    if (checked === true) {
        newTagIds = currentClientTags.includes(tagId) ? currentClientTags : [...currentClientTags, tagId];
    } else {
        newTagIds = currentClientTags.filter(id => id !== tagId);
    }

    // 2. Optimistic UI Update for Checkboxes
    setSelectedTopicTags(prev => {
        const newState = { ...prev, [topicId]: newTagIds };
        // Clean up entry if no tags are selected
        if (newState[topicId]?.length === 0) {
            delete newState[topicId];
        }
        return newState;
    });

    // 3. API Call to Update Tags
    setUpdatingTagsTopicId(topicId);
    try {
        await fetchApi(`/api/forum/topics/${topicId}/tags`, {
            method: 'PUT',
            body: JSON.stringify({ tagIds: newTagIds }),
        });
        toast.success("标签已更新");

        // 4. Update main 'topics' state for immediate badge update
        // Find the full tag objects corresponding to the new IDs
        const newFullTags = newTagIds.map(id => tags.find(t => t.id === id)).filter(Boolean) as TagType[];

        setTopics(currentTopics => currentTopics.map(topic => {
            if (topic.id === topicId) {
                return { ...topic, tags: newFullTags }; // Update the tags array for the specific topic
            }
            return topic;
        }));

    } catch (err: any) {
        toast.error("更新标签失败", { description: err.message });
        // Rollback optimistic checkbox update on error
        setSelectedTopicTags(prev => {
             const originalTopic = topics.find(t => t.id === topicId);
             const originalTagIds = originalTopic?.tags?.map(t => t.id) || [];
             // Handle cleanup if original was empty
             const newState = { ...prev, [topicId]: originalTagIds };
              if (newState[topicId]?.length === 0) {
                  delete newState[topicId];
              }
             return newState;
         });
    } finally {
        setUpdatingTagsTopicId(null); // Hide loading state
    }
  };

  // Handle tag selection change within the New Topic Dialog
  const handleNewTopicTagChange = (tagId: number, checked: boolean | "indeterminate") => {
      setNewTopicTagIds(prev =>
          checked === true ? [...prev, tagId] : prev.filter(id => id !== tagId)
      );
  };

  // Handle Create New Topic Submission
  const handleCreateTopic = async () => {
    if (!user) {
        toast.error("请先登录后再发帖");
        return;
    }
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !newTopicCategoryId) {
      toast.error(t("forum.validation.description"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: newTopicTitle,
        content: newTopicContent,
        categoryId: parseInt(newTopicCategoryId, 10),
        tagIds: newTopicTagIds.length > 0 ? newTopicTagIds : undefined,
      };
      
      // Log the content being sent to the API to check for whitespace preservation
      console.log("发送到 API 的内容 (检查空格和换行):", JSON.stringify(payload.content)); 

      const newTopicResponse = await fetchApi('/api/forum/topics', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (newTopicResponse && newTopicResponse.id) {
        toast.success(t("forum.success.description"));
        
        // Reset form state
        setNewTopicTitle("");
        setNewTopicContent("");
        setNewTopicCategoryId("");
        setNewTopicTagIds([]);
        setIsDialogOpen(false);

        // Fetch topics on page 1 AFTER successful creation and BEFORE navigating
        await fetchTopics(1); 

        // Navigate to the new topic page
        router.push(`/forum/${newTopicResponse.id}`); 
        
      } else {
          console.error("New topic response missing ID:", newTopicResponse);
          throw new Error("创建主题后未能获取新主题 ID");
      }

    } catch (err: any) {
      toast.error('创建主题失败', { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Topics Pagination Change
  const handleTopicsPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= topicsTotalPages && newPage !== topicsPage) {
        setTopicsPage(newPage);
    }
  };

  // Handler to initiate delete confirmation
  const handleDeleteClick = (e: MouseEvent, topicId: number) => {
    e.stopPropagation(); // Prevent card click
    setTopicToDeleteId(topicId);
    setIsConfirmOpen(true);
  };

  // Handler for confirming the delete action
  const handleConfirmDelete = async () => {
    if (!topicToDeleteId) return;
    if (!user) { toast.error("请先登录"); return; }

    setIsDeleting(true);
    try {
        await fetchApi(`/api/forum/topics/${topicToDeleteId}`, { method: 'DELETE' });
        toast.success("话题删除成功");
        // Remove the topic from the list immediately
        setTopics(prevTopics => prevTopics.filter(t => t.id !== topicToDeleteId));
        // Optionally adjust pagination if needed, e.g., if the last item on the page was deleted
        // This logic can be complex, maybe just let user navigate for now.
        setIsConfirmOpen(false); // Close the dialog
    } catch (err: any) {
         toast.error("删除话题失败", { description: err.message });
    } finally {
        setIsDeleting(false);
        setTopicToDeleteId(null); // Reset topic to delete
        // We don't close the dialog here on failure, let user explicitly cancel
    }
  };

  // Handler for Share Button Click
  const handleShareClick = async (e: MouseEvent, topicId: number) => {
    e.stopPropagation(); // Prevent card click

    if (!navigator.clipboard) {
        toast.error("浏览器不支持复制功能或页面非安全环境 (HTTPS)");
        return;
    }

    const topicUrl = `${window.location.origin}/forum/${topicId}`;

    try {
        await navigator.clipboard.writeText(topicUrl);
        toast.success("话题链接已复制到剪贴板！");
    } catch (err) {
        console.error('无法复制链接:', err);
        toast.error("复制链接失败", { description: "请手动复制链接。" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("forum.search.placeholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90" disabled={!user}>
              <Plus className="mr-2 h-4 w-4" />
              {t("forum.newTopic.button")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{t("forum.newTopic.title")}</DialogTitle>
              <DialogDescription>{t("forum.newTopic.description")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="topic-title">{t("forum.newTopic.form.titleLabel")}</Label>
                <Input
                  id="topic-title"
                  placeholder={t("forum.newTopic.form.titlePlaceholder")}
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topic-category">{t("forum.newTopic.form.categoryLabel")}</Label>
                <Select 
                    value={newTopicCategoryId} 
                    onValueChange={setNewTopicCategoryId} 
                    required 
                    disabled={isSubmitting || categories.length <= 1}
                >
                  <SelectTrigger id="topic-category">
                    <SelectValue placeholder={t("forum.newTopic.form.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                     {categories.filter(cat => cat.slug !== 'all').map(cat => (
                       <SelectItem key={cat.id} value={cat.id.toString()}> 
                           {cat.name}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("forum.actions.selectTags")} (可选)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 border p-3 rounded-md max-h-40 overflow-y-auto bg-background">
                    {tags.length === 0 && <p className="text-xs text-muted-foreground col-span-full">正在加载标签...</p>}
                    {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`new-tag-select-${tag.id}`}
                                checked={newTopicTagIds.includes(tag.id)}
                                onCheckedChange={(checked) => handleNewTopicTagChange(tag.id, checked)}
                                disabled={isSubmitting}
                            />
                            <Label
                                htmlFor={`new-tag-select-${tag.id}`}
                                className={`text-sm font-medium leading-none ${isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${tag.color_classes || ''}`}
                            >
                                {tag.name}
                            </Label>
                        </div>
                    ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topic-content">{t("forum.newTopic.form.contentLabel")}</Label>
                <Textarea
                  id="topic-content"
                  placeholder={t("forum.newTopic.form.contentPlaceholder")}
                  className="min-h-[150px]"
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                {t("forum.newTopic.form.cancelButton")}
              </Button>
              <Button
                onClick={handleCreateTopic}
                 disabled={isSubmitting || !newTopicTitle.trim() || !newTopicContent.trim() || !newTopicCategoryId}
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
              >
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("forum.newTopic.form.submitButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
        {categories.length > 0 ? (
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mb-6"> 
              {categories.map(category => (
                <TabsTrigger key={category.slug} value={category.slug}>
                    {category.name}
                </TabsTrigger>
              ))}
        </TabsList>
          ) : (
            <div className="h-10 mb-6 flex items-center justify-center text-sm text-muted-foreground">正在加载分类...</div>
          )
        }

        <TabsContent value={selectedCategory} className="space-y-4 mt-0">
          {isLoading && (
              <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
          )}
          {!isLoading && error && (
              <div className="text-center py-12 text-red-500">
                  <p>{error}</p>
                  <Button variant="link" onClick={() => fetchTopics(topicsPage)} className="mt-2">重试</Button>
              </div>
          )}
          {!isLoading && !error && topics.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("forum.search.noResults")}</p>
              {searchQuery && (
                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                  {t("forum.search.clear")}
                </Button>
              )}
            </div>
          )}
          {!isLoading && !error && topics.length > 0 && (
            topics.map((topic) => {
              const currentClientSelectedTags = selectedTopicTags[topic.id] || [];
              const actualTopicTags = topic.tags || []; 
              const isUpdatingThisTopicTags = updatingTagsTopicId === topic.id;

              return (
                <Card 
                  key={topic.id} 
                  className="glass-morphism cursor-pointer transition-all hover:shadow-md hover:border-primary/40 flex flex-col"
                  onClick={() => handleTopicClick(topic.id)}
                >
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-grow min-w-0">
                        <div className="mb-2">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <CardTitle 
                              className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer line-clamp-1"
                              onClick={(e: MouseEvent) => { e.stopPropagation(); handleTopicClick(topic.id); }}
                              title={topic.title}
                            > 
                              {topic.title}
                            </CardTitle>
                            {actualTopicTags.map(tag => (
                              <Badge
                                key={tag.id}
                                className={`border text-xs ${tag.color_classes || 'bg-secondary text-secondary-foreground border-border'}`}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {user && (
                            <Popover>
                              <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className={`h-6 w-6 ml-1 text-muted-foreground hover:text-foreground ${isUpdatingThisTopicTags ? 'animate-pulse' : ''}`} disabled={isUpdatingThisTopicTags}>
                                  {isUpdatingThisTopicTags ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />} 
                                  <span className="sr-only">{t("forum.actions.manageTags")}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-4" onClick={(e) => e.stopPropagation()}>
                                <div className="grid gap-4">
                                  <h4 className="font-medium leading-none">{t("forum.actions.selectTags")}</h4>
                                  <div className="grid gap-2">
                                     {tags.length === 0 && <p className="text-xs text-muted-foreground">正在加载标签...</p>}
                                     {tags.map((tag) => (
                                      <div key={tag.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`tag-${topic.id}-${tag.id}`}
                                          checked={currentClientSelectedTags.includes(tag.id)}
                                          onCheckedChange={(checked) => handleTagSelectionChange(topic.id, tag.id, checked)}
                                           disabled={isUpdatingThisTopicTags}
                                        />
                                        <Label
                                          htmlFor={`tag-${topic.id}-${tag.id}`}
                                           className={`text-sm font-medium leading-none cursor-pointer ${tag.color_classes || ''}`}
                                        >
                                           {tag.name}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            )}
                          </div>
                        </div>
                        {topic.content_snippet && (
                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-2 text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {topic.content_snippet + (topic.content_snippet.length === 50 ? '...' : '')}
                                </ReactMarkdown>
                            </div>
                        )}
                      </div>

                      <Badge variant="outline" className="capitalize shrink-0 text-xs px-2 py-0.5">
                         {topic.category.name}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardFooter className="mt-auto flex justify-between items-end pt-3 pb-3 px-5">
                     {/* Left side: Author Info ONLY */}
                     <div className="flex items-center space-x-2"> {/* Simplified left side */}
                         <Avatar className="h-7 w-7">
                             <AvatarImage src={topic.author.avatar || undefined} alt={topic.author.username} />
                             <AvatarFallback className="text-sm">{topic.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                         </Avatar>
                         <div>
                            <span className="text-sm font-medium text-foreground/90 mr-1.5">{topic.author.username}</span>
                            <span className="text-xs text-muted-foreground/80">
                                 · {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: zhCN })}
                            </span>
                         </div>
                     </div>

                     {/* Right side: Stats and Action Buttons */}
                     <div className="flex items-center space-x-3"> {/* Increased spacing slightly */} 
                         {/* Stats - Moved here */}
                         <div className="flex items-center space-x-3 text-sm text-muted-foreground"> {/* Keep text-sm */}
                             <span className="flex items-center" title="回复数">
                                 <MessageCircle className="h-4 w-4 mr-1" />
                                 <span>{topic.reply_count ?? 0}</span>
                             </span>
                             <span className="flex items-center" title="点赞数">
                                 <ThumbsUp className="h-4 w-4 mr-1" />
                                 <span>{topic.like_count ?? 0}</span>
                             </span>
                         </div>

                         {/* Action Buttons Separator? Optional */} 
                         {/* <Separator orientation="vertical" className="h-4 mx-1" /> */}

                         {/* Action Buttons */}
                         <div className="flex items-center space-x-1">
                             {/* Share Button */}
                             <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => handleShareClick(e, topic.id)} aria-label="分享话题">
                                 <Share2 className="h-4 w-4" />
                             </Button>
                             {/* Delete Button */}
                             {user && user.id && Number(user.id) === topic.author.id && (
                                  <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => handleDeleteClick(e, topic.id)}
                                      aria-label="删除话题"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                             )}
                          </div>
                     </div>
                  </CardFooter>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
      
       {!isLoading && !error && topicsTotalPages > 1 && (
         <Pagination className="mt-8">
           <PaginationContent>
             <PaginationItem>
               <PaginationPrevious 
                 href="#" 
                 onClick={(e) => { e.preventDefault(); handleTopicsPageChange(topicsPage - 1); }} 
                 aria-disabled={topicsPage <= 1} 
                 className={topicsPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
             </PaginationItem>
             {[...Array(topicsTotalPages)].map((_, i) => (
               <PaginationItem key={i}>
                 <PaginationLink 
                   href="#" 
                   isActive={topicsPage === i + 1} 
                   onClick={(e) => { e.preventDefault(); handleTopicsPageChange(i + 1); }}
                 >
                   {i + 1}
                 </PaginationLink>
               </PaginationItem>
             ))}
             <PaginationItem>
               <PaginationNext 
                 href="#" 
                 onClick={(e) => { e.preventDefault(); handleTopicsPageChange(topicsPage + 1); }} 
                 aria-disabled={topicsPage >= topicsTotalPages} 
                 className={topicsPage >= topicsTotalPages ? 'pointer-events-none opacity-50' : ''}
                />
             </PaginationItem>
           </PaginationContent>
         </Pagination>
       )}

       {/* Delete Confirmation Dialog */}
       <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>确认删除</AlertDialogTitle>
             <AlertDialogDescription>
               您确定要删除这个话题及其所有相关评论和点赞吗？此操作无法撤销。
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
             <AlertDialogAction 
                 onClick={handleConfirmDelete} 
                 disabled={isDeleting}
                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
                 {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                 确认删除
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

    </div>
  )
}

