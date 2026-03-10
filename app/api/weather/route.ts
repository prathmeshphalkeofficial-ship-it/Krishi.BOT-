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

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=2`),
    ]);

    if (!weatherRes.ok) throw new Error(`OpenWeather error: ${weatherRes.status}`);

    const data = await weatherRes.json();
    const forecastData = forecastRes.ok ? await forecastRes.json() : null;

    return NextResponse.json({
      // Basic info
      city:            data.name,
      country:         data.sys.country,

      // Temperature
      temp:            Math.round(data.main.temp),
      feelsLike:       Math.round(data.main.feels_like),
      temperature:     Math.round(data.main.temp),       // alias for other pages

      // Atmosphere
      humidity:        data.main.humidity,
      pressure:        data.main.pressure,               // number (hPa)
      visibility:      data.visibility / 1000,           // number (km)

      // Wind
      windSpeed:       data.wind?.speed ?? 0,            // m/s — page multiplies ×3.6
      windDeg:         data.wind?.deg ?? 0,

      // Rain / Cloud
      rainProbability: Math.round((forecastData?.list?.[0]?.pop ?? 0) * 100),
      cloudCover:      data.clouds?.all ?? 0,
      rainLastHour:    data.rain?.["1h"] ?? 0,

      // Sky condition
      condition:       data.weather[0].main,
      description:     data.weather[0].description,
      iconUrl:         `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,

      // Sun times
      sunrise:         new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      sunset:          new Date(data.sys.sunset  * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    });

  } catch (error: any) {
    console.log("DEBUG ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}