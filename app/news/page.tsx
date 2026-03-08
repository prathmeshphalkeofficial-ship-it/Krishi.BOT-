"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Newspaper, RefreshCw, ExternalLink, Clock, TrendingUp,
  Leaf, CloudRain, Bug, Wheat, AlertCircle, ArrowLeft, Globe
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"

const API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY || "pub_31e079101842453a9052670eaec760a0"

const categories = [
  { key: "all", label: { en: "All News", hi: "सभी समाचार", mr: "सर्व बातम्या" }, icon: Newspaper, query: "krishi farming agriculture india" },
  { key: "crops", label: { en: "Crops", hi: "फसलें", mr: "पिके" }, icon: Wheat, query: "crops farming india kharif rabi" },
  { key: "weather", label: { en: "Weather", hi: "मौसम", mr: "हवामान" }, icon: CloudRain, query: "monsoon weather india farmers" },
  { key: "pest", label: { en: "Pest Control", hi: "कीट नियंत्रण", mr: "कीड नियंत्रण" }, icon: Bug, query: "pest crop disease india agriculture" },
  { key: "market", label: { en: "Market", hi: "बाजार", mr: "बाजार" }, icon: TrendingUp, query: "mandi price MSP agriculture india" },
]

const tagColors: Record<string, string> = {
  all: "bg-primary/10 text-primary",
  crops: "bg-green-500/10 text-green-600 dark:text-green-400",
  weather: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pest: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  market: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

type NewsItem = {
  article_id: string
  title: string
  description: string | null
  content: string | null
  link: string
  source_name: string
  pubDate: string
  image_url: string | null
  creator: string[] | null
}

export default function NewsPage() {
  const { language } = useApp()
  const [activeCategory, setActiveCategory] = useState("all")
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)

  const getLangCode = useCallback(() => {
    if (language === "hi") return "hi,en"
    if (language === "mr") return "mr,en"
    return "en"
  }, [language])

  const fetchNews = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const cat = categories.find((c) => c.key === activeCategory)
      const query = cat?.query || "krishi farming agriculture india"
      const lang = getLangCode()
      const url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(query)}&language=${lang}&country=in&size=10`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status === "success") {
        if (data.results?.length > 0) {
          setNews(data.results)
        } else {
          const fallback = await fetch(`https://newsdata.io/api/1/news?apikey=${API_KEY}&q=${encodeURIComponent(query)}&language=en&country=in&size=10`)
          const fd = await fallback.json()
          setNews(fd.results || [])
        }
      } else {
        setError(data.message || "Failed to fetch news")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeCategory, getLangCode])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const getLabel = (obj: Record<string, string>) => obj[language] || obj.en

  const formatDate = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
      if (diff < 60) return `${diff}m ago`
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
      return `${Math.floor(diff / 1440)}d ago`
    } catch { return dateStr }
  }

  // ── Article Reader View ──────────────────────────────────────────────
  if (selectedArticle) {
    return (
      <div className="flex flex-col min-h-screen pb-20 md:pb-6">
        {/* Reader Header */}
        <div className="sticky top-0 md:top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{selectedArticle.source_name}</p>
            <p className="text-[10px] text-muted-foreground">{formatDate(selectedArticle.pubDate)}</p>
          </div>
          <a
            href={selectedArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            title="Open original"
          >
            <Globe className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>

        {/* Article Content */}
        <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
          {/* Category Badge */}
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", tagColors[activeCategory])}>
            {getLabel(categories.find(c => c.key === activeCategory)?.label || categories[0].label)}
          </span>

          {/* Title */}
          <h1 className="text-lg font-bold text-foreground leading-snug mt-3 mb-4">
            {selectedArticle.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-1">
              <Leaf className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{selectedArticle.source_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatDate(selectedArticle.pubDate)}</span>
            </div>
            {selectedArticle.creator?.[0] && (
              <span className="text-xs text-muted-foreground">By {selectedArticle.creator[0]}</span>
            )}
          </div>

          {/* Image */}
          {selectedArticle.image_url && (
            <div className="mb-4 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title}
                className="w-full object-cover max-h-56"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            </div>
          )}

          {/* Description */}
          {selectedArticle.description && (
            <p className="text-sm text-foreground leading-relaxed font-medium mb-4">
              {selectedArticle.description}
            </p>
          )}

          {/* Full Content */}
          {selectedArticle.content && selectedArticle.content !== "ONLY AVAILABLE IN PAID PLANS" ? (
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                {language === "hi"
                  ? "पूरा लेख पढ़ने के लिए मूल स्रोत पर जाएं"
                  : language === "mr"
                  ? "संपूर्ण लेख वाचण्यासाठी मूळ स्रोतावर जा"
                  : "Visit the original source to read the full article"}
              </p>
              <a
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {language === "hi" ? "पूरा लेख पढ़ें" : language === "mr" ? "संपूर्ण लेख वाचा" : "Read Full Article"}
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── News List View ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 md:top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Newspaper className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                {language === "hi" ? "कृषि समाचार" : language === "mr" ? "कृषी बातम्या" : "Krishi News"}
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {language === "hi" ? "ताज़ा कृषि अपडेट" : language === "mr" ? "ताज्या कृषी अपडेट" : "Live farming updates"}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchNews(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", refreshing && "animate-spin")} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              <cat.icon className="h-3 w-3" />
              {getLabel(cat.label)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "समाचार लोड हो रहे हैं..." : language === "mr" ? "बातम्या लोड होत आहेत..." : "Loading news..."}
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <button onClick={() => fetchNews()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
              {language === "hi" ? "पुनः प्रयास करें" : language === "mr" ? "पुन्हा प्रयत्न करा" : "Try Again"}
            </button>
          </div>
        )}

        {!loading && !error && news.map((item, i) => (
          <button
            key={item.article_id || i}
            onClick={() => setSelectedArticle(item)}
            className="group w-full text-left bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-[0.99]"
          >
            <div className="flex gap-3">
              {item.image_url && (
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none" }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", tagColors[activeCategory])}>
                    {getLabel(categories.find(c => c.key === activeCategory)?.label || categories[0].label)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDate(item.pubDate)}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {item.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-2">
                  <Leaf className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground font-medium">{item.source_name}</span>
                  <span className="ml-auto text-[10px] text-primary font-medium">
                    {language === "hi" ? "पढ़ें →" : language === "mr" ? "वाचा →" : "Read →"}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}

        {!loading && !error && news.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Newspaper className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {language === "hi" ? "कोई समाचार नहीं मिला" : language === "mr" ? "कोणत्याही बातम्या सापडल्या नाहीत" : "No news found"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}