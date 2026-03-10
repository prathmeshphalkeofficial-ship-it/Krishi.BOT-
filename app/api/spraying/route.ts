import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 })
  }

  const API_KEY = process.env.OPENWEATHER_API_KEY

  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=2`
      ),
    ])

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error('OpenWeather API error')
    }

    const current = await currentRes.json()
    const forecast = await forecastRes.json()

    const rainProbability = Math.round((forecast.list?.[0]?.pop ?? 0) * 100)
    const windDeg = current.wind?.deg ?? 0
    const cloudCover = current.clouds?.all ?? 0
    const rainLastHour = current.rain?.['1h'] ?? 0
    const visibility = current.visibility ? current.visibility / 1000 : 10

    const sunriseTs = current.sys?.sunrise ?? 0
    const sunsetTs = current.sys?.sunset ?? 0
    const sunriseDate = new Date(sunriseTs * 1000)
    const sunsetDate = new Date(sunsetTs * 1000)
    const sunrise = sunriseDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    const sunset = sunsetDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    return NextResponse.json({
      temp: Math.round(current.main?.temp ?? 0),
      feelsLike: Math.round(current.main?.feels_like ?? 0),
      humidity: current.main?.humidity ?? 0,
      windSpeed: current.wind?.speed ?? 0,
      windDeg,
      rainProbability,
      cloudCover,
      rainLastHour,
      visibility,
      pressure: current.main?.pressure ?? 0,
      description: current.weather?.[0]?.description ?? 'Unknown',
      city: current.name ?? 'Unknown',
      country: current.sys?.country ?? '',
      sunrise,
      sunset,
    })
  } catch (err) {
    console.error('Weather API error:', err)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}