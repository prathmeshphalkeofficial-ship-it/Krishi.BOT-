"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, Sparkles, Leaf, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useApp } from "@/lib/app-context"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface Message { id: string; role: "user" | "assistant"; text: string }

const speechLangMap = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" }

function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(v => v.lang === lang) ||
    voices.find(v => v.lang.startsWith(lang.split("-")[0])) ||
    voices.find(v => v.lang.startsWith("en")) ||
    null
  )
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[🌾🌧️💧🌱✅❌📊🎯🚜👨‍🌾🌿🌤️☀️🌩️🐛💊🧪📱💰🏛️🔴🟢⚠️]/gu, "")
    .replace(/\*\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function ChatUI() {
  const { language, setIsMotorOn } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (el) el.scrollTop = el.scrollHeight
    }
  }, [messages])

  // Load voices
  useEffect(() => {
    const load = () => setVoicesLoaded(true)
    window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener("voiceschanged", load)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load)
  }, [])

  const speakText = useCallback((text: string, msgId: string) => {
    if (!window.speechSynthesis) return
    if (speakingId === msgId) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }
    window.speechSynthesis.cancel()

    const cleanText = cleanTextForSpeech(text)
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const lang = speechLangMap[language]
    utterance.lang = lang

    // Find best matching voice
    const voice = getBestVoice(lang)
    if (voice) utterance.voice = voice

    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.onstart = () => setSpeakingId(msgId)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    window.speechSynthesis.speak(utterance)
  }, [language, speakingId, voicesLoaded])

  const toggleListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert("Use Chrome browser for voice input!"); return }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const rec = new SR()
    rec.lang = speechLangMap[language]
    rec.continuous = false
    rec.interimResults = false
    rec.onstart = () => setIsListening(true)
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setIsListening(false)
      sendMessage(transcript)
    }
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
  }, [isListening, language])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { id: `u${Date.now()}`, role: "user", text }])
    setLoading(true)
    const aiId = `a${Date.now()}`
    setMessages(prev => [...prev, { id: aiId, role: "assistant", text: "" }])
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, language }),
      })
      const data = await res.json()
      const reply = (data.text || "Sorry, no response.").replace("[MOTOR_ON] ", "").replace("[MOTOR_OFF] ", "")
      if (data.motorCommand === "on") setIsMotorOn(true)
      if (data.motorCommand === "off") setIsMotorOn(false)
      const words = reply.split(" ")
      let acc = ""
      for (let i = 0; i < words.length; i++) {
        acc += (i === 0 ? "" : " ") + words[i]
        const cur = acc
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: cur } : m))
        await new Promise(r => setTimeout(r, 12))
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: "❌ Error. Please try again." } : m))
    }
    setLoading(false)
    inputRef.current?.focus()
  }, [loading, language, setIsMotorOn])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const text = input; setInput(""); sendMessage(text)
  }

  const suggestions = [
    "🏛️ Who is CM of Maharashtra?",
    "🌾 Best crops for this season?",
    "🐛 How to control aphids?",
    "💰 What is PM-KISAN scheme?",
    "💧 Turn on the motor",
    "🌿 What is photosynthesis?",
  ]

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-4 py-3 text-sm">
                  {t("chatWelcome", language)}
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4" /> Suggested Questions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card text-sm text-left hover:bg-secondary transition-colors">
                      <Leaf className="h-3.5 w-3.5 text-primary shrink-0" />{q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md")}>
                {msg.role === "assistant" && msg.text === "" ? (
                  <div className="flex gap-1.5 py-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    {msg.role === "assistant" && msg.text !== "" && (
                      <button onClick={() => speakText(msg.text, msg.id)}
                        className={cn("mt-2 flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors",
                          speakingId === msg.id ? "bg-primary/20 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-primary hover:border-primary/30")}>
                        {speakingId === msg.id ? <><VolumeX className="h-3 w-3" /> Stop</> : <><Volume2 className="h-3 w-3" /> Listen</>}
                      </button>
                    )}
                  </>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-4 bg-card/50">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
          <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"}
            onClick={toggleListening}
            className={cn("h-11 w-11 rounded-xl shrink-0", isListening && "animate-pulse")}>
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={isListening ? (language === "hi" ? "🎤 हिंदी में बोलें..." : language === "mr" ? "🎤 मराठीत बोला..." : "🎤 Speak now...") : t("chatPlaceholder", language)}
            disabled={loading || isListening}
            className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          <Button type="submit" size="icon" disabled={!input.trim() || loading} className="h-11 w-11 rounded-xl shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          🎤 {language === "hi" ? "हिंदी में बोलें" : language === "mr" ? "मराठीत बोला" : "Speak in English"} · 🔊 Tap Listen on any reply
        </p>
      </div>
    </div>
  )
}

export default ChatUI
