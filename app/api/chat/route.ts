import { getJarvisResponse } from "@/lib/jarvis-engine"
import type { Language } from "@/lib/i18n"

export const maxDuration = 30

const GROQ_API_KEY = process.env.GROQ_API_KEY
const ESP_IP = process.env.ESP8266_IP

async function controlPump(action: "on" | "off"): Promise<boolean> {
  if (!ESP_IP) return false
  try {
    const res = await fetch(`http://${ESP_IP}/pump/${action}`, { signal: AbortSignal.timeout(5000) })
    await res.json()
    return true
  } catch { return false }
}

async function getGroqResponse(prompt: string, language: Language): Promise<string> {
  const systemPrompt = language === "hi"
    ? "आप KrishiBot AI हैं। आप किसी भी सवाल का जवाब दे सकते हैं। हमेशा हिंदी में जवाब दें।"
    : language === "mr"
    ? "तुम्ही KrishiBot AI आहात. कोणत्याही प्रश्नाचे उत्तर द्या. नेहमी मराठीत उत्तर द्या."
    : "You are KrishiBot AI - a smart Indian farming assistant. Answer ANY question accurately and helpfully in English."

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  })

  if (!response.ok) throw new Error(`Groq error: ${response.status}`)
  const data = await response.json()
  return data.choices[0]?.message?.content || "Sorry, I could not get a response."
}

export async function POST(req: Request) {
  const body = await req.json()
  const prompt: string = body.prompt || ""
  const language: Language = body.language || "en"

  if (!prompt.trim()) {
    return Response.json({ text: "I did not catch that. Try again!" })
  }

  const { motorCommand } = getJarvisResponse(prompt, language)

  if (motorCommand === "on") {
    await controlPump("on")
    return Response.json({ text: "[MOTOR_ON] Motor turned ON! Irrigation active.", motorCommand: "on" })
  }
  if (motorCommand === "off") {
    await controlPump("off")
    return Response.json({ text: "[MOTOR_OFF] Motor turned OFF! Irrigation stopped.", motorCommand: "off" })
  }

  try {
    const aiText = await getGroqResponse(prompt, language)
    return Response.json({ text: aiText, motorCommand: null })
  } catch (err: any) {
    console.error("Groq error:", err.message)
    const { text } = getJarvisResponse(prompt, language)
    return Response.json({ text, motorCommand: null })
  }
}
