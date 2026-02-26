"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Volume2,
  Loader2,
  Leaf,
  Power,
  HelpCircle,
  Search,
  AlertCircle,
  Zap,
  Globe,
  Newspaper,
  Calculator,
  Heart,
  StopCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useApp } from "@/lib/app-context"
import { t, type Language } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type VoiceState = "idle" | "listening" | "processing" | "speaking"

interface ConversationEntry {
  id: string
  role: "user" | "assistant"
  text: string
}

const voiceCommandExamples: Record<Language, { command: string; icon: typeof Power }[]> = {
  en: [
    { command: "Turn on motor", icon: Power },
    { command: "What's the weather today?", icon: Search },
    { command: "Tell me today's top news", icon: Newspaper },
    { command: "Best crop for this season?", icon: Leaf },
    { command: "How does drip irrigation work?", icon: HelpCircle },
    { command: "What is 247 times 89?", icon: Calculator },
    { command: "Health benefits of turmeric", icon: Heart },
    { command: "PM-KISAN scheme details", icon: Globe },
  ],
  hi: [
    { command: "मोटर चालू करो", icon: Power },
    { command: "आज का मौसम कैसा है?", icon: Search },
    { command: "आज की मुख्य खबरें बताओ", icon: Newspaper },
    { command: "इस मौसम के लिए अच्छी फसल?", icon: Leaf },
    { command: "ड्रिप सिंचाई कैसे काम करती है?", icon: HelpCircle },
    { command: "247 गुणा 89 कितना होता है?", icon: Calculator },
    { command: "हल्दी के स्वास्थ्य लाभ", icon: Heart },
    { command: "PM-KISAN योजना की जानकारी", icon: Globe },
  ],
  mr: [
    { command: "मोटर चालू करा", icon: Power },
    { command: "आजचे हवामान कसे आहे?", icon: Search },
    { command: "आजच्या मुख्य बातम्या सांगा", icon: Newspaper },
    { command: "या हंगामासाठी चांगले पीक?", icon: Leaf },
    { command: "ठिबक सिंचन कसे कार्य करते?", icon: HelpCircle },
    { command: "247 गुणिले 89 किती?", icon: Calculator },
    { command: "हळदीचे आरोग्य फायदे", icon: Heart },
    { command: "PM-KISAN योजनेची माहिती", icon: Globe },
  ],
}

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null
  const w = window as Record<string, unknown>
  return (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => SpeechRecognition) | null
}

