'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Thermometer, Wind, Droplets, CloudRain, Eye, Gauge,
  Sunrise, Sunset, Sprout, CheckCircle2, XCircle,
  AlertTriangle, Clock, RefreshCw, MapPin, Loader2,
  Waves, FlameKindling, Snowflake, CloudLightning
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────
interface WeatherData {
  city: string
  country: string
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  condition: string
  description: string
  iconUrl: string
  sunrise: string
  sunset: string
  visibility: string
  pressure: string
}

interface SprayCondition {
  label: string
  value: string
  status: 'good' | 'bad' | 'warning'
  icon: React.ReactNode
  detail: string
}

interface Recommendation {
  icon: React.ReactNode
  title: string
  description: string
  severity: 'danger' | 'warning' | 'info' | 'success'
}

// ── Spraying Logic ─────────────────────────────────────────────
function analyzeSpray(w: WeatherData): {
  canSpray: boolean
  conditions: SprayCondition[]
  recommendations: Recommendation[]
  bestTime: string
  score: number
} {
  const recs: Recommendation[] = []
  let score = 100

  // Temperature
  let tempStatus: 'good' | 'bad' | 'warning' = 'good'
  if (w.temperature > 35) {
    tempStatus = 'bad'; score -= 30
    recs.push({ icon: <FlameKindling className="h-5 w-5" />, title: 'Temperature too high', description: 'Above 35°C causes rapid spray evaporation. Apply early morning or after sunset.', severity: 'danger' })
  } else if (w.temperature < 10) {
    tempStatus = 'bad'; score -= 30
    recs.push({ icon: <Snowflake className="h-5 w-5" />, title: 'Temperature too low', description: 'Below 10°C reduces pesticide effectiveness significantly. Wait for warmer conditions.', severity: 'danger' })
  } else if (w.temperature > 30) {
    tempStatus = 'warning'; score -= 15
    recs.push({ icon: <Thermometer className="h-5 w-5" />, title: 'Slightly hot', description: 'Spray before 9 AM to avoid rapid evaporation in the heat.', severity: 'warning' })
  }

  // Wind
  let windStatus: 'good' | 'bad' | 'warning' = 'good'
  if (w.windSpeed > 20) {
    windStatus = 'bad'; score -= 40
    recs.push({ icon: <Wind className="h-5 w-5" />, title: 'Wind speed too high', description: 'Wind above 20 km/h causes dangerous chemical drift. Wait until wind drops below 15 km/h.', severity: 'danger' })
  } else if (w.windSpeed > 15) {
    windStatus = 'warning'; score -= 20
    recs.push({ icon: <Wind className="h-5 w-5" />, title: 'Moderate wind — be careful', description: 'Spray low to the crop canopy and avoid spraying near field edges.', severity: 'warning' })
  } else if (w.windSpeed < 3) {
    windStatus = 'warning'; score -= 5
    recs.push({ icon: <Wind className="h-5 w-5" />, title: 'Very calm — move sprayer steadily', description: 'Very low wind can cause spray to pool in one spot. Keep the sprayer moving.', severity: 'info' })
  }

  // Humidity
  let humStatus: 'good' | 'bad' | 'warning' = 'good'
  if (w.humidity < 30) {
    humStatus = 'bad'; score -= 25
    recs.push({ icon: <Droplets className="h-5 w-5" />, title: 'Humidity too low', description: 'Below 30% RH causes spray droplets to evaporate before reaching the crop. Spray at dawn.', severity: 'danger' })
  } else if (w.humidity > 90) {
    humStatus = 'warning'; score -= 10
    recs.push({ icon: <Waves className="h-5 w-5" />, title: 'Very high humidity', description: 'Slow drying time may promote fungal growth after spraying. Ensure ventilation.', severity: 'warning' })
  }

  // Rain (estimate from condition string since we don't have pop)
  const isRainy = w.condition.toLowerCase().includes('rain') || w.condition.toLowerCase().includes('drizzle') || w.condition.toLowerCase().includes('storm')
  const isThunder = w.condition.toLowerCase().includes('thunder') || w.condition.toLowerCase().includes('storm')
  let rainStatus: 'good' | 'bad' | 'warning' = 'good'
  if (isThunder) {
    rainStatus = 'bad'; score -= 50
    recs.push({ icon: <CloudLightning className="h-5 w-5" />, title: 'Thunderstorm — DO NOT spray', description: 'Extremely dangerous conditions. Stay indoors. No spraying under any circumstances.', severity: 'danger' })
  } else if (isRainy) {
    rainStatus = 'bad'; score -= 35
    recs.push({ icon: <CloudRain className="h-5 w-5" />, title: 'Rain detected', description: 'Rain will wash away the spray before it is absorbed. Wait for 4–6 dry hours after rain stops.', severity: 'danger' })
  }

  // Visibility bonus info
  const visNum = parseFloat(w.visibility)
  if (visNum < 2) {
    score -= 10
    recs.push({ icon: <Eye className="h-5 w-5" />, title: 'Low visibility', description: 'Fog or mist may indicate high moisture — check crop surfaces are dry before spraying.', severity: 'warning' })
  }

  score = Math.max(0, Math.min(100, score))
  const canSpray = score >= 60

  const conditions: SprayCondition[] = [
    { label: 'Temperature',  value: `${w.temperature}°C`,    status: tempStatus, icon: <Thermometer className="h-4 w-4" />, detail: `Feels like ${w.feelsLike}°C — ideal range is 15–30°C` },
    { label: 'Wind Speed',   value: `${w.windSpeed} km/h`,   status: windStatus, icon: <Wind className="h-4 w-4" />,        detail: w.windSpeed < 15 ? 'Safe — minimal drift risk' : 'High drift risk — chemical may spread to other crops' },
    { label: 'Humidity',     value: `${w.humidity}%`,        status: humStatus,  icon: <Droplets className="h-4 w-4" />,    detail: `Ideal range 40–80% — currently ${w.humidity < 40 ? 'too dry' : w.humidity > 80 ? 'too humid' : 'perfect'}` },
    { label: 'Rain / Sky',   value: w.condition,             status: rainStatus, icon: <CloudRain className="h-4 w-4" />,   detail: isRainy ? 'Precipitation will wash off spray' : 'No precipitation — good for spraying' },
  ]

  if (recs.length === 0) {
    recs.push({ icon: <CheckCircle2 className="h-5 w-5" />, title: 'All conditions are ideal!', description: 'Temperature, wind, humidity and sky conditions are all within the safe spraying range. Go ahead!', severity: 'success' })
  }

  let bestTime = 'Early morning (6–9 AM) or evening (5–7 PM)'
  if (!canSpray) bestTime = 'Wait for conditions to improve — check again later'
  else if (w.temperature > 28) bestTime = 'Early morning only (6–8 AM) — before heat builds up'
  else if (w.humidity > 80) bestTime = 'Mid-morning (9–11 AM) — after dew has dried off leaves'

  return { canSpray, conditions, recommendations: recs, bestTime, score }
}

