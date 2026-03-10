import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ph, nitrogen, phosphorus, potassium, organic, moisture, crop, soilType, language } = body;

    if (!ph || !nitrogen || !phosphorus || !potassium) {
      return NextResponse.json({ error: "missing_fields", message: "pH, N, P, K are required." }, { status: 400 });
    }

    const languageInstructions: Record<string, string> = {
      en: "Respond in English.",
      hi: "Respond in Hindi (हिंदी में जवाब दें).",
      mr: "Respond in Marathi (मराठीत उत्तर द्या).",
    };

    const prompt = `You are an expert Indian soil scientist and agronomist specializing in Maharashtra farming.
${languageInstructions[language] || languageInstructions.en}

Analyze this soil data and respond ONLY with a valid JSON object (no markdown, no extra text):

Soil Data:
- Soil Type: ${soilType || "Unknown"}
- pH: ${ph}
- Nitrogen (N): ${nitrogen} kg/ha
- Phosphorus (P): ${phosphorus} kg/ha
- Potassium (K): ${potassium} kg/ha
- Organic Matter: ${organic || "unknown"}%
- Moisture: ${moisture || "unknown"}%
- Intended Crop: ${crop || "not specified"}

Return this exact JSON structure:
{
  "score": <number 0-100 representing overall soil health>,
  "overall_health": "<Excellent | Good | Fair | Poor>",
  "summary": "<2 sentence summary of soil condition>",
  "warnings": ["<critical issue 1>", "<critical issue 2>"],
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "fertilizers": ["<specific fertilizer with dose 1>", "<fertilizer 2>", "<fertilizer 3>"],
  "amendments": ["<soil amendment 1>", "<amendment 2>"],
  "suitable_crops": ["<crop 1>", "<crop 2>", "<crop 3>", "<crop 4>", "<crop 5>"]
}

Base the score on: pH balance (ideal 6-7.5), NPK levels (N ideal 280+, P ideal 25+, K ideal 110+ kg/ha for most crops), organic matter (ideal 2%+), and moisture. Warnings array can be empty [] if no issues.`;

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.choices[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        error: "parse_error",
        message: "Could not analyze soil data. Please try again.",
      };
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Soil analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}