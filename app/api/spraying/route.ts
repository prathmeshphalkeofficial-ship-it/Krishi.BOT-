import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(req: NextRequest) {
  console.log("DEBUG API_KEY:", API_KEY ? `Found: ${API_KEY.slice(0, 6)}...` : "NOT FOUND");

  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json({ error: "API key missing in .env.local" }, { status: 500 });
    }

    // ── Fetch BOTH endpoints in parallel ──────────────────────
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
        { cache: "no-store" }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=4`,
        { cache: "no-store" }
      ),
    ]);

    if (!weatherRes.ok) throw new Error(`OpenWeather error: ${weatherRes.status}`);

    const data = await weatherRes.json();

    // ── Rain probability from forecast (next 3 hours) ─────────
    let rainProbability = 0;
    if (forecastRes.ok) {
      const forecastData = await forecastRes.json();
      // pop = probability of precipitation (0 to 1) for next time slot
      const nextSlot = forecastData?.list?.[0];
      rainProbability = nextSlot?.pop != null
        ? Math.round(nextSlot.pop * 100)
        : 0;
    }

    // ── Rain in last hour (actual rain mm if present) ─────────
    const rainLastHour = data.rain?.["1h"] ?? 0;

    return NextResponse.json({
      city:            data.name,
      country:         data.sys.country,
      temperature:     Math.round(data.main.temp),
      feelsLike:       Math.round(data.main.feels_like),
      humidity:        data.main.humidity,
      windSpeed:       parseFloat((data.wind.speed * 3.6).toFixed(1)),
      windDeg:         data.wind.deg ?? 0,
      condition:       data.weather[0].main,
      description:     data.weather[0].description,
      iconUrl:         `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      sunrise:         new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      sunset:          new Date(data.sys.sunset  * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      visibility:      (data.visibility / 1000).toFixed(1) + " km",
      pressure:        data.main.pressure + " hPa",
      rainProbability, // ← NEW: 0–100 real % from forecast endpoint
      rainLastHour,    // ← NEW: actual mm of rain in last hour (0 if none)
      cloudCover:      data.clouds?.all ?? 0, // ← NEW: cloud cover %
    });

  } catch (error: any) {
    console.log("DEBUG ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}