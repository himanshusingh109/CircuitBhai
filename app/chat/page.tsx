"use client"

import type React from "react"

import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scrollarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Smartphone,
  Laptop,
  Headphones,
  Wrench,
  ArrowLeft,
  Loader2,
  Play,
  X,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Leaf,
  Recycle,
  TreePine,
  Award,
} from "lucide-react"
import Link from "next/link"
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from "@/lib/youtube"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  deviceType?: string
  deviceModel?: string
  needsDeviceInfo?: boolean
  recommendedVideos?: Array<{
    id: string
    title: string
    thumbnail: string
    channelTitle: string
    duration?: string
    viewCount?: string
  }>
}

const deviceTypes = [
  { id: "smartphone", label: "Smartphone", icon: Smartphone },
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "headphones", label: "Headphones", icon: Headphones },
  { id: "appliance", label: "Appliance", icon: Wrench },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi! I'm your AI repair assistant. 🔧

To provide you with the most accurate help and relevant video tutorials, I need to know about your device.

**Please tell me:**
1. **Device Type** (smartphone, laptop, tablet, etc.)
2. **Brand and Model** (e.g., iPhone 14 Pro, Samsung Galaxy S23, MacBook Pro 2023)

**Examples:**
• "iPhone 13 Pro"
• "Dell XPS 13 laptop"
• "Samsung Galaxy S23 Ultra"
• "MacBook Air M2"

You can either click the device buttons on the left or type your device details directly!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [deviceModel, setDeviceModel] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [embeddedVideo, setEmbeddedVideo] = useState<string | null>(null)
  const [repairProgress, setRepairProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [showEnvironmentalImpact, setShowEnvironmentalImpact] = useState(false)
  const [videoCompleted, setVideoCompleted] = useState(false)
const scrollAreaRef = useRef<HTMLDivElement>(null)

const scrollToBottom = () => {
  if (scrollAreaRef.current) {
    // Find the viewport element within the ScrollArea component
    const viewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
    if (viewport) {
      // We use 'auto' for behavior to ensure it's instant and reliable
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "auto" })
    }
  }
}