export function VoiceAssistant() {
  const { language, setIsMotorOn } = useApp()
  const [state, setState] = useState<VoiceState>("idle")
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [speechSupported, setSpeechSupported] = useState<boolean | null>(null)
  const [textInput, setTextInput] = useState("")
  const [pulseSize, setPulseSize] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const animationRef = useRef<number | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSpeechSupported(getSpeechRecognition() !== null)
  }, [])

  // Pulse animation
  useEffect(() => {
    if (state === "listening") {
      const animate = () => {
        setPulseSize(1 + Math.sin(Date.now() / 300) * 0.15)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setPulseSize(1)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [state])

  // Auto-scroll conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversation])

  const speakResponse = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          resolve()
          return
        }
        try {
          window.speechSynthesis.cancel()
          const langMap: Record<string, string> = { en: "en-US", hi: "hi-IN", mr: "mr-IN" }
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = langMap[language]
          utterance.rate = 0.95
          utterance.pitch = 1.0
          utterance.onend = () => resolve()
          utterance.onerror = () => resolve()
          window.speechSynthesis.speak(utterance)
        } catch {
          resolve()
        }
      })
    },
    [language]
  )

  const processCommand = useCallback(
    async (text: string) => {
      setState("processing")
      setError(null)

      // Add user entry
      const userEntry: ConversationEntry = {
        id: `user-${Date.now()}`,
        role: "user",
        text,
      }
      setConversation((prev) => [...prev, userEntry])

      try {
        abortRef.current = new AbortController()

        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, language }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }

        const data = await res.json()
        const responseText: string = data.text || "I could not process that. Please try again."

        // Check for motor commands
        if (responseText.includes("[MOTOR_ON]")) setIsMotorOn(true)
        if (responseText.includes("[MOTOR_OFF]")) setIsMotorOn(false)

        const cleanResponse = responseText
          .replace(/\[MOTOR_ON\]/g, "")
          .replace(/\[MOTOR_OFF\]/g, "")
          .trim()

        const aiEntry: ConversationEntry = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          text: cleanResponse,
        }
        setConversation((prev) => [...prev, aiEntry])

        // Speak the response
        setState("speaking")
        await speakResponse(cleanResponse)
        setState("idle")
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setState("idle")
          return
        }
        const errorMsg =
          language === "hi"
            ? "AI से जुड़ने में समस्या। कृपया पुनः प्रयास करें।"
            : language === "mr"
              ? "AI शी कनेक्ट करण्यात समस्या. कृपया पुन्हा प्रयत्न करा."
              : "Could not connect to AI. Please try again."
        setError(errorMsg)
        setState("idle")
      }
    },
    [language, setIsMotorOn, speakResponse]
  )

  const handleVoiceInput = useCallback(() => {
    if (state === "listening") {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* */ }
        recognitionRef.current = null
      }
      setState("idle")
      return
    }

    if (state === "speaking") {
      window.speechSynthesis?.cancel()
      setState("idle")
      return
    }

    const SpeechRecognitionClass = getSpeechRecognition()
    if (!SpeechRecognitionClass) return

    setState("listening")
    setError(null)

    try {
      const recognition = new SpeechRecognitionClass()
      recognitionRef.current = recognition
      const langMap: Record<string, string> = { en: "en-US", hi: "hi-IN", mr: "mr-IN" }
      recognition.lang = langMap[language]
      recognition.interimResults = false
      recognition.continuous = false
      recognition.maxAlternatives = 1

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results[event.results.length - 1]
        const text = last[0].transcript
        recognitionRef.current = null
        if (text.trim()) {
          processCommand(text.trim())
        } else {
          setState("idle")
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        recognitionRef.current = null
        setState("idle")
        if (event.error === "not-allowed") {
          setError(
            language === "hi"
              ? "माइक्रोफ़ोन की अनुमति नहीं है। नीचे टेक्स्ट इनपुट का उपयोग करें।"
              : language === "mr"
                ? "मायक्रोफोन परवानगी नाही. खाली मजकूर इनपुट वापरा."
                : "Microphone permission denied. Use the text input below."
          )
        }
      }

      recognition.onend = () => {
        recognitionRef.current = null
      }

      recognition.start()
    } catch {
      setState("idle")
    }
  }, [state, language, processCommand])

  const handleTextSubmit = useCallback(() => {
    if (!textInput.trim() || state === "processing" || state === "speaking") return
    processCommand(textInput.trim())
    setTextInput("")
  }, [textInput, state, processCommand])

  const handleExampleClick = useCallback(
    (command: string) => {
      if (state === "processing" || state === "speaking") return
      processCommand(command)
    },
    [state, processCommand]
  )

  const stopAction = useCallback(() => {
    if (state === "speaking") {
      window.speechSynthesis?.cancel()
      setState("idle")
    } else if (state === "processing") {
      abortRef.current?.abort()
      setState("idle")
    }
  }, [state])

  const stateLabels: Record<VoiceState, string> = {
    idle: t("tapToSpeak", language),
    listening: t("listening", language),
    processing: t("processing", language),
    speaking: t("speaking", language),
  }

  const commands = voiceCommandExamples[language]

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4 max-w-lg mx-auto">
      {/* Main Voice Button */}
      <div className="relative flex items-center justify-center">
        {state === "listening" && (
          <>
            <span className="absolute h-40 w-40 rounded-full bg-primary/5 animate-ping [animation-duration:2s]" />
            <span className="absolute h-52 w-52 rounded-full bg-primary/5 animate-ping [animation-duration:3s]" />
          </>
        )}
        {state === "speaking" && (
          <span className="absolute h-40 w-40 rounded-full bg-accent/10 animate-pulse" />
        )}
        {state === "processing" && (
          <span className="absolute h-36 w-36 rounded-full border-2 border-dashed border-muted-foreground/30 animate-spin [animation-duration:3s]" />
        )}

        <button
          onClick={state === "processing" || state === "speaking" ? stopAction : handleVoiceInput}
          className={cn(
            "relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all duration-300 shadow-xl cursor-pointer",
            state === "idle" && "bg-primary hover:scale-105 text-primary-foreground shadow-primary/20",
            state === "listening" && "bg-primary text-primary-foreground shadow-primary/40",
            state === "processing" && "bg-muted text-muted-foreground",
            state === "speaking" && "bg-accent text-accent-foreground shadow-accent/30"
          )}
          style={state === "listening" ? { transform: `scale(${pulseSize})` } : undefined}
          aria-label={stateLabels[state]}
        >
          {state === "processing" ? (
            <Loader2 className="h-9 w-9 animate-spin" />
          ) : state === "speaking" ? (
            <Volume2 className="h-9 w-9" />
          ) : state === "listening" ? (
            <MicOff className="h-9 w-9" />
          ) : (
            <Mic className="h-9 w-9" />
          )}
        </button>
      </div>

      {/* State Label */}
      <div className="text-center space-y-1">
        <div
          className={cn(
            "text-lg font-semibold",
            state === "listening" && "text-primary",
            state === "speaking" && "text-accent",
            state === "processing" && "text-muted-foreground",
            state === "idle" && "text-foreground"
          )}
        >
          {stateLabels[state]}
        </div>
        {state === "idle" && (
          <p className="text-sm text-muted-foreground">
            {language === "hi"
              ? "कुछ भी पूछें - खबरें, ज्ञान, गणित, स्वास्थ्य, खेती..."
              : language === "mr"
                ? "काहीही विचारा - बातम्या, ज्ञान, गणित, आरोग्य, शेती..."
                : "Ask me anything - news, knowledge, math, health, farming..."}
          </p>
        )}
        {(state === "processing" || state === "speaking") && (
          <button onClick={stopAction} className="inline-flex items-center gap-1.5 text-xs text-destructive-foreground hover:underline cursor-pointer">
            <StopCircle className="h-3 w-3" />
            {language === "hi" ? "रोकें" : language === "mr" ? "थांबवा" : "Stop"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 w-full rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertCircle className="h-4 w-4 text-destructive-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-foreground leading-relaxed">{error}</p>
        </div>
      )}

      {/* Speech Not Supported Notice */}
      {speechSupported === false && (
        <div className="flex items-start gap-2 w-full rounded-lg border border-primary/20 bg-primary/5 p-3">
          <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-foreground leading-relaxed">
            {language === "hi"
              ? "वॉइस इनपुट इस ब्राउज़र में उपलब्ध नहीं है। नीचे टाइप करें।"
              : language === "mr"
                ? "व्हॉइस इनपुट या ब्राउझरमध्ये उपलब्ध नाही. खाली टाइप करा."
                : "Voice input unavailable in this browser. Type your command below."}
          </p>
        </div>
      )}

      {/* Text Input */}
      <div className="flex gap-2 w-full">
        <Input
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={
            language === "hi"
              ? "कुछ भी पूछें..."
              : language === "mr"
                ? "काहीही विचारा..."
                : "Ask anything..."
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTextSubmit()
          }}
          disabled={state === "processing" || state === "speaking"}
          className="flex-1"
        />
        <Button
          onClick={handleTextSubmit}
          disabled={!textInput.trim() || state === "processing" || state === "speaking"}
          size="default"
        >
          <Zap className="h-4 w-4 mr-1" />
          {language === "hi" ? "पूछो" : language === "mr" ? "विचारा" : "Ask"}
        </Button>
      </div>

      {/* Conversation History */}
      {conversation.length > 0 && (
        <Card className="w-full border-border bg-card">
          <CardContent className="p-3 max-h-64 overflow-y-auto space-y-3" ref={scrollRef}>
            {conversation.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "rounded-xl p-3 text-sm leading-relaxed",
                  entry.role === "user"
                    ? "bg-primary/10 text-foreground ml-8"
                    : "bg-secondary text-secondary-foreground mr-4"
                )}
              >
                {entry.role === "assistant" && (
                  <div className="text-xs text-primary mb-1 font-medium flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    KrishiBot AI
                  </div>
                )}
                {entry.role === "user" && (
                  <div className="text-xs text-muted-foreground mb-1 font-medium">
                    {language === "hi" ? "आपने कहा:" : language === "mr" ? "तुम्ही म्हणालात:" : "You said:"}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{entry.text}</div>
              </div>
            ))}
            {state === "processing" && (
              <div className="rounded-xl bg-secondary p-3 mr-4">
                <div className="text-xs text-primary mb-1 font-medium flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  KrishiBot AI
                </div>
                <div className="flex gap-1.5 py-1">
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Example Commands */}
      {state === "idle" && conversation.length === 0 && (
        <Card className="w-full border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              {t("voiceCommands", language)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {commands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(cmd.command)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-colors text-left cursor-pointer"
              >
                <cmd.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-foreground">{`"${cmd.command}"`}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
