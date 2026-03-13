"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  Newspaper, RefreshCw, ExternalLink, Clock, TrendingUp,
  Leaf, CloudRain, Bug, Wheat, AlertCircle, ArrowLeft,
  Globe, ShoppingBasket, TrendingDown, Minus, Search, MapPin,
  X, Send,
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
  { key: "all",     label: { en: "All News",     hi: "सभी समाचार",    mr: "सर्व बातम्या"    }, icon: Newspaper, query: "krishi farming agriculture india" },
  { key: "crops",   label: { en: "Crops",         hi: "फसलें",          mr: "पिके"             }, icon: Wheat,     query: "crops farming india kharif rabi" },
  { key: "weather", label: { en: "Weather",       hi: "मौसम",           mr: "हवामान"           }, icon: CloudRain, query: "monsoon weather india farmers" },
  { key: "pest",    label: { en: "Pest Control",  hi: "कीट नियंत्रण",  mr: "कीड नियंत्रण"   }, icon: Bug,       query: "pest crop disease india agriculture" },
  { key: "market",  label: { en: "Market News",   hi: "बाजार समाचार",  mr: "बाजार बातम्या"   }, icon: TrendingUp, query: "mandi price MSP agriculture india" },
]

const tagColors: Record<string, string> = {
  all:     "bg-primary/10 text-primary",
  crops:   "bg-green-500/10 text-green-600 dark:text-green-400",
  weather: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pest:    "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  market:  "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

const MH_DISTRICTS = ["Pune","Nashik","Nagpur","Aurangabad","Solapur","Kolhapur","Ahmednagar","Satara","Sangli","Latur"]

const commodityCategories = [
  { key: "all",       label: { en: "All",        hi: "सभी",       mr: "सर्व"   }, keywords: [] },
  { key: "vegetable", label: { en: "Vegetables", hi: "सब्जियां",  mr: "भाज्या" }, keywords: ["Tomato","Onion","Potato","Brinjal","Cabbage","Cauliflower","Carrot","Capsicum","Garlic","Ginger","Lady Finger","Cucumber","Pumpkin","Bitter Gourd","Bottle Gourd","Drumstick","Radish","Spinach"] },
  { key: "fruit",     label: { en: "Fruits",     hi: "फल",        mr: "फळे"    }, keywords: ["Banana","Mango","Grapes","Pomegranate","Orange","Papaya","Guava","Watermelon","Muskmelon","Apple","Lemon","Pineapple"] },
  { key: "crop",      label: { en: "Crops",      hi: "फसलें",     mr: "पिके"   }, keywords: ["Wheat","Rice","Soybean","Cotton","Maize","Jowar","Bajra","Tur","Gram","Moong","Urad","Groundnut","Sunflower"] },
]

const CHAT_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  news: {
    en: ["Summarize today's farming news", "What's affecting crop prices?", "Any pest alerts this season?", "Government schemes for farmers?"],
    hi: ["आज की कृषि खबरें बताओ", "फसल भाव को क्या प्रभावित कर रहा है?", "इस मौसम में कीट का खतरा?", "किसानों के लिए सरकारी योजनाएं?"],
    mr: ["आजच्या कृषी बातम्या सांगा", "पीक भावावर काय परिणाम होतोय?", "या हंगामात कीड धोका?", "शेतकऱ्यांसाठी सरकारी योजना?"],
  },
  mandi: {
    en: ["Which crop is giving best price now?", "Should I sell onion today?", "When do tomato prices rise?", "Best time to sell wheat?"],
    hi: ["अभी कौन सी फसल का भाव सबसे अच्छा है?", "क्या आज प्याज बेचूं?", "टमाटर का भाव कब बढ़ता है?", "गेहूं बेचने का सही समय?"],
    mr: ["आत्ता कोणत्या पिकाचा भाव सर्वोत्तम आहे?", "आज कांदा विकावा का?", "टोमॅटोचा भाव कधी वाढतो?", "गहू विकण्याची योग्य वेळ?"],
  },
}

function cleanForSpeech(text: string): string {
  return text.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").replace(/[*#_~`>|→•]/g, "").replace(/\n+/g, ". ").trim()
}

