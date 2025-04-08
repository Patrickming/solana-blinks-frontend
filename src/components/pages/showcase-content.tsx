"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Link, ThumbsUp, MessageSquare, ExternalLink, Search } from "lucide-react"

export function ShowcaseContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [comment, setComment] = useState("")
  const { toast } = useToast()

  const handleCommentSubmit = () => {
    if (!comment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment before submitting",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Comment Submitted",
      description: "Your comment has been added to the case study",
    })
    setComment("")
  }

  // Mock data for case studies
  const caseStudies = [
    {
      id: 1,
      title: "NFT Collection Launch",
      description: "How a digital artist used Blinks to simplify NFT purchases during a collection launch",
      category: "nft",
      author: "Elena M.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "2 weeks ago",
      likes: 42,
      comments: 8,
      link: "#",
    },
    {
      id: 2,
      title: "Token Swap Integration",
      description: "A DeFi platform that integrated Blinks to streamline token swaps for users",
      category: "defi",
      author: "Michael K.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "1 month ago",
      likes: 36,
      comments: 5,
      link: "#",
    },
    {
      id: 3,
      title: "Community Airdrop",
      description: "How a DAO used Blinks to distribute token airdrops to community members",
      category: "dao",
      author: "Sarah J.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "3 weeks ago",
      likes: 29,
      comments: 12,
      link: "#",
    },
    {
      id: 4,
      title: "Gaming Marketplace",
      description: "A Solana game that implemented Blinks for in-game asset purchases",
      category: "gaming",
      author: "David L.",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "5 days ago",
      likes: 51,
      comments: 7,
      link: "#",
    },
  ]

  const filteredCaseStudies = caseStudies.filter(
    (study) =>
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Case Showcase</h2>
        <p className="text-muted-foreground">Explore real-world applications and success stories using Solana Blinks</p>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search case studies..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">Filters</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="defi">DeFi</TabsTrigger>
          <TabsTrigger value="nft">NFT</TabsTrigger>
          <TabsTrigger value="dao">DAO</TabsTrigger>
          <TabsTrigger value="gaming">Gaming</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredCaseStudies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCaseStudies.map((study) => (
                <Card key={study.id} className="glass-morphism overflow-hidden">
                  <div
                    className={`h-2 bg-gradient-to-r ${
                      study.category === "defi"
                        ? "from-blue-500 to-cyan-500"
                        : study.category === "nft"
                          ? "from-purple-500 to-pink-500"
                          : study.category === "dao"
                            ? "from-green-500 to-emerald-500"
                            : "from-orange-500 to-yellow-500"
                    }`}
                  />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{study.title}</CardTitle>
                        <CardDescription className="mt-1">{study.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {study.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={study.authorAvatar} alt={study.author} />
                        <AvatarFallback>{study.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{study.author}</p>
                        <p className="text-xs text-muted-foreground">{study.date}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-4">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{study.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{study.comments}</span>
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Case Study
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No case studies found matching your search.</p>
              <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                Clear search
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Other category tabs would filter by category */}
        <TabsContent value="defi" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCaseStudies
              .filter((study) => study.category === "defi")
              .map((study) => (
                <Card key={study.id} className="glass-morphism overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{study.title}</CardTitle>
                        <CardDescription className="mt-1">{study.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {study.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={study.authorAvatar} alt={study.author} />
                        <AvatarFallback>{study.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{study.author}</p>
                        <p className="text-xs text-muted-foreground">{study.date}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-4">
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{study.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{study.comments}</span>
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Case Study
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Similar structure for other tabs (nft, dao, gaming) */}
      </Tabs>

      <Card className="glass-morphism mt-8">
        <CardHeader>
          <CardTitle>Featured Case Study</CardTitle>
          <CardDescription>
            NFT Collection Launch: How a digital artist used Blinks to simplify NFT purchases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
            <Link className="h-12 w-12 text-muted-foreground" />
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Digital artist Elena M. faced challenges with her NFT collection launch, particularly around the user
              experience of purchasing NFTs. Traditional methods required multiple steps and technical knowledge that
              created friction for potential buyers.
            </p>
            <p>
              By implementing Solana Blinks, Elena created simple, shareable links for each NFT in her collection. These
              links allowed buyers to complete purchases in a single click, dramatically increasing conversion rates and
              reducing support requests.
            </p>
            <p>The results were impressive:</p>
            <ul>
              <li>85% reduction in abandoned purchase attempts</li>
              <li>42% increase in overall sales</li>
              <li>Positive feedback from non-technical collectors</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Comments (8)</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">John Doe</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                  <p className="text-sm mt-1">
                    This is exactly what I needed for my upcoming collection launch. Thanks for sharing!
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Alice Smith</p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                  <p className="text-sm mt-1">
                    I've been using Blinks for my NFT sales and the difference in user experience is night and day.
                    Highly recommended!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Add your comment..."
                className="min-h-[80px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                onClick={handleCommentSubmit}
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
              >
                Post Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

