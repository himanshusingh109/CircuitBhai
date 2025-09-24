// Gemini AI integration for device repair assistance

import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

console.log("[v0] Gemini API Key status:", process.env.GEMINI_API_KEY ? "Available" : "Missing")

export interface RepairAnalysis {
  diagnosis: string
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: string
  toolsNeeded: string[]
  steps: string[]
  safetyWarnings: string[]
  videoSearchTerms: string[]
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Mock Gemini API responses for development
// In production, you would use the actual Google Gemini API
export async function analyzeDeviceIssue(
  deviceType: string,
  issueDescription: string,
  conversationHistory: ChatMessage[] = [],
): Promise<RepairAnalysis> {
  console.log("[v0] Analyzing device issue with Gemini API:", { deviceType, issueDescription })

  if (genAI) {
    try {
      console.log("[v0] Using real Gemini API for analysis")
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `You are an expert electronics repair technician helping users fix their devices to reduce e-waste. 
      
Device Type: ${deviceType}
Issue Description: ${issueDescription}

Please provide a detailed repair analysis in JSON format with the following structure:
{
  "diagnosis": "Clear explanation of what's likely wrong",
  "difficulty": "easy|medium|hard",
  "estimatedTime": "time estimate like '20-30 minutes'",
  "toolsNeeded": ["array", "of", "required", "tools"],
  "steps": ["step-by-step", "repair", "instructions"],
  "safetyWarnings": ["important", "safety", "considerations"],
  "videoSearchTerms": ["relevant", "search", "terms", "for", "videos"]
}

Focus on sustainable repair solutions and emphasize safety. Be encouraging but realistic about difficulty levels.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log("[v0] Gemini API response received, length:", text.length)

      try {
        let jsonText = text.trim()

        // Remove markdown code block wrapper if present
        if (jsonText.startsWith("```json")) {
          jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
        } else if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "")
        }

