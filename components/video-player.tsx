"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, ExternalLink, Clock, Eye } from "lucide-react"
import { type YouTubeVideo, getYouTubeEmbedUrl, getYouTubeWatchUrl } from "@/lib/youtube"

interface VideoPlayerProps {
  video: YouTubeVideo
  autoplay?: boolean
}

export function VideoPlayer({ video, autoplay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay)

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-gray-100">
        {isPlaying ? (
          <iframe
            src={`${getYouTubeEmbedUrl(video.id)}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full">
            <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 p-0"
                onClick={() => setIsPlaying(true)}
              >
                <Play className="w-6 h-6 ml-1" />
              </Button>
            </div>
            {video.duration && (
              <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
                <Clock className="w-3 h-3 mr-1" />
                {video.duration}
              </Badge>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{video.title}</h3>

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
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Play className="w-4 h-4 mr-2" />
              {isPlaying ? "Minimize" : "Watch Here"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={getYouTubeWatchUrl(video.id)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                YouTube
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
