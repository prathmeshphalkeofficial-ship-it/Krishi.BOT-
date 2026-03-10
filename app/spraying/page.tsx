'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, MapPin, Thermometer, Wind, Droplets, CloudRain, Eye, Cloud, Gauge, Sunrise, Sunset, CheckCircle2, XCircle, AlertCircle, Sprout, Clock, ShieldCheck, ChevronRight } from 'lucide-react'

interface WeatherData {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDeg: number
  rainProbability: number
  cloudCover: number
  rainLastHour: number
  visibility: number
  pressure: number
  description: string
  city: string
  country: string
  sunrise: string
  sunset: string
}

function getWindDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

function calcSprayScore(w: WeatherData): number {
  let score = 100

  // Temperature: ideal 15–30°C
  if (w.temp > 35) score -= 30
  else if (w.temp > 30) score -= 15
  else if (w.temp < 10) score -= 25
  else if (w.temp < 15) score -= 10

  // Wind: ideal < 15 km/h
  const windKmh = w.windSpeed * 3.6
  if (windKmh > 25) score -= 35
  else if (windKmh > 15) score -= 20
  else if (windKmh > 10) score -= 5

  // Humidity: ideal 40–80%
  if (w.humidity < 20) score -= 25
  else if (w.humidity < 40) score -= 15
  else if (w.humidity > 90) score -= 20
  else if (w.humidity > 80) score -= 10

  // Rain probability
  if (w.rainProbability > 70) score -= 30
  else if (w.rainProbability > 40) score -= 15
  else if (w.rainProbability > 20) score -= 5

  // Rain last hour
  if (w.rainLastHour > 2) score -= 20
  else if (w.rainLastHour > 0) score -= 10

  // Cloud cover: slight cloud is fine
  if (w.cloudCover > 80) score -= 5

  return Math.max(0, Math.min(100, score))
}

type CondStatus = 'good' | 'warning' | 'danger'

interface Condition {
  label: string
  sublabel: string
  value: string
  status: CondStatus
  icon: React.ReactNode
  statusIcon: React.ReactNode
}

function getConditions(w: WeatherData): Condition[] {
  const windKmh = (w.windSpeed * 3.6).toFixed(1)

  const tempStatus: CondStatus = w.temp > 35 ? 'danger' : w.temp > 30 || w.temp < 15 ? 'warning' : 'good'
  const windStatus: CondStatus = parseFloat(windKmh) > 25 ? 'danger' : parseFloat(windKmh) > 15 ? 'warning' : 'good'
  const humStatus: CondStatus = w.humidity < 20 ? 'danger' : w.humidity < 40 || w.humidity > 80 ? 'warning' : 'good'
  const rainStatus: CondStatus = w.rainProbability > 70 ? 'danger' : w.rainProbability > 30 ? 'warning' : 'good'

  const statusIcon = (s: CondStatus) => s === 'good'
    ? <CheckCircle2 className="w-4 h-4 text-green-400" />
    : s === 'warning'
    ? <AlertCircle className="w-4 h-4 text-yellow-400" />
    : <XCircle className="w-4 h-4 text-red-400" />

  return [
    {
      label: 'Temperature',
      sublabel: `Feels ${w.feelsLike}°C — ideal 15–30°C`,
      value: `${w.temp}°C`,
      status: tempStatus,
      icon: <Thermometer className="w-4 h-4" />,
      statusIcon: statusIcon(tempStatus),
    },
    {
      label: 'Wind Speed',
      sublabel: parseFloat(windKmh) <= 15 ? 'Safe — minimal drift risk' : parseFloat(windKmh) <= 25 ? 'Moderate — some drift possible' : 'High — spray drift risk',
      value: `${windKmh} km/h`,
      status: windStatus,
      icon: <Wind className="w-4 h-4" />,
      statusIcon: statusIcon(windStatus),
    },
    {
      label: 'Humidity',
      sublabel: `Ideal 40–80% — ${w.humidity < 40 ? 'Low' : w.humidity > 80 ? 'High' : 'Optimal'}`,
      value: `${w.humidity}%`,
      status: humStatus,
      icon: <Droplets className="w-4 h-4" />,
      statusIcon: statusIcon(humStatus),
    },
    {
      label: 'Rain Probability',
      sublabel: w.rainProbability < 30 ? 'Low rain risk — safe window' : w.rainProbability < 70 ? 'Moderate rain risk' : 'High rain risk — avoid spraying',
      value: `${w.rainProbability}%`,
      status: rainStatus,
      icon: <CloudRain className="w-4 h-4" />,
      statusIcon: statusIcon(rainStatus),
    },
  ]
}