// ── KrishiBot Avatar — big, cursor-tracking, glowing eyes ─────────────────────
function KrishiRobotAvatar({
  size = 72,
  chatOpen = false,
  hasNotification = false,
}: {
  size?: number
  chatOpen?: boolean
  hasNotification?: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
  const [isBlinking, setIsBlinking] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const angle = Math.atan2(
        e.clientY - (rect.top + rect.height / 2),
        e.clientX - (rect.left + rect.width / 2)
      )
      const d = 4.5
      setEyeOffset({ x: Math.cos(angle) * d, y: Math.sin(angle) * d })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 140)
      setTimeout(blink, 2800 + Math.random() * 3500)
    }
    const t = setTimeout(blink, 2000)
    return () => clearTimeout(t)
  }, [])

  const LEX = 46, LEY = 52
  const REX = 74, REY = 52
  const lx = chatOpen ? LEX : LEX + eyeOffset.x
  const ly = chatOpen ? LEY : LEY + eyeOffset.y
  const rx = chatOpen ? REX : REX + eyeOffset.x
  const ry = chatOpen ? REY : REY + eyeOffset.y

  const borderColor = chatOpen ? "#f97316" : "#22c55e"
  const glowColor   = chatOpen ? "rgba(249,115,22,0.75)" : "rgba(34,197,94,0.6)"
  const eyeRingColor = chatOpen ? "#f97316" : "#aaee00"
  const irisColor    = chatOpen ? "#ff6600" : "#bbee00"

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          cursor: "pointer",
          transition: "transform 0.25s, filter 0.25s",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          filter: `drop-shadow(0 0 ${hovered ? "20px" : "9px"} ${glowColor})`,
          display: "block",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setEyeOffset({ x: 0, y: 0 }) }}
      >
        <defs>
          <clipPath id="kb-news-circ"><circle cx="60" cy="60" r="58" /></clipPath>
          <radialGradient id="kb-news-sky" cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="#f5c842" />
            <stop offset="60%" stopColor="#a8d448" />
            <stop offset="100%" stopColor="#3a7d1e" />
          </radialGradient>
          <radialGradient id="kb-news-helm" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6dbe2e" />
            <stop offset="70%" stopColor="#2d7a0a" />
            <stop offset="100%" stopColor="#1a4f05" />
          </radialGradient>
          <radialGradient id="kb-news-body" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </radialGradient>
          <radialGradient id="kb-news-iris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffff66" />
            <stop offset="45%" stopColor={irisColor} />
            <stop offset="100%" stopColor="#336600" />
          </radialGradient>
        </defs>

        {/* Outer ring */}
        <circle cx="60" cy="60" r="59" fill="#1a1a1a" stroke={borderColor} strokeWidth="2.5" />

        <g clipPath="url(#kb-news-circ)">
          {/* Farm background */}
          <rect x="0" y="0" width="120" height="120" fill="url(#kb-news-sky)" />
          <ellipse cx="60" cy="110" rx="70" ry="28" fill="#3a7d1e" />
          <ellipse cx="60" cy="106" rx="56" ry="18" fill="#4a9a24" />
          {/* Trees */}
          <ellipse cx="17" cy="79" rx="12" ry="14" fill="#2d6e10" />
          <rect x="14" y="86" width="6" height="10" fill="#5a3010" />
          <ellipse cx="103" cy="79" rx="12" ry="14" fill="#2d6e10" />
          <rect x="100" y="86" width="6" height="10" fill="#5a3010" />
          {/* WiFi arcs */}
          <path d="M28 44 Q22 38 26 32" stroke="#22c55e" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M24 48 Q14 39 20 28" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M92 44 Q98 38 94 32" stroke="#22c55e" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M96 48 Q106 39 100 28" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
          {/* Body + arms */}
          <rect x="38" y="72" width="44" height="34" rx="10" fill="url(#kb-news-body)" stroke="#222" strokeWidth="1" />
          <rect x="22" y="74" width="18" height="28" rx="9" fill="url(#kb-news-body)" stroke="#222" strokeWidth="1" />
          <rect x="80" y="74" width="18" height="28" rx="9" fill="url(#kb-news-body)" stroke="#222" strokeWidth="1" />
          {/* Hands */}
          <ellipse cx="31" cy="104" rx="11" ry="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <ellipse cx="89" cy="104" rx="11" ry="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          {/* Soil + seedling */}
          <ellipse cx="60" cy="104" rx="18" ry="8" fill="#6b3a1f" />
          <ellipse cx="60" cy="101" rx="14" ry="5" fill="#7c4a25" />
          <rect x="58.5" y="84" width="3" height="18" rx="1.5" fill="#2d7a0a" />
          <ellipse cx="52" cy="86" rx="8" ry="5" fill="#3aaa18" transform="rotate(-30 52 86)" />
          <ellipse cx="68" cy="86" rx="8" ry="5" fill="#3aaa18" transform="rotate(30 68 86)" />
          {/* Neck */}
          <rect x="52" y="60" width="16" height="14" rx="4" fill="#1e1e1e" />
          {/* Helmet dome */}
          <ellipse cx="60" cy="50" rx="28" ry="30" fill="url(#kb-news-helm)" stroke="#1a5c0a" strokeWidth="1.5" />
          <ellipse cx="52" cy="36" rx="8" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-20 52 36)" />
          {/* Visor band */}
          <ellipse cx="60" cy="60" rx="28" ry="7" fill="#111" stroke="#1a5c0a" strokeWidth="1.2" />
          <ellipse cx="60" cy="59" rx="22" ry="5" fill="#0d1a0d" opacity="0.85" />
          {/* Top leaf */}
          <rect x="58.5" y="20" width="3" height="10" rx="1.5" fill="#2d7a0a" />
          <ellipse cx="60" cy="18" rx="7" ry="5" fill="#4ade80" transform="rotate(-15 60 18)" />

          {/* ── EYES ── big whites */}
          <circle cx={LEX} cy={LEY} r="9.5" fill="white" />
          <circle cx={REX} cy={REY} r="9.5" fill="white" />
          <circle cx={LEX} cy={LEY} r="9.5" fill="none" stroke={eyeRingColor} strokeWidth="1.8" opacity="0.6" />
          <circle cx={REX} cy={REY} r="9.5" fill="none" stroke={eyeRingColor} strokeWidth="1.8" opacity="0.6" />

          {chatOpen ? (
            /* X eyes when chat is open */
            <>
              <line x1={LEX-5} y1={LEY-5} x2={LEX+5} y2={LEY+5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              <line x1={LEX+5} y1={LEY-5} x2={LEX-5} y2={LEY+5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              <line x1={REX-5} y1={REY-5} x2={REX+5} y2={REY+5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              <line x1={REX+5} y1={REY-5} x2={REX-5} y2={REY+5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : !isBlinking ? (
            /* Cursor-tracking pupils */
            <>
              <circle cx={lx} cy={ly} r="6" fill="url(#kb-news-iris)" />
              <circle cx={rx} cy={ry} r="6" fill="url(#kb-news-iris)" />
              {/* Dark pupil center */}
              <circle cx={lx} cy={ly} r="2.5" fill="#1a3300" opacity="0.75" />
              <circle cx={rx} cy={ry} r="2.5" fill="#1a3300" opacity="0.75" />
              {/* Shine dots */}
              <circle cx={lx - 2.5} cy={ly - 2.5} r="2.2" fill="white" opacity="0.85" />
              <circle cx={rx - 2.5} cy={ry - 2.5} r="2.2" fill="white" opacity="0.85" />
            </>
          ) : (
            /* Blink */
            <>
              <ellipse cx={LEX} cy={LEY} rx="6" ry="1.2" fill="#ccee00" />
              <ellipse cx={REX} cy={REY} rx="6" ry="1.2" fill="#ccee00" />
            </>
          )}
        </g>

        {/* Logo swoosh */}
        <path d="M10 112 Q40 100 60 108 Q80 116 110 104" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M10 115 Q40 103 60 111 Q80 119 110 107" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
        {/* Border rings */}
        <circle cx="60" cy="60" r="58" fill="none" stroke={borderColor} strokeWidth="2" opacity="0.85" />
        <circle cx="60" cy="60" r="55" fill="none" stroke="#4ade80" strokeWidth="0.8" opacity="0.35" />
      </svg>

      {/* Notification dot */}
      {hasNotification && !chatOpen && (
        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-background animate-pulse" />
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, chatLoading])

  useEffect(() => { setChatMessages([]) }, [mainTab])

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

  const buildSystemPrompt = useCallback(() => {
    const langMap: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi" }
    const lang = langMap[language] ?? "English"
    let ctx = `You are KrishiBot, an expert Indian farming assistant embedded in a News & Mandi Prices page.
Always respond in ${lang}. Be concise (under 150 words). Be practical and specific for Indian farmers. Use relevant emojis (📰🌾💰⚠️✅📈) to make responses friendly and easy to read.`
    if (mainTab === "news") {
      ctx += `\n\nCONTEXT: The farmer is reading farming news. Current category: "${activeCategory}".`
      if (news.length > 0) {
        const headlines = news.slice(0, 5).map((n, i) => `${i + 1}. ${n.title}`).join("\n")
        ctx += `\n\nCURRENT NEWS HEADLINES:\n${headlines}\n\nUse these headlines to answer questions about today's news.`
      }
      if (selectedArticle) {
        ctx += `\n\nFARMER IS READING THIS ARTICLE:\nTitle: ${selectedArticle.title}\nDescription: ${selectedArticle.description ?? ""}`
      }
    } else {
      ctx += `\n\nCONTEXT: The farmer is viewing mandi prices for ${selectedDistrict} district.`
      if (mandiData.length > 0) {
        const top = mandiData.slice(0, 10).map(m =>
          `${m.commodity}: ₹${(parseInt(m.modal_price)/100).toFixed(1)}/kg (min ₹${(parseInt(m.min_price)/100).toFixed(1)}, max ₹${(parseInt(m.max_price)/100).toFixed(1)})`
        ).join("\n")
        ctx += `\n\nLIVE MANDI PRICES (${selectedDistrict}):\n${top}\n\nUse these REAL prices to answer questions. Do NOT make up prices.`
      }
    }
    return ctx
  }, [language, mainTab, activeCategory, news, selectedArticle, selectedDistrict, mandiData])

  function speakMessage(text: string, index: number) {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (speakingIndex === index) { setSpeakingIndex(null); return }
    const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text))
    utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN"
    utterance.rate = 0.95
    utterance.onstart = () => setSpeakingIndex(index)
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
  }

  function toggleVoiceInput() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Voice input not supported. Use Chrome."); return }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN"
    recognition.interimResults = false
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setChatInput("")
      sendChatWithText(transcript)
    }
    recognition.start()
  }

  const sendChatWithText = async (text: string) => {
    if (!text.trim() || chatLoading) return
    setChatMessages(prev => [...prev, { role: "user", text }])
    setChatLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildSystemPrompt() + "\n\nFarmer question: " + text, language }),
      })
      const data = await res.json()
      const reply = data.text ?? data.reply ?? data.message ?? "No response."
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Try again." }])
    } finally {
      setChatLoading(false)
    }
  }

  const sendChat = async (overrideText?: string) => {
    const text = (overrideText ?? chatInput).trim()
    if (!text || chatLoading) return
    setChatInput("")
    await sendChatWithText(text)
  }

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

  useEffect(() => { if (mainTab === "news") fetchNews() }, [fetchNews, mainTab])

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

  useEffect(() => { if (mainTab === "mandi") fetchMandi() }, [fetchMandi, mainTab])

  const formatDate = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
      if (diff < 60)   return `${diff}m ago`
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

  const suggestions = CHAT_SUGGESTIONS[mainTab]?.[language] ?? CHAT_SUGGESTIONS[mainTab]?.en ?? []

  // ── Chat popup ─────────────────────────────────────────────────────────────
  const chatPopup = (
    <>
      {/* ✅ KrishiBot avatar as floating button — size 72 so eyes are clearly visible */}
      <button
        onClick={() => setChatOpen(o => !o)}
        className="fixed bottom-20 right-4 z-50 transition-all active:scale-95"
        aria-label="Open KrishiBot chat"
      >
        <KrishiRobotAvatar
          size={72}
          chatOpen={chatOpen}
          hasNotification={!chatOpen && (news.length > 0 || mandiData.length > 0) && chatMessages.length === 0}
        />
      </button>

      {chatOpen && (
        <div
          className="fixed bottom-36 right-4 z-50 flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: "320px", maxWidth: "calc(100vw - 2rem)", height: "460px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary flex-shrink-0">
            {/* Mini avatar in chat header */}
            <KrishiRobotAvatar size={32} chatOpen={false} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary leading-tight">
                {mainTab === "news"
                  ? t("Ask about the news", "समाचार के बारे में पूछें", "बातम्यांबद्दल विचारा")
                  : t("Ask about mandi prices", "मंडी भाव के बारे में पूछें", "मंडी भावाबद्दल विचारा")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {t("KrishiBot AI · Real data", "KrishiBot AI · रियल डेटा", "KrishiBot AI · खरा डेटा")}
              </p>
            </div>
            <button onClick={() => setChatOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context pills */}
          <div className="flex gap-1.5 px-3 pt-2 flex-shrink-0 flex-wrap">
            {mainTab === "news" ? (
              <>
                <span className="text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  📰 {activeCategory}
                </span>
                {news.length > 0 && (
                  <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                    ✅ {news.length} articles loaded
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  📍 {selectedDistrict}
                </span>
                {mandiData.length > 0 && (
                  <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                    ✅ {mandiData.length} prices loaded
                  </span>
                )}
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {chatMessages.length === 0 && (
              <div className="space-y-2">
                <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-3 py-2.5 text-xs text-foreground leading-relaxed">
                  {mainTab === "news"
                    ? (news.length > 0
                        ? t(`I've loaded ${news.length} farming news articles. Ask me anything!`,
                            `मैंने ${news.length} कृषि समाचार लोड किए हैं। कुछ भी पूछें!`,
                            `मी ${news.length} कृषी बातम्या लोड केल्या आहेत. काहीही विचारा!`)
                        : t("Load some news first, then ask me about it!", "पहले समाचार लोड करें, फिर पूछें!", "आधी बातम्या लोड करा, मग विचारा!"))
                    : (mandiData.length > 0
                        ? t(`I have live mandi prices for ${selectedDistrict}. Ask me about any crop price!`,
                            `मेरे पास ${selectedDistrict} के लाइव मंडी भाव हैं। किसी भी फसल का भाव पूछें!`,
                            `माझ्याकडे ${selectedDistrict} चे लाइव्ह मंडी भाव आहेत. कोणत्याही पिकाचा भाव विचारा!`)
                        : t("Load mandi data first, then ask me!", "पहले मंडी डेटा लोड करें, फिर पूछें!", "आधी मंडी डेटा लोड करा, मग विचारा!"))}
                </div>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendChat(s)} disabled={chatLoading}
                      className="text-left text-xs bg-secondary border border-border rounded-xl px-3 py-2 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <KrishiRobotAvatar size={18} chatOpen={false} />
                      <span className="text-[10px] text-primary font-medium">KrishiBot</span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary border border-border text-foreground rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                  {m.role === "assistant" && (
                    <button onClick={() => speakMessage(m.text, i)}
                      className={cn(
                        "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all",
                        speakingIndex === i
                          ? "bg-primary/20 text-primary border-primary/40 animate-pulse"
                          : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/40"
                      )}>
                      {speakingIndex === i ? "⏹ Stop" : "🔊 Listen"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "160ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "320ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input row */}
          <div className="flex gap-2 px-3 py-3 border-t border-border flex-shrink-0 bg-card">
            <button onClick={toggleVoiceInput}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm border transition-all",
                isListening
                  ? "bg-red-500 text-white border-red-500 animate-pulse"
                  : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/40"
              )}
              title={isListening ? "Stop" : "Speak"}>
              {isListening ? "⏹" : "🎤"}
            </button>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat() } }}
              placeholder={isListening
                ? t("Listening...", "सुन रहा हूं...", "ऐकतोय...")
                : t("Ask about news or prices...", "समाचार या भाव पूछें...", "बातम्या किंवा भाव विचारा...")}
              disabled={chatLoading}
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 disabled:opacity-60"
            />
            <button onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity">
              {chatLoading
                ? <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                : <Send className="w-4 h-4 text-primary-foreground" />
              }
            </button>
          </div>
        </div>
      )}
    </>
  )

  // ── Article reader view ────────────────────────────────────────────────────
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
              <p className="text-sm text-muted-foreground mb-3">{t("Visit the original source to read the full article","पूरा लेख पढ़ने के लिए मूल स्रोत पर जाएं","संपूर्ण लेख वाचण्यासाठी मूळ स्रोतावर जा")}</p>
              <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <ExternalLink className="h-3.5 w-3.5" />
                {t("Read Full Article","पूरा लेख पढ़ें","संपूर्ण लेख वाचा")}
              </a>
            </div>
          )}
        </div>
        {chatPopup}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-6">

      {/* ── Header ── */}
      <div className="sticky top-0 md:top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center px-4 pt-3 pb-0 justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {mainTab === "news" ? <Newspaper className="h-4 w-4 text-primary" /> : <ShoppingBasket className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">
                {mainTab === "news" ? t("Krishi News","कृषि समाचार","कृषी बातम्या") : t("Mandi Prices","मंडी भाव","मंडी भाव")}
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {mainTab === "news"
                  ? t("Live farming updates","ताज़ा कृषि अपडेट","ताज्या कृषी अपडेट")
                  : mandiSource === "mock"
                    ? t("Reference prices · Updated daily","संदर्भ मूल्य · प्रतिदिन अपडेट","संदर्भ किंमती · दररोज अपडेट")
                    : t("Live Maharashtra APMC rates","महाराष्ट्र APMC लाइव भाव","महाराष्ट्र APMC थेट भाव")}
              </p>
            </div>
          </div>
          <button onClick={() => mainTab === "news" ? fetchNews(true) : fetchMandi(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", (newsRefreshing || mandiRefreshing) && "animate-spin")} />
          </button>
        </div>

        <div className="flex px-4 mt-2 gap-1 border-b border-border">
          <button onClick={() => setMainTab("news")}
            className={cn("flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors",
              mainTab === "news" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <Newspaper className="h-3.5 w-3.5" />{t("News","समाचार","बातम्या")}
          </button>
          <button onClick={() => setMainTab("mandi")}
            className={cn("flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors",
              mainTab === "mandi" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <ShoppingBasket className="h-3.5 w-3.5" />{t("Mandi Prices","मंडी भाव","मंडी भाव")}
          </button>
        </div>

        {mainTab === "news" && (
          <div className="flex gap-2 overflow-x-auto px-4 py-2">
            {newsCategories.map((cat) => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground")}>
                <cat.icon className="h-3 w-3" />{getLabel(cat.label)}
              </button>
            ))}
          </div>
        )}

        {mainTab === "mandi" && (
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              {MH_DISTRICTS.map((d) => (
                <button key={d} onClick={() => setSelectedDistrict(d)}
                  className={cn("px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-all",
                    selectedDistrict === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50")}>
                  {d}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 overflow-x-auto">
                {commodityCategories.map((c) => (
                  <button key={c.key} onClick={() => setCommodityCat(c.key)}
                    className={cn("px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap border transition-all",
                      commodityCat === c.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50")}>
                    {getLabel(c.label)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-secondary rounded-lg px-2 py-1 flex-1 min-w-[80px]">
                <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t("Search...","खोजें...","शोधा...")}
                  className="bg-transparent text-xs outline-none w-full text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── NEWS CONTENT ── */}
      {mainTab === "news" && (
        <div className="flex-1 px-4 py-4 space-y-3">
          {newsLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{t("Loading news...","समाचार लोड हो रहे हैं...","बातम्या लोड होत आहेत...")}</p>
            </div>
          )}
          {newsError && !newsLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">{newsError}</p>
              <button onClick={() => fetchNews()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                {t("Try Again","पुनः प्रयास करें","पुन्हा प्रयत्न करा")}
              </button>
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
                    <span className="ml-auto text-[10px] text-primary font-medium">{t("Read →","पढ़ें →","वाचा →")}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
          {!newsLoading && !newsError && news.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Newspaper className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t("No news found","कोई समाचार नहीं मिला","कोणत्याही बातम्या सापडल्या नाहीत")}</p>
            </div>
          )}
        </div>
      )}

      {/* ── MANDI CONTENT ── */}
      {mainTab === "mandi" && (
        <div className="flex-1 px-4 py-4">
          {mandiLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{t("Loading mandi prices...","मंडी भाव लोड हो रहे हैं...","मंडी भाव लोड होत आहेत...")}</p>
            </div>
          )}
          {mandiError && !mandiLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">{mandiError}</p>
              <button onClick={() => fetchMandi()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                {t("Try Again","पुनः प्रयास करें","पुन्हा प्रयत्न करा")}
              </button>
            </div>
          )}
          {!mandiLoading && !mandiError && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">{filteredMandi.length} {t("commodities","वस्तुएं","वस्तू")} · {selectedDistrict}</p>
                <p className="text-[10px] text-muted-foreground">{t("₹/Quintal","₹/क्विंटल","₹/क्विंटल")}</p>
              </div>
              {mandiSource !== "mock" && (
                <div className="flex items-center gap-1.5 mb-3 px-2 py-1 bg-green-500/10 rounded-lg w-fit">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                    {t("Live APMC Data","लाइव APMC डेटा","थेट APMC डेटा")}
                  </span>
                </div>
              )}
              <Link href="/mandi/history"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 mb-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {t("📈 View 30-Day Price History Charts","📈 30 दिन का मूल्य इतिहास देखें","📈 ३० दिवसांचा किंमत इतिहास पाहा")}
                </span>
              </Link>
              {filteredMandi.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <ShoppingBasket className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t("No data found","कोई डेटा नहीं मिला","कोणताही डेटा सापडला नाही")}</p>
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
                            {trend === "up"     && <TrendingUp   className="h-3.5 w-3.5 text-green-500" />}
                            {trend === "down"   && <TrendingDown className="h-3.5 w-3.5 text-red-500"   />}
                            {trend === "stable" && <Minus        className="h-3.5 w-3.5 text-yellow-500"/>}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{item.market} · {item.variety}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {t("Min","न्यूनतम","किमान")} <span className="text-red-500 font-medium">₹{(parseInt(item.min_price)/100).toFixed(1)}/kg</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {t("Max","अधिकतम","जास्तीत जास्त")} <span className="text-green-500 font-medium">₹{(parseInt(item.max_price)/100).toFixed(1)}/kg</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-foreground">
                            ₹{(item as any).price_per_kg || (isNaN(modal) ? "-" : (modal/100).toFixed(1))}
                            <span className="text-xs font-normal text-muted-foreground">/kg</span>
                          </p>
                          <p className={cn("text-[10px] font-semibold",
                            trend==="up" ? "text-green-500" : trend==="down" ? "text-red-500" : "text-yellow-500")}>
                            {trend==="up"     ? t("Rising ↑","बढ़ रहा ↑","वाढत आहे ↑")
                           : trend==="down"   ? t("Falling ↓","गिर रहा ↓","घसरत आहे ↓")
                           :                   t("Stable →","स्थिर →","स्थिर →")}
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
          {!mandiLoading && !mandiError && (
            <div className="mt-4 pt-3 border-t border-border">
              <a href={mandiSourceUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-colors">
                <span className="text-lg">🌾</span>
                <span className="text-xs font-semibold text-primary">
                  {t("View Full Prices on VegetableMarketPrice.com →","VegetableMarketPrice.com पर पूरे भाव देखें →","VegetableMarketPrice.com वर संपूर्ण भाव पाहा →")}
                </span>
                <ExternalLink className="h-3 w-3 text-primary" />
              </a>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                {t("Source: vegetablemarketprice.com · Prices may vary by market","स्रोत: vegetablemarketprice.com · भाव बाजार अनुसार भिन्न हो सकते हैं","स्रोत: vegetablemarketprice.com · भाव बाजारानुसार बदलू शकतात")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Floating KrishiBot Chat ── */}
      {chatPopup}

    </div>
  )
}