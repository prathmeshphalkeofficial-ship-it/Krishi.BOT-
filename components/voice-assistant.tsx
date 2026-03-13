"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Mic, MicOff, Volume2, Loader2, Power, HelpCircle,
  Search, AlertCircle, Zap, Globe, Newspaper, Calculator,
  Heart, StopCircle, Navigation, Droplets, FlaskConical,
  Bug, CloudSun, ShoppingCart,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { t, type Language } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────
type VoiceState = "idle" | "wake" | "listening" | "processing" | "speaking"

interface ConversationEntry {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: Date
}

// ── Voice navigation routes ───────────────────────────────────────────────────
const NAV_COMMANDS: { keywords: string[]; route: string; label: Record<Language, string> }[] = [
  { keywords: ["soil", "मिट्टी", "माती"], route: "/soil", label: { en: "Opening Soil Tracker", hi: "मिट्टी ट्रैकर खोल रहा हूं", mr: "माती ट्रॅकर उघडत आहे" } },
  { keywords: ["disease", "रोग", "बीमारी", "pests"], route: "/disease", label: { en: "Opening Disease Detection", hi: "रोग पहचान खोल रहा हूं", mr: "रोग ओळख उघडत आहे" } },
  { keywords: ["spray", "spraying", "छिड़काव", "फवारणी"], route: "/spraying", label: { en: "Opening Spraying Advisor", hi: "छिड़काव सलाहकार खोल रहा हूं", mr: "फवारणी सल्लागार उघडत आहे" } },
  { keywords: ["mandi", "price", "market", "भाव", "मंडी", "बाजार"], route: "/news", label: { en: "Opening Mandi Prices", hi: "मंडी भाव खोल रहा हूं", mr: "मंडी भाव उघडत आहे" } },
  { keywords: ["news", "खबर", "बातम्या"], route: "/news", label: { en: "Opening News", hi: "खबरें खोल रहा हूं", mr: "बातम्या उघडत आहे" } },
  { keywords: ["chat", "assistant", "सहायक"], route: "/chat", label: { en: "Opening AI Assistant", hi: "AI सहायक खोल रहा हूं", mr: "AI सहाय्यक उघडत आहे" } },
]

