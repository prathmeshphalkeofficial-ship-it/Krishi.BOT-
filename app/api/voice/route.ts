import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import { getJarvisResponse } from "@/lib/jarvis-engine"
import type { Language } from "@/lib/i18n"

export const maxDuration = 30

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const ESP_IP = process.env.ESP8266_IP
const WEATHER_KEY = process.env.OPENWEATHER_API_KEY
const NEWS_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY

// ── Pump control ──────────────────────────────────────────────────────────────
async function controlPump(action: "on" | "off"): Promise<boolean> {
  if (!ESP_IP) return false
  try {
    const res = await fetch(`http://${ESP_IP}/pump/${action}`, { signal: AbortSignal.timeout(5000) })
    await res.json()
    return true
  } catch { return false }
}

// ── Live current weather ──────────────────────────────────────────────────────
async function getLiveWeather(lat?: number, lon?: number): Promise<string | null> {
  if (!WEATHER_KEY) return null
  try {
    const latitude = lat ?? 18.5204  // Default: Pune, Maharashtra
    const longitude = lon ?? 73.8567
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_KEY}&units=metric`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    if (!data.main) return null
    const city = data.name ?? "your area"
    const temp = Math.round(data.main.temp)
    const feels = Math.round(data.main.feels_like)
    const humidity = data.main.humidity
    const desc = data.weather?.[0]?.description ?? "clear"
    const wind = Math.round((data.wind?.speed ?? 0) * 3.6)
    const rain = data.rain?.["1h"] ? `Rain: ${data.rain["1h"]}mm in last hour.` : ""
    return `Live weather in ${city}: ${temp}°C (feels like ${feels}°C), ${desc}. Humidity: ${humidity}%. Wind: ${wind} km/h. ${rain}`.trim()
  } catch { return null }
}

// ── Weather forecast (next 12 hours) ─────────────────────────────────────────
async function getWeatherForecast(lat?: number, lon?: number): Promise<string | null> {
  if (!WEATHER_KEY) return null
  try {
    const latitude = lat ?? 18.5204
    const longitude = lon ?? 73.8567
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_KEY}&units=metric&cnt=8`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    if (!data.list) return null
    const summary = data.list.slice(0, 4).map((item: any) => {
      const time = new Date(item.dt * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      return `${time}: ${Math.round(item.main.temp)}°C ${item.weather[0].description}`
    }).join(" | ")
    return `Next 12 hours forecast: ${summary}`
  } catch { return null }
}

