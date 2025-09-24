import { type NextRequest, NextResponse } from "next/server"
import { analyzeDeviceIssue, generateChatResponse } from "@/lib/gemini"
import { searchRepairVideos } from "@/lib/youtube"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { message, deviceType, deviceModel, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    console.log("[v0] Chat API called with:", { message, deviceType, deviceModel })

    const needsDeviceInfo = !deviceType

    if (needsDeviceInfo && !message.toLowerCase().includes("hello") && !message.toLowerCase().includes("hi")) {
      return NextResponse.json({
        response:
          "Hello! I'm here to help you repair your device and reduce e-waste. To get started, please tell me:\n\n**What type of device do you need help with?**\n\nFor example:\n• iPhone 14 Pro\n• Samsung Galaxy S23\n• MacBook Pro 2023\n• Dell XPS 13 laptop\n• Sony headphones\n• etc.\n\nJust tell me your device and I'll help you fix it!",
        needsDeviceInfo: true,
        recommendedVideos: [],
      })
    }

    // Generate AI response using Gemini
    const aiResponse = await generateChatResponse(message, deviceType, conversationHistory)

    let detailedAnalysis = null
    let recommendedVideos = []

    // Check if user described a specific issue (not just device type)
    const issueKeywords = [
      "broken",
      "not working",
      "problem",
      "issue",
      "fix",
      "repair",
      "cracked",
      "dead",
      "won't",
      "can't",
      "doesn't",
      "error",
      "slow",
      "battery",
      "screen",
      "charging",
      "overheating",
      "keyboard",
      "audio",
      "bluetooth",
      "wifi",
      "camera",
      "speaker",
      "microphone",
      "touch",
      "display",
      "power",
      "boot",
      "freeze",
      "crash",
    ]
    const hasIssueDescription = issueKeywords.some((keyword) => message.toLowerCase().includes(keyword))

    console.log("[v0] Has issue description:", hasIssueDescription)

    if (hasIssueDescription && deviceType && message.length > 10) {
      try {
        console.log(
          "[v0] Searching for videos with query:",
          message,
          "deviceType:",
          deviceType,
          "deviceModel:",
          deviceModel,
        )
        recommendedVideos = await searchRepairVideos({
          query: message,
          deviceType,
          deviceModel,
          maxResults: 3,
        })
        console.log("[v0] Found videos:", recommendedVideos.length)

        // Get detailed repair analysis for any described issue
        detailedAnalysis = await analyzeDeviceIssue(deviceType, message, conversationHistory)

        const enhancedResponse = `${aiResponse}\n\n---\n\n## 🔧 **Repair Analysis & Guide**\n\n**Diagnosis:** ${detailedAnalysis.diagnosis}\n\n**Difficulty Level:** ${detailedAnalysis.difficulty.charAt(0).toUpperCase() + detailedAnalysis.difficulty.slice(1)} ⭐\n**Estimated Time:** ${detailedAnalysis.estimatedTime} ⏱️\n\n### 🛠️ **Tools You'll Need:**\n${detailedAnalysis.toolsNeeded.map((tool) => `• ${tool}`).join("\n")}\n\n### ⚠️ **Safety First:**\n${detailedAnalysis.safetyWarnings.map((warning) => `🔸 ${warning}`).join("\n")}\n\n### 📋 **Step-by-Step Repair Guide:**\n${detailedAnalysis.steps.map((step, index) => `**${index + 1}.** ${step}`).join("\n")}\n\n---\n\n💡 **I've found helpful video tutorials below that demonstrate these repair techniques!** Watch them before starting your repair for the best results.`

        // Save conversation to database (optional - requires user authentication)
        try {
          const supabase = await createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            await supabase.from("chat_conversations").insert({
              user_id: user.id,
              device_type: deviceType,
              issue_description: message,
              ai_response: enhancedResponse,
              recommended_videos: recommendedVideos,
            })
          }
        } catch (dbError) {
          console.log("Database save failed (user may not be logged in):", dbError)
          // Continue without saving - this is optional functionality
        }

        return NextResponse.json({
          response: enhancedResponse,
          analysis: detailedAnalysis,
          recommendedVideos,
        })
      } catch (analysisError) {
        console.error("Analysis failed:", analysisError)
        // Fall back to basic response but still return videos if found
      }
    }

    console.log("[v0] Returning response with videos:", recommendedVideos.length)

    return NextResponse.json({
      response: aiResponse,
      recommendedVideos,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
