"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, ExternalLink, Clock, Eye, RefreshCw } from "lucide-react"
import { type YouTubeVideo, searchRepairVideos, getYouTubeWatchUrl } from "@/lib/youtube"

interface VideoRecommendationsProps {
  deviceType: string
  issueDescription: string
  maxVideos?: number
}

export function VideoRecommendations({ deviceType, issueDescription, maxVideos = 3 }: VideoRecommendationsProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const searchResults = await searchRepairVideos({
        query: issueDescription,
        deviceType,
        maxResults: maxVideos,
      })
      setVideos(searchResults)
    } catch (error) {
      console.error("Error loading videos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (deviceType && issueDescription) {
      loadVideos()
    }
  }, [deviceType, issueDescription, maxVideos])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            Loading Repair Videos...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            Repair Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No videos found for this issue.</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={loadVideos}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" />
            Recommended Repair Videos
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadVideos} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="border rounded-lg overflow-hidden">
            {/* Video Thumbnail and Player */}
            <div className="relative aspect-video bg-gray-100">
              {selectedVideo === video.id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full cursor-pointer" onClick={() => setSelectedVideo(video.id)}>
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors">
                    <div className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>
                  {video.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {video.duration}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{video.title}</h4>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">{video.channelTitle}</span>
                {video.viewCount && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{video.viewCount} views</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => setSelectedVideo(selectedVideo === video.id ? null : video.id)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {selectedVideo === video.id ? "Minimize" : "Watch Here"}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={getYouTubeWatchUrl(video.id)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    YouTube
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
