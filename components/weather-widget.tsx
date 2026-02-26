"use client"

import { useEffect, useState } from "react"
import { Droplets, Thermometer, Wind, Cloud, MapPin, Eye, Loader2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/lib/app-context"
import { t } from "@/lib/i18n"

interface WeatherData {
  city: string; country: string; temperature: number; feelsLike: number
  humidity: number; windSpeed: number; condition: string; description: string
  iconUrl: string; sunrise: string; sunset: string; visibility: string; pressure: string
}

const DEFAULT_LAT = 18.5204
const DEFAULT_LON = 73.8567

function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading")
  const [error, setError] = useState("")
  const fetchWeather = async (lat: number, lon: number) => {
    setStatus("loading")
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setWeather(data); setStatus("success")
    } catch (err: any) { setError(err.message || "Failed"); setStatus("error") }
  }
  const load = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(DEFAULT_LAT, DEFAULT_LON),
        { timeout: 5000 }
      )
    } else { fetchWeather(DEFAULT_LAT, DEFAULT_LON) }
  }
  useEffect(() => { load() }, [])
  return { weather, status, error, refetch: load }
}

function getFarmingTip(condition: string, humidity: number): string {
  const c = condition.toLowerCase()
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️ Rain expected — skip irrigation today!"
  if (c.includes("thunderstorm")) return "⛈️ Thunderstorm — no field work today."
  if (c.includes("clear") && humidity < 40) return "☀️ Hot & dry — irrigate in early morning."
  if (c.includes("clear")) return "☀️ Clear sky — good day for field work!"
  if (c.includes("cloud")) return "⛅ Cloudy — good for transplanting seedlings."
  if (humidity > 80) return "💧 High humidity — watch for fungal infections."
  return "🌱 Good farming conditions today!"
}

export function WeatherWidget() {
  const { language } = useApp()
  const { weather, status, error, refetch } = useWeather()
  if (status === "loading") return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">🌤️ Fetching live weather...</p>
      </CardContent>
    </Card>
  )
  if (status === "error" || !weather) return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-sm text-destructive font-medium">⚠️ {error}</p>
        <button onClick={refetch} className="flex items-center gap-2 text-xs bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
          <RefreshCw className="h-3 w-3" /> Try Again
        </button>
      </CardContent>
    </Card>
  )
  const tip = getFarmingTip(weather.condition, weather.humidity)
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><Cloud className="h-4 w-4 text-primary" />{t("weatherForecast", language)}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground"><MapPin className="h-3 w-3" />{weather.city}, {weather.country}</span>
            <button onClick={refetch}><RefreshCw className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" /></button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <img src={weather.iconUrl} alt={weather.condition} className="h-10 w-10" />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{weather.temperature}°C</div>
              <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
              <div className="text-xs text-muted-foreground">Feels like {weather.feelsLike}°C</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground"><Droplets className="h-3.5 w-3.5 text-primary" />{weather.humidity}%</div>
            <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground"><Wind className="h-3.5 w-3.5 text-primary" />{weather.windSpeed} km/h</div>
            <div className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground"><Eye className="h-3.5 w-3.5 text-primary" />{weather.visibility}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">🌅 Sunrise: <span className="font-semibold text-foreground">{weather.sunrise}</span></div>
          <div className="text-xs text-muted-foreground">🌇 Sunset: <span className="font-semibold text-foreground">{weather.sunset}</span></div>
          <div className="text-xs text-muted-foreground">🌡️ Pressure: <span className="font-semibold text-foreground">{weather.pressure}</span></div>
        </div>
        <div className="rounded-xl bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary font-medium">{tip}</div>
        <div className="text-[10px] text-muted-foreground text-right">Live · OpenWeatherMap · auto-updates</div>
      </CardContent>
    </Card>
  )
}

export function SensorCards() {
  const { language, moistureLevel } = useApp()
  const { weather, status } = useWeather()
  const isLoading = status === "loading"
  const sensors = [
    { key: "soilMoisture" as const, value: `${moistureLevel}%`, icon: Droplets, trend: "+2% from yesterday", color: "text-primary", bgColor: "bg-primary/10", live: false },
    { key: "temperature" as const, value: isLoading ? "..." : weather ? `${weather.temperature}°C` : "N/A", icon: Thermometer, trend: isLoading ? "Fetching..." : weather ? `Feels like ${weather.feelsLike}°C` : "Check API key", color: "text-chart-4", bgColor: "bg-chart-4/10", live: true },
    { key: "humidity" as const, value: isLoading ? "..." : weather ? `${weather.humidity}%` : "N/A", icon: Droplets, trend: isLoading ? "Fetching..." : weather ? weather.humidity > 70 ? "High humidity" : weather.humidity > 40 ? "Optimal" : "Low humidity" : "Check API key", color: "text-chart-5", bgColor: "bg-chart-5/10", live: true },
    { key: "windSpeed" as const, value: isLoading ? "..." : weather ? `${weather.windSpeed} km/h` : "N/A", icon: Wind, trend: isLoading ? "Fetching..." : weather ? weather.windSpeed < 10 ? "Light breeze" : weather.windSpeed < 30 ? "Moderate wind" : "Strong wind" : "Check API key", color: "text-chart-2", bgColor: "bg-chart-2/10", live: true },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {sensors.map((sensor) => (
        <Card key={sensor.key} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${sensor.bgColor}`}>
                <sensor.icon className={`h-5 w-5 ${sensor.color}`} />
              </div>
              {sensor.live && isLoading && <Loader2 className="h-3 w-3 text-muted-foreground animate-spin mt-1" />}
              {sensor.live && !isLoading && weather && <span className="text-[9px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">LIVE</span>}
            </div>
            <div className="text-2xl font-bold text-foreground">{sensor.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{t(sensor.key, language)}</div>
            <div className="text-[10px] text-primary/70 mt-1 font-medium">{sensor.trend}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