function getRecommendations(w: WeatherData): { title: string; detail: string; type: 'warning' | 'danger' | 'info' }[] {
  const recs: { title: string; detail: string; type: 'warning' | 'danger' | 'info' }[] = []

  if (w.temp > 30) {
    recs.push({
      title: 'Slightly hot',
      detail: 'Spray before 9 AM to avoid rapid evaporation in the heat.',
      type: 'warning',
    })
  }
  if (w.humidity < 40) {
    recs.push({
      title: 'Humidity too low',
      detail: 'Below 30% RH causes spray to evaporate before reaching the crop. Spray at dawn.',
      type: 'danger',
    })
  }
  if (w.rainProbability > 60) {
    recs.push({
      title: 'Rain expected soon',
      detail: 'High rain probability — spray may wash off. Wait for clear weather.',
      type: 'danger',
    })
  }
  if (w.rainLastHour > 0) {
    recs.push({
      title: 'Recent rainfall detected',
      detail: `${w.rainLastHour}mm rain in last hour. Wait 2–4 hours for foliage to dry.`,
      type: 'danger',
    })
  }
  if (w.windSpeed * 3.6 > 15) {
    recs.push({
      title: 'Wind speed elevated',
      detail: 'Wind drift may reduce effectiveness. Spray perpendicular to wind direction.',
      type: 'warning',
    })
  }
  if (recs.length === 0) {
    recs.push({
      title: 'Conditions are good',
      detail: 'Weather is suitable for spraying. Follow standard safety protocols.',
      type: 'info',
    })
  }
  return recs
}

const statusBg: Record<CondStatus, string> = {
  good: 'border-green-800/40 bg-green-900/10',
  warning: 'border-yellow-700/40 bg-yellow-900/10',
  danger: 'border-red-800/40 bg-red-900/10',
}

