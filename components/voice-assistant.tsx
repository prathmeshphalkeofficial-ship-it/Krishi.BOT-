"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Power, AlertCircle, Zap, Globe, StopCircle, Navigation, Droplets, FlaskConical,
  Bug, CloudSun, ShoppingCart,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { t, type Language } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type VoiceState = "idle" | "wake" | "listening" | "processing" | "speaking"

interface ConversationEntry {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: Date
}

const NAV_COMMANDS: { keywords: string[]; route: string; label: Record<Language, string> }[] = [
  { keywords: ["soil", "मिट्टी", "माती"], route: "/soil", label: { en: "Opening Soil Tracker", hi: "मिट्टी ट्रैकर खोल रहा हूं", mr: "माती ट्रॅकर उघडत आहे" } },
  { keywords: ["disease", "रोग", "बीमारी", "pests"], route: "/disease", label: { en: "Opening Disease Detection", hi: "रोग पहचान खोल रहा हूं", mr: "रोग ओळख उघडत आहे" } },
  { keywords: ["spray", "spraying", "छिड़काव", "फवारणी"], route: "/spraying", label: { en: "Opening Spraying Advisor", hi: "छिड़काव सलाहकार खोल रहा हूं", mr: "फवारणी सल्लागार उघडत आहे" } },
  { keywords: ["mandi", "price", "market", "भाव", "मंडी", "बाजार"], route: "/news", label: { en: "Opening Mandi Prices", hi: "मंडी भाव खोल रहा हूं", mr: "मंडी भाव उघडत आहे" } },
  { keywords: ["news", "खबर", "बातम्या"], route: "/news", label: { en: "Opening News", hi: "खबरें खोल रहा हूं", mr: "बातम्या उघडत आहे" } },
  { keywords: ["chat", "assistant", "सहायक"], route: "/chat", label: { en: "Opening AI Assistant", hi: "AI सहायक खोल रहा हूं", mr: "AI सहाय्यक उघडत आहे" } },
]

