"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, ThumbsUp, Share2, Search, Plus, MessageCircle } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export function ForumContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [newTopicTitle, setNewTopicTitle] = useState("")
  const [newTopicContent, setNewTopicContent] = useState("")
  const [newTopicCategory, setNewTopicCategory] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t, currentLanguage } = useLanguage()

  const { toast } = useToast()

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !newTopicCategory) {
      toast({
        title: t("forum.validation.title"),
        description: t("forum.validation.description"),
        variant: "destructive",
      })
      return
    }

    toast({
      title: t("forum.success.title"),
      description: t("forum.success.description"),
    })

    setNewTopicTitle("")
    setNewTopicContent("")
    setNewTopicCategory("")
    setIsDialogOpen(false)
  }

  // 社区话题的示例数据（中文版）
  const topics = [
    {
      id: 1,
      title: t("forum.topics.tokenSwap.title"),
      content: t("forum.topics.tokenSwap.content"),
      author: "币圈爱好者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: t("forum.topics.tokenSwap.date"),
      category: "discussion",
      replies: 12,
      likes: 24,
      isHot: true,
      isOfficial: false,
    },
    {
      id: 2,
      title: t("forum.topics.sdkAnnouncement.title"),
      content: t("forum.topics.sdkAnnouncement.content"),
      author: "Solana团队",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: t("forum.topics.sdkAnnouncement.date"),
      category: "announcement",
      replies: 8,
      likes: 42,
      isHot: true,
      isOfficial: true,
    },
    {
      id: 3,
      title: t("forum.topics.reactNative.title"),
      content: t("forum.topics.reactNative.content"),
      author: "移动开发者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: t("forum.topics.reactNative.date"),
      category: "help",
      replies: 5,
      likes: 7,
      isHot: false,
      isOfficial: false,
    },
    {
      id: 4,
      title: t("forum.topics.nftCollection.title"),
      content: t("forum.topics.nftCollection.content"),
      author: "NFT创作者",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: t("forum.topics.nftCollection.date"),
      category: "showcase",
      replies: 3,
      likes: 15,
      isHot: false,
      isOfficial: false,
    },
  ]

  const filteredTopics = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90">
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topic-category">{t("forum.newTopic.form.categoryLabel")}</Label>
                <Select value={newTopicCategory} onValueChange={setNewTopicCategory}>
                  <SelectTrigger id="topic-category">
                    <SelectValue placeholder={t("forum.newTopic.form.categoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discussion">{t("forum.categories.discussion")}</SelectItem>
                    <SelectItem value="help">{t("forum.categories.help")}</SelectItem>
                    <SelectItem value="showcase">{t("forum.categories.showcase")}</SelectItem>
                    <SelectItem value="feedback">{t("forum.categories.feedback")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="topic-content">{t("forum.newTopic.form.contentLabel")}</Label>
                <Textarea
                  id="topic-content"
                  placeholder={t("forum.newTopic.form.contentPlaceholder")}
                  className="min-h-[150px]"
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("forum.newTopic.form.cancelButton")}
              </Button>
              <Button
                onClick={handleCreateTopic}
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
              >
                {t("forum.newTopic.form.submitButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">{t("forum.tabs.all")}</TabsTrigger>
          <TabsTrigger value="discussion">{t("forum.tabs.discussion")}</TabsTrigger>
          <TabsTrigger value="help">{t("forum.tabs.help")}</TabsTrigger>
          <TabsTrigger value="showcase">{t("forum.tabs.showcase")}</TabsTrigger>
          <TabsTrigger value="announcement">{t("forum.tabs.announcement")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => (
              <Card key={topic.id} className="glass-morphism">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        {topic.isHot && (
                          <Badge variant="secondary" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                            {t("forum.badges.hot")}
                          </Badge>
                        )}
                        {topic.isOfficial && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                            {t("forum.badges.official")}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">{topic.content}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {t(`forum.categories.${topic.category}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={topic.authorAvatar} alt={topic.author} />
                      <AvatarFallback>{topic.author.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{topic.author}</p>
                      <p className="text-xs text-muted-foreground">{topic.date}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-4">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{topic.replies}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{topic.likes}</span>
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    {t("forum.actions.share")}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("forum.search.noResults")}</p>
              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                {t("forum.search.clear")}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Similar structure for other tabs (discussion, help, showcase, announcement) */}
      </Tabs>
    </div>
  )
}