useLayoutEffect(() => {
  scrollToBottom()
}, [messages])

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId)
    setRepairProgress(25) // Update progress when device is selected
    setCurrentStep("Device selected")

    const deviceLabel = deviceTypes.find((d) => d.id === deviceId)?.label
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I need help with my ${deviceLabel?.toLowerCase()}`,
      timestamp: new Date(),
      deviceType: deviceId,
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI response asking for model
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Great! I can help you with your ${deviceLabel?.toLowerCase()}. 📱

To find the most relevant repair tutorials, please tell me the **specific brand and model**.

**Examples for ${deviceLabel?.toLowerCase()}:**
${
  deviceId === "smartphone"
    ? "• iPhone 14 Pro\n• Samsung Galaxy S23 Ultra\n• Google Pixel 7\n• OnePlus 11"
    : deviceId === "laptop"
      ? "• MacBook Pro M2 2023\n• Dell XPS 13\n• HP Spectre x360\n• Lenovo ThinkPad X1"
      : deviceId === "headphones"
        ? "• Sony WH-1000XM4\n• Bose QuietComfort 45\n• Apple AirPods Pro\n• Sennheiser HD 660S"
        : "• Samsung Smart TV\n• LG Refrigerator\n• Dyson V15\n• KitchenAid Mixer"
}

What's the exact model of your ${deviceLabel?.toLowerCase()}?`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      deviceType: selectedDevice,
      deviceModel: deviceModel,
    }

    setMessages((prev) => [...prev, userMessage])

    if (!deviceModel && input.length > 5) {
      const extractedModel = input.trim()
      setDeviceModel(extractedModel)
      userMessage.deviceModel = extractedModel
      setRepairProgress(50) // Update progress when model is provided
      setCurrentStep("Device model identified")
    }

    setInput("")
    setIsLoading(true)

    try {
      // Call our API route for AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          deviceType: selectedDevice,
          deviceModel: deviceModel || input.trim(),
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      if (data.recommendedVideos && data.recommendedVideos.length > 0) {
        setRepairProgress(75)
        setCurrentStep("Repair guidance provided")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        needsDeviceInfo: data.needsDeviceInfo,
        recommendedVideos: data.recommendedVideos,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmbedVideo = (videoId: string) => {
    setEmbeddedVideo(videoId)
    setRepairProgress(90)
    setCurrentStep("Watching repair tutorial")
    setVideoCompleted(false)
  }

  const closeEmbeddedVideo = () => {
    setEmbeddedVideo(null)
    if (!videoCompleted) {
      setRepairProgress(100)
      setCurrentStep("Repair tutorial completed")
      setVideoCompleted(true)
      setShowEnvironmentalImpact(true)
    }
  }

  const awardEcoPoints = async (deviceType: string, ecoPoints: number) => {
    try {
      console.log("[v0] Awarding eco points:", { deviceType, ecoPoints })

      const response = await fetch("/api/eco-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deviceType: deviceType,
          amount: ecoPoints,
          description: `${deviceType} repair completed successfully`,
          repairSessionId: `repair_${Date.now()}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Failed to award eco points:", errorData)
        return false
      }

      const result = await response.json()
      console.log("[v0] Eco points awarded successfully:", result)
      return true
    } catch (error) {
      console.error("[v0] Error awarding eco points:", error)
      return false
    }
  }

  const closeEnvironmentalImpact = async () => {
    // Award eco points to the database when user completes repair
    if (selectedDevice) {
      const impact = getEnvironmentalImpact()
      const success = await awardEcoPoints(selectedDevice, impact.ecoPoints)

      if (success) {
        console.log("[v0] Eco points successfully saved to database")
      } else {
        console.log("[v0] Failed to save eco points to database")
      }
    }

    setShowEnvironmentalImpact(false)
  }

  const getEnvironmentalImpact = () => {
    const impacts = {
      smartphone: {
        eWasteSaved: "0.2 kg",
        carbonReduced: "15 kg CO₂",
        materialsRecovered: "Gold, Silver, Copper",
        ecoPoints: 50,
      },
      laptop: {
        eWasteSaved: "2.5 kg",
        carbonReduced: "180 kg CO₂",
        materialsRecovered: "Lithium, Rare Earth Metals",
        ecoPoints: 200,
      },
      headphones: {
        eWasteSaved: "0.3 kg",
        carbonReduced: "8 kg CO₂",
        materialsRecovered: "Plastic, Copper, Magnets",
        ecoPoints: 30,
      },
      appliance: {
        eWasteSaved: "5.0 kg",
        carbonReduced: "300 kg CO₂",
        materialsRecovered: "Steel, Aluminum, Copper",
        ecoPoints: 350,
      },
    }

    return impacts[selectedDevice as keyof typeof impacts] || impacts.smartphone
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <MessageCircle className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">AI Repair Assistant</h1>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Device Selection */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Device Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deviceTypes.map((device) => {
                  const Icon = device.icon
                  return (
                    <Button
                      key={device.id}
                      variant={selectedDevice === device.id ? "default" : "outline"}
                      className={`w-full justify-start gap-3 ${
                        selectedDevice === device.id
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "border-border hover:bg-muted text-foreground"
                      }`}
                      onClick={() => handleDeviceSelect(device.id)}
                    >
                      <Icon className="w-4 h-4" />
                      {device.label}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {selectedDevice && (
              <Card className="border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Repair Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{repairProgress}%</span>
                    </div>
                    <Progress value={repairProgress} className="h-2" />
                  </div>
                  {currentStep && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">{currentStep}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {deviceModel && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Device Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {deviceModel}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {selectedDevice && (
              <Card className="border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Be specific about the problem</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Mention when it started</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Include any error messages</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col border-2 border-primary/20">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">Repair Chat</CardTitle>
                  <div className="flex gap-2">
                    {selectedDevice && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {deviceTypes.find((d) => d.id === selectedDevice)?.label}
                      </Badge>
                    )}
                    {deviceModel && (
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        {deviceModel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-card-foreground border"
                        }`}
                      >
                        <MarkdownRenderer content={message.content} />

                        {message.recommendedVideos && message.recommendedVideos.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <div className="text-sm font-medium text-foreground border-t border-border pt-3">
                              📺 Recommended Repair Videos:
                            </div>
                            {message.recommendedVideos.map((video, index) => (
                              <div key={index} className="bg-background rounded-lg p-3 border border-border shadow-sm">
                                <div className="flex gap-3">
                                  <img
                                    src={video.thumbnail || "/placeholder.svg?height=60&width=80"}
                                    alt={video.title}
                                    className="w-20 h-15 rounded object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                                      {video.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mb-2">{video.channelTitle}</p>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="text-xs h-7 px-2 bg-primary hover:bg-primary/90"
                                        onClick={() => handleEmbedVideo(video.id)}
                                      >
                                        <Play className="w-3 h-3 mr-1" />
                                        Play Here
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-7 px-2 bg-transparent"
                                        asChild
                                      >
                                        <a
                                          href={getYouTubeWatchUrl(video.id)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Watch on YouTube
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-card rounded-2xl px-4 py-3 border">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Analyzing your issue...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      !selectedDevice
                        ? "Tell me your device type and model (e.g., iPhone 14 Pro)..."
                        : !deviceModel
                          ? "What's the exact model of your device?"
                          : "Describe the issue with your device..."
                    }
                    disabled={isLoading}
                    className="flex-1 bg-input border-border"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {embeddedVideo && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden border shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Repair Tutorial</h3>
              <Button variant="ghost" size="sm" onClick={closeEmbeddedVideo} className="hover:bg-muted">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(embeddedVideo, true)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Repair Tutorial Video"
                onLoad={() => {
                  // Listen for video end events via postMessage
                  const handleMessage = (event: MessageEvent) => {
                    if (event.origin === "https://www.youtube.com" && event.data) {
                      const data = JSON.parse(event.data)
                      if (data.event === "video-ended") {
                        setRepairProgress(100)
                        setCurrentStep("Repair tutorial completed")
                        setVideoCompleted(true)
                        setShowEnvironmentalImpact(true)
                      }
                    }
                  }
                  window.addEventListener("message", handleMessage)
                  return () => window.removeEventListener("message", handleMessage)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Environmental Impact Popup */}
      <Dialog open={showEnvironmentalImpact} onOpenChange={setShowEnvironmentalImpact}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <Leaf className="w-6 h-6" />🎉 Congratulations!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 pb-6">
            <div className="text-lg font-semibold text-foreground text-center">
              You've successfully completed your repair journey!
            </div>

            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              <div className="font-semibold text-green-800 flex items-center gap-2 justify-center">
                <TreePine className="w-5 h-5" />
                Environmental Impact
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getEnvironmentalImpact().eWasteSaved}</div>
                  <div className="text-green-700">E-waste Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getEnvironmentalImpact().carbonReduced}</div>
                  <div className="text-green-700">Carbon Reduced</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-green-700 mb-2">
                  <strong>Materials Recovered:</strong> {getEnvironmentalImpact().materialsRecovered}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-700">
                    +{getEnvironmentalImpact().ecoPoints} EcoPoints Earned!
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              By repairing instead of replacing, you've made a positive impact on our planet! Every repair counts
              towards a more sustainable future.
            </div>

            <div className="flex justify-center pt-2">
              <Button onClick={closeEnvironmentalImpact} className="bg-green-600 hover:bg-green-700 text-white">
                <Recycle className="w-4 h-4 mr-2" />
                Continue Saving the Planet!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