const QUICK_COMMANDS: Record<Language, { label: string; query: string; icon: typeof Power; color: string }[]> = {
  en: [
    { label: "Weather",    query: "What's the weather today?",                         icon: CloudSun,   color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    { label: "Mandi",      query: "Show mandi prices for onion",                       icon: ShoppingCart,color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    { label: "Soil Advice",query: "How to improve my soil health?",                    icon: FlaskConical,color: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
    { label: "Disease",    query: "My wheat leaves are turning yellow, what disease?", icon: Bug,         color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "Irrigation", query: "When should I irrigate my crop?",                   icon: Droplets,    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
    { label: "Motor ON",   query: "Turn on motor",                                     icon: Power,       color: "bg-green-500/15 text-green-400 border-green-500/25" },
    { label: "Motor OFF",  query: "Turn off motor",                                    icon: Power,       color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "PM-KISAN",   query: "PM-KISAN scheme details",                           icon: Globe,       color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  ],
  hi: [
    { label: "मौसम",     query: "आज का मौसम कैसा है?",                                      icon: CloudSun,    color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    { label: "मंडी",     query: "प्याज का मंडी भाव बताओ",                                   icon: ShoppingCart, color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    { label: "मिट्टी",   query: "मेरी मिट्टी कैसे सुधारें?",                                icon: FlaskConical, color: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
    { label: "रोग",      query: "मेरी गेहूं की पत्तियां पीली हो रही हैं, क्या रोग है?",   icon: Bug,          color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "सिंचाई",   query: "फसल में कब पानी दें?",                                    icon: Droplets,     color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
    { label: "मोटर चालू",query: "मोटर चालू करो",                                           icon: Power,        color: "bg-green-500/15 text-green-400 border-green-500/25" },
    { label: "मोटर बंद", query: "मोटर बंद करो",                                            icon: Power,        color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "PM-KISAN", query: "PM-KISAN योजना की जानकारी",                              icon: Globe,        color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  ],
  mr: [
    { label: "हवामान",    query: "आजचे हवामान कसे आहे?",                                   icon: CloudSun,    color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
    { label: "मंडी",      query: "कांद्याचा मंडी भाव सांगा",                               icon: ShoppingCart, color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
    { label: "माती",      query: "माझी माती कशी सुधारायची?",                               icon: FlaskConical, color: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
    { label: "रोग",       query: "माझ्या गव्हाची पाने पिवळी पडत आहेत, काय रोग आहे?",     icon: Bug,          color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "सिंचन",    query: "पिकाला पाणी कधी द्यावे?",                                icon: Droplets,     color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
    { label: "मोटर चालू",query: "मोटर चालू करा",                                           icon: Power,        color: "bg-green-500/15 text-green-400 border-green-500/25" },
    { label: "मोटर बंद", query: "मोटर बंद करा",                                            icon: Power,        color: "bg-red-500/15 text-red-400 border-red-500/25" },
    { label: "PM-KISAN", query: "PM-KISAN योजनेची माहिती",                                icon: Globe,        color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  ],
}

const WAKE_WORDS = ["krishi", "hey krishi", "krishibot", "कृषि", "क्रिषि"]

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null
  const w = window as Record<string, unknown>
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => SpeechRecognition) | null
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[*#_~`>|→•]/g, "")
    .replace(/\[MOTOR_ON\]|\[MOTOR_OFF\]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// KrishiBot Logo Avatar — faithfully recreated from the actual app logo.
// Dark robot (round head, tiny leaf antenna, big glowing eyes, dark body,
// arms holding a seedling) inside a deep-dark orb with bright green glow ring.
// Eyes track the mouse/touch cursor. Reacts to voice state.
// ─────────────────────────────────────────────────────────────────────────────
function KrishiLogoAvatar({
  size = 48,
  voiceState = "idle",
  isTapButton = false,
}: {
  size?: number
  voiceState?: VoiceState
  isTapButton?: boolean
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    const maxD = isTapButton ? 5.5 : 3
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const angle = Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2))
      setEyeOffset({ x: Math.cos(angle) * maxD, y: Math.sin(angle) * maxD })
    }
    const onTouch = (e: TouchEvent) => {
      if (!svgRef.current || !e.touches[0]) return
      const rect = svgRef.current.getBoundingClientRect()
      const angle = Math.atan2(e.touches[0].clientY - (rect.top + rect.height / 2), e.touches[0].clientX - (rect.left + rect.width / 2))
      setEyeOffset({ x: Math.cos(angle) * maxD, y: Math.sin(angle) * maxD })
    }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onTouch, { passive: true })
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("touchmove", onTouch) }
  }, [isTapButton])

  useEffect(() => {
    const schedule = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 110)
      setTimeout(schedule, 2800 + Math.random() * 3200)
    }
    const timer = setTimeout(schedule, 1800)
    return () => clearTimeout(timer)
  }, [])

  // Eye colours matching the logo's bright yellow-green
  const eyeCore = voiceState === "listening" ? "#44ffaa" : voiceState === "speaking" ? "#77ff77" : voiceState === "processing" ? "#ffdd22" : "#eeff44"
  const eyeMid  = voiceState === "listening" ? "#00cc66" : voiceState === "speaking" ? "#22cc44" : voiceState === "processing" ? "#cc8800" : "#99cc00"
  const eyeEdge = voiceState === "listening" ? "#005522" : voiceState === "speaking" ? "#115522" : voiceState === "processing" ? "#553300" : "#336600"

  // Orb glow
  const orbGlowColor = voiceState === "listening" ? "rgba(0,255,120,0.9)" : voiceState === "speaking" ? "rgba(50,230,80,0.85)" : voiceState === "processing" ? "rgba(255,200,0,0.75)" : "rgba(50,200,50,0.6)"
  const ringColor    = voiceState === "listening" ? "#44ffaa" : voiceState === "speaking" ? "#66ee66" : voiceState === "processing" ? "#ffcc22" : "#44cc44"

  // Eye positions (viewBox is 0 0 120 120)
  const LEX = 43, LEY = 53, REX = 77, REY = 53
  const uid = isTapButton ? "tap" : "hdr"

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "block",
        flexShrink: 0,
        filter: `drop-shadow(0 0 ${isTapButton ? (voiceState === "idle" ? "18px" : "32px") : "5px"} ${orbGlowColor})`,
        transition: "filter 0.35s",
      }}
    >
      <defs>
        <clipPath id={`kl-clip-${uid}`}><circle cx="60" cy="60" r="57" /></clipPath>

        {/* Deep dark orb interior */}
        <radialGradient id={`kl-bg-${uid}`} cx="50%" cy="42%" r="62%">
          <stop offset="0%"  stopColor="#0c1f0a" />
          <stop offset="50%" stopColor="#060f05" />
          <stop offset="100%" stopColor="#010501" />
        </radialGradient>

        {/* Bright green glow ring on inside edge */}
        <radialGradient id={`kl-glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="62%"  stopColor="transparent" />
          <stop offset="82%"  stopColor={voiceState === "processing" ? "rgba(255,180,0,0.12)" : "rgba(30,180,30,0.15)"} />
          <stop offset="100%" stopColor={voiceState === "processing" ? "rgba(255,180,0,0.45)" : "rgba(30,200,30,0.5)"} />
        </radialGradient>

        {/* Robot head — deep forest green dome */}
        <radialGradient id={`kl-head-${uid}`} cx="38%" cy="28%" r="68%">
          <stop offset="0%"   stopColor="#3d9020" />
          <stop offset="45%"  stopColor="#1e580c" />
          <stop offset="100%" stopColor="#0b2e05" />
        </radialGradient>

        {/* Robot body — near-black dark grey */}
        <radialGradient id={`kl-body-${uid}`} cx="30%" cy="20%" r="70%">
          <stop offset="0%"   stopColor="#222222" />
          <stop offset="100%" stopColor="#060606" />
        </radialGradient>

        {/* Iris — bright, logo-faithful */}
        <radialGradient id={`kl-iris-${uid}`} cx="38%" cy="32%" r="62%">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="22%"  stopColor={eyeCore} />
          <stop offset="65%"  stopColor={eyeMid} />
          <stop offset="100%" stopColor={eyeEdge} />
        </radialGradient>

        {/* Top leaf */}
        <radialGradient id={`kl-leaf-${uid}`} cx="45%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#aaffaa" />
          <stop offset="100%" stopColor="#33bb00" />
        </radialGradient>

        {/* Seedling leaves */}
        <linearGradient id={`kl-seed-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#77ee22" />
          <stop offset="100%" stopColor="#228800" />
        </linearGradient>
      </defs>

      {/* ── DARK ORB BACKGROUND ── */}
      <circle cx="60" cy="60" r="58" fill={`url(#kl-bg-${uid})`} />

      <g clipPath={`url(#kl-clip-${uid})`}>
        {/* Inner glow ring */}
        <circle cx="60" cy="60" r="57" fill={`url(#kl-glow-${uid})`} />

        {/* Ground shadow */}
        <ellipse cx="60" cy="104" rx="33" ry="5.5" fill="#020a02" opacity="0.85" />

        {/* ── ROBOT ARMS ── */}
        {/* Left arm */}
        <rect x="25" y="77" width="16" height="22" rx="8" fill={`url(#kl-body-${uid})`} />
        {/* Right arm */}
        <rect x="79" y="77" width="16" height="22" rx="8" fill={`url(#kl-body-${uid})`} />
        {/* Left fist */}
        <ellipse cx="33" cy="100" rx="9" ry="6" fill="#080808" />
        {/* Right fist */}
        <ellipse cx="87" cy="100" rx="9" ry="6" fill="#080808" />

        {/* ── BODY TORSO ── */}
        <rect x="42" y="75" width="36" height="28" rx="9" fill={`url(#kl-body-${uid})`} />

        {/* ── SEEDLING IN HANDS ── */}
        {/* Soil mound */}
        <ellipse cx="60" cy="103" rx="17" ry="7"   fill="#3a1c07" />
        <ellipse cx="60" cy="101" rx="13" ry="5"   fill="#5a2c0c" />
        {/* Stem */}
        <rect x="58.5" y="82" width="3" height="20" rx="1.5" fill="#2c9900" />
        {/* Left sprout leaf */}
        <ellipse cx="50" cy="86" rx="10" ry="5.5" fill={`url(#kl-seed-${uid})`} transform="rotate(-38 50 86)" />
        {/* Right sprout leaf */}
        <ellipse cx="70" cy="86" rx="10" ry="5.5" fill={`url(#kl-seed-${uid})`} transform="rotate(38 70 86)" />

        {/* ── NECK ── */}
        <rect x="52" y="63" width="16" height="13" rx="3.5" fill="#0c0c0c" />

        {/* ── HEAD DOME (main green rounded shape) ── */}
        <ellipse cx="60" cy="47" rx="27" ry="29" fill={`url(#kl-head-${uid})`} />
        {/* Head highlight (shine) */}
        <ellipse cx="50" cy="32" rx="7.5" ry="4.5" fill="rgba(255,255,255,0.13)" transform="rotate(-22 50 32)" />
        {/* Secondary shine */}
        <ellipse cx="68" cy="29" rx="4" ry="2.5" fill="rgba(255,255,255,0.07)" transform="rotate(15 68 29)" />

        {/* ── VISOR BAND (dark strip across face) ── */}
        <ellipse cx="60" cy="59" rx="25" ry="7"   fill="#050c05" />
        <ellipse cx="60" cy="58" rx="20" ry="5"   fill="#020702" opacity="0.9" />

        {/* ── ANTENNA + LEAF ON TOP ── */}
        <rect x="58.5" y="16" width="3" height="12" rx="1.5" fill="#228800" />
        <ellipse cx="60" cy="14" rx="8.5" ry="5.5" fill={`url(#kl-leaf-${uid})`} transform="rotate(-10 60 14)" />
        <line x1="56" y1="15" x2="64.5" y2="13" stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" />
        {/* Tiny bud tip */}
        <circle cx="60" cy="9" r="2.5" fill="#88ff44" opacity="0.7" />

        {/* ── EYE WHITES — large, prominent ── */}
        <circle cx={LEX} cy={LEY} r="11" fill="white" />
        <circle cx={REX} cy={REY} r="11" fill="white" />
        {/* Eye ring */}
        <circle cx={LEX} cy={LEY} r="11" fill="none" stroke={eyeMid} strokeWidth="1.5" opacity="0.35" />
        <circle cx={REX} cy={REY} r="11" fill="none" stroke={eyeMid} strokeWidth="1.5" opacity="0.35" />

        {/* ── IRISES + PUPILS (cursor-tracking) ── */}
        {!isBlinking ? (
          <>
            {/* Iris */}
            <circle cx={LEX + eyeOffset.x} cy={LEY + eyeOffset.y} r="7.5"  fill={`url(#kl-iris-${uid})`} />
            <circle cx={REX + eyeOffset.x} cy={REY + eyeOffset.y} r="7.5"  fill={`url(#kl-iris-${uid})`} />
            {/* Dark pupil */}
            <circle cx={LEX + eyeOffset.x} cy={LEY + eyeOffset.y} r="3.2"  fill="#071500" opacity="0.9" />
            <circle cx={REX + eyeOffset.x} cy={REY + eyeOffset.y} r="3.2"  fill="#071500" opacity="0.9" />
            {/* Specular shine */}
            <circle cx={LEX + eyeOffset.x - 2.8} cy={LEY + eyeOffset.y - 2.8} r="2.6" fill="white" opacity="0.92" />
            <circle cx={REX + eyeOffset.x - 2.8} cy={REY + eyeOffset.y - 2.8} r="2.6" fill="white" opacity="0.92" />
            {/* Active glow ring on iris */}
            {voiceState !== "idle" && (
              <>
                <circle cx={LEX + eyeOffset.x} cy={LEY + eyeOffset.y} r="8" fill="none" stroke={eyeCore} strokeWidth="1.5" opacity="0.55" />
                <circle cx={REX + eyeOffset.x} cy={REY + eyeOffset.y} r="8" fill="none" stroke={eyeCore} strokeWidth="1.5" opacity="0.55" />
              </>
            )}
          </>
        ) : (
          /* Blink animation */
          <>
            <ellipse cx={LEX} cy={LEY} rx="7.5" ry="1.4" fill={eyeCore} />
            <ellipse cx={REX} cy={REY} rx="7.5" ry="1.4" fill={eyeCore} />
          </>
        )}

      </g>

      {/* ── OUTER RING — bright green glow border (key logo feature) ── */}
      <circle cx="60" cy="60" r="57.5" fill="none" stroke={ringColor} strokeWidth={isTapButton ? "3.5" : "2.2"} opacity={voiceState === "idle" ? "0.8" : "1"} />
      <circle cx="60" cy="60" r="54"   fill="none" stroke={ringColor} strokeWidth="0.8" opacity="0.25" />

      {/* ── ANIMATED STATE RINGS ── */}
      {voiceState === "listening" && (
        <circle cx="60" cy="60" r="57.5" fill="none" stroke="#44ffaa" strokeWidth="2.5" opacity="0.75" strokeDasharray="12 9">
          <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="2.2s" repeatCount="indefinite" />
        </circle>
      )}
      {voiceState === "processing" && (
        <circle cx="60" cy="60" r="57.5" fill="none" stroke="#ffcc22" strokeWidth="2" opacity="0.55" strokeDasharray="5 16">
          <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
      {voiceState === "speaking" && (
        <circle cx="60" cy="60" r="57.5" fill="none" stroke="#66ff66" strokeWidth="2.5" opacity="0.6">
          <animate attributeName="opacity" values="0.25;0.8;0.25" dur="1.1s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

// Convenience alias (used in header + conversation) — same component, smaller
function KrishiRobotAvatar({ size = 48, voiceState = "idle" }: { size?: number; voiceState?: VoiceState }) {
  return <KrishiLogoAvatar size={size} voiceState={voiceState} isTapButton={false} />
}

// ── Main VoiceAssistant component ─────────────────────────────────────────────
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
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const wakeRecognitionRef = useRef<SpeechRecognition | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
      (pos) => { coordsRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude } }, () => {}
    )
  }, [])
  useEffect(() => { setSpeechSupported(getSpeechRecognition() !== null) }, [])
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [conversation])

  const speakText = useCallback((text: string, id?: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) { resolve(); return }
      try {
        window.speechSynthesis.cancel()
        const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" }
        const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text))
        utterance.lang = langMap[language] ?? "en-IN"
        utterance.rate = 0.95; utterance.pitch = 1.0
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
        setNavMessage(msg); speakText(msg)
        setTimeout(() => { setNavMessage(null); router.push(nav.route) }, 1500)
        return true
      }
    }
    return false
  }, [language, router, speakText])

  const processCommand = useCallback(async (text: string) => {
    setState("processing"); setError(null)
    if (checkNavCommand(text)) { setState("idle"); return }
    const userEntry: ConversationEntry = { id: `user-${Date.now()}`, role: "user", text, timestamp: new Date() }
    setConversation(prev => [...prev, userEntry])
    try {
      abortRef.current = new AbortController()
      const res = await fetch("/api/voice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, language, ...coordsRef.current }),
        signal: abortRef.current.signal,
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const responseText: string = data.text || "Could not process. Please try again."
      if (responseText.includes("[MOTOR_ON]"))  { setIsMotorOn(true);  setLocalMotorOn(true) }
      if (responseText.includes("[MOTOR_OFF]")) { setIsMotorOn(false); setLocalMotorOn(false) }
      const clean = responseText.replace(/\[MOTOR_ON\]/g, "").replace(/\[MOTOR_OFF\]/g, "").trim()
      const aiId = `ai-${Date.now()}`
      setConversation(prev => [...prev, { id: aiId, role: "assistant", text: clean, timestamp: new Date() }])
      setState("speaking")
      await speakText(clean, aiId)
      setState("idle")
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") { setState("idle"); return }
      setError(language === "hi" ? "AI से जुड़ने में समस्या।" : language === "mr" ? "AI शी कनेक्ट करण्यात समस्या." : "Could not connect to AI. Please try again.")
      setState("idle")
    }
  }, [language, setIsMotorOn, speakText, checkNavCommand])

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition(); if (!SR) return
    setState("listening"); setError(null)
    try {
      const recognition = new SR(); recognitionRef.current = recognition
      recognition.lang = ({ en: "en-IN", hi: "hi-IN", mr: "mr-IN" }[language] ?? "en-IN")
      recognition.interimResults = false; recognition.continuous = false; recognition.maxAlternatives = 1
      recognition.onresult = (e: SpeechRecognitionEvent) => {
        const text = e.results[e.results.length - 1][0].transcript
        recognitionRef.current = null
        if (text.trim()) processCommand(text.trim()); else setState("idle")
      }
      recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
        recognitionRef.current = null; setState("idle")
        if (e.error === "not-allowed") setError(language === "hi" ? "माइक्रोफ़ोन की अनुमति नहीं।" : language === "mr" ? "मायक्रोफोन परवानगी नाही." : "Microphone permission denied.")
      }
      recognition.onend = () => { recognitionRef.current = null }
      recognition.start()
    } catch { setState("idle") }
  }, [language, processCommand])

  const startWakeMode = useCallback(() => {
    const SR = getSpeechRecognition(); if (!SR || wakeMode) return
    setWakeMode(true)
    const recognition = new SR(); wakeRecognitionRef.current = recognition
    recognition.lang = ({ en: "en-IN", hi: "hi-IN", mr: "mr-IN" }[language] ?? "en-IN")
    recognition.interimResults = true; recognition.continuous = true
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1]
      const transcript = last[0].transcript.toLowerCase()
      if (WAKE_WORDS.some(w => transcript.includes(w)) && last.isFinal) {
        let query = transcript; WAKE_WORDS.forEach(w => { query = query.replace(w, "").trim() })
        if (query.length > 2) processCommand(query); else startListening()
      }
    }
    recognition.onerror = () => { setWakeMode(false); wakeRecognitionRef.current = null }
    recognition.onend = () => { if (wakeMode) { try { recognition.start() } catch { setWakeMode(false) } } }
    recognition.start()
  }, [language, wakeMode, processCommand, startListening])

  const stopWakeMode = useCallback(() => {
    setWakeMode(false)
    try { wakeRecognitionRef.current?.stop() } catch {}
    wakeRecognitionRef.current = null
  }, [])

  const handleMainButton = useCallback(() => {
    if (state === "listening")  { try { recognitionRef.current?.stop() } catch {}; recognitionRef.current = null; setState("idle") }
    else if (state === "speaking")   { window.speechSynthesis?.cancel(); setState("idle") }
    else if (state === "processing") { abortRef.current?.abort(); setState("idle") }
    else startListening()
  }, [state, startListening])

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim() || state === "processing" || state === "speaking") return
    processCommand(textInput.trim()); setTextInput("")
  }, [textInput, state, processCommand])

  const replayMessage = useCallback((entry: ConversationEntry) => {
    if (speakingId === entry.id) { window.speechSynthesis?.cancel(); setSpeakingId(null); return }
    speakText(entry.text, entry.id)
  }, [speakingId, speakText])

  const lang = (({ en: "en", hi: "hi", mr: "mr" }[language] ?? "en") as Language)
  const commands = QUICK_COMMANDS[lang]

  const stateLabel = ({
    idle:       language === "hi" ? "बोलने के लिए दबाएं"  : language === "mr" ? "बोलण्यासाठी दाबा"  : "Tap to Speak",
    wake:       language === "hi" ? "जाग रहा हूं..."       : language === "mr" ? "जागे आहे..."        : "Wake mode active...",
    listening:  language === "hi" ? "सुन रहा हूं..."       : language === "mr" ? "ऐकतोय..."           : "Listening...",
    processing: language === "hi" ? "सोच रहा हूं..."       : language === "mr" ? "विचार करतोय..."     : "Thinking...",
    speaking:   language === "hi" ? "बोल रहा हूं..."       : language === "mr" ? "बोलतोय..."          : "Speaking...",
  } as Record<VoiceState, string>)[state]

  const labelColor = state === "listening" ? "text-green-400" : state === "speaking" ? "text-emerald-400" : state === "processing" ? "text-yellow-400" : "text-foreground"

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
            isMotorOn ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-secondary text-muted-foreground border-border"
          )}>
            <Power className="w-3 h-3" />
            <span>{language === "hi" ? "मोटर" : language === "mr" ? "मोटर" : "Motor"}</span>
            <span className={cn("w-2 h-2 rounded-full", isMotorOn ? "bg-green-400 animate-pulse" : "bg-muted-foreground/40")} />
          </div>
        </div>

        {/* ── HUGE TAP BUTTON — the KrishiBot logo avatar ── */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative flex items-center justify-center">

            {/* Background pulse rings behind the avatar */}
            {state === "listening" && (
              <>
                <span className="absolute rounded-full bg-green-500/7  animate-ping  [animation-duration:1.3s]" style={{ width: 260, height: 260 }} />
                <span className="absolute rounded-full bg-green-500/4  animate-ping  [animation-duration:2.0s]" style={{ width: 300, height: 300 }} />
                <span className="absolute rounded-full bg-green-500/10 animate-pulse [animation-duration:0.85s]" style={{ width: 250, height: 250 }} />
              </>
            )}
            {state === "speaking" && (
              <>
                <span className="absolute rounded-full bg-emerald-500/8  animate-pulse [animation-duration:0.95s]" style={{ width: 255, height: 255 }} />
                <span className="absolute rounded-full bg-emerald-500/4  animate-pulse [animation-duration:1.5s]"  style={{ width: 285, height: 285 }} />
              </>
            )}
            {state === "processing" && (
              <span className="absolute rounded-full border-2 border-dashed border-yellow-400/20 animate-spin [animation-duration:2.8s]" style={{ width: 248, height: 248 }} />
            )}
            {wakeMode && state === "idle" && (
              <span className="absolute rounded-full border border-primary/20 animate-pulse" style={{ width: 240, height: 240 }} />
            )}

            {/* ── THE AVATAR AS TAP BUTTON ── */}
            <button
              onClick={handleMainButton}
              className="relative z-10 select-none active:scale-95 transition-transform duration-150"
              style={{ transform: state === "listening" ? "scale(1.05)" : state === "speaking" ? "scale(1.03)" : "scale(1)" }}
              aria-label={stateLabel}
            >
              <KrishiLogoAvatar size={220} voiceState={state} isTapButton />

              {/* "Tap" / state pill overlaid at avatar bottom */}
              <div className="absolute bottom-9 left-0 right-0 flex justify-center pointer-events-none">
                <span className={cn(
                  "text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm border",
                  state === "idle"       && "bg-black/45 text-white/95 border-white/15",
                  state === "listening"  && "bg-green-500/40 text-white border-green-400/50 animate-pulse",
                  state === "speaking"   && "bg-emerald-500/35 text-white border-emerald-400/40",
                  state === "processing" && "bg-yellow-500/30 text-white border-yellow-400/40",
                )}>
                  {state === "idle"       ? (language === "hi" ? "दबाएं" : language === "mr" ? "दाबा" : "Tap")
                  : state === "listening" ? (language === "hi" ? "सुन रहा..." : language === "mr" ? "ऐकतोय..." : "Listening...")
                  : state === "speaking"  ? (language === "hi" ? "बोल रहा..." : language === "mr" ? "बोलतोय..." : "Speaking...")
                  :                         (language === "hi" ? "सोच रहा..." : language === "mr" ? "विचारतोय..." : "Thinking...")}
                </span>
              </div>
            </button>
          </div>

          {/* State label */}
          <div className="text-center space-y-1.5">
            <p className={cn("text-lg font-bold", labelColor)}>{stateLabel}</p>
            {(state === "processing" || state === "speaking") && (
              <button
                onClick={() => { abortRef.current?.abort(); window.speechSynthesis?.cancel(); setState("idle") }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive-foreground transition-colors"
              >
                <StopCircle className="w-3.5 h-3.5" />
                {language === "hi" ? "रोकें" : language === "mr" ? "थांबवा" : "Stop"}
              </button>
            )}
          </div>

          {/* Wake word toggle */}
          <button
            onClick={wakeMode ? stopWakeMode : startWakeMode}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all",
              wakeMode ? "bg-primary/20 text-primary border-primary/40 animate-pulse" : "bg-secondary text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", wakeMode ? "bg-primary" : "bg-muted-foreground/40")} />
            {wakeMode
              ? (language === "hi" ? "\"हे कृषि\" सुन रहा हूं" : language === "mr" ? "\"हे कृषि\" ऐकत आहे" : "Listening for \"Hey Krishi\"")
              : (language === "hi" ? "वेक वर्ड चालू करें" : language === "mr" ? "वेक वर्ड सुरू करा" : "Enable Wake Word")}
          </button>
        </div>

        {/* ── Nav toast ── */}
        {navMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Navigation className="w-4 h-4 shrink-0" />{navMessage}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
            <AlertCircle className="w-4 h-4 text-destructive-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-foreground">{error}</p>
          </div>
        )}

        {/* ── Quick Commands ── */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {language === "hi" ? "त्वरित कमांड" : language === "mr" ? "जलद कमांड" : "Quick Commands"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {commands.map((cmd, i) => (
              <button key={i} onClick={() => processCommand(cmd.query)}
                disabled={state === "processing" || state === "speaking"}
                className={cn("flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all disabled:opacity-50 hover:scale-105 active:scale-95", cmd.color)}>
                <cmd.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-tight">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Text Input ── */}
        <div className="flex gap-2">
          <input
            value={textInput} onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
            placeholder={language === "hi" ? "कुछ भी टाइप करें..." : language === "mr" ? "काहीही टाइप करा..." : "Type anything..."}
            disabled={state === "processing" || state === "speaking"}
            className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 disabled:opacity-60"
          />
          <button onClick={handleTextSubmit}
            disabled={!textInput.trim() || state === "processing" || state === "speaking"}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            {language === "hi" ? "पूछो" : language === "mr" ? "विचारा" : "Ask"}
          </button>
        </div>

        {/* ── Conversation ── */}
        {conversation.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {language === "hi" ? "बातचीत" : language === "mr" ? "संभाषण" : "Conversation"}
              </p>
              <button onClick={() => setConversation([])} className="text-[10px] text-muted-foreground hover:text-destructive-foreground transition-colors">
                {language === "hi" ? "साफ करें" : language === "mr" ? "साफ करा" : "Clear"}
              </button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-3" ref={scrollRef}>
              {conversation.map(entry => (
                <div key={entry.id} className={cn("flex", entry.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[88%] flex flex-col gap-1", entry.role === "user" ? "items-end" : "items-start")}>
                    {entry.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <KrishiRobotAvatar size={18} voiceState="idle" />
                        <span className="text-[10px] text-primary font-medium">KrishiBot</span>
                      </div>
                    )}
                    <div className={cn(
                      "rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                      entry.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary border border-border text-foreground rounded-bl-sm"
                    )}>
                      {entry.text}
                    </div>
                    {entry.role === "assistant" && (
                      <button onClick={() => replayMessage(entry)}
                        className={cn(
                          "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all",
                          speakingId === entry.id ? "bg-green-500/20 text-green-400 border-green-500/30 animate-pulse" : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/40"
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

        {/* ── Voice nav tips ── */}
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
                language === "hi" ? '"कृषि, मंडी भाव जाओ"'   : language === "mr" ? '"कृषि, मंडी भाव जा"'   : '"Go to mandi prices"',
                language === "hi" ? '"कृषि, छिड़काव सलाहकार"' : language === "mr" ? '"कृषि, फवारणी सल्लागार"': '"Open spraying advisor"',
              ].map((cmd, i) => (
                <div key={i} className="bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground border border-border">{cmd}</div>
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