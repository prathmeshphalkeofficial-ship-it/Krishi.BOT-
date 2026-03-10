import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const language = (formData.get("language") as string) || "en";

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    const languageInstructions: Record<string, string> = {
      en: "Respond in English.",
      hi: "Respond in Hindi (हिंदी में जवाब दें).",
      mr: "Respond in Marathi (मराठीत उत्तर द्या).",
    };

    const systemPrompt = `You are an expert Indian agricultural plant pathologist and crop disease specialist with deep knowledge of diseases affecting crops grown in Maharashtra and India. 
${languageInstructions[language] || languageInstructions.en}

When analyzing a crop/plant image, you MUST respond with ONLY a valid JSON object (no markdown, no extra text) in this exact structure:
{
  "disease": "Disease name or 'Healthy Plant'",
  "confidence": "High / Medium / Low",
  "affected_crop": "Crop or plant name",
  "description": "Brief description of the disease and what you observe in the image",
  "causes": ["cause 1", "cause 2", "cause 3"],
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "urgency": "Immediate / Within a week / Monitor",
  "is_healthy": true or false
}

If the image is NOT a plant or crop, return:
{
  "error": "not_a_plant",
  "message": "Please upload a clear image of a crop or plant leaf."
}`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
            {
              type: "text",
              text: systemPrompt,
            },
          ],
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content || "";

    // Parse JSON from response
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if JSON parse fails
      parsed = {
        error: "parse_error",
        message: "Could not analyze image. Please try again with a clearer photo.",
        raw: rawText,
      };
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Disease detection error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "server_error", message },
      { status: 500 }
    );
  }
}