        console.log("[v0] Cleaned JSON text:", jsonText.substring(0, 200) + "...")
        const parsedResponse = JSON.parse(jsonText)
        console.log("[v0] Successfully parsed Gemini response")
        return parsedResponse
      } catch (parseError) {
        console.error("[v0] Failed to parse Gemini response:", parseError)
        console.error("[v0] Raw response text:", text)
        // Fall back to mock response
      }
    } catch (apiError) {
      console.error("[v0] Gemini API error:", apiError)
      // Fall back to mock response
    }
  } else {
    console.log("[v0] No Gemini API key available, using mock response")
  }

  console.log("[v0] Using mock response for device analysis")

  // Simulate API delay for mock responses
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const responses: Record<string, Record<string, RepairAnalysis>> = {
    smartphone: {
      screen: {
        diagnosis:
          "Based on your description, it sounds like you have a cracked or unresponsive screen. This is one of the most common smartphone issues and is usually repairable.",
        difficulty: "medium",
        estimatedTime: "30-45 minutes",
        toolsNeeded: [
          "Screwdriver set",
          "Plastic prying tools",
          "Heat gun or hair dryer",
          "Suction cup",
          "Replacement screen",
        ],
        steps: [
          "Power off the device completely",
          "Remove screws around the charging port",
          "Use heat to soften the adhesive around the screen",
          "Carefully pry open the device using plastic tools",
          "Disconnect the screen cable connectors",
          "Remove the old screen assembly",
          "Install the new screen and reconnect cables",
          "Test the screen before reassembling",
          "Reassemble the device and test all functions",
        ],
        safetyWarnings: [
          "Always power off the device before starting",
          "Be careful with heat - too much can damage internal components",
          "Handle the screen cables gently to avoid damage",
          "Work in a clean, well-lit area to avoid losing small screws",
        ],
        videoSearchTerms: ["smartphone screen replacement", `${deviceType} screen repair`, "phone display fix"],
      },
      battery: {
        diagnosis:
          "Battery issues can manifest as rapid draining, not charging, or the device shutting down unexpectedly. This often requires battery replacement.",
        difficulty: "medium",
        estimatedTime: "20-30 minutes",
        toolsNeeded: ["Screwdriver set", "Plastic prying tools", "Replacement battery", "Adhesive strips"],
        steps: [
          "Power off the device and remove any case",
          "Remove the back cover or screen (depending on model)",
          "Disconnect the battery connector",
          "Remove adhesive strips holding the battery",
          "Carefully lift out the old battery",
          "Install new battery with fresh adhesive",
          "Reconnect the battery connector",
          "Reassemble the device",
          "Charge to 100% and test battery performance",
        ],
        safetyWarnings: [
          "Never puncture or bend the battery",
          "Dispose of old battery properly at recycling center",
          "Avoid using metal tools near the battery",
          "If battery is swollen, handle with extra care",
        ],
        videoSearchTerms: ["smartphone battery replacement", "phone battery repair", `${deviceType} battery change`],
      },
      charging: {
        diagnosis:
          "Charging issues are often caused by debris in the charging port, damaged cables, or faulty charging components. Let's troubleshoot step by step.",
        difficulty: "easy",
        estimatedTime: "10-20 minutes",
        toolsNeeded: ["Compressed air", "Toothpick or plastic pick", "Different charging cable", "Flashlight"],
        steps: [
          "Try a different charging cable and adapter first",
          "Inspect the charging port with a flashlight",
          "Gently remove any visible debris with a plastic pick",
          "Use compressed air to blow out dust",
          "Test charging again",
          "If still not working, the port may need professional repair",
        ],
        safetyWarnings: [
          "Never use metal objects in the charging port",
          "Be gentle to avoid damaging the port pins",
          "Ensure device is powered off during cleaning",
        ],
        videoSearchTerms: ["phone charging port cleaning", "smartphone not charging fix", "charging port repair"],
      },
    },
    laptop: {
      power: {
        diagnosis:
          "Laptop power issues can be caused by battery problems, power adapter failure, or internal hardware issues. Let's diagnose systematically.",
        difficulty: "medium",
        estimatedTime: "15-30 minutes",
        toolsNeeded: ["Multimeter (optional)", "Different power adapter", "Screwdriver set"],
        steps: [
          "Check if the power LED on the adapter is lit",
          "Try a different power outlet",
          "Remove the battery and try powering with just the adapter",
          "Check for loose connections",
          "If no response, may need internal diagnosis",
          "Test with a known good power adapter if available",
        ],
        safetyWarnings: [
          "Unplug power adapter before removing battery",
          "Handle battery carefully - do not short circuit",
          "Avoid opening laptop unless experienced",
        ],
        videoSearchTerms: ["laptop won't turn on", "laptop power troubleshooting", "laptop no power fix"],
      },
      keyboard: {
        diagnosis:
          "Keyboard issues like stuck keys or non-responsive keys can often be fixed by cleaning or replacing individual keys.",
        difficulty: "easy",
        estimatedTime: "10-15 minutes",
        toolsNeeded: ["Compressed air", "Keycap puller or flat tool", "Cotton swabs", "Isopropyl alcohol"],
        steps: [
          "Power off the laptop",
          "Use compressed air to blow out debris",
          "Gently remove the problematic keycap",
          "Clean under the key with cotton swab and alcohol",
          "Check the key mechanism for damage",
          "Reinstall the keycap firmly",
          "Test the key functionality",
        ],
        safetyWarnings: [
          "Be gentle when removing keycaps to avoid breaking clips",
          "Don't use too much liquid - it can damage electronics",
          "Take photos before removing keys to remember placement",
        ],
        videoSearchTerms: ["laptop keyboard key repair", "laptop key replacement", "keyboard cleaning"],
      },
      overheating: {
        diagnosis:
          "Laptop overheating is usually caused by dust buildup in fans and vents, or dried thermal paste. This requires internal cleaning.",
        difficulty: "hard",
        estimatedTime: "45-60 minutes",
        toolsNeeded: ["Screwdriver set", "Compressed air", "Thermal paste", "Cotton swabs", "Isopropyl alcohol"],
        steps: [
          "Power off and unplug the laptop",
          "Remove the bottom panel (varies by model)",
          "Locate the cooling fans and heat sinks",
          "Use compressed air to blow out dust from fans",
          "Clean the heat sink fins thoroughly",
          "Remove old thermal paste from CPU/GPU",
          "Apply new thermal paste (thin layer)",
          "Reassemble and test temperatures",
        ],
        safetyWarnings: [
          "Ground yourself to avoid static damage",
          "Don't over-tighten screws when reassembling",
          "Use proper amount of thermal paste - too much is harmful",
          "Take photos during disassembly for reference",
        ],
        videoSearchTerms: ["laptop overheating fix", "laptop fan cleaning", "thermal paste replacement"],
      },
    },
    headphones: {
      audio: {
        diagnosis:
          "Audio issues in headphones can be caused by damaged cables, loose connections, or driver problems. Let's troubleshoot the most common causes.",
        difficulty: "medium",
        estimatedTime: "20-30 minutes",
        toolsNeeded: ["Soldering iron", "Solder", "Wire strippers", "Multimeter", "Replacement cable (if needed)"],
        steps: [
          "Test headphones with different devices",
          "Check for visible damage to the cable",
          "Gently flex the cable to find break points",
          "If cable is damaged, cut and strip wires",
          "Solder new connections or replace cable",
          "Test audio quality after repair",
          "Secure connections with heat shrink tubing",
        ],
        safetyWarnings: [
          "Use proper ventilation when soldering",
          "Be careful with hot soldering iron",
          "Match wire colors correctly when reconnecting",
          "Test with low volume first",
        ],
        videoSearchTerms: ["headphone cable repair", "headphone jack fix", "audio cable soldering"],
      },
      bluetooth: {
        diagnosis:
          "Bluetooth connectivity issues are often software-related and can usually be resolved through pairing reset and troubleshooting steps.",
        difficulty: "easy",
        estimatedTime: "5-10 minutes",
        toolsNeeded: ["Device manual", "Charging cable"],
        steps: [
          "Ensure headphones are fully charged",
          "Turn off Bluetooth on your device",
          "Reset headphones to factory settings (check manual)",
          "Clear Bluetooth cache on your device",
          "Turn Bluetooth back on",
          "Put headphones in pairing mode",
          "Reconnect and test audio quality",
        ],
        safetyWarnings: ["Follow manufacturer reset instructions exactly", "Don't force buttons during reset process"],
        videoSearchTerms: ["bluetooth headphones not connecting", "headphone pairing issues", "bluetooth reset"],
      },
    },
    appliance: {
      microwave: {
        diagnosis:
          "A microwave that runs but doesn't heat usually has a faulty magnetron or high voltage components. This requires careful diagnosis.",
        difficulty: "hard",
        estimatedTime: "30-45 minutes",
        toolsNeeded: ["Multimeter", "Screwdriver set", "Safety gloves"],
        steps: [
          "SAFETY FIRST: Unplug microwave and wait 24 hours",
          "Remove outer casing carefully",
          "Visually inspect for obvious damage",
          "Test door switches with multimeter",
          "Check fuses and replace if blown",
          "If components test good, magnetron may need replacement",
          "Reassemble and test with water cup",
        ],
        safetyWarnings: [
          "DANGER: Microwaves contain high voltage capacitors",
          "Wait 24 hours after unplugging before opening",
          "Never touch internal components with bare hands",
          "Consider professional repair for safety",
        ],
        videoSearchTerms: [
          "microwave not heating repair",
          "microwave magnetron replacement",
          "microwave troubleshooting",
        ],
      },
    },
  }

  // Find the best matching response
  const deviceResponses = responses[deviceType] || responses.smartphone
  const issueKey =
    Object.keys(deviceResponses).find((key) => issueDescription.toLowerCase().includes(key)) ||
    Object.keys(deviceResponses)[0]

  return deviceResponses[issueKey] || deviceResponses[Object.keys(deviceResponses)[0]]
}

