"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Newspaper, RefreshCw, ExternalLink, Clock, TrendingUp,
  Leaf, CloudRain, Bug, Wheat, AlertCircle, ArrowLeft,
  Globe, ShoppingBasket, TrendingDown, Minus, Search, MapPin
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY || "pub_31e079101842453a9052670eaec760a0"

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

type MandiItem = {
  state: string
  district: string
  market: string
  commodity: string
  variety: string
  arrival_date: string
  min_price: string
  max_price: string
  modal_price: string
}

const newsCategories = [
  { key: "all", label: { en: "All News", hi: "सभी समाचार", mr: "सर्व बातम्या" }, icon: Newspaper, query: "krishi farming agriculture india" },
  { key: "crops", label: { en: "Crops", hi: "फसलें", mr: "पिके" }, icon: Wheat, query: "crops farming india kharif rabi" },
  { key: "weather", label: { en: "Weather", hi: "मौसम", mr: "हवामान" }, icon: CloudRain, query: "monsoon weather india farmers" },
  { key: "pest", label: { en: "Pest Control", hi: "कीट नियंत्रण", mr: "कीड नियंत्रण" }, icon: Bug, query: "pest crop disease india agriculture" },
  { key: "market", label: { en: "Market News", hi: "बाजार समाचार", mr: "बाजार बातम्या" }, icon: TrendingUp, query: "mandi price MSP agriculture india" },
]

