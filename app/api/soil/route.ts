import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ph, nitrogen, phosphorus, potassium, organicMatter, moisture, soilType, crop, language } = body;

    const langInstructions: Record<string, string> = {
      en: "Respond in English.",
      hi: "हिंदी में उत्तर दें।",
      mr: "मराठीत उत्तर द्या.",
    };

    const systemPrompt = `You are an expert Indian agricultural soil scientist. Analyze soil data and return ONLY a valid JSON object with no extra text, no markdown fences.

JSON schema (all fields required):
{
  "score": number (0-100),
  "overallHealth": string (1-2 sentences summary),
  "warnings": string[] (2-4 specific issues),
  "recommendations": string[] (3-5 actionable steps),
  "fertilizers": [
    {
      "name": string (e.g. "DAP (18:46:0)"),
      "dose": string (e.g. "50 kg/ha"),
      "reason": string (why this fertilizer),
      "costPerDose": number (approximate ₹ cost for that dose, Indian market price 2024)
    }
  ],
  "amendments": string[] (e.g. ["Compost 5 tons/ha", "Farmyard manure 10 tons/ha"]),
  "suitableCrops": string[] (5-6 crops suitable for these conditions),
  "yieldPrediction": {
    "crop": string (intended crop name),
    "minYield": string (e.g. "3.8"),
    "maxYield": string (e.g. "4.5"),
    "unit": string (e.g. "tons")
  }
}

Score interpretation: 90-100=Excellent, 75-89=Good, 60-74=Moderate, <60=Poor.
For fertilizer costPerDose use realistic 2024 Indian market prices:
- Urea 45kg bag: ₹266 (govt MRP)
- DAP 50kg bag: ₹1350
- MOP 50kg bag: ₹850
- SSP 50kg bag: ₹400
- NPK 50kg bag: ₹1100
Scale cost proportionally for the dose you recommend.
For yield prediction, base on soil score and Indian regional average yields.
${langInstructions[language] ?? langInstructions.en}`;

    const userPrompt = `Soil Analysis Request:
- pH: ${ph}
- Nitrogen: ${nitrogen} kg/ha
- Phosphorus: ${phosphorus} kg/ha
- Potassium: ${potassium} kg/ha
- Organic Matter: ${organicMatter}%
- Moisture: ${moisture}%
- Soil Type: ${soilType}
- Intended Crop: ${crop}

Analyze these values and provide the complete JSON response.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Strip markdown fences if present
    const clean = raw.replace(/```json|```/gi, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Attempt to extract JSON from response
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Invalid JSON from AI model");
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Soil API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}