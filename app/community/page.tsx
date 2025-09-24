"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  MessageCircle,
  ThumbsUp,
  Star,
  Trophy,
  ArrowLeft,
  Search,
  Plus,
  Clock,
  CheckCircle,
  Smartphone,
  Laptop,
  Headphones,
  Wrench,
  Leaf,
  Upload,
  Hash,
  Heart,
  MessageSquare,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function CommunityPage() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      name: "Emma Rodriguez",
      title: "Where can I recycle old batteries safely?",
      content:
        "I have a collection of old phone and laptop batteries. What's the safest way to dispose of them? Are there specific recycling centers I should look for?",
      image: null,
      likes: 12,
      liked: false,
      comments: [
        {
          id: 1,
          name: "David Chen",
          content: "Check with Best Buy - they have a battery recycling program at most locations!",
          time: "2 hours ago",
        },
        {
          id: 2,
          name: "Sarah Kim",
          content: "Never throw batteries in regular trash! Most electronics stores accept them for free recycling.",
          time: "1 hour ago",
        },
      ],
      timeAgo: "4 hours ago",
      hashtags: ["#BatteryRecycling", "#EwasteAwareness"],
    },
    {
      id: 2,
      name: "Marcus Johnson",
      title: "Successfully donated my old laptop parts!",
      content:
        "Just dropped off my old ThinkPad at a local repair shop. They were thrilled to get the RAM and hard drive for other repairs. Feels great to give electronics a second life!",
      image: "/person-repairing-smartphone-with-tools-on-clean-wo.jpg",
      likes: 28,
      liked: false,
      comments: [
        {
          id: 1,
          name: "Lisa Park",
          content: "That's awesome! Which repair shop did you go to? I have some old parts too.",
          time: "3 hours ago",
        },
        {
          id: 2,
          name: "Alex Thompson",
          content: "Love this! I've been collecting old components to donate as well. Thanks for the inspiration!",
          time: "2 hours ago",
        },
      ],
      timeAgo: "6 hours ago",
      hashtags: ["#SecondLifeElectronics", "#DonateNotDump"],
    },
    {
      id: 3,
      name: "Priya Patel",
      title: "Tips for safely disposing of old smartphones",
      content:
        "Here's what I learned about smartphone disposal: 1) Wipe all data completely, 2) Remove SIM and SD cards, 3) Find certified e-waste recyclers, 4) Consider trade-in programs first!",
      image: null,
      likes: 35,
      liked: false,
      comments: [
        {
          id: 1,
          name: "Tom Wilson",
          content: "Great tips! Also remember to sign out of all accounts before wiping.",
          time: "5 hours ago",
        },
        {
          id: 2,
          name: "Nina Garcia",
          content: "Apple and Samsung both have good trade-in programs even for older devices.",
          time: "4 hours ago",
        },
        {
          id: 3,
          name: "Jake Miller",
          content: "Don't forget to back up photos and contacts before wiping!",
          time: "3 hours ago",
        },
      ],
      timeAgo: "8 hours ago",
      hashtags: ["#RecycleYourPhone", "#DataSafety"],
    },
  ])

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    content: "",
    image: null,
  })

  const [replyForms, setReplyForms] = useState<{ [key: number]: { name: string; content: string } }>({})
  const [showReplyForm, setShowReplyForm] = useState<{ [key: number]: boolean }>({})

  const ecoTips = [
    "Donate old electronics to repair shops",
    "Never throw batteries in regular trash",
    "Recycle responsibly to save resources",
    "Consider repair before replacement",
    "Use certified e-waste recyclers only",
    "Wipe data before disposing devices",
  ]

  const trendingHashtags = [
    "#RecycleYourPhone",
    "#EwasteAwareness",
    "#SecondLifeElectronics",
    "#BatteryRecycling",
    "#DonateNotDump",
    "#RepairFirst",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.title && formData.content) {
      const newPost = {
        id: posts.length + 1,
        name: formData.name,
        title: formData.title,
        content: formData.content,
        image: formData.image,
        likes: 0,
        liked: false,
        comments: [],
        timeAgo: "Just now",
        hashtags: [],
      }
      setPosts([newPost, ...posts])
      setFormData({ name: "", title: "", content: "", image: null })
    }
  }

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
            liked: !post.liked,
          }
        }
        return post
      }),
    )
  }

  const handleReplySubmit = (postId: number, e: React.FormEvent) => {
    e.preventDefault()
    const replyData = replyForms[postId]
    if (replyData && replyData.name && replyData.content) {
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            const newComment = {
              id: post.comments.length + 1,
              name: replyData.name,
              content: replyData.content,
              time: "Just now",
            }
            return {
              ...post,
              comments: [...post.comments, newComment],
            }
          }
          return post
        }),
      )

      setReplyForms({ ...replyForms, [postId]: { name: "", content: "" } })
      setShowReplyForm({ ...showReplyForm, [postId]: false })
    }
  }

  const updateReplyForm = (postId: number, field: string, value: string) => {
    setReplyForms({
      ...replyForms,
      [postId]: {
        ...replyForms[postId],
        [field]: value,
      },
    })
  }

  const toggleReplyForm = (postId: number) => {
    setShowReplyForm({ ...showReplyForm, [postId]: !showReplyForm[postId] })
    if (!replyForms[postId]) {
      setReplyForms({ ...replyForms, [postId]: { name: "", content: "" } })
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "smartphone":
        return <Smartphone className="w-4 h-4" />
      case "laptop":
        return <Laptop className="w-4 h-4" />
      case "headphones":
        return <Headphones className="w-4 h-4" />
      default:
        return <Wrench className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CircuitBhai%20png-JnoLSbsOUcbKHo4etgaInv0EGgE5qI.png"
                alt="CircuitBhai Logo"
                className="w-50 h-50 object-contain bg-transparent"
              />
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">CircuitBhai Community Hub</h2>
          <p className="text-lg text-muted-foreground">Ask, Share, and Learn How to Reduce E-Waste</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Plus className="w-5 h-5 text-green-600" />
                  Share Your E-Waste Question or Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Post Title / Topic</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Where can I recycle old batteries?"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Post Content / Description</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Share your question, tip, or success story..."
                      className="bg-background min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Optional Image Upload</Label>
                    <div className="border-2 border-dashed border-green-200 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    </div>
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    Post to Community
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Community Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-6 bg-card">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-medium">
                          {post.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{post.name}</h3>
                            <span className="text-sm text-muted-foreground">• {post.timeAgo}</span>
                          </div>
                          <h4 className="font-medium text-lg mb-2">{post.title}</h4>
                          <p className="text-muted-foreground mb-3">{post.content}</p>

                          {post.image && (
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt="Post image"
                              className="rounded-lg mb-3 max-w-md h-48 object-cover"
                            />
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            {post.hashtags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`text-muted-foreground hover:text-red-500 ${post.liked ? "text-red-500" : ""}`}
                              onClick={() => handleLike(post.id)}
                            >
                              <Heart className={`w-4 h-4 mr-1 ${post.liked ? "fill-current" : ""}`} />
                              {post.likes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                              onClick={() => toggleReplyForm(post.id)}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {post.comments.length} Reply
                            </Button>
                          </div>

                          {/* Comments */}
                          <div className="space-y-3 pl-4 border-l-2 border-green-100">
                            {post.comments.map((comment, index) => (
                              <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{comment.name}</span>
                                  <span className="text-xs text-muted-foreground">{comment.time}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                              </div>
                            ))}

                            {showReplyForm[post.id] && (
                              <div className="bg-background border rounded-lg p-4 mt-3">
                                <form onSubmit={(e) => handleReplySubmit(post.id, e)} className="space-y-3">
                                  <div>
                                    <Input
                                      placeholder="Your name"
                                      value={replyForms[post.id]?.name || ""}
                                      onChange={(e) => updateReplyForm(post.id, "name", e.target.value)}
                                      className="bg-background"
                                    />
                                  </div>
                                  <div>
                                    <Textarea
                                      placeholder="Write your reply..."
                                      value={replyForms[post.id]?.content || ""}
                                      onChange={(e) => updateReplyForm(post.id, "content", e.target.value)}
                                      className="bg-background min-h-[80px]"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Send className="w-4 h-4 mr-1" />
                                      Reply
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowReplyForm({ ...showReplyForm, [post.id]: false })}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search community posts..." className="pl-10 bg-background border-border" />
                  </div>
                  <Button
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
                  >
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageCircle className="w-5 h-5 text-accent" />
                  Recent Repair Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                              {getDeviceIcon(post.device)}
                            </div>
                            <h3 className="font-medium text-foreground hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            {post.solved && (
                              <Badge className="bg-accent/10 text-accent border-accent/20">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Solved
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>by {post.author}</span>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post.replies} replies
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {post.likes} likes
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.timeAgo}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Eco-Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ecoTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-green-50">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-green-800">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Hash className="w-5 h-5 text-blue-600" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.map((hashtag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer"
                    >
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Trophy className="w-5 h-5 text-primary" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                        {post.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{post.name}</div>
                        <div className="text-sm text-muted-foreground">{post.likes} points</div>
                      </div>
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        {post.device}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="text-foreground">Community Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4" />
                  Ask a Question
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-accent/20 text-accent hover:bg-accent/5 bg-transparent"
                >
                  <Star className="w-4 h-4" />
                  Share Success Story
                </Button>
                <Link href="/chat">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Get AI Help
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Be respectful and helpful</p>
                <p>• Share detailed repair steps</p>
                <p>• Include photos when possible</p>
                <p>• Mark solved posts as complete</p>
                <p>• Give credit to helpful answers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
