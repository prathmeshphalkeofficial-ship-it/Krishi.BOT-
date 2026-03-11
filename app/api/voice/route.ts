import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import { getJarvisResponse } from "@/lib/jarvis-engine"
import type { Language } from "@/lib/i18n"

export const maxDuration = 30

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

const SYSTEM_PROMPTS: Record<Language, string> = {
  en: `You are KrishiBot, an expert AI farming assistant for Indian farmers. 
You help with: agriculture, crop diseases, soil health, weather, mandi prices, government schemes (PM-KISAN, Fasal Bima, etc.), irrigation, fertilizers, pesticides, and general knowledge.
Be concise — keep answers under 100 words for voice. Use simple language a farmer can understand.
For weather questions, give general advice since you don't have live data — suggest the farmer check their local weather app.
Always respond in English.`,

  hi: `आप KrishiBot हैं, भारतीय किसानों के लिए एक विशेषज्ञ AI कृषि सहायक।
आप इनमें मदद करते हैं: खेती, फसल रोग, मिट्टी स्वास्थ्य, मौसम, मंडी भाव, सरकारी योजनाएं (PM-KISAN, फसल बीमा आदि), सिंचाई, उर्वरक, कीटनाशक।
संक्षिप्त रहें — वॉइस के लिए 100 शब्दों से कम में जवाब दें। सरल भाषा का उपयोग करें।
मौसम के प्रश्नों के लिए, सामान्य सलाह दें क्योंकि आपके पास लाइव डेटा नहीं है।
हमेशा हिंदी में जवाब दें।`,

  mr: `तुम्ही KrishiBot आहात, भारतीय शेतकऱ्यांसाठी एक तज्ञ AI शेती सहाय्यक.
तुम्ही यामध्ये मदत करता: शेती, पीक रोग, माती आरोग्य, हवामान, मंडी भाव, सरकारी योजना (PM-KISAN, पीक विमा इ.), सिंचन, खते, कीटकनाशके.
संक्षिप्त राहा — व्हॉइससाठी 100 शब्दांपेक्षा कमी उत्तर द्या. सोपी भाषा वापरा.
हवामानाच्या प्रश्नांसाठी, सामान्य सल्ला द्या कारण तुमच्याकडे लाइव्ह डेटा नाही.
नेहमी मराठीत उत्तर द्या.`,
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const prompt: string = body.prompt || ""
    const language: Language = body.language || "en"

    if (!prompt.trim()) {
      return NextResponse.json({ text: "I did not catch that. Could you try again?" })
    }

    // ── Step 1: Check for motor/pump commands via jarvis-engine ──────────────
    const { motorCommand } = getJarvisResponse(prompt, language)
    let prefix = ""

    if (motorCommand === "on") {
      await controlPump("on")
      prefix = "[MOTOR_ON] "
    } else if (motorCommand === "off") {
      await controlPump("off")
      prefix = "[MOTOR_OFF] "
    }

    // ── Step 2: Always call Groq AI for the real answer ───────────────────────
    const systemPrompt = SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.en

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.6,
    })

    const aiText = completion.choices[0]?.message?.content?.trim() ?? "Sorry, I could not get an answer. Please try again."

    return NextResponse.json({
      text: prefix + aiText,
      motorCommand: motorCommand || null,
    })

  } catch (error: unknown) {
    console.error("Voice API error:", error)

    // Friendly fallback message in correct language
    const body = await new Response(req.body).text().catch(() => "{}")
    const lang = (() => { try { return JSON.parse(body).language } catch { return "en" } })()

    const fallback =
      lang === "hi" ? "AI से जुड़ने में समस्या हुई। कृपया दोबारा कोशिश करें।"
      : lang === "mr" ? "AI शी कनेक्ट करण्यात समस्या झाली. कृपया पुन्हा प्रयत्न करा."
      : "Could not connect to AI. Please try again."

    return NextResponse.json({ text: fallback, motorCommand: null }, { status: 500 })
  }
}