export async function generateChatResponse(
  message: string,
  deviceType: string,
  conversationHistory: ChatMessage[] = [],
): Promise<string> {
  console.log("[v0] Generating chat response with Gemini API:", {
    message: message.substring(0, 50) + "...",
    deviceType,
  })

  if (genAI) {
    try {
      console.log("[v0] Using real Gemini API for chat response")
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const conversationContext = conversationHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")

      const prompt = `You are a helpful electronics repair assistant focused on reducing e-waste by helping people repair their devices instead of replacing them.

Device Type: ${deviceType}
User Message: ${message}

Previous Conversation:
${conversationContext}

IMPORTANT CONVERSATION FLOW:
1. If the user just provided a device type/model but hasn't described a specific issue, ask them to describe the specific problem they're experiencing with their device.
2. Once they describe an issue, provide helpful repair guidance.

Your response should:
- If no specific issue mentioned: Ask "What specific issue are you experiencing with your ${deviceType}? Please describe the problem in detail (e.g., screen cracked, won't charge, overheating, etc.)"
- If issue described: Provide encouraging, practical repair advice
- Always promote device repair and sustainability
- Maintain an encouraging but realistic tone
- Keep responses conversational and supportive

Keep responses concise and focused on the next step in the repair process.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log("[v0] Gemini chat response received, length:", text.length)
      return text
    } catch (apiError) {
      console.error("[v0] Gemini API error in chat response:", apiError)
      // Fall back to mock response
    }
  } else {
    console.log("[v0] No Gemini API key available, using mock chat response")
  }

  console.log("[v0] Using mock response for chat")

  // Simulate API delay for mock responses
  await new Promise((resolve) => setTimeout(resolve, 800))

  const messageLower = message.toLowerCase()

  // Check if user has provided device info but no specific issue
  const hasDeviceInfo = deviceType && deviceType !== "unknown"
  const hasSpecificIssue =
    messageLower.includes("broken") ||
    messageLower.includes("not working") ||
    messageLower.includes("problem") ||
    messageLower.includes("issue") ||
    messageLower.includes("cracked") ||
    messageLower.includes("dead") ||
    messageLower.includes("won't") ||
    messageLower.includes("can't") ||
    messageLower.includes("doesn't") ||
    messageLower.includes("error") ||
    messageLower.includes("slow") ||
    messageLower.includes("battery") ||
    messageLower.includes("screen") ||
    messageLower.includes("charging") ||
    messageLower.includes("overheating") ||
    messageLower.includes("keyboard") ||
    messageLower.includes("audio") ||
    messageLower.includes("bluetooth") ||
    messageLower.includes("wifi") ||
    messageLower.includes("camera")

  // If device provided but no specific issue, ask for the issue
  if (
    hasDeviceInfo &&
    !hasSpecificIssue &&
    !messageLower.includes("thank") &&
    !messageLower.includes("hello") &&
    !messageLower.includes("hi")
  ) {
    return `Great! I can help you repair your ${deviceType}. What specific issue are you experiencing with your device? Please describe the problem in detail, for example:

• Screen is cracked or not responding
• Device won't charge or battery drains quickly
• Overheating or running slowly
• Buttons or keyboard not working
• Audio/speaker problems
• Camera or connectivity issues

The more details you provide, the better I can help you with a repair solution!`
  }

  // Device-specific responses
  if (deviceType === "smartphone") {
    if (messageLower.includes("screen") || messageLower.includes("display")) {
      return "Screen repairs are very common and often successful! The key is taking your time and using the right tools. Heat is your friend for softening adhesive, but don't overdo it. Make sure to test the new screen before fully reassembling. What specific screen issue are you experiencing?"
    }
    if (messageLower.includes("battery")) {
      return "Battery replacement can really extend your phone's life! Modern smartphones often have the battery glued in, so you'll need to be patient with the adhesive removal. Always dispose of the old battery properly at an electronics recycling center. Is your battery draining quickly or not charging at all?"
    }
  }

  if (deviceType === "laptop") {
    if (messageLower.includes("slow") || messageLower.includes("performance")) {
      return "Slow laptop performance can often be improved without hardware replacement! Try cleaning out dust (which causes overheating), upgrading RAM if possible, or replacing a traditional hard drive with an SSD. These upgrades can make an old laptop feel new again. What specific performance issues are you noticing?"
    }
  }

  // General encouraging response
  return "That's a great question! Repairing electronics can seem intimidating at first, but you're taking an important step toward sustainability. Every device you repair instead of replace helps reduce e-waste. I'm here to guide you through the process step by step. Can you tell me more details about the specific issue you're experiencing?"
}
