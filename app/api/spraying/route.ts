import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon)
      return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
    if (!API_KEY)
      return NextResponse.json({ error: "API key missing in .env.local" }, { status: 500 });

    // Fetch current weather + forecast in parallel
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
        { cache: "no-store" }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=2`,
        { cache: "no-store" }
      ),
    ]);

    if (!weatherRes.ok) throw new Error(`OpenWeather error: ${weatherRes.status}`);
    const data = await weatherRes.json();

    // Rain probability from forecast endpoint
    let rainProbability = 0;
    if (forecastRes.ok) {
      const forecastData = await forecastRes.json();
      const pop = forecastData?.list?.[0]?.pop;
      rainProbability = pop != null ? Math.round(Number(pop) * 100) : 0;
    }

    return NextResponse.json({
      city:            data.name                    ?? "Unknown",
      country:         data.sys?.country            ?? "",
      temperature:     Math.round(data.main?.temp   ?? 0),
      feelsLike:       Math.round(data.main?.feels_like ?? 0),
      humidity:        data.main?.humidity          ?? 0,
      windSpeed:       parseFloat(((data.wind?.speed ?? 0) * 3.6).toFixed(1)),
      windDeg:         data.wind?.deg               ?? 0,
      condition:       data.weather?.[0]?.main      ?? "Clear",
      description:     data.weather?.[0]?.description ?? "clear sky",
      iconUrl:         `https://openweathermap.org/img/wn/${data.weather?.[0]?.icon ?? "01d"}@2x.png`,
      sunrise:         new Date((data.sys?.sunrise ?? 0) * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      sunset:          new Date((data.sys?.sunset  ?? 0) * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      visibility:      (((data.visibility ?? 10000) / 1000).toFixed(1)) + " km",
      pressure:        (data.main?.pressure ?? 0) + " hPa",
      rainProbability,                                          // 0-100 from forecast
      rainLastHour:    data.rain?.["1h"]            ?? 0,      // mm, 0 if no rain
      cloudCover:      data.clouds?.all             ?? 0,      // % cloud cover
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}