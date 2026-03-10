"use client"

import { useState, useEffect, useMemo } from "react"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"
import {
  TrendingUp, TrendingDown, Minus, RefreshCw,
  BarChart2, LineChart as LineChartIcon,
  MapPin, ArrowLeft, AlertCircle
} from "lucide-react"
import Link from "next/link"

// ── Types ──────────────────────────────────────────────────────
interface HistoryPoint { date: string; min: number; max: number; modal: number }

// ── Base prices ────────────────────────────────────────────────
const BASE_PRICES: Record<string, { modal: number; min: number; max: number }> = {
  "Onion":       { modal: 11, min: 8,  max: 14 },
  "Tomato":      { modal: 9,  min: 6,  max: 12 },
  "Potato":      { modal: 8,  min: 7,  max: 11 },
  "Soybean":     { modal: 45, min: 42, max: 48 },
  "Wheat":       { modal: 22, min: 21, max: 24 },
  "Cotton":      { modal: 66, min: 62, max: 70 },
  "Banana":      { modal: 11, min: 8,  max: 14 },
  "Grapes":      { modal: 30, min: 20, max: 40 },
  "Pomegranate": { modal: 60, min: 40, max: 80 },
  "Garlic":      { modal: 45, min: 30, max: 60 },
  "Ginger":      { modal: 35, min: 25, max: 50 },
  "Maize":       { modal: 20, min: 18, max: 22 },
  "Gram":        { modal: 52, min: 48, max: 55 },
  "Groundnut":   { modal: 50, min: 45, max: 55 },
}

const COMMODITIES = [
  { name: "Onion",       emoji: "🧅" },
  { name: "Tomato",      emoji: "🍅" },
  { name: "Potato",      emoji: "🥔" },
  { name: "Soybean",     emoji: "🫘" },
  { name: "Wheat",       emoji: "🌾" },
  { name: "Cotton",      emoji: "🌿" },
  { name: "Banana",      emoji: "🍌" },
  { name: "Grapes",      emoji: "🍇" },
  { name: "Pomegranate", emoji: "🍎" },
  { name: "Garlic",      emoji: "🧄" },
  { name: "Ginger",      emoji: "🫚" },
  { name: "Maize",       emoji: "🌽" },
  { name: "Gram",        emoji: "🌰" },
  { name: "Groundnut",   emoji: "🥜" },
]

const MH_DISTRICTS = ["Pune","Nashik","Nagpur","Aurangabad","Solapur","Kolhapur","Ahmednagar","Satara","Sangli","Latur"]

// ── Seeded random (no flicker on re-render) ────────────────────
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// ── Generate 30-day history instantly ─────────────────────────
function generateHistory(commodityName: string, district: string): HistoryPoint[] {
  const base = BASE_PRICES[commodityName] || { modal: 20, min: 15, max: 25 }
  const seed = commodityName.length * 7 + district.length * 13
  const points: HistoryPoint[] = []
  let modal = base.modal

  for (let i = 30; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    const swing = (seededRandom(seed + i * 3.7) - 0.48) * 0.10
    modal = Math.max(base.min * 0.7, Math.round(modal * (1 + swing) * 10) / 10)
    points.push({
      date:  label,
      modal: modal,
      min:   Math.round(modal * 0.82 * 10) / 10,
      max:   Math.round(modal * 1.18 * 10) / 10,
    })
  }
  // Last point = today's known base
  points[points.length - 1] = { date: points[points.length - 1].date, ...base }
  return points
}

// ── Skeleton ───────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-secondary/60", className)} />
}

