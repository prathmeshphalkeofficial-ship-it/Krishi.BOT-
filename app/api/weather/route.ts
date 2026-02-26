import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(req: NextRequest) {
  // TEMPORARY DEBUG
  console.log("DEBUG API_KEY:", API_KEY ? `Found: ${API_KEY.slice(0,6)}...` : "NOT FOUND")

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

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!res.ok) throw new Error(`OpenWeather error: ${res.status}`);

    const data = await res.json();

    return NextResponse.json({
      city:        data.name,
      country:     data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike:   Math.round(data.main.feels_like),
      humidity:    data.main.humidity,
      windSpeed:   parseFloat((data.wind.speed * 3.6).toFixed(1)),
      condition:   data.weather[0].main,
      description: data.weather[0].description,
      iconUrl:     `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      sunrise:     new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      sunset:      new Date(data.sys.sunset  * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      visibility:  (data.visibility / 1000).toFixed(1) + " km",
      pressure:    data.main.pressure + " hPa",
    });

  } catch (error: any) {
    console.log("DEBUG ERROR:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}