export default function SprayingAdvisorPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      if (!res.ok) throw new Error('Failed to fetch weather')
      const data = await res.json()
      setWeather(data)
      const now = new Date()
      setLastUpdated(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }))
    } catch {
      setError('Unable to fetch weather data. Check your API key.')
    } finally {
      setLoading(false)
    }
  }, [])

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lon: longitude })
        fetchWeather(latitude, longitude)
      },
      () => {
        // fallback: Pune
        setCoords({ lat: 18.5204, lon: 73.8567 })
        fetchWeather(18.5204, 73.8567)
      }
    )
  }, [fetchWeather])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  const handleRefresh = () => {
    if (coords) fetchWeather(coords.lat, coords.lon)
    else getLocation()
  }

  const score = weather ? calcSprayScore(weather) : null
  const isSafe = score !== null && score >= 60
  const conditions = weather ? getConditions(weather) : []
  const recommendations = weather ? getRecommendations(weather) : []

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            <span className="font-semibold text-base">Spraying Advisor</span>
          </div>
          {weather && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {weather.city}, {weather.country} · Live · Updated {lastUpdated}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/10 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && !weather && (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-sm">Fetching live weather…</span>
          </div>
        </div>
      )}

      {weather && (
        <div className="px-4 pt-4 space-y-5">
          {/* Hero temp + score */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                {weather.cloudCover > 60 ? '☁️' : weather.cloudCover > 20 ? '⛅' : '☀️'}
              </div>
              <div>
                <div className="text-5xl font-bold tracking-tight">{weather.temp}°C</div>
                <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${
                  isSafe
                    ? 'border-green-600 text-green-400 bg-green-900/20'
                    : 'border-red-600 text-red-400 bg-red-900/20'
                }`}
              >
                {isSafe ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {isSafe ? 'Safe to Spray' : 'Avoid Spraying'}
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  isSafe ? 'bg-green-700 text-white' : 'bg-red-800 text-white'
                }`}
              >
                {score}
              </div>
            </div>
          </div>

          {/* Live weather grid */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Complete Live Weather Data</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { icon: <Thermometer className="w-4 h-4 text-orange-400" />, value: `${weather.temp}°C`, label: 'Temperature', sub: `Feels ${weather.feelsLike}°C` },
                { icon: <Wind className="w-4 h-4 text-blue-400" />, value: `${(weather.windSpeed * 3.6).toFixed(1)} km/h`, label: 'Wind Speed', sub: `Direction: ${getWindDirection(weather.windDeg)}` },
                { icon: <Droplets className="w-4 h-4 text-cyan-400" />, value: `${weather.humidity}%`, label: 'Humidity', sub: weather.humidity < 40 ? 'Low' : weather.humidity > 80 ? 'High' : 'Optimal' },
                { icon: <CloudRain className="w-4 h-4 text-sky-400" />, value: `${weather.rainProbability}%`, label: 'Rain Probability', sub: 'Next 3 hours — real data' },
                { icon: <Gauge className="w-4 h-4 text-purple-400" />, value: `${weather.pressure} hPa`, label: 'Pressure', sub: 'Atmospheric' },
                { icon: <Eye className="w-4 h-4 text-teal-400" />, value: `${weather.visibility.toFixed(1)} km`, label: 'Visibility', sub: weather.visibility > 5 ? 'Clear' : 'Hazy' },
                { icon: <Cloud className="w-4 h-4 text-slate-400" />, value: `${weather.cloudCover}%`, label: 'Cloud Cover', sub: weather.cloudCover < 20 ? 'Mostly clear' : weather.cloudCover < 60 ? 'Partly cloudy' : 'Overcast' },
                { icon: <Droplets className="w-4 h-4 text-blue-300" />, value: `${weather.rainLastHour} mm`, label: 'Rain Last Hour', sub: weather.rainLastHour === 0 ? 'No recent rain' : 'Recent rain detected' },
                { icon: <Sunrise className="w-4 h-4 text-yellow-400" />, value: weather.sunrise, label: 'Sunrise', sub: 'Morning spray starts' },
                { icon: <Sunset className="w-4 h-4 text-orange-500" />, value: weather.sunset, label: 'Sunset', sub: 'Evening spray ends' },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-3">
                  {item.icon}
                  <div className="mt-2 text-lg font-semibold">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground/70">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conditions Check */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Spraying Conditions Check</p>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${statusBg[c.status]}`}>
                  <div className="flex items-center gap-3">
                    {c.statusIcon}
                    <span className="text-muted-foreground">{c.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.sublabel}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${c.status === 'good' ? 'text-green-400' : c.status === 'warning' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {c.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Recommendations</p>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    r.type === 'danger'
                      ? 'border-red-800/40 bg-red-900/10'
                      : r.type === 'warning'
                      ? 'border-yellow-700/40 bg-yellow-900/10'
                      : 'border-green-700/40 bg-green-900/10'
                  }`}
                >
                  <div className={`font-semibold text-sm ${r.type === 'danger' ? 'text-red-400' : r.type === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {r.type === 'danger' ? '🔥' : r.type === 'warning' ? '⚠️' : '✅'} {r.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{r.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Best time + Safety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                Best Time to Spray
              </div>
              <div className="text-primary font-bold text-base leading-tight">
                {weather.temp > 30 || weather.humidity < 40
                  ? 'Early morning only (6–8 AM) — before heat builds up'
                  : weather.rainProbability > 60
                  ? 'Wait for rain to clear — check forecast'
                  : 'Morning (7–10 AM) or Evening (4–6 PM)'}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Based on live data from {weather.city} — rain probability {weather.rainProbability}% · wind speed {(weather.windSpeed * 3.6).toFixed(1)} km/h · humidity {weather.humidity}%
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <ShieldCheck className="w-4 h-4" />
                Safety Reminders
              </div>
              <ul className="space-y-1.5">
                {[
                  'Always wear protective gear — mask, gloves, goggles',
                  'Calibrate sprayer nozzle before starting',
                  'Spray in the direction of wind, never against it',
                  'Check product label for minimum rain-free hours',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Spray Windows */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Today's Spray Windows</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-sm text-muted-foreground">Morning Window</div>
                <div className="text-primary font-semibold mt-1">
                  {weather.sunrise} – 10:00 AM
                </div>
                <div className={`text-xs mt-1 ${isSafe ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isSafe ? '✓ Recommended' : '⚠ Check conditions'}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="text-sm text-muted-foreground">Evening Window</div>
                <div className="text-primary font-semibold mt-1">
                  4:00 PM – {weather.sunset}
                </div>
                <div className={`text-xs mt-1 ${isSafe ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isSafe ? '✓ Suitable' : '⚠ Check conditions'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
