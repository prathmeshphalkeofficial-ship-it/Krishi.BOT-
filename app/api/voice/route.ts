import { getJarvisResponse } from "@/lib/jarvis-engine"
import type { Language } from "@/lib/i18n"

export const maxDuration = 10

const ESP_IP = process.env.ESP8266_IP

async function controlPump(action: "on" | "off"): Promise<boolean> {
  if (!ESP_IP) return false
  try {
    const res = await fetch(`http://${ESP_IP}/pump/${action}`, {
      signal: AbortSignal.timeout(5000),
    })
    await res.json()
    return true
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const prompt: string = body.prompt || ""
  const language: Language = body.language || "en"

  if (!prompt.trim()) {
    return Response.json({ text: "I did not catch that. Could you try again?" })
  }

  const { text, motorCommand } = getJarvisResponse(prompt, language)
  let responseText = text

  if (motorCommand === "on") {
    await controlPump("on")
    responseText = "[MOTOR_ON] " + responseText
  } else if (motorCommand === "off") {
    await controlPump("off")
    responseText = "[MOTOR_OFF] " + responseText
  }

  return Response.json({
    text: responseText,
    motorCommand: motorCommand || null,
  })
}
