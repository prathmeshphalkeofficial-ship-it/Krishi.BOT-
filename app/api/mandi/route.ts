import { NextRequest, NextResponse } from "next/server"

export const revalidate = 3600 // cache for 1 hour

const DISTRICT_STATE_MAP: Record<string, string> = {
  Pune: "Maharashtra",
  Nashik: "Maharashtra",
  Nagpur: "Maharashtra",
  Aurangabad: "Maharashtra",
  Solapur: "Maharashtra",
  Kolhapur: "Maharashtra",
  Ahmednagar: "Maharashtra",
  Satara: "Maharashtra",
  Sangli: "Maharashtra",
  Latur: "Maharashtra",
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const district = searchParams.get("district") || "Pune"

  try {
    // Try data.gov.in with the user's API key
    const apiKey = process.env.NEXT_PUBLIC_MANDI_API_KEY || "579b464db66ec23bdd000001eb9dea2926d04e6f5613a9ebe58b2f88"
    const state = DISTRICT_STATE_MAP[district] || "Maharashtra"

    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}&limit=100&sort[arrival_date]=desc`

    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 3600 },
    })

    const data = await res.json()

    if (data.records && data.records.length > 0) {
      return NextResponse.json({ success: true, source: "data.gov.in", records: data.records })
    }

    // Fallback: try without district filter
    const fallbackUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[state]=${encodeURIComponent(state)}&limit=100&sort[arrival_date]=desc`
    const fallbackRes = await fetch(fallbackUrl, { next: { revalidate: 3600 } })
    const fallbackData = await fallbackRes.json()

    if (fallbackData.records && fallbackData.records.length > 0) {
      return NextResponse.json({ success: true, source: "data.gov.in", records: fallbackData.records })
    }

    // Final fallback: return mock data based on real Maharashtra prices
    return NextResponse.json({
      success: true,
      source: "mock",
      records: getMockData(district),
    })
  } catch (error) {
    // Always return mock data on error so app never breaks
    return NextResponse.json({
      success: true,
      source: "mock",
      records: getMockData(district),
    })
  }
}

function getMockData(district: string) {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
  return [
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Onion", variety: "Local", arrival_date: today, min_price: "800", max_price: "1400", modal_price: "1100" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Tomato", variety: "Local", arrival_date: today, min_price: "600", max_price: "1200", modal_price: "900" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Potato", variety: "Local", arrival_date: today, min_price: "700", max_price: "1100", modal_price: "850" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Soybean", variety: "Yellow", arrival_date: today, min_price: "4200", max_price: "4800", modal_price: "4500" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Wheat", variety: "Local", arrival_date: today, min_price: "2100", max_price: "2400", modal_price: "2250" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Cotton", variety: "Medium", arrival_date: today, min_price: "6200", max_price: "7000", modal_price: "6600" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Banana", variety: "Local", arrival_date: today, min_price: "800", max_price: "1400", modal_price: "1100" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Grapes", variety: "Thomson", arrival_date: today, min_price: "2000", max_price: "4000", modal_price: "3000" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Pomegranate", variety: "Bhagwa", arrival_date: today, min_price: "4000", max_price: "8000", modal_price: "6000" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Cabbage", variety: "Local", arrival_date: today, min_price: "200", max_price: "600", modal_price: "400" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Cauliflower", variety: "Local", arrival_date: today, min_price: "400", max_price: "900", modal_price: "650" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Brinjal", variety: "Local", arrival_date: today, min_price: "300", max_price: "800", modal_price: "550" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Tur (Arhar)", variety: "Local", arrival_date: today, min_price: "6500", max_price: "7500", modal_price: "7000" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Gram", variety: "Desi", arrival_date: today, min_price: "4800", max_price: "5500", modal_price: "5200" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Maize", variety: "Local", arrival_date: today, min_price: "1800", max_price: "2200", modal_price: "2000" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Garlic", variety: "Local", arrival_date: today, min_price: "3000", max_price: "6000", modal_price: "4500" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Ginger", variety: "Local", arrival_date: today, min_price: "2500", max_price: "5000", modal_price: "3500" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Mango", variety: "Kesar", arrival_date: today, min_price: "3000", max_price: "8000", modal_price: "5500" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Groundnut", variety: "Local", arrival_date: today, min_price: "4500", max_price: "5500", modal_price: "5000" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "Sunflower", variety: "Local", arrival_date: today, min_price: "4200", max_price: "5000", modal_price: "4600" },
  ]
}