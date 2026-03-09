'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/app-context'
import {
  Thermometer, Wind, Droplets, CloudRain, Eye, Gauge,
  Sunrise, Sunset, Sprout, CheckCircle2, XCircle,
  AlertTriangle, Clock, RefreshCw, MapPin, Loader2,
  Waves, FlameKindling, Snowflake, CloudLightning, Cloud
} from 'lucide-react'

// ── Translations ───────────────────────────────────────────────
const TR = {
  en: {
    title: 'Spraying Advisor', live: 'Live', updated: 'Updated',
    refresh: 'Refresh', safe: 'Safe to Spray', notRec: 'Not Recommended',
    score: 'score', completeWeather: 'Complete Live Weather Data',
    condCheck: 'Spraying Conditions Check', recommendations: 'Recommendations',
    bestTime: 'Best Time to Spray', safety: 'Safety Reminders',
    windows: "Today's Spray Windows", morning: 'Morning Window',
    evening: 'Evening Window', windowTip: 'Spraying during these windows minimises evaporation and maximises absorption',
    to9: 'to 9:00 AM — Ideal', from5: 'from 5:00 PM — Good',
    temperature: 'Temperature', feelsLike: 'Feels', windSpeed: 'Wind Speed',
    direction: 'Direction', humidity: 'Humidity', rainProb: 'Rain Probability',
    next3h: 'Next 3 hours — real data', pressure: 'Pressure', atm: 'Atmospheric',
    visibility: 'Visibility', cloudCover: 'Cloud Cover', rainLastH: 'Rain Last Hour',
    sunrise: 'Sunrise', sunset: 'Sunset', morningStarts: 'Morning spray starts',
    eveningEnds: 'Evening spray ends', noRain: 'No recent rain', recentRain: 'Recent rain detected',
    clear: 'Clear', reduced: 'Reduced', low: 'Low', high: 'High', ideal: 'Ideal',
    mostlyClear: 'Mostly clear', overcast: 'Overcast', partlyCloudy: 'Partly cloudy',
    basedOn: 'Based on live data from',
    tips: ['Always wear protective gear — mask, gloves, goggles', 'Calibrate sprayer nozzle before starting', 'Spray in the direction of wind, never against it', 'Check product label for minimum rain-free hours'],
  },
  hi: {
    title: 'छिड़काव सलाहकार', live: 'लाइव', updated: 'अपडेट',
    refresh: 'रिफ्रेश', safe: 'छिड़काव सुरक्षित', notRec: 'अनुशंसित नहीं',
    score: 'स्कोर', completeWeather: 'पूर्ण मौसम डेटा',
    condCheck: 'छिड़काव स्थिति जाँच', recommendations: 'सिफारिशें',
    bestTime: 'छिड़काव का सही समय', safety: 'सुरक्षा याद दिलाएं',
    windows: 'आज के छिड़काव समय', morning: 'सुबह का समय',
    evening: 'शाम का समय', windowTip: 'इन समय पर छिड़काव से वाष्पीकरण कम होता है',
    to9: 'सुबह 9 बजे तक — आदर्श', from5: 'शाम 5 बजे से — अच्छा',
    temperature: 'तापमान', feelsLike: 'महसूस', windSpeed: 'हवा की गति',
    direction: 'दिशा', humidity: 'नमी', rainProb: 'बारिश की संभावना',
    next3h: 'अगले 3 घंटे — वास्तविक', pressure: 'दबाव', atm: 'वायुमंडलीय',
    visibility: 'दृश्यता', cloudCover: 'बादल', rainLastH: 'पिछले घंटे बारिश',
    sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', morningStarts: 'सुबह छिड़काव शुरू',
    eveningEnds: 'शाम छिड़काव समाप्त', noRain: 'हाल में बारिश नहीं', recentRain: 'हाल में बारिश हुई',
    clear: 'साफ', reduced: 'कम', low: 'कम', high: 'ज्यादा', ideal: 'आदर्श',
    mostlyClear: 'ज्यादातर साफ', overcast: 'बादल छाए', partlyCloudy: 'आंशिक बादल',
    basedOn: 'लाइव डेटा से',
    tips: ['सुरक्षात्मक गियर पहनें — मास्क, दस्ताने, चश्मा', 'छिड़काव से पहले नोजल जांचें', 'हवा की दिशा में छिड़काव करें', 'उत्पाद लेबल पर बारिश-मुक्त घंटे देखें'],
  },
  mr: {
    title: 'फवारणी सल्लागार', live: 'लाइव', updated: 'अपडेट',
    refresh: 'रिफ्रेश', safe: 'फवारणी सुरक्षित', notRec: 'शिफारस नाही',
    score: 'गुण', completeWeather: 'संपूर्ण हवामान माहिती',
    condCheck: 'फवारणी स्थिती तपासणी', recommendations: 'शिफारसी',
    bestTime: 'फवारणीची योग्य वेळ', safety: 'सुरक्षा आठवण',
    windows: 'आजच्या फवारणीच्या वेळा', morning: 'सकाळची वेळ',
    evening: 'संध्याकाळची वेळ', windowTip: 'या वेळी फवारणी केल्यास बाष्पीभवन कमी होते',
    to9: 'सकाळी ९ पर्यंत — आदर्श', from5: 'संध्याकाळी ५ पासून — चांगले',
    temperature: 'तापमान', feelsLike: 'जाणवते', windSpeed: 'वाऱ्याचा वेग',
    direction: 'दिशा', humidity: 'आर्द्रता', rainProb: 'पावसाची शक्यता',
    next3h: 'पुढील ३ तास — वास्तविक', pressure: 'दाब', atm: 'वातावरणीय',
    visibility: 'दृश्यमानता', cloudCover: 'ढग', rainLastH: 'मागील तासात पाऊस',
    sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', morningStarts: 'सकाळची फवारणी सुरू',
    eveningEnds: 'संध्याकाळची फवारणी संपते', noRain: 'अलीकडे पाऊस नाही', recentRain: 'अलीकडे पाऊस झाला',
    clear: 'स्वच्छ', reduced: 'कमी', low: 'कमी', high: 'जास्त', ideal: 'आदर्श',
    mostlyClear: 'बहुतेक स्वच्छ', overcast: 'ढगाळ', partlyCloudy: 'अंशतः ढगाळ',
    basedOn: 'लाइव्ह डेटावरून',
    tips: ['संरक्षणात्मक साधने घाला — मास्क, हातमोजे, गॉगल', 'फवारणीपूर्वी नोझल तपासा', 'वाऱ्याच्या दिशेने फवारणी करा', 'उत्पादनाच्या लेबलवरील पावसाची वेळ तपासा'],
  },
} as const
type Lang = keyof typeof TR

