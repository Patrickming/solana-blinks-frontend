"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useParams
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/app/components/ui/pagination";
import { Loader2, ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import { useAuth } from '@/app/context/auth-context';
import { useToast } from "@/app/components/ui/use-toast";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { SiteHeader } from "@/app/components/layout/site-header";

// --- Types (Should ideally be shared) ---
type Author = {
  id: number;
  username: string;
  avatar: string | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type TagType = {
  id: number;
  name: string;
  slug: string;
  color_classes: string | null;
};

type Post = {
  id: number;
  topic_id: number;
  parent_post_id: number | null; // For nested replies later?
  content: string;
  status: string;
  like_count: number;
  created_at: string;
  author: Author;
  userLiked: boolean; // Does the current user like this post?
};

type TopicDetails = {
  id: number;
  title: string;
  status: string;
  reply_count: number;
  like_count: number; // Likes on the initial post
  created_at: string;
  last_activity_at: string;
  author: Author;
  category: Category;
  tags: TagType[];
  initialPost: Post | null; // Include the initial post content
};

// --- API Fetching Function (Should ideally be shared) ---
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
            try { errorData = await response.json(); } catch (e) { /* Ignore */ }
            console.error("API Error:", errorData);
            throw new Error(errorData.message || `API request failed: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (response.status === 204) { return null; } 
        if (contentType && contentType.includes("application/json")) {
            try { return await response.json(); } catch (jsonError: any) { 
                console.error("JSON Parse Error:", jsonError);
                throw new Error(`Invalid JSON: ${jsonError.message}`);
            }
        } else {
            try { return await response.text(); } catch (textError) { return null; }
        }
    } catch (networkError: any) {
        console.error("Network Error:", networkError);
        throw new Error(`Network error: ${networkError.message}`);
    }
}


// --- Constants ---
const POSTS_LIMIT = 4; // Number of posts per page

// --- Topic Detail Page Component ---
export default function TopicDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams(); // Get route parameters
    const topicId = params.topicId as string; // Assuming the parameter name is topicId
    const { toast } = useToast(); // Use shadcn toast

    // --- State Variables ---
    const [topicDetails, setTopicDetails] = useState<TopicDetails | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoadingTopic, setIsLoadingTopic] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true); // Separate loading for posts
    const [topicError, setTopicError] = useState<string | null>(null);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [newReplyContent, setNewReplyContent] = useState("");
    const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
    const [replyViewMode, setReplyViewMode] = useState<'source' | 'preview'>('source');

    // --- Data Fetching ---

    // Fetch Topic Details
    const fetchTopicDetails = useCallback(async () => {
        if (!topicId || isNaN(Number(topicId))) {
             setTopicError("无效的主题 ID");
             setIsLoadingTopic(false);
             return;
        }
        setIsLoadingTopic(true);
        setTopicError(null);
        try {
            const data = await fetchApi(`/api/forum/topics/${topicId}`);
            if (!data || typeof data !== 'object') {
                throw new Error("未找到主题或数据格式无效");
            }
            setTopicDetails(data);
            // Initialize totalPages based on topic's reply_count - Removed check for isLoadingPosts
            // if (isLoadingPosts) { 
            setTotalPages(Math.ceil((data.reply_count || 0) / POSTS_LIMIT) || 1);
            // }
        } catch (err: any) {
            setTopicError(`无法加载主题详情: ${err.message}`);
            toast({ 
                title: '加载主题详情失败', 
                description: err.message, 
                variant: "destructive" 
            });
        } finally {
            setIsLoadingTopic(false);
        }
    }, [topicId, toast]);

    // Fetch Posts for a specific page
    const fetchPosts = useCallback(async (page: number) => {
        if (!topicId || isNaN(Number(topicId))) {
            setPostsError("无效的主题 ID");
            setIsLoadingPosts(false);
            return;
       }
        setIsLoadingPosts(true);
        setPostsError(null);
        const postsParams = new URLSearchParams({ 
            page: page.toString(), 
            limit: POSTS_LIMIT.toString() 
        });
        try {
            const data = await fetchApi(`/api/forum/topics/${topicId}/posts?${postsParams.toString()}`);
            console.log(`fetchPosts(page ${page}) API Response:`, JSON.stringify(data)); // <-- Log API response
            setPosts(data?.posts || []);
            setTotalPages(data?.totalPages || 1); // Update totalPages from API response
            setCurrentPage(page);
        } catch (err: any) {
            setPostsError(`无法加载评论: ${err.message}`);
            setPosts([]);
            setTotalPages(1);
            toast({ 
                title: '加载评论失败', 
                description: err.message, 
                variant: "destructive" 
            });
        } finally {
            setIsLoadingPosts(false);
        }
    }, [topicId, toast]);

    // --- Effects ---

    // Effect to Fetch Topic Details when topicId changes
    useEffect(() => {
        console.log("Effect: Fetching Topic Details for", topicId); // Add log
        fetchTopicDetails();
    }, [fetchTopicDetails]); // fetchTopicDetails depends only on topicId

    // Effect to Fetch Initial Posts (page 1) when topicId changes
    useEffect(() => {
        // We fetch initial posts only based on topicId changing.
        // fetchPosts itself handles checking if topicId is valid.
        console.log("Effect: Fetching Initial Posts for", topicId); // Add log
        fetchPosts(1);
    }, [fetchPosts]); // fetchPosts depends only on topicId

    // --- Event Handlers ---

    // Handle Post Pagination
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            fetchPosts(newPage);
        }
    };

    // Handle Liking/Unliking a Post (with Optimistic Update)
    const handleLikeToggle = async (postId: number, isCurrentlyLiked: boolean) => {
        if (!user) { 
            toast({ title: '请先登录再点赞', variant: "destructive" }); 
            return; 
        }
        const method = isCurrentlyLiked ? 'DELETE' : 'POST';
        
        // Store original state for rollback
        const originalPosts = JSON.parse(JSON.stringify(posts));
        const originalTopicDetails = topicDetails ? JSON.parse(JSON.stringify(topicDetails)) : null;

        // Optimistic UI Update
        const updateLikeState = (liked: boolean) => {
            const change = liked ? 1 : -1;
            // Update post in posts array
            setPosts(prev => prev.map(p => p.id === postId 
                ? { ...p, userLiked: liked, like_count: Math.max(0, p.like_count + change) } 
                : p
            ));
            // Update initialPost within topicDetails if it matches
             if (topicDetails?.initialPost?.id === postId) {
                 setTopicDetails(prev => prev ? { 
                     ...prev, 
                     initialPost: prev.initialPost 
                         ? { ...prev.initialPost, userLiked: liked, like_count: Math.max(0, prev.initialPost.like_count + change)} 
                         : null,
                     // Also update the topic's main like_count if the initial post was liked
                     like_count: Math.max(0, (prev.like_count ?? 0) + change) 
                    } : null
                 );
             }
        };
        updateLikeState(!isCurrentlyLiked); // Apply the change optimistically

        // API Call
        try {
          await fetchApi(`/api/forum/posts/${postId}/like`, { method }); 
          // Success toast handled by optimistic update feedback, maybe remove explicit toast here
          // toast.success(isCurrentlyLiked ? '取消点赞成功' : '点赞成功');
        } catch (err: any) {
          // Rollback on error
          setPosts(originalPosts);
          setTopicDetails(originalTopicDetails);
          toast({ 
              title: '操作失败', 
              description: `点赞/取消点赞失败: ${err.message}`, 
              variant: "destructive" 
          });
        }
      };

    // Handle Creating a New Reply
    const handleCreateReply = async () => {
        if (!user) { 
            toast({ title: '请先登录再回复', variant: "destructive" }); 
            return; 
        }
        if (!newReplyContent.trim()) {
             toast({ title: '回复内容不能为空', variant: "destructive" });
            return;
        }
        if (!topicDetails) { toast({ title: '无法获取主题信息', variant: "destructive" }); return; }

        setIsSubmittingReply(true);
        try {
            const payload = { content: newReplyContent };
            const newPost = await fetchApi(`/api/forum/topics/${topicId}/posts`, { 
                method: 'POST', 
                body: JSON.stringify(payload) 
            });

            toast({ title: '回复成功' });
            setNewReplyContent(""); // Clear textarea

             // Optimistically update reply count on topic details
             const newTotalReplies = (topicDetails.reply_count || 0) + 1;
             setTopicDetails(prev => prev ? {...prev, reply_count: newTotalReplies } : null);

            // Refresh comments by fetching the last page
             const newTotalPages = Math.ceil(newTotalReplies / POSTS_LIMIT);
             console.log(`handleCreateReply: Attempting to fetch last page: ${newTotalPages} (Total Replies: ${newTotalReplies})`); // <-- Log calculated page
             fetchPosts(newTotalPages || 1); // Fetch the last page (or page 1 if no replies before)
             
        } catch (err: any) {
            console.error("Reply creation failed:", err);
             toast({ 
                 title: '回复失败', 
                 description: err.message, 
                 variant: "destructive" 
             });
        } finally {
            setIsSubmittingReply(false);
        }
    };

    console.log(
        "Rendering TopicDetailPage. isLoadingTopic:", isLoadingTopic,
        "isLoadingPosts:", isLoadingPosts,
        "Topic ID:", topicDetails?.id,
        "Posts Count:", posts.length
    ); // <-- Add log here

    // --- Render Functions ---

    // Render Loading State
    if (isLoadingTopic) {
        // Wrap loading state in basic layout with header
        return (
            <>
                <SiteHeader />
                <div className="container mx-auto py-12 px-4 md:px-6 flex justify-center items-center min-h-[400px]">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
            </>
        );
    }

    // Render Error State for Topic
    if (topicError) {
        // Wrap error state in basic layout with header
        return (
            <>
                <SiteHeader />
                 <div className="container mx-auto py-12 px-4 md:px-6 text-center text-red-500">
                    <p>{topicError}</p>
                    <Button variant="link" onClick={() => router.back()} className="mt-4">返回</Button>
                </div>
            </>
        );
    }

    // Render Not Found (if topicDetails is null after loading and no error)
    if (!topicDetails) {
        // Wrap not found state in basic layout with header
         return (
             <>
                 <SiteHeader />
                 <div className="container mx-auto py-12 px-4 md:px-6 text-center text-muted-foreground">
                    <p>未找到该主题。</p>
                    <Button variant="link" onClick={() => router.push('/forum')} className="mt-4">返回论坛</Button>
                </div>
            </>
        );
    }

    // Render Main Content (Add SiteHeader here)
    return (
        <>
            <SiteHeader />
            <main className="container mx-auto py-8 px-4 md:px-6">
                {/* Back Button */}
                <Button onClick={() => router.push('/forum')} variant="outline" className="mb-6">
                    返回论坛列表
                </Button>

                {/* Topic Header Card */}
                <Card className="mb-6 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold mb-2">{topicDetails.title}</CardTitle>
                        {/* Meta Info: Author, Date, Category */}
                         <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                             <div className="flex items-center gap-1.5">
                                 <Avatar className="h-5 w-5">
                                     <AvatarImage src={topicDetails.author.avatar || undefined} alt={topicDetails.author.username} />
                                     <AvatarFallback className="text-xs">{topicDetails.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                                 </Avatar>
                                 <span>{topicDetails.author.username}</span>
                             </div>
                             <span>发布于 {formatDistanceToNow(new Date(topicDetails.created_at), { addSuffix: true, locale: zhCN })}</span>
                             <Badge variant="outline" className="py-0.5 px-1.5 text-xs">{topicDetails.category.name}</Badge>
                        </div>
                        {/* Tags */}
                        {topicDetails.tags && topicDetails.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {topicDetails.tags.map(tag => (
                                    <Badge 
                                        key={tag.id} 
                                        variant="secondary" 
                                        className={`text-xs font-normal ${tag.color_classes || 'bg-secondary text-secondary-foreground border-border'}`}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardHeader>

                    {/* Initial Post Content & Like */}
                    {topicDetails.initialPost && (
                         <>
                             <CardContent className="pt-0 pb-4 prose lg:prose-lg dark:prose-invert max-w-none">
                                 {/* View Mode Toggle */}
                                 <div className="flex items-center justify-end space-x-2 mb-4">
                                    <Label htmlFor="view-mode-toggle" className="text-sm text-muted-foreground">原文</Label>
                                    <Switch
                                        id="view-mode-toggle"
                                        checked={viewMode === 'preview'}
                                        onCheckedChange={(checked) => setViewMode(checked ? 'preview' : 'source')}
                                        aria-label="切换预览/原文模式"
                                    />
                                     <Label htmlFor="view-mode-toggle" className="text-sm text-muted-foreground">预览</Label>
                                </div>

                                 {/* Conditional Rendering based on viewMode */}
                                 {viewMode === 'preview' ? (
                                     <div>
                                         {/* Restore dynamic content */}
                                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{topicDetails.initialPost.content}</ReactMarkdown>
                                     </div>
                                 ) : (
                                     <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words">
                                         {/* Source view already shows dynamic content */}
                                         <code>{topicDetails.initialPost.content}</code>
                                     </pre>
                                 )}
                             </CardContent>
                             <CardFooter className="pt-3 pb-4 border-t flex justify-end">
                                  <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleLikeToggle(topicDetails.initialPost!.id, topicDetails.initialPost!.userLiked)}
                                      disabled={!user} 
                                      className={`h-7 px-2 ${topicDetails.initialPost.userLiked ? 'text-primary hover:text-primary' : 'text-muted-foreground'}`}
                                  >
                                      <ThumbsUp className="w-4 h-4 mr-1" /> {topicDetails.initialPost.like_count}
                                  </Button>
                             </CardFooter>
                         </>
                     )}
                    {!topicDetails.initialPost && topicDetails.like_count > 0 && ( // Show topic like count if initial post is missing but likes exist
                         <CardFooter className="pt-3 pb-4 border-t flex justify-end">
                              <span className="text-sm text-muted-foreground flex items-center">
                                   <ThumbsUp className="w-4 h-4 mr-1" /> {topicDetails.like_count}
                              </span>
                         </CardFooter>
                    )}
                     {!topicDetails.initialPost && topicDetails.like_count === 0 && (
                          <CardContent className="pt-0 pb-4"><p className="text-sm text-muted-foreground italic">此主题没有初始内容。</p></CardContent>
                     )}
                </Card>

                {/* Replies Section */}
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    回复 ({topicDetails.reply_count ?? 0})
                </h2>

                 {/* Loading and Error for Posts */}
                 {isLoadingPosts && (
                     <div className="flex justify-center items-center py-8">
                         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                     </div>
                 )}
                 {!isLoadingPosts && postsError && (
                     <div className="text-center py-8 text-red-500">
                         <p>{postsError}</p>
                          <Button variant="link" onClick={() => fetchPosts(currentPage)} className="mt-2">重试加载评论</Button>
                     </div>
                 )}
                 {!isLoadingPosts && !postsError && posts.length === 0 && topicDetails.reply_count > 0 && (
                     <p className="text-center py-8 text-muted-foreground">无法加载评论，请稍后再试。</p> // Error case if count > 0 but fetch failed silently or returned empty
                 )}
                 {!isLoadingPosts && !postsError && posts.length === 0 && topicDetails.reply_count === 0 && (
                     <p className="text-center py-8 text-muted-foreground">还没有人回复，快来抢沙发吧！</p>
                 )}

                 {/* Render Posts */}
                 {!isLoadingPosts && !postsError && posts.length > 0 && (
                     <div className="space-y-4 mb-6">
                         {posts.map(post => (
                             <Card key={post.id} className="shadow-sm border border-border/60">
                                 <CardHeader className="flex flex-row justify-between items-center pb-2 pt-3 px-4">
                                     <div className="flex items-center space-x-2 text-xs">
                                         <Avatar className="h-5 w-5">
                                             <AvatarImage src={post.author.avatar || undefined} alt={post.author.username} />
                                             <AvatarFallback className="text-[10px]">{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                                         </Avatar>
                                         <span className="font-medium">{post.author.username}</span>
                                         <span className="text-muted-foreground">
                                             · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}
                                         </span>
                                     </div>
                                     {/* Reply-to-Post Button (Future Feature) */}
                                 </CardHeader>
                                 <CardContent className="pb-3 pt-1 px-4 pl-11 prose dark:prose-invert max-w-none text-sm">
                                     {/* Conditional Rendering for Replies */}
                                     {viewMode === 'preview' ? (
                                         <div>
                                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                 {post.content}
                                             </ReactMarkdown>
                                         </div>
                                     ) : (
                                         <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono whitespace-pre-wrap break-words">
                                             <code>{post.content}</code>
                                         </pre>
                                     )}
                                 </CardContent>
                                 <CardFooter className="pt-1 pb-2 px-4 pl-11 flex justify-end">
                                     <Button
                                         variant="ghost" 
                                         size="sm" 
                                         onClick={() => handleLikeToggle(post.id, post.userLiked)}
                                         disabled={!user} 
                                         className={`h-6 px-1.5 ${post.userLiked ? 'text-primary hover:text-primary' : 'text-muted-foreground'}`}
                                         aria-label={post.userLiked ? '取消点赞' : '点赞'}
                                     >
                                         <ThumbsUp className="w-3.5 h-3.5 mr-1" /> {post.like_count}
                                     </Button>
                                     {/* Other actions? */}
                                 </CardFooter>
                             </Card>
                         ))}
                     </div>
                 )}

                {/* Posts Pagination */}
                {!isLoadingPosts && totalPages > 1 && (
                    <Pagination className="my-8">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} 
                                    aria-disabled={currentPage <= 1} 
                                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink 
                                        href="#" 
                                        isActive={currentPage === i + 1} 
                                        onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} 
                                    aria-disabled={currentPage >= totalPages} 
                                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

                 {/* Reply Form */}
                 <Card className="mt-8 border border-border/80 shadow-sm">
                     <CardHeader className="flex flex-row justify-between items-center pb-3">
                         <CardTitle className="text-base font-medium">发表你的回复</CardTitle>
                          {/* Reply View Mode Toggle */}
                         {user && ( 
                             <div className="flex items-center space-x-2">
                                 <Label htmlFor="reply-view-mode-toggle" className="text-sm text-muted-foreground">原文</Label>
                                 <Switch
                                     id="reply-view-mode-toggle"
                                     checked={replyViewMode === 'preview'}
                                     onCheckedChange={(checked) => setReplyViewMode(checked ? 'preview' : 'source')}
                                     aria-label="切换回复预览/原文模式"
                                 />
                                 <Label htmlFor="reply-view-mode-toggle" className="text-sm text-muted-foreground">预览</Label>
                             </div>
                         )}
                     </CardHeader>
                     <CardContent>
                         {user ? (
                             <div>
                                 {replyViewMode === 'source' ? (
                                     <form onSubmit={(e) => { e.preventDefault(); handleCreateReply(); }} className="space-y-3">
                                         <Textarea 
                                             value={newReplyContent} 
                                             onChange={(e) => setNewReplyContent(e.target.value)} 
                                             placeholder="写下你的想法 (支持 Markdown)..."
                                             rows={5} 
                                             required 
                                             disabled={isSubmittingReply}
                                             className="focus-visible:ring-primary/50 font-mono text-sm"
                                         />
                                         <div className="flex justify-end">
                                             <Button type="submit" disabled={isSubmittingReply || !newReplyContent.trim()} className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">
                                                  {isSubmittingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                                                  提交回复
                                             </Button>
                                         </div>
                                     </form>
                                  ) : ( 
                                     <div className="prose dark:prose-invert max-w-none text-sm p-3 border rounded-md min-h-[140px] bg-background">
                                         <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                             {newReplyContent || "*无内容可预览*"} 
                                         </ReactMarkdown>
                                     </div>
                                  )}
                             </div>
                         ) : (
                             <p className="text-center text-muted-foreground">
                                 请 <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login?redirect=/forum/' + topicId )}>登录</Button> 后发表回复。
                             </p>
                         )}
                     </CardContent>
                 </Card>
            </main>
        </>
    );
} 