// ── Main Page ──────────────────────────────────────────────────
export default function SprayingPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [locating, setLocating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchWeather = useCallback((lat: number, lon: number) => {
    setLoading(true)
    fetch(`/api/weather?lat=${lat}&lon=${lon}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setWeather(d)
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
        setError('')
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const getLocation = useCallback(() => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setLocating(false); fetchWeather(pos.coords.latitude, pos.coords.longitude) },
      ()  => { setLocating(false); fetchWeather(18.5204, 73.8567) /* Pune fallback */ }
    )
  }, [fetchWeather])

  useEffect(() => { getLocation() }, [getLocation])

  const analysis = weather ? analyzeSpray(weather) : null

  // ── Loading State ──
  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium">
        {locating ? 'Getting your location…' : 'Loading weather data…'}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">

      {/* ── Hero Header ─────────────────────────────────────── */}
      <div className="bg-card border-b border-border px-4 md:px-8 pt-6 pb-0">
        <div className="max-w-5xl mx-auto">

          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sprout className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Spraying Advisor</h1>
              </div>
              {weather && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{weather.city}, {weather.country}</span>
                  {lastUpdated && <span className="text-xs">· Updated {lastUpdated}</span>}
                </div>
              )}
            </div>
            <button
              onClick={getLocation}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* Big temp + status strip */}
          {weather && analysis && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5">
              <div className="flex items-center gap-3">
                <img src={weather.iconUrl} alt={weather.description} className="h-16 w-16" />
                <div>
                  <p className="text-5xl font-black text-foreground leading-none">{weather.temperature}°C</p>
                  <p className="text-muted-foreground capitalize mt-1">{weather.description}</p>
                </div>
              </div>
              {/* Score badge */}
              <div className="sm:ml-auto flex items-center gap-3">
                <div className={`
                  flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-base border-2
                  ${analysis.canSpray
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-destructive/10 border-destructive text-destructive'}
                `}>
                  {analysis.canSpray
                    ? <CheckCircle2 className="h-6 w-6" />
                    : <XCircle className="h-6 w-6" />}
                  {analysis.canSpray ? 'Safe to Spray' : 'Not Recommended'}
                </div>
                {/* Score ring */}
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-primary/30 bg-primary/5">
                  <span className="text-xl font-black text-primary leading-none">{analysis.score}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">score</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        </div>
      )}

      {weather && analysis && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-6 space-y-6">

          {/* ── Full Weather Grid ─────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Complete Weather Data
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: <Thermometer className="h-5 w-5" />, label: 'Temperature',  value: `${weather.temperature}°C`,  sub: `Feels ${weather.feelsLike}°C`,  color: 'text-orange-400' },
                { icon: <Wind         className="h-5 w-5" />, label: 'Wind Speed',   value: `${weather.windSpeed} km/h`, sub: weather.windSpeed < 15 ? 'Safe' : 'Too high', color: 'text-blue-400' },
                { icon: <Droplets     className="h-5 w-5" />, label: 'Humidity',     value: `${weather.humidity}%`,      sub: weather.humidity < 40 ? 'Low' : weather.humidity > 80 ? 'High' : 'Ideal', color: 'text-cyan-400' },
                { icon: <Gauge        className="h-5 w-5" />, label: 'Pressure',     value: weather.pressure,            sub: 'Atmospheric',                    color: 'text-purple-400' },
                { icon: <Eye          className="h-5 w-5" />, label: 'Visibility',   value: weather.visibility,          sub: parseFloat(weather.visibility) > 5 ? 'Clear' : 'Low', color: 'text-emerald-400' },
                { icon: <CloudRain    className="h-5 w-5" />, label: 'Condition',    value: weather.condition,           sub: weather.description,              color: 'text-sky-400' },
                { icon: <Sunrise      className="h-5 w-5" />, label: 'Sunrise',      value: weather.sunrise,             sub: 'Best spray window starts',       color: 'text-yellow-400' },
                { icon: <Sunset       className="h-5 w-5" />, label: 'Sunset',       value: weather.sunset,              sub: 'Evening spray window ends',      color: 'text-rose-400' },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/40 transition-colors">
                  <div className={`${item.color} mb-3`}>{item.icon}</div>
                  <p className="text-2xl font-black text-foreground leading-tight">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Spray Conditions ─────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Spraying Conditions Check
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {analysis.conditions.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-5 py-4 ${i < analysis.conditions.length - 1 ? 'border-b border-border' : ''}`}
                >
                  {/* Status dot */}
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-black text-sm
                    ${c.status === 'good'    ? 'bg-primary/20 text-primary' :
                      c.status === 'bad'     ? 'bg-destructive/20 text-destructive' :
                                               'bg-yellow-500/20 text-yellow-500'}
                  `}>
                    {c.status === 'good' ? '✓' : c.status === 'bad' ? '✕' : '!'}
                  </div>
                  {/* Icon + label */}
                  <div className="text-muted-foreground shrink-0">{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.detail}</p>
                  </div>
                  {/* Value */}
                  <span className={`
                    text-base font-black shrink-0
                    ${c.status === 'good'    ? 'text-primary' :
                      c.status === 'bad'     ? 'text-destructive' :
                                               'text-yellow-500'}
                  `}>
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Recommendations ───────────────────────────── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Recommendations
            </h2>
            <div className="space-y-3">
              {analysis.recommendations.map((r, i) => (
                <div key={i} className={`
                  flex gap-4 p-5 rounded-2xl border
                  ${r.severity === 'danger'  ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                    r.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                    r.severity === 'success' ? 'bg-primary/10 border-primary/30 text-primary' :
                                               'bg-blue-500/10 border-blue-500/30 text-blue-400'}
                `}>
                  <div className="shrink-0 mt-0.5">{r.icon}</div>
                  <div>
                    <p className="font-bold text-base">{r.title}</p>
                    <p className="text-sm opacity-80 mt-1 leading-relaxed">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Best Time + Extra Tips ────────────────────── */}
          <section className="grid md:grid-cols-2 gap-4">
            {/* Best time */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">Best Time to Spray</h3>
              </div>
              <p className="text-lg font-black text-primary">{analysis.bestTime}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on current temperature, wind, and humidity levels at {weather.city}
              </p>
            </div>

            {/* General tips */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sprout className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-foreground">General Spraying Tips</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Always wear protective gear — mask, gloves, goggles',
                  'Calibrate sprayer nozzle before starting',
                  'Spray in the direction of wind, never against it',
                  'Check product label for minimum rain-free hours',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">›</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Sunrise / Sunset Spray Windows ───────────── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Today's Spray Windows
            </h2>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <Sunrise className="h-8 w-8 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Morning Window</p>
                    <p className="text-xl font-black text-foreground">{weather.sunrise}</p>
                    <p className="text-xs text-yellow-500 mt-0.5">to 9:00 AM — Ideal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <Sunset className="h-8 w-8 text-rose-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Evening Window</p>
                    <p className="text-xl font-black text-foreground">{weather.sunset}</p>
                    <p className="text-xs text-rose-400 mt-0.5">from 5:00 PM — Good</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Spraying during these windows minimises evaporation and maximises absorption
              </p>
            </div>
          </section>

        </div>
      )}
    </div>
  )
}