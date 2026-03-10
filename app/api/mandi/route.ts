import { NextRequest, NextResponse } from "next/server"

export const revalidate = 3600 // cache 1 hour

const DISTRICT_URL_MAP: Record<string, string> = {
  Pune: "https://vegetablemarketprice.com/market/maharashtra/today",
  Nashik: "https://vegetablemarketprice.com/market/maharashtra/today",
  Nagpur: "https://vegetablemarketprice.com/market/maharashtra/today",
  Aurangabad: "https://vegetablemarketprice.com/market/maharashtra/today",
  Solapur: "https://vegetablemarketprice.com/market/maharashtra/today",
  Kolhapur: "https://vegetablemarketprice.com/market/maharashtra/today",
  Ahmednagar: "https://vegetablemarketprice.com/market/maharashtra/today",
  Satara: "https://vegetablemarketprice.com/market/maharashtra/today",
  Sangli: "https://vegetablemarketprice.com/market/maharashtra/today",
  Latur: "https://vegetablemarketprice.com/market/maharashtra/today",
}

type MandiRecord = {
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  arrival_date: string
  min_price: string
  max_price: string
  modal_price: string
  unit: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const district = searchParams.get("district") || "Pune"
  const url = DISTRICT_URL_MAP[district] || DISTRICT_URL_MAP["Pune"]
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const html = await res.text()

    // Parse the price table from vegetablemarketprice.com
    const records: MandiRecord[] = []

    // Match table rows with vegetable prices
    // The site has a table with: Name | Min Price | Max Price | Modal/Avg Price
    const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi)

    if (tableMatch) {
      for (const table of tableMatch) {
        // Look for rows with price data
        const rowMatches = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi)
        if (!rowMatches) continue

        for (const row of rowMatches) {
          // Extract cells
          const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi)
          if (!cells || cells.length < 3) continue

          // Clean HTML tags from cell content
          const cleanCell = (cell: string) => cell.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim()

          const name = cleanCell(cells[0])
          const minPrice = cleanCell(cells[1])
          const maxPrice = cleanCell(cells[2])
          const modalPrice = cells[3] ? cleanCell(cells[3]) : maxPrice

          // Skip header rows and empty rows
          if (!name || name.toLowerCase().includes("vegetable") || name.toLowerCase().includes("commodity") || name.toLowerCase() === "name") continue
          if (isNaN(parseFloat(minPrice)) && isNaN(parseFloat(maxPrice))) continue

          // Convert from per kg to per quintal (multiply by 100)
          const minQtl = Math.round(parseFloat(minPrice) * 100).toString()
          const maxQtl = Math.round(parseFloat(maxPrice) * 100).toString()
          const modalQtl = Math.round(parseFloat(modalPrice) * 100).toString()

          records.push({
            state: "Maharashtra",
            district,
            market: `${district} Market`,
            commodity: name,
            variety: "Local",
            arrival_date: today,
            min_price: isNaN(parseFloat(minPrice)) ? "0" : minQtl,
            max_price: isNaN(parseFloat(maxPrice)) ? "0" : maxQtl,
            modal_price: isNaN(parseFloat(modalPrice)) ? maxQtl : modalQtl,
            unit: "per kg",
          })
        }
      }
    }

    if (records.length > 0) {
      return NextResponse.json({
        success: true,
        source: "vegetablemarketprice.com",
        records,
      })
    }

    // Fallback to mock data if scraping fails
    throw new Error("No records parsed")

  } catch (err) {
    // Return realistic Maharashtra prices as fallback
    return NextResponse.json({
      success: true,
      source: "mock",
      records: getMockData(district),
    })
  }
}

function getMockData(district: string): MandiRecord[] {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
  return [
  { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🧅 Onion", variety: "Local", arrival_date: today, min_price: "800", max_price: "1400", modal_price: "1100", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🍅 Tomato", variety: "Local", arrival_date: today, min_price: "600", max_price: "1200", modal_price: "900", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🥔 Potato", variety: "Local", arrival_date: today, min_price: "700", max_price: "1100", modal_price: "850", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🫘 Soybean", variety: "Yellow", arrival_date: today, min_price: "4200", max_price: "4800", modal_price: "4500", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🌾 Wheat", variety: "Local", arrival_date: today, min_price: "2100", max_price: "2400", modal_price: "2250", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🌿 Cotton", variety: "Medium", arrival_date: today, min_price: "6200", max_price: "7000", modal_price: "6600", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🍌 Banana", variety: "Local", arrival_date: today, min_price: "800", max_price: "1400", modal_price: "1100", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🍇 Grapes", variety: "Thomson", arrival_date: today, min_price: "2000", max_price: "4000", modal_price: "3000", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🍎 Pomegranate", variety: "Bhagwa", arrival_date: today, min_price: "4000", max_price: "8000", modal_price: "6000", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🥬 Cabbage", variety: "Local", arrival_date: today, min_price: "200", max_price: "600", modal_price: "400", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🥦 Cauliflower", variety: "Local", arrival_date: today, min_price: "400", max_price: "900", modal_price: "650", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🍆 Brinjal", variety: "Local", arrival_date: today, min_price: "300", max_price: "800", modal_price: "550", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🫛 Tur (Arhar)", variety: "Local", arrival_date: today, min_price: "6500", max_price: "7500", modal_price: "7000", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🌰 Gram", variety: "Desi", arrival_date: today, min_price: "4800", max_price: "5500", modal_price: "5200", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🌽 Maize", variety: "Local", arrival_date: today, min_price: "1800", max_price: "2200", modal_price: "2000", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🧄 Garlic", variety: "Local", arrival_date: today, min_price: "3000", max_price: "6000", modal_price: "4500", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🫚 Ginger", variety: "Local", arrival_date: today, min_price: "2500", max_price: "5000", modal_price: "3500", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🥭 Mango", variety: "Kesar", arrival_date: today, min_price: "3000", max_price: "8000", modal_price: "5500", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🥜 Groundnut", variety: "Local", arrival_date: today, min_price: "4500", max_price: "5500", modal_price: "5000", unit: "per quintal" },
    { state: "Maharashtra", district, market: `${district} APMC`, commodity: "🌻 Sunflower", variety: "Local", arrival_date: today, min_price: "4200", max_price: "5000", modal_price: "4600", unit: "per quintal" },
  ]
}