// ── Types ──────────────────────────────────────────────────────
interface WeatherData {
  city: string; country: string; temperature: number; feelsLike: number
  humidity: number; windSpeed: number; windDeg: number; condition: string
  description: string; iconUrl: string; sunrise: string; sunset: string
  visibility: string; pressure: string; rainProbability: number
  rainLastHour: number; cloudCover: number
}

// ── Helpers ────────────────────────────────────────────────────
function windDir(deg: number | undefined): string {
  if (deg == null || isNaN(Number(deg))) return ''
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(Number(deg) / 45) % 8]
}
function n(val: any, fallback = 0): number {
  const v = Number(val)
  return isNaN(v) ? fallback : v
}

// ── Spraying Analysis ──────────────────────────────────────────
function analyzeSpray(w: WeatherData, tr: typeof TR['en']) {
  const recs: { icon: React.ReactNode; title: string; description: string; severity: 'danger'|'warning'|'info'|'success' }[] = []
  let score = 100

  const temp  = n(w.temperature)
  const wind  = n(w.windSpeed)
  const hum   = n(w.humidity)
  const rain  = n(w.rainProbability)
  const rain1h = n(w.rainLastHour)
  const vis   = parseFloat(w.visibility ?? '10')

  // Temperature
  let tempStatus: 'good'|'bad'|'warning' = 'good'
  if (temp > 35)      { tempStatus='bad';     score-=30; recs.push({ icon:<FlameKindling className="h-5 w-5"/>, title:'Temperature too high',      description:'Above 35°C causes rapid spray evaporation. Apply early morning or after sunset.',     severity:'danger'  }) }
  else if (temp < 10) { tempStatus='bad';     score-=30; recs.push({ icon:<Snowflake     className="h-5 w-5"/>, title:'Temperature too low',       description:'Below 10°C reduces pesticide effectiveness. Wait for warmer conditions.',            severity:'danger'  }) }
  else if (temp > 30) { tempStatus='warning'; score-=15; recs.push({ icon:<Thermometer   className="h-5 w-5"/>, title:'Slightly hot',              description:'Spray before 9 AM to avoid rapid evaporation in the heat.',                         severity:'warning' }) }

  // Wind
  let windStatus: 'good'|'bad'|'warning' = 'good'
  if (wind > 20)      { windStatus='bad';     score-=40; recs.push({ icon:<Wind className="h-5 w-5"/>, title:'Wind speed too high',        description:'Wind above 20 km/h causes dangerous chemical drift. Wait until wind drops below 15 km/h.', severity:'danger'  }) }
  else if (wind > 15) { windStatus='warning'; score-=20; recs.push({ icon:<Wind className="h-5 w-5"/>, title:'Moderate wind — be careful', description:'Spray low to the crop canopy and avoid spraying near field edges.',                        severity:'warning' }) }
  else if (wind < 3)  { windStatus='warning'; score-=5;  recs.push({ icon:<Wind className="h-5 w-5"/>, title:'Very calm — move steadily',  description:'Very low wind can cause spray to pool. Keep the sprayer moving at all times.',            severity:'info'    }) }

  // Humidity
  let humStatus: 'good'|'bad'|'warning' = 'good'
  if (hum < 30)      { humStatus='bad';     score-=25; recs.push({ icon:<Droplets className="h-5 w-5"/>, title:'Humidity too low',    description:'Below 30% RH causes spray to evaporate before reaching the crop. Spray at dawn.', severity:'danger'  }) }
  else if (hum > 90) { humStatus='warning'; score-=10; recs.push({ icon:<Waves    className="h-5 w-5"/>, title:'Very high humidity',  description:'Slow drying may promote fungal growth. Ensure good ventilation after spraying.',    severity:'warning' }) }

  // Rain
  let rainStatus: 'good'|'bad'|'warning' = 'good'
  const isThunder = (w.condition ?? '').toLowerCase().includes('thunder') || (w.condition ?? '').toLowerCase().includes('storm')
  if (isThunder)      { rainStatus='bad';     score-=50; recs.push({ icon:<CloudLightning className="h-5 w-5"/>, title:'Thunderstorm — DO NOT spray', description:'Extremely dangerous. Stay indoors. No spraying under any circumstances.',                       severity:'danger'  }) }
  else if (rain > 60) { rainStatus='bad';     score-=35; recs.push({ icon:<CloudRain      className="h-5 w-5"/>, title:'High rain probability',       description:`${rain}% chance of rain in next 3 hours. Spray will be completely washed off.`,              severity:'danger'  }) }
  else if (rain > 30) { rainStatus='warning'; score-=15; recs.push({ icon:<CloudRain      className="h-5 w-5"/>, title:'Some rain possible',          description:`${rain}% rain chance. Check product label for minimum rain-free hours required.`,            severity:'warning' }) }

  if (rain1h > 0) { score-=20; recs.push({ icon:<CloudRain className="h-5 w-5"/>, title:`Recent rain — ${rain1h}mm last hour`, description:'Crop surfaces may be wet. Wait until leaves are dry for best absorption.', severity:'warning' }) }
  if (vis < 2)    { score-=10; recs.push({ icon:<Eye       className="h-5 w-5"/>, title:'Low visibility',                     description:'Fog or mist — check crop surfaces are dry before spraying.',                severity:'warning' }) }

  score = Math.max(0, Math.min(100, score))
  const canSpray = score >= 60

  const dir = windDir(w.windDeg)

  const conditions = [
    { label:tr.temperature, value:`${temp}°C`,                                    status:tempStatus, icon:<Thermometer className="h-4 w-4"/>, detail:`${tr.feelsLike} ${n(w.feelsLike)}°C — ideal 15–30°C` },
    { label:tr.windSpeed,   value:`${wind} km/h${dir ? ' '+dir : ''}`,            status:windStatus, icon:<Wind        className="h-4 w-4"/>, detail:wind<15?'Safe — minimal drift risk':'High drift risk — chemical may spread' },
    { label:tr.humidity,    value:`${hum}%`,                                       status:humStatus,  icon:<Droplets    className="h-4 w-4"/>, detail:`Ideal 40–80% — ${hum<40?tr.low:hum>80?tr.high:tr.ideal}` },
    { label:tr.rainProb,    value:`${rain}%`,                                      status:rainStatus, icon:<CloudRain   className="h-4 w-4"/>, detail:rain<30?'Low rain risk — safe window':`${rain}% chance of rain in next 3 hours` },
  ]

  if (recs.length === 0) recs.push({ icon:<CheckCircle2 className="h-5 w-5"/>, title:'All conditions are ideal!', description:'Temperature, wind, humidity and rain outlook are all within the safe spraying range. Go ahead!', severity:'success' })

  let bestTime = 'Early morning (6–9 AM) or evening (5–7 PM)'
  if (!canSpray)   bestTime = 'Wait for conditions to improve — check again later'
  else if (temp>28) bestTime = 'Early morning only (6–8 AM) — before heat builds up'
  else if (hum>80)  bestTime = 'Mid-morning (9–11 AM) — after dew has dried off leaves'

  return { canSpray, conditions, recommendations:recs, bestTime, score }
}