const tagColors: Record<string, string> = {
  all: "bg-primary/10 text-primary",
  crops: "bg-green-500/10 text-green-600 dark:text-green-400",
  weather: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pest: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  market: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

const MH_DISTRICTS = ["Pune", "Nashik", "Nagpur", "Aurangabad", "Solapur", "Kolhapur", "Ahmednagar", "Satara", "Sangli", "Latur"]

const commodityCategories = [
  { key: "all", label: { en: "All", hi: "सभी", mr: "सर्व" }, keywords: [] },
  { key: "vegetable", label: { en: "Vegetables", hi: "सब्जियां", mr: "भाज्या" }, keywords: ["Tomato", "Onion", "Potato", "Brinjal", "Cabbage", "Cauliflower", "Carrot", "Capsicum", "Garlic", "Ginger", "Lady Finger", "Cucumber", "Pumpkin", "Bitter Gourd", "Bottle Gourd", "Drumstick", "Radish", "Spinach"] },
  { key: "fruit", label: { en: "Fruits", hi: "फल", mr: "फळे" }, keywords: ["Banana", "Mango", "Grapes", "Pomegranate", "Orange", "Papaya", "Guava", "Watermelon", "Muskmelon", "Apple", "Lemon", "Pineapple"] },
  { key: "crop", label: { en: "Crops", hi: "फसलें", mr: "पिके" }, keywords: ["Wheat", "Rice", "Soybean", "Cotton", "Maize", "Jowar", "Bajra", "Tur", "Gram", "Moong", "Urad", "Groundnut", "Sunflower"] },
]

export default function NewsPage() {
  const { language } = useApp()
  const [mainTab, setMainTab] = useState<"news" | "mandi">("news")

  // News state
  const [activeCategory, setActiveCategory] = useState("all")
  const [news, setNews] = useState<NewsItem[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [newsRefreshing, setNewsRefreshing] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null)

  // Mandi state
  const [mandiData, setMandiData] = useState<MandiItem[]>([])
  const [mandiLoading, setMandiLoading] = useState(false)
  const [mandiError, setMandiError] = useState<string | null>(null)
  const [mandiRefreshing, setMandiRefreshing] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState("Pune")
  const [commodityCat, setCommodityCat] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [mandiSource, setMandiSource] = useState("")
  const [mandiSourceUrl, setMandiSourceUrl] = useState("https://vegetablemarketprice.com/market/maharashtra/today")

  const t = useCallback((en: string, hi: string, mr: string) => {
    if (language === "hi") return hi
    if (language === "mr") return mr
    return en
  }, [language])

  const getLabel = useCallback((obj: Record<string, string>) => obj[language] || obj.en, [language])

  const getLangCode = useCallback(() => {
    if (language === "hi") return "hi,en"
    if (language === "mr") return "mr,en"
    return "en"
  }, [language])

  // Fetch news
  const fetchNews = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setNewsRefreshing(true)
    else setNewsLoading(true)
    setNewsError(null)
    try {
      const cat = newsCategories.find((c) => c.key === activeCategory)
      const query = cat?.query || "krishi farming agriculture india"
      const lang = getLangCode()
      const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=${lang}&country=in&size=10`
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === "success") {
        if (data.results?.length > 0) {
          setNews(data.results)
        } else {
          const fb = await fetch(`https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en&country=in&size=10`)
          const fd = await fb.json()
          setNews(fd.results || [])
        }
      } else {
        setNewsError(data.message || "Failed to fetch news")
      }
    } catch {
      setNewsError("Network error. Please check your connection.")
    } finally {
      setNewsLoading(false)
      setNewsRefreshing(false)
    }
  }, [activeCategory, getLangCode])

  useEffect(() => {
    if (mainTab === "news") fetchNews()
  }, [fetchNews, mainTab])

  // Fetch mandi via our own API route
  const fetchMandi = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setMandiRefreshing(true)
    else setMandiLoading(true)
    setMandiError(null)
    try {
      const res = await fetch(`/api/mandi?district=${encodeURIComponent(selectedDistrict)}`)
      const data = await res.json()
      if (data.success && data.records?.length > 0) {
        setMandiData(data.records)
        setMandiSource(data.source)
        setMandiSourceUrl(data.sourceUrl || "https://vegetablemarketprice.com/market/maharashtra/today")
      } else {
        setMandiError("No mandi data available right now.")
      }
    } catch {
      setMandiError("Could not fetch mandi prices. Please try again.")
    } finally {
      setMandiLoading(false)
      setMandiRefreshing(false)
    }
  }, [selectedDistrict])

  useEffect(() => {
    if (mainTab === "mandi") fetchMandi()
  }, [fetchMandi, mainTab])

  const formatDate = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
      if (diff < 60) return `${diff}m ago`
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
      return `${Math.floor(diff / 1440)}d ago`
    } catch { return dateStr }
  }

  const getPriceTrend = (min: string, max: string, modal: string) => {
    const mn = parseInt(min), mx = parseInt(max), md = parseInt(modal)
    if (isNaN(mn) || isNaN(mx) || isNaN(md)) return "stable"
    const ratio = (md - mn) / (mx - mn || 1)
    if (ratio > 0.65) return "up"
    if (ratio < 0.35) return "down"
    return "stable"
  }

  const filteredMandi = mandiData.filter((item) => {
    const matchSearch = searchQuery === "" || item.commodity.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchSearch) return false
    if (commodityCat === "all") return true
    const cat = commodityCategories.find(c => c.key === commodityCat)
    if (!cat?.keywords?.length) return true
    return cat.keywords.some(k => item.commodity.toLowerCase().includes(k.toLowerCase()))
  })

  // Article reader view
  if (selectedArticle) {
    return (
      <div className="flex flex-col min-h-screen pb-20 md:pb-6">
        <div className="sticky top-0 md:top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelectedArticle(null)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{selectedArticle.source_name}</p>
            <p className="text-[10px] text-muted-foreground">{formatDate(selectedArticle.pubDate)}</p>
          </div>
          <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <Globe className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
        <div className="flex-1 px-4 py-5 max-w-2xl mx-auto w-full">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", tagColors[activeCategory])}>
            {getLabel(newsCategories.find(c => c.key === activeCategory)?.label || newsCategories[0].label)}
          </span>
          <h1 className="text-lg font-bold text-foreground leading-snug mt-3 mb-4">{selectedArticle.title}</h1>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-1">
              <Leaf className="h-3 w-3 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">{selectedArticle.source_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatDate(selectedArticle.pubDate)}</span>
            </div>
          </div>
          {selectedArticle.image_url && (
            <div className="mb-4 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedArticle.image_url} alt={selectedArticle.title} className="w-full object-cover max-h-56" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
          )}
          {selectedArticle.description && (
            <p className="text-sm text-foreground leading-relaxed font-medium mb-4">{selectedArticle.description}</p>
          )}
          {selectedArticle.content && selectedArticle.content !== "ONLY AVAILABLE IN PAID PLANS" ? (
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{selectedArticle.content}</div>
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center mt-4">
              <p className="text-sm text-muted-foreground mb-3">{t("Visit the original source to read the full article", "पूरा लेख पढ़ने के लिए मूल स्रोत पर जाएं", "संपूर्ण लेख वाचण्यासाठी मूळ स्रोतावर जा")}</p>
              <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
                {t("Read Full Article", "पूरा लेख पढ़ें", "संपूर्ण लेख वाचा")}
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 md:top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center px-4 pt-3 pb-0 justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {mainTab === "news" ? <Newspaper className="h-4 w-4 text-primary" /> : <ShoppingBasket className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                {mainTab === "news" ? t("Krishi News", "कृषि समाचार", "कृषी बातम्या") : t("Mandi Prices", "मंडी भाव", "मंडी भाव")}
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {mainTab === "news"
                  ? t("Live farming updates", "ताज़ा कृषि अपडेट", "ताज्या कृषी अपडेट")
                  : mandiSource === "mock"
                    ? t("Reference prices · Updated daily", "संदर्भ मूल्य · प्रतिदिन अपडेट", "संदर्भ किंमती · दररोज अपडेट")
                    : t("Live Maharashtra APMC rates", "महाराष्ट्र APMC लाइव भाव", "महाराष्ट्र APMC थेट भाव")}
              </p>
            </div>
          </div>
          <button onClick={() => mainTab === "news" ? fetchNews(true) : fetchMandi(true)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", (newsRefreshing || mandiRefreshing) && "animate-spin")} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex px-4 mt-2 gap-1 border-b border-border">
          <button onClick={() => setMainTab("news")} className={cn("flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors", mainTab === "news" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <Newspaper className="h-3.5 w-3.5" />{t("News", "समाचार", "बातम्या")}
          </button>
          <button onClick={() => setMainTab("mandi")} className={cn("flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors", mainTab === "mandi" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <ShoppingBasket className="h-3.5 w-3.5" />{t("Mandi Prices", "मंडी भाव", "मंडी भाव")}
          </button>
        </div>

        {/* News filters */}
        {mainTab === "news" && (
          <div className="flex gap-2 overflow-x-auto px-4 py-2">
            {newsCategories.map((cat) => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                  activeCategory === cat.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground")}>
                <cat.icon className="h-3 w-3" />{getLabel(cat.label)}
              </button>
            ))}
          </div>
        )}

        {/* Mandi filters */}
        {mainTab === "mandi" && (
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              {MH_DISTRICTS.map((d) => (
                <button key={d} onClick={() => setSelectedDistrict(d)}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all",
                    selectedDistrict === d ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50")}>
                  {d}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 overflow-x-auto">
                {commodityCategories.map((c) => (
                  <button key={c.key} onClick={() => setCommodityCat(c.key)}
                    className={cn("px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap border transition-all",
                      commodityCat === c.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50")}>
                    {getLabel(c.label)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1 flex-1 min-w-[80px]">
                <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t("Search...", "खोजें...", "शोधा...")}
                  className="bg-transparent text-xs outline-none w-full text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEWS CONTENT */}
      {mainTab === "news" && (
        <div className="flex-1 px-4 py-4 space-y-3">
          {newsLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{t("Loading news...", "समाचार लोड हो रहे हैं...", "बातम्या लोड होत आहेत...")}</p>
            </div>
          )}
          {newsError && !newsLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">{newsError}</p>
              <button onClick={() => fetchNews()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">{t("Try Again", "पुनः प्रयास करें", "पुन्हा प्रयत्न करा")}</button>
            </div>
          )}
          {!newsLoading && !newsError && news.map((item, i) => (
            <button key={item.article_id || i} onClick={() => setSelectedArticle(item)}
              className="group w-full text-left bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.99]">
              <div className="flex gap-3">
                {item.image_url && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none" }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", tagColors[activeCategory])}>
                      {getLabel(newsCategories.find(c => c.key === activeCategory)?.label || newsCategories[0].label)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />{formatDate(item.pubDate)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                  {item.description && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.description}</p>}
                  <div className="flex items-center gap-1 mt-2">
                    <Leaf className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground font-medium">{item.source_name}</span>
                    <span className="ml-auto text-[10px] text-primary font-medium">{t("Read →", "पढ़ें →", "वाचा →")}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {!newsLoading && !newsError && news.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Newspaper className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("No news found", "कोई समाचार नहीं मिला", "कोणत्याही बातम्या सापडल्या नाहीत")}</p>
            </div>
          )}
        </div>
      )}

      {/* MANDI CONTENT */}
      {mainTab === "mandi" && (
        <div className="flex-1 px-4 py-4">
          {mandiLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{t("Loading mandi prices...", "मंडी भाव लोड हो रहे हैं...", "मंडी भाव लोड होत आहेत...")}</p>
            </div>
          )}
          {mandiError && !mandiLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">{mandiError}</p>
              <button onClick={() => fetchMandi()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">{t("Try Again", "पुनः प्रयास करें", "पुन्हा प्रयत्न करा")}</button>
            </div>
          )}
          {!mandiLoading && !mandiError && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{filteredMandi.length} {t("commodities", "वस्तुएं", "वस्तू")} · {selectedDistrict}</p>
                <p className="text-[10px] text-muted-foreground">{t("₹/Quintal", "₹/क्विंटल", "₹/क्विंटल")}</p>
              </div>

              {/* Live badge */}
              {mandiSource !== "mock" && (
                <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-green-500/10 rounded-lg w-fit">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">{t("Live APMC Data", "लाइव APMC डेटा", "थेट APMC डेटा")}</span>
                </div>
              )}

              {filteredMandi.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <ShoppingBasket className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("No data found", "कोई डेटा नहीं मिला", "कोणताही डेटा सापडला नाही")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMandi.map((item, i) => {
                    const trend = getPriceTrend(item.min_price, item.max_price, item.modal_price)
                    const modal = parseInt(item.modal_price)
                    return (
                      <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-xl flex-shrink-0">
                          {(item as any).emoji || "🌿"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{item.commodity}</h3>
                            {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
                            {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                            {trend === "stable" && <Minus className="h-3.5 w-3.5 text-yellow-500" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{item.market} · {item.variety}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {t("Min", "न्यूनतम", "किमान")} <span className="text-red-500 font-medium">₹{(parseInt(item.min_price)/100).toFixed(1)}/kg</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {t("Max", "अधिकतम", "जास्तीत जास्त")} <span className="text-green-500 font-medium">₹{(parseInt(item.max_price)/100).toFixed(1)}/kg</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-foreground">
                            ₹{(item as any).price_per_kg || (isNaN(modal) ? "-" : (modal/100).toFixed(1))}<span className="text-xs font-normal text-muted-foreground">/kg</span>
                          </p>
                          <p className={cn("text-[10px] font-semibold", trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-yellow-500")}>
                            {trend === "up" ? t("Rising ↑", "बढ़ रहा ↑", "वाढत आहे ↑") : trend === "down" ? t("Falling ↓", "गिर रहा ↓", "घसरत आहे ↓") : t("Stable →", "स्थिर →", "स्थिर →")}
                          </p>
                          <p className="text-[9px] text-muted-foreground">{item.arrival_date}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Bottom source link */}
          {!mandiLoading && !mandiError && (
            <div className="mt-4 pt-3 border-t border-border">
              <a
                href={mandiSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors"
              >
                <span className="text-lg">🌾</span>
                <span className="text-xs font-semibold text-primary">
                  {t("View Full Prices on VegetableMarketPrice.com →", "VegetableMarketPrice.com पर पूरे भाव देखें →", "VegetableMarketPrice.com वर संपूर्ण भाव पाहा →")}
                </span>
                <ExternalLink className="h-3 w-3 text-primary" />
              </a>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                {t("Source: vegetablemarketprice.com · Prices may vary by market", "स्रोत: vegetablemarketprice.com · भाव बाजार अनुसार भिन्न हो सकते हैं", "स्रोत: vegetablemarketprice.com · भाव बाजारानुसार बदलू शकतात")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}