// ── Farming news ──────────────────────────────────────────────────────────────
async function getFarmingNews(language: Language): Promise<string | null> {
  if (!NEWS_KEY) return null
  try {
    const lang = language === "en" ? "en" : "hi"
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${NEWS_KEY}&q=farming+agriculture+kisan&language=${lang}&size=3`,
      { signal: AbortSignal.timeout(5000) }
    )
    const data = await res.json()
    if (!data.results?.length) return null
    const headlines = data.results.slice(0, 3).map((n: any, i: number) => `${i + 1}. ${n.title}`).join(" | ")
    return `Latest farming news: ${headlines}`
  } catch { return null }
}

// ── Intent detection ──────────────────────────────────────────────────────────
function detectIntent(text: string): "weather" | "forecast" | "news" | "general" {
  const lower = text.toLowerCase()
  if (["forecast", "tomorrow", "next few days", "कल", "उद्या", "पुढील दिवस"].some(w => lower.includes(w)))
    return "forecast"
  if (["weather", "मौसम", "हवामान", "temperature", "rain", "बारिश", "पाऊस", "temp"].some(w => lower.includes(w)))
    return "weather"
  if (["news", "खबर", "बातम्या", "headline", "latest news", "today's news"].some(w => lower.includes(w)))
    return "news"
  return "general"
}

// ── System prompts ────────────────────────────────────────────────────────────
const SYSTEM_PROMPTS: Record<Language, string> = {
  en: `You are KrishiBot, an expert AI farming assistant for Indian farmers.
You help with: agriculture, crop diseases, soil health, weather, mandi prices, government schemes (PM-KISAN, Fasal Bima, etc.), irrigation, fertilizers, pesticides, general knowledge, math, and health.
When LIVE WEATHER DATA or LIVE NEWS is provided above, use it to give specific accurate answers — do NOT say you don't have live data.
Be concise — keep voice answers under 80 words. Use simple clear language a farmer can understand.
Always respond in English.`,

  hi: `आप KrishiBot हैं, भारतीय किसानों के लिए एक विशेषज्ञ AI कृषि सहायक।
आप इनमें मदद करते हैं: खेती, फसल रोग, मिट्टी, मौसम, मंडी भाव, सरकारी योजनाएं, सिंचाई, उर्वरक, गणित, स्वास्थ्य।
जब ऊपर LIVE WEATHER DATA या LIVE NEWS दिया जाए, उसका उपयोग करके सटीक जवाब दें — यह मत कहें कि आपके पास लाइव डेटा नहीं है।
80 शब्दों से कम में जवाब दें। सरल हिंदी में बोलें।
हमेशा हिंदी में जवाब दें।`,

  mr: `तुम्ही KrishiBot आहात, भारतीय शेतकऱ्यांसाठी एक तज्ञ AI शेती सहाय्यक.
तुम्ही यामध्ये मदत करता: शेती, पीक रोग, माती, हवामान, मंडी भाव, सरकारी योजना, सिंचन, खते, गणित, आरोग्य.
वर LIVE WEATHER DATA किंवा LIVE NEWS दिल्यास, त्याचा वापर करून अचूक उत्तर द्या — लाइव्ह डेटा नाही असे म्हणू नका.
80 शब्दांपेक्षा कमी उत्तर द्या. सोप्या मराठीत बोला.
नेहमी मराठीत उत्तर द्या.`,
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const prompt: string = body.prompt || ""
    const language: Language = body.language || "en"
    const lat: number | undefined = body.lat
    const lon: number | undefined = body.lon

    if (!prompt.trim()) {
      return NextResponse.json({ text: "I did not catch that. Could you try again?" })
    }

    // Step 1 — Motor command check
    const { motorCommand } = getJarvisResponse(prompt, language)
    let prefix = ""
    if (motorCommand === "on")  { await controlPump("on");  prefix = "[MOTOR_ON] " }
    if (motorCommand === "off") { await controlPump("off"); prefix = "[MOTOR_OFF] " }

    // Step 2 — Fetch live context in parallel
    const intent = detectIntent(prompt)
    let liveContext = ""

    if (intent === "weather") {
      const weather = await getLiveWeather(lat, lon)
      if (weather) liveContext = `\n\nLIVE WEATHER DATA (use this to answer): ${weather}`
    } else if (intent === "forecast") {
      const [weather, forecast] = await Promise.all([
        getLiveWeather(lat, lon),
        getWeatherForecast(lat, lon),
      ])
      if (weather)   liveContext += `\n\nLIVE WEATHER DATA: ${weather}`
      if (forecast)  liveContext += `\n\nFORECAST DATA: ${forecast}`
    } else if (intent === "news") {
      const news = await getFarmingNews(language)
      if (news) liveContext = `\n\nLIVE NEWS DATA (use this to answer): ${news}`
    }

    // Step 3 — Groq AI with live data injected into system prompt
    const systemPrompt = (SYSTEM_PROMPTS[language] ?? SYSTEM_PROMPTS.en) + liveContext

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.6,
    })

    const aiText = completion.choices[0]?.message?.content?.trim()
      ?? "Sorry, I could not get an answer. Please try again."

    return NextResponse.json({
      text: prefix + aiText,
      motorCommand: motorCommand || null,
      hasLiveData: liveContext.length > 0,
    })

  } catch (error: unknown) {
    console.error("Voice API error:", error)
    return NextResponse.json(
      { text: "Could not connect to AI. Please try again.", motorCommand: null },
      { status: 500 }
    )
  }
}