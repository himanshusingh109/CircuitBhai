// YouTube API utilities for fetching repair videos

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  duration?: string
  viewCount?: string
}

export interface YouTubeSearchParams {
  query: string
  deviceType?: string
  deviceModel?: string
  maxResults?: number
}

// Mock YouTube API responses for development
// In production, you would use the actual YouTube Data API v3
export async function searchRepairVideos({
  query,
  deviceType,
  deviceModel,
  maxResults = 5,
}: YouTubeSearchParams): Promise<YouTubeVideo[]> {
  console.log("[v0] Searching for videos with query:", query, "deviceType:", deviceType, "deviceModel:", deviceModel)

  // Build search query with device model for better results
  let searchQuery = query
  if (deviceModel) {
    searchQuery = `${deviceModel} ${query} repair tutorial`
  } else if (deviceType) {
    searchQuery = `${deviceType} ${query} repair tutorial`
  }

  // Try to use real YouTube API if API key is available
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
          new URLSearchParams({
            part: "snippet",
            q: searchQuery,
            type: "video",
            maxResults: maxResults.toString(),
            key: process.env.YOUTUBE_API_KEY,
            order: "relevance",
            videoDuration: "medium", // 4-20 minutes
            videoDefinition: "high",
          }),
      )

      if (response.ok) {
        const data = await response.json()
        const videos: YouTubeVideo[] =
          data.items?.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
          })) || []

        console.log("[v0] Found", videos.length, "videos from YouTube API")
        return videos
      }
    } catch (error) {
      console.error("[v0] YouTube API error:", error)
      // Fall back to mock data
    }
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data based on device type and query
  const mockVideos: Record<string, YouTubeVideo[]> = {
    smartphone: [
      {
        id: "dQw4w9WgXcQ",
        title: "How to Replace iPhone Screen - Complete Guide",
        description:
          "Step-by-step tutorial for replacing a cracked iPhone screen with professional tools and techniques.",
        thumbnail: "/iphone-screen-repair-tutorial.jpg",
        channelTitle: "iFixit",
        publishedAt: "2024-01-15T10:00:00Z",
        duration: "12:34",
        viewCount: "1.2M",
      },
      {
        id: "abc123def456",
        title: "Android Phone Battery Replacement Tutorial",
        description: "Learn how to safely replace your Android phone battery and extend your device's life.",
        thumbnail: "/android-battery-replacement-tutorial.jpg",
        channelTitle: "Phone Repair Guru",
        publishedAt: "2024-01-10T14:30:00Z",
        duration: "8:45",
        viewCount: "850K",
      },
      {
        id: "xyz789ghi012",
        title: "Fix Charging Port Issues - Universal Method",
        description: "Common charging port problems and how to fix them on most smartphone models.",
        thumbnail: "/phone-charging-port-repair.jpg",
        channelTitle: "TechFix Pro",
        publishedAt: "2024-01-08T09:15:00Z",
        duration: "15:22",
        viewCount: "2.1M",
      },
      {
        id: "phone004",
        title: "Smartphone Won't Turn On - Troubleshooting",
        description: "Complete guide to fix phones that won't power on or boot up properly.",
        thumbnail: "/phone-won-t-turn-on-repair.jpg",
        channelTitle: "Mobile Fix Central",
        publishedAt: "2024-01-13T09:00:00Z",
        duration: "16:45",
        viewCount: "1.5M",
      },
      {
        id: "phone005",
        title: "Water Damage Phone Recovery Guide",
        description: "Emergency steps to save your phone from water damage and liquid spills.",
        thumbnail: "/water-damaged-phone-repair.jpg",
        channelTitle: "Emergency Phone Repair",
        publishedAt: "2024-01-14T11:30:00Z",
        duration: "13:20",
        viewCount: "980K",
      },
    ],
    laptop: [
      {
        id: "laptop001",
        title: "Laptop Won't Turn On - Troubleshooting Guide",
        description: "Comprehensive guide to diagnose and fix laptops that won't power on.",
        thumbnail: "/laptop-power-troubleshooting.jpg",
        channelTitle: "Laptop Repair Central",
        publishedAt: "2024-01-12T11:00:00Z",
        duration: "18:30",
        viewCount: "950K",
      },
      {
        id: "laptop002",
        title: "How to Replace Laptop Keyboard Keys",
        description: "Easy method to replace broken or stuck keyboard keys on most laptop models.",
        thumbnail: "/laptop-keyboard-key-replacement.jpg",
        channelTitle: "DIY Tech Repairs",
        publishedAt: "2024-01-09T16:45:00Z",
        duration: "7:12",
        viewCount: "650K",
      },
      {
        id: "laptop003",
        title: "Laptop Overheating Fix - Clean Fans & Thermal Paste",
        description: "Stop your laptop from overheating by cleaning fans and replacing thermal paste.",
        thumbnail: "/laptop-overheating-fan-cleaning.jpg",
        channelTitle: "Computer Clinic",
        publishedAt: "2024-01-05T13:20:00Z",
        duration: "22:15",
        viewCount: "1.8M",
      },
      {
        id: "laptop004",
        title: "Laptop Screen Flickering - Complete Fix",
        description: "Diagnose and repair laptop screens that flicker, have lines, or display issues.",
        thumbnail: "/laptop-screen-flickering-repair.jpg",
        channelTitle: "Display Doctor",
        publishedAt: "2024-01-11T14:15:00Z",
        duration: "14:50",
        viewCount: "720K",
      },
    ],
    headphones: [
      {
        id: "audio001",
        title: "Fix Broken Headphone Jack - Soldering Tutorial",
        description: "Learn to repair broken headphone jacks with basic soldering techniques.",
        thumbnail: "/headphone-jack-soldering-repair.jpg",
        channelTitle: "Audio Repair Shop",
        publishedAt: "2024-01-11T12:00:00Z",
        duration: "14:28",
        viewCount: "420K",
      },
      {
        id: "audio002",
        title: "Bluetooth Headphones Not Connecting - Solutions",
        description: "Troubleshoot and fix common Bluetooth connectivity issues with headphones.",
        thumbnail: "/bluetooth-headphones-connection-fix.jpg",
        channelTitle: "Wireless Tech Help",
        publishedAt: "2024-01-07T10:30:00Z",
        duration: "9:45",
        viewCount: "780K",
      },
      {
        id: "audio003",
        title: "Headphone Driver Replacement Guide",
        description: "Replace blown or damaged headphone drivers to restore audio quality.",
        thumbnail: "/headphone-driver-replacement.jpg",
        channelTitle: "Audio Fix Pro",
        publishedAt: "2024-01-09T15:20:00Z",
        duration: "19:35",
        viewCount: "340K",
      },
    ],
    appliance: [
      {
        id: "appliance001",
        title: "Microwave Not Heating - Common Fixes",
        description: "Diagnose and repair microwave ovens that run but don't heat food.",
        thumbnail: "/microwave-repair-not-heating.jpg",
        channelTitle: "Appliance Doctor",
        publishedAt: "2024-01-06T15:00:00Z",
        duration: "16:40",
        viewCount: "1.1M",
      },
      {
        id: "appliance002",
        title: "Coffee Maker Water Flow Problems",
        description: "Fix clogged coffee makers and restore proper water flow for better brewing.",
        thumbnail: "/coffee-maker-repair-water-flow.jpg",
        channelTitle: "Kitchen Fix It",
        publishedAt: "2024-01-04T08:45:00Z",
        duration: "11:20",
        viewCount: "560K",
      },
      {
        id: "appliance003",
        title: "Washing Machine Won't Drain - Easy Fix",
        description: "Simple solutions for washing machines that won't drain water properly.",
        thumbnail: "/washing-machine-drain-repair.jpg",
        channelTitle: "Home Appliance Helper",
        publishedAt: "2024-01-08T13:45:00Z",
        duration: "12:15",
        viewCount: "890K",
      },
    ],
  }

  // Get videos for the specific device type, or default to smartphone
  let videos = mockVideos[deviceType || "smartphone"] || mockVideos.smartphone

  if (query && query.length > 3) {
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter((word) => word.length > 2)

    // Score videos based on keyword matches
    const scoredVideos = videos.map((video) => {
      let score = 0
      const titleLower = video.title.toLowerCase()
      const descLower = video.description.toLowerCase()

      // Check for exact phrase matches (higher score)
      if (titleLower.includes(queryLower) || descLower.includes(queryLower)) {
        score += 10
      }

      // Check for individual word matches
      queryWords.forEach((word) => {
        if (titleLower.includes(word)) score += 3
        if (descLower.includes(word)) score += 1
      })

      // Boost score for common repair keywords
      const repairKeywords = ["fix", "repair", "replace", "broken", "not working", "problem", "issue"]
      repairKeywords.forEach((keyword) => {
        if (queryLower.includes(keyword) && (titleLower.includes(keyword) || descLower.includes(keyword))) {
          score += 2
        }
      })

      return { ...video, score }
    })

    // Sort by score and filter out videos with no matches
    videos = scoredVideos
      .filter((video) => video.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...video }) => video)
  }

  if (videos.length === 0) {
    videos = mockVideos[deviceType || "smartphone"] || mockVideos.smartphone
  }

  const result = videos.slice(0, maxResults)
  console.log("[v0] Found", result.length, "videos for query")

  return result
}

// Get YouTube video embed URL
export function getYouTubeEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    rel: "0", // Don't show related videos
    modestbranding: "1", // Minimal YouTube branding
    fs: "1", // Allow fullscreen
    cc_load_policy: "1", // Show captions if available
  })

  if (autoplay) {
    params.set("autoplay", "1")
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

// Get YouTube video watch URL
export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

// Format video duration from seconds to MM:SS format
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Format view count to readable format (1.2M, 850K, etc.)
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`
  }
  return count.toString()
}