// ── Example commands ──────────────────────────────────────────────────────────
const QUICK_COMMANDS: Record<Language, { label: string; query: string; icon: typeof Power; color: string }[]> = {
  en: [
    { label: "Weather", query: "What's the weather today?", icon: CloudSun, color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    { label: "Mandi", query: "Show mandi prices for onion", icon: ShoppingCart, color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    { label: "Soil Advice", query: "How to improve my soil health?", icon: FlaskConical, color: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
    { label: "Disease", query: "My wheat leaves are turning yellow, what disease?", icon: Bug, color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "Irrigation", query: "When should I irrigate my crop?", icon: Droplets, color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
    { label: "Motor ON", query: "Turn on motor", icon: Power, color: "bg-green-500/15 text-green-400 border-green-500/25" },
    { label: "Motor OFF", query: "Turn off motor", icon: Power, color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "PM-KISAN", query: "PM-KISAN scheme details", icon: Globe, color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  ],
  hi: [
    { label: "मौसम", query: "आज का मौसम कैसा है?", icon: CloudSun, color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    { label: "मंडी", query: "प्याज का मंडी भाव बताओ", icon: ShoppingCart, color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    { label: "मिट्टी", query: "मेरी मिट्टी कैसे सुधारें?", icon: FlaskConical, color: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
    { label: "रोग", query: "मेरी गेहूं की पत्तियां पीली हो रही हैं, क्या रोग है?", icon: Bug, color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "सिंचाई", query: "फसल में कब पानी दें?", icon: Droplets, color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
    { label: "मोटर चालू", query: "मोटर चालू करो", icon: Power, color: "bg-green-500/15 text-green-400 border-green-500/25" },
    { label: "मोटर बंद", query: "मोटर बंद करो", icon: Power, color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "PM-KISAN", query: "PM-KISAN योजना की जानकारी", icon: Globe, color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  ],
  mr: [
    { label: "हवामान", query: "आजचे हवामान कसे आहे?", icon: CloudSun, color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    { label: "मंडी", query: "कांद्याचा मंडी भाव सांगा", icon: ShoppingCart, color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    { label: "माती", query: "माझी माती कशी सुधारायची?", icon: FlaskConical, color: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
    { label: "रोग", query: "माझ्या गव्हाची पाने पिवळी पडत आहेत, काय रोग आहे?", icon: Bug, color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "सिंचन", query: "पिकाला पाणी कधी द्यावे?", icon: Droplets, color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
    { label: "मोटर चालू", query: "मोटर चालू करा", icon: Power, color: "bg-green-500/15 text-green-400 border-green-500/25" },
    { label: "मोटर बंद", query: "मोटर बंद करा", icon: Power, color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "PM-KISAN", query: "PM-KISAN योजनेची माहिती", icon: Globe, color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  ],
}

// ── Wake words ────────────────────────────────────────────────────────────────
const WAKE_WORDS = ["krishi", "hey krishi", "krishibot", "कृषि", "क्रिषि"]

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null
  const w = window as Record<string, unknown>
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => SpeechRecognition) | null
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[•*#_~`>|→]/g, "")
    .replace(/\[MOTOR_ON\]|\[MOTOR_OFF\]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

// ── KrishiBot Circular Avatar with cursor-tracking eyes ───────────────────────
function KrishiRobotAvatar({
  size = 48,
  voiceState = "idle",
}: {
  size?: number
  voiceState?: VoiceState
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
  const [isBlinking, setIsBlinking] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Cursor tracking
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const angle = Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2))
      const d = 3.2
      setEyeOffset({ x: Math.cos(angle) * d, y: Math.sin(angle) * d })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  // Auto blink
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 130)
      setTimeout(blink, 3000 + Math.random() * 3500)
    }
    const t = setTimeout(blink, 2500)
    return () => clearTimeout(t)
  }, [])

  // Eye color reacts to voice state
  const eyeColor = voiceState === "listening"
    ? "#00ff88"
    : voiceState === "speaking"
    ? "#44ff44"
    : voiceState === "processing"
    ? "#ffcc00"
    : "#ccee00"

  const glowColor = voiceState === "listening"
    ? "rgba(0,255,136,0.75)"
    : voiceState === "speaking"
    ? "rgba(34,197,94,0.75)"
    : voiceState === "processing"
    ? "rgba(255,200,0,0.6)"
    : "rgba(34,197,94,0.4)"

  const LEX = 46, LEY = 52
  const REX = 74, REY = 52

  return (
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
        transform: hovered ? "scale(1.12)" : "scale(1)",
        filter: `drop-shadow(0 0 ${hovered ? "14px" : "6px"} ${glowColor})`,
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setEyeOffset({ x: 0, y: 0 }) }}
    >
      <defs>
        <clipPath id="kb-circ"><circle cx="60" cy="60" r="58" /></clipPath>
        <radialGradient id="kb-sky" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#f5c842" />
          <stop offset="60%" stopColor="#a8d448" />
          <stop offset="100%" stopColor="#3a7d1e" />
        </radialGradient>
        <radialGradient id="kb-helmet" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#6dbe2e" />
          <stop offset="70%" stopColor="#2d7a0a" />
          <stop offset="100%" stopColor="#1a4f05" />
        </radialGradient>
        <radialGradient id="kb-body" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
        <radialGradient id="kb-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor={eyeColor} />
          <stop offset="100%" stopColor="#669900" />
        </radialGradient>
      </defs>

      {/* Outer circle */}
      <circle cx="60" cy="60" r="59" fill="#1a1a1a" stroke="#22c55e" strokeWidth="2.5" />

      <g clipPath="url(#kb-circ)">
        {/* Farm background */}
        <rect x="0" y="0" width="120" height="120" fill="url(#kb-sky)" />
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
        <rect x="38" y="72" width="44" height="34" rx="10" fill="url(#kb-body)" stroke="#222" strokeWidth="1" />
        <rect x="22" y="74" width="18" height="28" rx="9" fill="url(#kb-body)" stroke="#222" strokeWidth="1" />
        <rect x="80" y="74" width="18" height="28" rx="9" fill="url(#kb-body)" stroke="#222" strokeWidth="1" />
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
        {/* Helmet */}
        <ellipse cx="60" cy="50" rx="28" ry="30" fill="url(#kb-helmet)" stroke="#1a5c0a" strokeWidth="1.5" />
        <ellipse cx="52" cy="36" rx="8" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-20 52 36)" />
        <ellipse cx="60" cy="60" rx="28" ry="7" fill="#111" stroke="#1a5c0a" strokeWidth="1.2" />
        <ellipse cx="60" cy="59" rx="22" ry="5" fill="#0d1a0d" opacity="0.85" />
        {/* Top leaf */}
        <rect x="58.5" y="20" width="3" height="10" rx="1.5" fill="#2d7a0a" />
        <ellipse cx="60" cy="18" rx="7" ry="5" fill="#4ade80" transform="rotate(-15 60 18)" />
        {/* Eyes white */}
        <circle cx={LEX} cy={LEY} r="8" fill="white" />
        <circle cx={REX} cy={REY} r="8" fill="white" />
        <circle cx={LEX} cy={LEY} r="8" fill="none" stroke={eyeColor} strokeWidth="1.5" opacity="0.55" />
        <circle cx={REX} cy={REY} r="8" fill="none" stroke={eyeColor} strokeWidth="1.5" opacity="0.55" />
        {/* Pupils — cursor tracked */}
        {!isBlinking ? (
          <>
            <circle cx={LEX + eyeOffset.x} cy={LEY + eyeOffset.y} r="5" fill="url(#kb-eye)" />
            <circle cx={REX + eyeOffset.x} cy={REY + eyeOffset.y} r="5" fill="url(#kb-eye)" />
            <circle cx={LEX + eyeOffset.x - 2} cy={LEY + eyeOffset.y - 2} r="1.8" fill="white" opacity="0.75" />
            <circle cx={REX + eyeOffset.x - 2} cy={REY + eyeOffset.y - 2} r="1.8" fill="white" opacity="0.75" />
          </>
        ) : (
          <>
            <ellipse cx={LEX} cy={LEY} rx="5" ry="1" fill={eyeColor} />
            <ellipse cx={REX} cy={REY} rx="5" ry="1" fill={eyeColor} />
          </>
        )}
      </g>

      {/* Swoosh */}
      <path d="M10 112 Q40 100 60 108 Q80 116 110 104" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M10 115 Q40 103 60 111 Q80 119 110 107" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
      {/* Border rings */}
      <circle cx="60" cy="60" r="58" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.8" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#4ade80" strokeWidth="0.5" opacity="0.3" />

      {/* Listening pulse ring */}
      {voiceState === "listening" && (
        <circle cx="60" cy="60" r="58" fill="none" stroke="#00ff88" strokeWidth="3" opacity="0.6" strokeDasharray="8 6">
          <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function VoiceAssistant() {
  const { language, setIsMotorOn } = useApp()
  const router = useRouter()
  const [state, setState] = useState<VoiceState>("idle")
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null)
  const [textInput, setTextInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isMotorOn, setLocalMotorOn] = useState(false)
  const [wakeMode, setWakeMode] = useState(false)
  const [navMessage, setNavMessage] = useState<string | null>(null)
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  const coordsRef = useRef<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { coordsRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude } },
        () => { }
      )
    }
  }, [])

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const wakeRecognitionRef = useRef<SpeechRecognition | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSpeechSupported(getSpeechRecognition() !== null)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversation])

  const speakText = useCallback((text: string, id?: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) { resolve(); return }
      try {
        window.speechSynthesis.cancel()
        const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" }
        const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text))
        utterance.lang = langMap[language] ?? "en-IN"
        utterance.rate = 0.95
        utterance.pitch = 1.0
        if (id) utterance.onstart = () => setSpeakingId(id)
        utterance.onend = () => { setSpeakingId(null); resolve() }
        utterance.onerror = () => { setSpeakingId(null); resolve() }
        window.speechSynthesis.speak(utterance)
      } catch { resolve() }
    })
  }, [language])

  const checkNavCommand = useCallback((text: string): boolean => {
    const lower = text.toLowerCase()
    const hasNavIntent = ["open", "go to", "show", "खोलो", "जाओ", "उघडा", "दाखव"].some(w => lower.includes(w))
    if (!hasNavIntent) return false
    for (const nav of NAV_COMMANDS) {
      if (nav.keywords.some(k => lower.includes(k))) {
        const msg = nav.label[language as Language] ?? nav.label.en
        setNavMessage(msg)
        speakText(msg)
        setTimeout(() => { setNavMessage(null); router.push(nav.route) }, 1500)
        return true
      }
    }
    return false
  }, [language, router, speakText])

  const processCommand = useCallback(async (text: string) => {
    setState("processing")
    setError(null)
    if (checkNavCommand(text)) { setState("idle"); return }
    const userEntry: ConversationEntry = { id: `user-${Date.now()}`, role: "user", text, timestamp: new Date() }
    setConversation(prev => [...prev, userEntry])
    try {
      abortRef.current = new AbortController()
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, language, ...coordsRef.current }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const responseText: string = data.text || "Could not process. Please try again."
      if (responseText.includes("[MOTOR_ON]")) { setIsMotorOn(true); setLocalMotorOn(true) }
      if (responseText.includes("[MOTOR_OFF]")) { setIsMotorOn(false); setLocalMotorOn(false) }
      const clean = responseText.replace(/\[MOTOR_ON\]/g, "").replace(/\[MOTOR_OFF\]/g, "").trim()
      const aiId = `ai-${Date.now()}`
      const aiEntry: ConversationEntry = { id: aiId, role: "assistant", text: clean, timestamp: new Date() }
      setConversation(prev => [...prev, aiEntry])
      setState("speaking")
      await speakText(clean, aiId)
      setState("idle")
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") { setState("idle"); return }
      const msg = language === "hi" ? "AI से जुड़ने में समस्या।" : language === "mr" ? "AI शी कनेक्ट करण्यात समस्या." : "Could not connect to AI. Please try again."
      setError(msg)
      setState("idle")
    }
  }, [language, setIsMotorOn, speakText, checkNavCommand])

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR) return
    setState("listening")
    setError(null)
    try {
      const recognition = new SR()
      recognitionRef.current = recognition
      const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" }
      recognition.lang = langMap[language] ?? "en-IN"
      recognition.interimResults = false
      recognition.continuous = false
      recognition.maxAlternatives = 1
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[event.results.length - 1][0].transcript
        recognitionRef.current = null
        if (text.trim()) processCommand(text.trim())
        else setState("idle")
      }
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        recognitionRef.current = null
        setState("idle")
        if (event.error === "not-allowed") {
          setError(language === "hi" ? "माइक्रोफ़ोन की अनुमति नहीं।" : language === "mr" ? "मायक्रोफोन परवानगी नाही." : "Microphone permission denied.")
        }
      }
      recognition.onend = () => { recognitionRef.current = null }
      recognition.start()
    } catch { setState("idle") }
  }, [language, processCommand])

  const startWakeMode = useCallback(() => {
    const SR = getSpeechRecognition()
    if (!SR || wakeMode) return
    setWakeMode(true)
    const recognition = new SR()
    wakeRecognitionRef.current = recognition
    const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" }
    recognition.lang = langMap[language] ?? "en-IN"
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1]
      const transcript = last[0].transcript.toLowerCase()
      const hasWake = WAKE_WORDS.some(w => transcript.includes(w))
      if (hasWake && last.isFinal) {
        let query = transcript
        WAKE_WORDS.forEach(w => { query = query.replace(w, "").trim() })
        if (query.length > 2) processCommand(query)
        else startListening()
      }
    }
    recognition.onerror = () => { setWakeMode(false); wakeRecognitionRef.current = null }
    recognition.onend = () => {
      if (wakeMode) {
        try { recognition.start() } catch { setWakeMode(false) }
      }
    }
    recognition.start()
  }, [language, wakeMode, processCommand, startListening])

  const stopWakeMode = useCallback(() => {
    setWakeMode(false)
    try { wakeRecognitionRef.current?.stop() } catch { }
    wakeRecognitionRef.current = null
  }, [])

  const handleMainButton = useCallback(() => {
    if (state === "listening") {
      try { recognitionRef.current?.stop() } catch { }
      recognitionRef.current = null
      setState("idle")
    } else if (state === "speaking") {
      window.speechSynthesis?.cancel()
      setState("idle")
    } else if (state === "processing") {
      abortRef.current?.abort()
      setState("idle")
    } else {
      startListening()
    }
  }, [state, startListening])

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim() || state === "processing" || state === "speaking") return
    processCommand(textInput.trim())
    setTextInput("")
  }, [textInput, state, processCommand])

  const replayMessage = useCallback((entry: ConversationEntry) => {
    if (speakingId === entry.id) { window.speechSynthesis?.cancel(); setSpeakingId(null); return }
    speakText(entry.text, entry.id)
  }, [speakingId, speakText])

  const langMap: Record<string, string> = { en: "en", hi: "hi", mr: "mr" }
  const lang = (langMap[language] ?? "en") as Language
  const commands = QUICK_COMMANDS[lang]

  const stateLabel = {
    idle: language === "hi" ? "बोलने के लिए दबाएं" : language === "mr" ? "बोलण्यासाठी दाबा" : "Tap to Speak",
    wake: language === "hi" ? "जाग रहा हूं..." : language === "mr" ? "जागे आहे..." : "Wake mode active...",
    listening: language === "hi" ? "सुन रहा हूं..." : language === "mr" ? "ऐकतोय..." : "Listening...",
    processing: language === "hi" ? "सोच रहा हूं..." : language === "mr" ? "विचार करतोय..." : "Thinking...",
    speaking: language === "hi" ? "बोल रहा हूं..." : language === "mr" ? "बोलतोय..." : "Speaking...",
  }[state]

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ✅ KrishiBot Avatar — replaces the old Leaf icon */}
            <KrishiRobotAvatar size={48} voiceState={state} />
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {language === "hi" ? "कृषि वॉइस" : language === "mr" ? "कृषि व्हॉइस" : "Krishi Voice"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "hi" ? "बोलें या टाइप करें — हिंदी, मराठी, English" : language === "mr" ? "बोला किंवा टाइप करा" : "Speak or type — any language"}
              </p>
            </div>
          </div>
          {/* Motor status badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
            isMotorOn
              ? "bg-green-500/15 text-green-400 border-green-500/30"
              : "bg-secondary text-muted-foreground border-border"
          )}>
            <Power className="w-3 h-3" />
            <span>{language === "hi" ? "मोटर" : language === "mr" ? "मोटर" : "Motor"}</span>
            <span className={cn("w-2 h-2 rounded-full", isMotorOn ? "bg-green-400 animate-pulse" : "bg-muted-foreground/40")} />
          </div>
        </div>

        {/* ── Main Voice Button ── */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative flex items-center justify-center">
            {state === "listening" && (
              <>
                <span className="absolute w-44 h-44 rounded-full bg-primary/5 animate-ping [animation-duration:1.5s]" />
                <span className="absolute w-56 h-56 rounded-full bg-primary/3 animate-ping [animation-duration:2.5s]" />
              </>
            )}
            {state === "speaking" && (
              <span className="absolute w-44 h-44 rounded-full bg-green-500/10 animate-pulse" />
            )}
            {state === "processing" && (
              <span className="absolute w-40 h-40 rounded-full border-2 border-dashed border-primary/20 animate-spin [animation-duration:3s]" />
            )}
            {wakeMode && state === "idle" && (
              <span className="absolute w-36 h-36 rounded-full border border-primary/20 animate-pulse" />
            )}

            <button
              onClick={handleMainButton}
              className={cn(
                "relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 shadow-2xl",
                state === "idle" && "bg-primary text-primary-foreground hover:scale-105 shadow-primary/25",
                state === "listening" && "bg-primary text-primary-foreground scale-110 shadow-primary/40",
                state === "processing" && "bg-muted text-muted-foreground",
                state === "speaking" && "bg-green-500 text-white shadow-green-500/30",
              )}
            >
              {state === "processing" ? <Loader2 className="w-10 h-10 animate-spin" />
                : state === "speaking" ? <Volume2 className="w-10 h-10" />
                : state === "listening" ? <MicOff className="w-10 h-10" />
                : <Mic className="w-10 h-10" />}
              <span className="text-[10px] font-medium opacity-80">
                {state === "idle" ? (language === "hi" ? "दबाएं" : language === "mr" ? "दाबा" : "Tap") : ""}
              </span>
            </button>
          </div>

          <div className="text-center space-y-1">
            <p className={cn(
              "text-base font-semibold",
              state === "listening" && "text-primary",
              state === "speaking" && "text-green-400",
              state === "processing" && "text-muted-foreground",
              state === "idle" && "text-foreground",
            )}>
              {stateLabel}
            </p>
            {(state === "processing" || state === "speaking") && (
              <button onClick={() => { abortRef.current?.abort(); window.speechSynthesis?.cancel(); setState("idle") }}
                className="inline-flex items-center gap-1 text-xs text-destructive-foreground hover:underline">
                <StopCircle className="w-3 h-3" />
                {language === "hi" ? "रोकें" : language === "mr" ? "थांबवा" : "Stop"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={wakeMode ? stopWakeMode : startWakeMode}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all",
                wakeMode
                  ? "bg-primary/20 text-primary border-primary/40 animate-pulse"
                  : "bg-secondary text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", wakeMode ? "bg-primary" : "bg-muted-foreground/40")} />
              {wakeMode
                ? (language === "hi" ? "\"हे कृषि\" सुन रहा हूं" : language === "mr" ? "\"हे कृषि\" ऐकत आहे" : "Listening for \"Hey Krishi\"")
                : (language === "hi" ? "वेक वर्ड चालू करें" : language === "mr" ? "वेक वर्ड सुरू करा" : "Enable Wake Word")}
            </button>
          </div>
        </div>

        {/* ── Nav message toast ── */}
        {navMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Navigation className="w-4 h-4 shrink-0" />
            {navMessage}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
            <AlertCircle className="w-4 h-4 text-destructive-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-foreground">{error}</p>
          </div>
        )}

        {/* ── Quick Command Grid ── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {language === "hi" ? "त्वरित कमांड" : language === "mr" ? "जलद कमांड" : "Quick Commands"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {commands.map((cmd, i) => (
              <button key={i}
                onClick={() => processCommand(cmd.query)}
                disabled={state === "processing" || state === "speaking"}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all disabled:opacity-50 hover:scale-105 active:scale-95",
                  cmd.color
                )}>
                <cmd.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Text Input ── */}
        <div className="flex gap-2">
          <input
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
            placeholder={language === "hi" ? "कुछ भी टाइप करें..." : language === "mr" ? "काहीही टाइप करा..." : "Type anything..."}
            disabled={state === "processing" || state === "speaking"}
            className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 disabled:opacity-60"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || state === "processing" || state === "speaking"}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            {language === "hi" ? "पूछो" : language === "mr" ? "विचारा" : "Ask"}
          </button>
        </div>

        {/* ── Conversation History ── */}
        {conversation.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {language === "hi" ? "बातचीत" : language === "mr" ? "संभाषण" : "Conversation"}
              </p>
              <button onClick={() => setConversation([])}
                className="text-[10px] text-muted-foreground hover:text-destructive-foreground transition-colors">
                {language === "hi" ? "साफ करें" : language === "mr" ? "साफ करा" : "Clear"}
              </button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-3" ref={scrollRef}>
              {conversation.map(entry => (
                <div key={entry.id} className={cn("flex", entry.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[88%] flex flex-col gap-1",
                    entry.role === "user" ? "items-end" : "items-start"
                  )}>
                    {entry.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <KrishiRobotAvatar size={18} voiceState="idle" />
                        <span className="text-[10px] text-primary font-medium">KrishiBot</span>
                      </div>
                    )}
                    <div className={cn(
                      "rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                      entry.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary border border-border text-foreground rounded-bl-sm"
                    )}>
                      {entry.text}
                    </div>
                    {entry.role === "assistant" && (
                      <button
                        onClick={() => replayMessage(entry)}
                        className={cn(
                          "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all",
                          speakingId === entry.id
                            ? "bg-green-500/20 text-green-400 border-green-500/30 animate-pulse"
                            : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/40"
                        )}>
                        {speakingId === entry.id ? "⏹ Stop" : "🔊 Listen"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {state === "processing" && (
                <div className="flex justify-start">
                  <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Voice nav commands tip ── */}
        {conversation.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-primary" />
              {language === "hi" ? "वॉइस नेविगेशन" : language === "mr" ? "व्हॉइस नेव्हिगेशन" : "Voice Navigation"}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                language === "hi" ? '"कृषि, मिट्टी पेज खोलो"' : language === "mr" ? '"कृषि, माती पान उघडा"' : '"Open soil page"',
                language === "hi" ? '"कृषि, रोग पहचान दिखाओ"' : language === "mr" ? '"कृषि, रोग ओळख दाखव"' : '"Show disease detection"',
                language === "hi" ? '"कृषि, मंडी भाव जाओ"' : language === "mr" ? '"कृषि, मंडी भाव जा"' : '"Go to mandi prices"',
                language === "hi" ? '"कृषि, छिड़काव सलाहकार"' : language === "mr" ? '"कृषि, फवारणी सल्लागार"' : '"Open spraying advisor"',
              ].map((cmd, i) => (
                <div key={i} className="bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground border border-border">
                  {cmd}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {language === "hi" ? '* "Hey Krishi" से शुरू करें या वेक वर्ड चालू करें' : language === "mr" ? '* "Hey Krishi" ने सुरुवात करा किंवा वेक वर्ड सुरू करा' : '* Say "Hey Krishi" first, or enable wake word mode above'}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}