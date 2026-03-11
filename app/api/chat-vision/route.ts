import { NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message: string = body.message || ""
    const imageBase64: string = body.imageBase64 || "" // data:image/...;base64,... OR raw base64
    const language: string = body.language || "en"
    const context: string = body.context || "" // existing analysis result if available

    if (!message.trim()) {
      return NextResponse.json({ text: "No question provided." })
    }

    const langName = language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English"

    // ── Case 1: Have image → use vision model ─────────────────────────────────
    if (imageBase64) {
      // Extract just the base64 data (strip data:image/...;base64, prefix if present)
      const base64Data = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64

      // Detect media type
      const mediaType = imageBase64.startsWith("data:image/png") ? "image/png"
        : imageBase64.startsWith("data:image/webp") ? "image/webp"
        : "image/jpeg"

      const systemPrompt = context
        ? `You are an expert plant pathologist and farming advisor.
A previous AI analysis found: ${context}
Now the farmer is asking a follow-up question about the same image.
Answer based on BOTH what you see in the image AND the prior analysis.
Be concise and practical. Respond in ${langName}.`
        : `You are an expert plant pathologist and farming advisor.
Analyze the crop/plant image and answer the farmer's question directly.
Identify plant species, diseases, deficiencies, pests — whatever is visible.
Be specific, practical, and concise. Respond in ${langName}.`

      const completion = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mediaType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: `${systemPrompt}\n\nFarmer's question: ${message}`,
              },
            ],
          },
        ],
        max_tokens: 400,
        temperature: 0.4,
      })

      const text = completion.choices[0]?.message?.content?.trim()
        ?? "Could not analyze the image. Please try again."

      return NextResponse.json({ text })
    }

    // ── Case 2: No image → text-only with context ─────────────────────────────
    const system = context
      ? `You are a plant disease expert helping a farmer. Previous analysis: ${context}. Answer concisely in ${langName}.`
      : `You are a plant disease expert helping a farmer. No image provided. Help with crop diseases, pests, deficiencies. Be concise. Respond in ${langName}.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.5,
    })

    const text = completion.choices[0]?.message?.content?.trim()
      ?? "Could not get a response. Please try again."

    return NextResponse.json({ text })

  } catch (error: unknown) {
    console.error("Chat vision error:", error)
    return NextResponse.json(
      { text: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}