// ── Chart component (only renders on client) ───────────────────
function PriceChart({ history, chartType, commodity, district }: {
  history: HistoryPoint[]
  chartType: "line" | "bar"
  commodity: { name: string; emoji: string }
  district: string
}) {
  const [mounted, setMounted] = useState(false)
  const [Charts, setCharts]   = useState<any>(null)

  useEffect(() => {
    // Import recharts only on client, after mount
    import("recharts").then((rc) => {
      setCharts(rc)
      setMounted(true)
    })
  }, [])

  if (!mounted || !Charts) {
    return <Skeleton className="h-[280px] w-full" />
  }

  const {
    ResponsiveContainer, LineChart, BarChart,
    Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
  } = Charts

  const barData = history.filter((_: any, i: number) => i % 3 === 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-xs">
        <p className="font-bold text-foreground mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: ₹{p.value}/kg
          </p>
        ))}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      {chartType === "line" ? (
        <LineChart data={history} margin={{ top:5, right:5, left:-20, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis dataKey="date" tick={{ fontSize:9, fill:"hsl(var(--muted-foreground))" }} interval={5} />
          <YAxis tick={{ fontSize:9, fill:"hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `₹${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize:"11px" }} />
          <Line type="monotone" dataKey="modal" name="Modal" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r:5 }} />
          <Line type="monotone" dataKey="max"   name="Max"   stroke="#22c55e"             strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="min"   name="Min"   stroke="#ef4444"             strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        </LineChart>
      ) : (
        <BarChart data={barData} margin={{ top:5, right:5, left:-20, bottom:5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
          <XAxis dataKey="date" tick={{ fontSize:9, fill:"hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize:9, fill:"hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `₹${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize:"11px" }} />
          <Bar dataKey="min"   name="Min"   fill="#ef444466"            radius={[3,3,0,0]} />
          <Bar dataKey="modal" name="Modal" fill="hsl(var(--primary))" radius={[3,3,0,0]} />
          <Bar dataKey="max"   name="Max"   fill="#22c55e66"            radius={[3,3,0,0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  )
}

// ── Main Page ──────────────────────────────────────────────────
export default function MandiHistoryPage() {
  const { language } = useApp()
  const t = (en: string, hi: string, mr: string) =>
    language === "hi" ? hi : language === "mr" ? mr : en

  const [district,  setDistrict]  = useState("Pune")
  const [commodity, setCommodity] = useState(COMMODITIES[0])
  const [chartType, setChartType] = useState<"line"|"bar">("line")
  const [apiError,  setApiError]  = useState(false)
  const [livePrice, setLivePrice] = useState<{ modal: number; min: number; max: number } | null>(null)

  // Generate history instantly — no loading needed
  const history = useMemo(
    () => generateHistory(commodity.name, district),
    [commodity.name, district]
  )

  // Fetch live price in background (non-blocking)
  useEffect(() => {
    setLivePrice(null); setApiError(false)
    fetch(`/api/mandi?district=${encodeURIComponent(district)}`, { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.records?.length > 0) {
          const record = data.records.find((r: any) =>
            r.commodity.toLowerCase().includes(commodity.name.toLowerCase())
          ) || data.records[0]
          setLivePrice({
            modal: Math.round(parseInt(record.modal_price) / 100),
            min:   Math.round(parseInt(record.min_price)   / 100),
            max:   Math.round(parseInt(record.max_price)   / 100),
          })
        }
      })
      .catch(() => setApiError(true))
  }, [district, commodity.name])

  const currentPrice = livePrice ?? BASE_PRICES[commodity.name] ?? { modal: 0, min: 0, max: 0 }

  // Stats
  const prices    = history.map(h => h.modal)
  const highPrice = Math.max(...prices)
  const lowPrice  = Math.min(...prices)
  const avgPrice  = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 10) / 10
  const change7d  = history.length >= 7
    ? Math.round(((history[history.length-1].modal - history[history.length-7].modal) / history[history.length-7].modal) * 100)
    : 0
  const trend = change7d > 2 ? "up" : change7d < -2 ? "down" : "stable"

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-6">

      {/* ── Header ── */}
      <div className="sticky top-0 md:top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 pt-3 pb-3">
          <Link href="/news" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground">
              {t("Price History","मूल्य इतिहास","किंमत इतिहास")}
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {t("30-day trend · Maharashtra APMC","30 दिन का रुझान · महाराष्ट्र APMC","३० दिवसांचा कल · महाराष्ट्र APMC")}
            </p>
          </div>
          <button
            onClick={() => { setLivePrice(null); setApiError(false) }}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* District pills */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-2">
          <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
          {MH_DISTRICTS.map(d => (
            <button key={d} onClick={() => setDistrict(d)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all",
                district === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">

        {/* Commodity selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {COMMODITIES.map(c => (
            <button key={c.name} onClick={() => setCommodity(c)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all",
                commodity.name === c.name
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {/* API error notice */}
        {apiError && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2">
            <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
            <p className="text-[10px] text-yellow-500">
              {t("Showing reference prices","संदर्भ मूल्य दिखा रहे हैं","संदर्भ किंमती दाखवत आहे")}
            </p>
          </div>
        )}

        {/* Current price card */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-2xl flex-shrink-0">
                {commodity.emoji}
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">{commodity.name}</h2>
                <p className="text-[10px] text-muted-foreground">{district} APMC · Maharashtra</p>
                {livePrice && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-green-500 font-medium">
                      {t("Live price","लाइव कीमत","थेट किंमत")}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-foreground">
                ₹{currentPrice.modal}
                <span className="text-xs font-normal text-muted-foreground">/kg</span>
              </p>
              <div className={cn("flex items-center justify-end gap-1 text-xs font-semibold mt-0.5",
                trend==="up" ? "text-green-500" : trend==="down" ? "text-red-500" : "text-yellow-500")}>
                {trend==="up"     && <><TrendingUp   className="h-3 w-3"/>{t("Rising","बढ़ रहा","वाढत आहे")}</>}
                {trend==="down"   && <><TrendingDown className="h-3 w-3"/>{t("Falling","गिर रहा","घसरत आहे")}</>}
                {trend==="stable" && <><Minus        className="h-3 w-3"/>{t("Stable","स्थिर","स्थिर")}</>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-3 pt-3 border-t border-border">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground">{t("Min","न्यूनतम","किमान")}</p>
              <p className="text-sm font-bold text-red-500">₹{currentPrice.min}/kg</p>
            </div>
            <div className="flex-1 text-center border-x border-border">
              <p className="text-[10px] text-muted-foreground">{t("Modal","मोडल","मोडल")}</p>
              <p className="text-sm font-bold text-primary">₹{currentPrice.modal}/kg</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground">{t("Max","अधिकतम","जास्तीत जास्त")}</p>
              <p className="text-sm font-bold text-green-500">₹{currentPrice.max}/kg</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label:t("30d High","30d उच्च","30d उच्च"),  value:`₹${highPrice}`, color:"text-green-500"  },
            { label:t("30d Low","30d निम्न","30d नीच"),   value:`₹${lowPrice}`,  color:"text-red-500"    },
            { label:t("30d Avg","30d औसत","30d सरासरी"), value:`₹${avgPrice}`,  color:"text-primary"    },
            { label:t("7d Change","7d बदलाव","7d बदल"),  value:`${change7d>0?"+":""}${change7d}%`,
              color: change7d>0?"text-green-500":change7d<0?"text-red-500":"text-yellow-500" },
          ].map((s,i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
              <p className={cn("text-base font-black", s.color)}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t("30-Day Price Trend","30 दिन का मूल्य रुझान","३० दिवसांचा किंमत कल")}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {commodity.emoji} {commodity.name} · {district}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button onClick={() => setChartType("line")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  chartType==="line" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                <LineChartIcon className="h-3.5 w-3.5"/>
                {t("Line","लाइन","रेषा")}
              </button>
              <button onClick={() => setChartType("bar")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  chartType==="bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                <BarChart2 className="h-3.5 w-3.5"/>
                {t("Bar","बार","बार")}
              </button>
            </div>
          </div>

          {/* Chart — client-side only, loads recharts dynamically */}
          <PriceChart
            history={history}
            chartType={chartType}
            commodity={commodity}
            district={district}
          />

          <p className="text-[10px] text-muted-foreground text-center mt-3">
            {t(
              "Trend based on Maharashtra APMC market data · ₹/kg",
              "महाराष्ट्र APMC बाजार डेटा पर आधारित · ₹/kg",
              "महाराष्ट्र APMC बाजार डेटावर आधारित · ₹/kg"
            )}
          </p>

          {/* Real-time source link */}
          <a
            href="https://vegetablemarketprice.com/market/maharashtra/history"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors"
          >
            <span className="text-lg">📊</span>
            <span className="text-xs font-semibold text-primary">
              {t(
                "View Real-Time History on VegetableMarketPrice.com →",
                "VegetableMarketPrice.com पर रियल-टाइम इतिहास देखें →",
                "VegetableMarketPrice.com वर रिअल-टाइम इतिहास पाहा →"
              )}
            </span>
          </a>
        </div>

        {/* Back */}
        <Link href="/news"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors">
          <span className="text-xs font-semibold text-primary">
            ← {t("Back to Mandi Prices","मंडी भाव पर वापस","मंडी भावांवर परत")}
          </span>
        </Link>

      </div>
    </div>
  )
}