// ── Page ───────────────────────────────────────────────────────
export default function SprayingPage() {
  const { language } = useApp()
  const tr = TR[(language as Lang)] ?? TR.en

  const [weather, setWeather]         = useState<WeatherData|null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchWeather = useCallback((lat: number, lon: number) => {
    setLoading(true)
    fetch(`/api/weather?lat=${lat}&lon=${lon}`, { cache:'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setWeather(d)
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }))
        setError('')
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const getLocation = useCallback(() => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      p => fetchWeather(p.coords.latitude, p.coords.longitude),
      () => fetchWeather(18.5204, 73.8567) // Pune fallback
    )
  }, [fetchWeather])

  useEffect(() => { getLocation() }, [getLocation])

  const analysis = weather ? analyzeSpray(weather, tr) : null

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-muted-foreground font-medium">{tr.live}…</p>
    </div>
  )

  const cov = n(weather?.cloudCover)

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">

      {/* ── Header ── */}
      <div className="bg-card border-b border-border px-4 md:px-8 pt-6 pb-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sprout className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">{tr.title}</h1>
              </div>
              {weather && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{weather.city}, {weather.country}</span>
                  {lastUpdated && <span className="text-xs">· {tr.live} · {tr.updated} {lastUpdated}</span>}
                </div>
              )}
            </div>
            <button onClick={getLocation} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors">
              <RefreshCw className="h-4 w-4" />{tr.refresh}
            </button>
          </div>

          {weather && analysis && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5">
              <div className="flex items-center gap-3">
                <img src={weather.iconUrl} alt={weather.description} className="h-16 w-16" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                <div>
                  <p className="text-5xl font-black text-foreground leading-none">{n(weather.temperature)}°C</p>
                  <p className="text-muted-foreground capitalize mt-1">{weather.description}</p>
                </div>
              </div>
              <div className="sm:ml-auto flex items-center gap-3">
                <div className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-base border-2 ${analysis.canSpray?'bg-primary/10 border-primary text-primary':'bg-destructive/10 border-destructive text-destructive'}`}>
                  {analysis.canSpray ? <CheckCircle2 className="h-6 w-6"/> : <XCircle className="h-6 w-6"/>}
                  {analysis.canSpray ? tr.safe : tr.notRec}
                </div>
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-primary/30 bg-primary/5">
                  <span className="text-xl font-black text-primary leading-none">{analysis.score}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{tr.score}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0"/> {error}
          </div>
        </div>
      )}

      {weather && analysis && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 mt-6 space-y-6">

          {/* ── 10 weather cards ── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{tr.completeWeather}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { icon:<Thermometer className="h-5 w-5"/>, label:tr.temperature,  value:`${n(weather.temperature)}°C`,           sub:`${tr.feelsLike} ${n(weather.feelsLike)}°C`,                                        color:'text-orange-400'  },
                { icon:<Wind        className="h-5 w-5"/>, label:tr.windSpeed,    value:`${n(weather.windSpeed)} km/h`,           sub:`${tr.direction}: ${windDir(weather.windDeg) || '—'}`,                              color:'text-blue-400'    },
                { icon:<Droplets    className="h-5 w-5"/>, label:tr.humidity,     value:`${n(weather.humidity)}%`,                sub:n(weather.humidity)<40?tr.low:n(weather.humidity)>80?tr.high:tr.ideal,              color:'text-cyan-400'    },
                { icon:<CloudRain   className="h-5 w-5"/>, label:tr.rainProb,     value:`${n(weather.rainProbability)}%`,         sub:tr.next3h,                                                                          color:'text-sky-400'     },
                { icon:<Gauge       className="h-5 w-5"/>, label:tr.pressure,     value:weather.pressure ?? '— hPa',             sub:tr.atm,                                                                             color:'text-purple-400'  },
                { icon:<Eye         className="h-5 w-5"/>, label:tr.visibility,   value:weather.visibility ?? '— km',            sub:parseFloat(weather.visibility??'10')>5?tr.clear:tr.reduced,                         color:'text-emerald-400' },
                { icon:<Cloud       className="h-5 w-5"/>, label:tr.cloudCover,   value:`${cov}%`,                               sub:cov<30?tr.mostlyClear:cov>70?tr.overcast:tr.partlyCloudy,                           color:'text-slate-400'   },
                { icon:<CloudRain   className="h-5 w-5"/>, label:tr.rainLastH,    value:`${n(weather.rainLastHour)} mm`,          sub:n(weather.rainLastHour)>0?tr.recentRain:tr.noRain,                                  color:'text-indigo-400'  },
                { icon:<Sunrise     className="h-5 w-5"/>, label:tr.sunrise,      value:weather.sunrise ?? '—',                  sub:tr.morningStarts,                                                                   color:'text-yellow-400'  },
                { icon:<Sunset      className="h-5 w-5"/>, label:tr.sunset,       value:weather.sunset  ?? '—',                  sub:tr.eveningEnds,                                                                     color:'text-rose-400'    },
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

          {/* ── Conditions check ── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{tr.condCheck}</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {analysis.conditions.map((c, i) => (
                <div key={i} className={`flex items-center gap-4 px-5 py-4 ${i<analysis.conditions.length-1?'border-b border-border':''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-black text-sm ${c.status==='good'?'bg-primary/20 text-primary':c.status==='bad'?'bg-destructive/20 text-destructive':'bg-yellow-500/20 text-yellow-500'}`}>
                    {c.status==='good'?'✓':c.status==='bad'?'✕':'!'}
                  </div>
                  <div className="text-muted-foreground shrink-0">{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.detail}</p>
                  </div>
                  <span className={`text-base font-black shrink-0 ${c.status==='good'?'text-primary':c.status==='bad'?'text-destructive':'text-yellow-500'}`}>{c.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Recommendations ── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{tr.recommendations}</h2>
            <div className="space-y-3">
              {analysis.recommendations.map((r, i) => (
                <div key={i} className={`flex gap-4 p-5 rounded-2xl border ${r.severity==='danger'?'bg-destructive/10 border-destructive/30 text-destructive':r.severity==='warning'?'bg-yellow-500/10 border-yellow-500/30 text-yellow-500':r.severity==='success'?'bg-primary/10 border-primary/30 text-primary':'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                  <div className="shrink-0 mt-0.5">{r.icon}</div>
                  <div>
                    <p className="font-bold text-base">{r.title}</p>
                    <p className="text-sm opacity-80 mt-1 leading-relaxed">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Best time + tips ── */}
          <section className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><Clock className="h-5 w-5 text-primary"/><h3 className="font-bold text-foreground">{tr.bestTime}</h3></div>
              <p className="text-lg font-black text-primary">{analysis.bestTime}</p>
              <p className="text-xs text-muted-foreground mt-2">{tr.basedOn} {weather.city} — {tr.rainProb.toLowerCase()} {n(weather.rainProbability)}% · {tr.windSpeed.toLowerCase()} {n(weather.windSpeed)} km/h · {tr.humidity.toLowerCase()} {n(weather.humidity)}%</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><Sprout className="h-5 w-5 text-primary"/><h3 className="font-bold text-foreground">{tr.safety}</h3></div>
              <ul className="space-y-2">
                {tr.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">›</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ── Spray windows ── */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{tr.windows}</h2>
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <Sunrise className="h-8 w-8 text-yellow-400 shrink-0"/>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{tr.morning}</p>
                    <p className="text-xl font-black text-foreground">{weather.sunrise ?? '—'}</p>
                    <p className="text-xs text-yellow-500 mt-0.5">{tr.to9}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <Sunset className="h-8 w-8 text-rose-400 shrink-0"/>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{tr.evening}</p>
                    <p className="text-xl font-black text-foreground">{weather.sunset ?? '—'}</p>
                    <p className="text-xs text-rose-400 mt-0.5">{tr.from5}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">{tr.windowTip}</p>
            </div>
          </section>

        </div>
      )}
    </div>
  )
}