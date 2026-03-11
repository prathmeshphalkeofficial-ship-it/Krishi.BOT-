"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useApp } from "@/lib/app-context";

const translations = {
  en: {
    title: "Crop Disease Detection",
    subtitle: "Upload a photo of your crop to identify diseases instantly",
    uploadPrompt: "Tap to upload crop photo",
    uploadSub: "or drag & drop — JPG, PNG, WEBP",
    analyze: "Analyze Crop",
    analyzing: "Analyzing...",
    changePhoto: "Change Photo",
    results: "Diagnosis Results",
    affected: "Affected Crop",
    confidence: "Confidence",
    description: "What We See",
    causes: "Causes",
    symptoms: "Symptoms",
    treatment: "Treatment Steps",
    prevention: "Prevention Tips",
    urgency: "Action Required",
    healthy: "Your crop looks healthy! 🌿",
    healthySub: "No disease detected. Keep monitoring regularly.",
    tryAnother: "Analyze Another",
    notPlant: "Please upload a clear image of a crop or plant leaf.",
    error: "Analysis failed. Please try again.",
    tips: "Tips for best results",
    tip1: "Use natural daylight",
    tip2: "Focus on affected leaf",
    tip3: "Avoid blurry photos",
    chatTitle: "Plant Doctor",
    chatGreetingNoResult: "Hi! Upload a crop image and analyze it first — then I can help you understand the disease and treatment. 🌿",
    chatGreetingWithResult: "Analysis done! Ask me anything about this disease, treatment steps, or how to prevent it spreading. 🔬",
    inputPlaceholder: "Ask about the disease...",
    suggestions: ["What causes this?", "How to treat it?", "Will it spread?", "Prevention tips"],
  },
  hi: {
    title: "फसल रोग पहचान",
    subtitle: "फसल की फोटो अपलोड करें और तुरंत रोग जानें",
    uploadPrompt: "फसल की फोटो अपलोड करें",
    uploadSub: "या यहाँ खींचें — JPG, PNG, WEBP",
    analyze: "विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    changePhoto: "फोटो बदलें",
    results: "निदान परिणाम",
    affected: "प्रभावित फसल",
    confidence: "आत्मविश्वास",
    description: "हमने क्या देखा",
    causes: "कारण",
    symptoms: "लक्षण",
    treatment: "उपचार के चरण",
    prevention: "बचाव के उपाय",
    urgency: "आवश्यक कार्रवाई",
    healthy: "आपकी फसल स्वस्थ दिखती है! 🌿",
    healthySub: "कोई रोग नहीं मिला। नियमित निगरानी जारी रखें।",
    tryAnother: "दूसरा विश्लेषण करें",
    notPlant: "कृपया फसल या पत्ती की स्पष्ट तस्वीर अपलोड करें।",
    error: "विश्लेषण विफल। कृपया पुनः प्रयास करें।",
    tips: "सर्वोत्तम परिणाम के लिए सुझाव",
    tip1: "प्राकृतिक रोशनी में फोटो लें",
    tip2: "प्रभावित पत्ती पर फोकस करें",
    tip3: "धुंधली फोटो से बचें",
    chatTitle: "पौधा डॉक्टर",
    chatGreetingNoResult: "नमस्ते! पहले फसल की छवि अपलोड और विश्लेषण करें — फिर मैं रोग और उपचार में मदद करूंगा। 🌿",
    chatGreetingWithResult: "विश्लेषण हो गया! रोग, उपचार या बचाव के बारे में कुछ भी पूछें। 🔬",
    inputPlaceholder: "रोग के बारे में पूछें...",
    suggestions: ["इसका कारण क्या है?", "उपचार कैसे करें?", "क्या यह फैलेगा?", "बचाव के उपाय"],
  },
  mr: {
    title: "पीक रोग ओळख",
    subtitle: "पिकाचा फोटो अपलोड करा आणि रोग त्वरित जाणून घ्या",
    uploadPrompt: "पिकाचा फोटो अपलोड करा",
    uploadSub: "किंवा येथे ड्रॅग करा — JPG, PNG, WEBP",
    analyze: "विश्लेषण करा",
    analyzing: "विश्लेषण होत आहे...",
    changePhoto: "फोटो बदला",
    results: "निदान निकाल",
    affected: "प्रभावित पीक",
    confidence: "विश्वास",
    description: "आम्ही काय पाहिले",
    causes: "कारणे",
    symptoms: "लक्षणे",
    treatment: "उपचार पद्धती",
    prevention: "प्रतिबंधक उपाय",
    urgency: "आवश्यक कृती",
    healthy: "तुमचे पीक निरोगी दिसते! 🌿",
    healthySub: "कोणताही रोग आढळला नाही. नियमित निरीक्षण ठेवा.",
    tryAnother: "आणखी विश्लेषण करा",
    notPlant: "कृपया पीक किंवा पानाचा स्पष्ट फोटो अपलोड करा.",
    error: "विश्लेषण अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    tips: "सर्वोत्तम परिणामांसाठी टिप्स",
    tip1: "नैसर्गिक प्रकाशात फोटो घ्या",
    tip2: "प्रभावित पानावर फोकस करा",
    tip3: "धुक्याचे फोटो टाळा",
    chatTitle: "वनस्पती डॉक्टर",
    chatGreetingNoResult: "नमस्कार! आधी पिकाची प्रतिमा अपलोड करा आणि विश्लेषण करा — मग मी मदत करेन। 🌿",
    chatGreetingWithResult: "विश्लेषण झाले! रोग, उपचार किंवा प्रतिबंधाबद्दल काहीही विचारा। 🔬",
    inputPlaceholder: "रोगाबद्दल विचारा...",
    suggestions: ["याचे कारण काय?", "उपचार कसा करायचा?", "हे पसरेल का?", "प्रतिबंध उपाय"],
  },
};

type DiagnosisResult = {
  disease?: string;
  confidence?: string;
  affected_crop?: string;
  description?: string;
  causes?: string[];
  symptoms?: string[];
  treatment?: string[];
  prevention?: string[];
  urgency?: string;
  is_healthy?: boolean;
  error?: string;
  message?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const urgencyColors: Record<string, string> = {
  Immediate: "text-red-400 bg-red-400/10 border-red-400/30",
  "Within a week": "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Monitor: "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

const confidenceColors: Record<string, string> = {
  High: "text-emerald-400",
  Medium: "text-yellow-400",
  Low: "text-red-400",
};

export default function DiseasePage() {
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;

  // ── Existing state ──────────────────────────────────────────────────────────
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Chat state ──────────────────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // ── Voice state ─────────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Reset greeting when result or language changes
  useEffect(() => {
    setChatMessages([{
      role: "assistant",
      content: result && !result.error ? t.chatGreetingWithResult : t.chatGreetingNoResult,
    }]);
  }, [result, language]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen) setTimeout(() => chatInputRef.current?.focus(), 100);
  }, [chatOpen]);

  // ── Existing handlers ───────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const analyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      fd.append("language", language);
      const res = await fetch("/api/disease", { method: "POST", body: fd });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "server_error", message: t.error });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
  };

  // ── Build disease context for chat ──────────────────────────────────────────
  function buildContext(): string {
    if (!result || result.error || result.is_healthy) return "";
    return `
Disease: ${result.disease || "Unknown"}
Affected Crop: ${result.affected_crop || "Unknown"}
Confidence: ${result.confidence || "—"}
Urgency: ${result.urgency || "—"}
Causes: ${result.causes?.join(", ") || "—"}
Symptoms: ${result.symptoms?.join(", ") || "—"}
Treatment: ${result.treatment?.join("; ") || "—"}
Prevention: ${result.prevention?.join("; ") || "—"}
    `.trim();
  }

  // ── Send chat message ───────────────────────────────────────────────────────
  async function sendChat(text?: string) {
    const message = (text ?? chatInput).trim();
    if (!message || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);
    setChatLoading(true);

    try {
      const ctx = buildContext();
      const langName = language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English";
      const system = ctx
        ? `You are a plant disease expert helping a farmer. The AI already analyzed their crop image:\n\n${ctx}\n\nAnswer based on this. Be concise and practical. Respond in ${langName}.`
        : `You are a plant disease expert helping a farmer. No image analyzed yet. Help with crop diseases, pests, deficiencies. Be concise. Respond in ${langName}.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${system}\n\nFarmer asks: ${message}` }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.text ?? t.error }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: t.error }]);
    } finally {
      setChatLoading(false);
    }
  }

  // ── Strip emojis and symbols for TTS ───────────────────────────────────────
  function cleanForSpeech(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // emojis
      .replace(/[🌿🔬💊🧫🔍🛡️⏰✅⚠️🌾📷☀️🍃]/g, "")
      .replace(/[•*#_~`>|]/g, "")
      .replace(/\n+/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  // ── Speak a message ─────────────────────────────────────────────────────────
  function speakMessage(text: string, index: number) {
    if (!window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }

    const cleaned = cleanForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utteranceRef.current = utterance;

    // Set language for TTS
    utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    window.speechSynthesis.speak(utterance);
  }

  // ── Voice input (mic) ───────────────────────────────────────────────────────
  function toggleVoiceInput() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input not supported on this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      // Auto-send after a short delay
      setTimeout(() => {
        setChatInput("");
        sendChatWithText(transcript);
      }, 400);
    };

    recognition.start();
  }

  // ── sendChat variant that accepts explicit text (needed for voice auto-send) ─
  async function sendChatWithText(message: string) {
    if (!message.trim() || chatLoading) return;
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);
    setChatLoading(true);

    try {
      const ctx = buildContext();
      const langName = language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English";
      const system = ctx
        ? `You are a plant disease expert helping a farmer. The AI already analyzed their crop image:\n\n${ctx}\n\nAnswer based on this. Be concise and practical. Respond in ${langName}.`
        : `You are a plant disease expert helping a farmer. No image analyzed yet. Help with crop diseases, pests, deficiencies. Be concise. Respond in ${langName}.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${system}\n\nFarmer asks: ${message}` }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.text ?? t.error }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: t.error }]);
    } finally {
      setChatLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">

      {/* Header */}
      <div className="relative overflow-hidden border-b border-border bg-card/50">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, var(--color-primary) 0%, transparent 60%), radial-gradient(circle at 80% 20%, #22c55e 0%, transparent 50%)",
          }}
        />
        <div className="relative px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl">
              🔬
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Upload Zone */}
        {!result && (
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden
              ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 bg-card/30"}
              ${!image ? "cursor-pointer" : ""}`}
            onClick={() => !image && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {image ? (
              <div className="relative">
                <img src={image} alt="Crop" className="w-full max-h-72 object-contain bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs border border-white/20 hover:bg-black/80 transition-colors"
                >
                  {t.changePhoto}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mb-4">
                  🌿
                </div>
                <p className="text-foreground font-medium mb-1">{t.uploadPrompt}</p>
                <p className="text-muted-foreground text-sm">{t.uploadSub}</p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {[t.tip1, t.tip2, t.tip3].map((tip, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                      {["☀️", "🍃", "📷"][i]} {tip}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Analyze Button — outside upload zone, no propagation issues */}
        {image && !result && (
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base
              hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60
              flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.analyzing}
              </>
            ) : (
              <>🔍 {t.analyze}</>
            )}
          </button>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {image && (
              <div className="rounded-xl overflow-hidden border border-border h-40">
                <img src={image} alt="Analyzed crop" className="w-full h-full object-cover" />
              </div>
            )}

            {result.error === "not_a_plant" ? (
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5 text-center">
                <div className="text-3xl mb-2">🌾</div>
                <p className="text-yellow-400 font-medium">{t.notPlant}</p>
              </div>
            ) : result.error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-red-400">{result.message || t.error}</p>
              </div>
            ) : result.is_healthy ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-emerald-400 font-bold text-lg mb-1">{t.healthy}</h2>
                <p className="text-muted-foreground text-sm">{t.healthySub}</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t.results}</p>
                      <h2 className="text-xl font-bold text-foreground">{result.disease}</h2>
                      {result.affected_crop && (
                        <p className="text-sm text-primary mt-0.5">🌾 {t.affected}: {result.affected_crop}</p>
                      )}
                    </div>
                    {result.confidence && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${confidenceColors[result.confidence] || "text-muted-foreground"} border-current/30 bg-current/5 shrink-0`}>
                        {t.confidence}: {result.confidence}
                      </span>
                    )}
                  </div>
                  {result.urgency && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${urgencyColors[result.urgency] || "text-muted-foreground bg-secondary border-border"}`}>
                      ⏰ {t.urgency}: {result.urgency}
                    </div>
                  )}
                  {result.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {result.description}
                    </p>
                  )}
                </div>

                {result.causes && result.causes.length > 0 && (
                  <Section icon="🧫" title={t.causes} items={result.causes} color="red" />
                )}
                {result.symptoms && result.symptoms.length > 0 && (
                  <Section icon="🔍" title={t.symptoms} items={result.symptoms} color="yellow" />
                )}
                {result.treatment && result.treatment.length > 0 && (
                  <Section icon="💊" title={t.treatment} items={result.treatment} color="blue" numbered />
                )}
                {result.prevention && result.prevention.length > 0 && (
                  <Section icon="🛡️" title={t.prevention} items={result.prevention} color="green" />
                )}
              </>
            )}

            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary transition-colors"
            >
              📷 {t.tryAnother}
            </button>
          </div>
        )}
      </div>

      {/* ── Floating Chat Button ──────────────────────────────────────────────── */}
      {!chatOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-6 z-50">
          <button
            onClick={() => setChatOpen(true)}
            className="relative w-14 h-14 rounded-full bg-primary text-white shadow-lg
              flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform"
          >
            💬
            {result && !result.error && (
              <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
            )}
          </button>
        </div>
      )}

      {/* ── Chat Popup ────────────────────────────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed bottom-20 right-4 md:bottom-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden
            border border-border bg-card w-[calc(100vw-2rem)] max-w-sm"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">🌿</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{t.chatTitle}</p>
                {result && !result.error && (
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {result.affected_crop && (
                      <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {result.affected_crop}
                      </span>
                    )}
                    {result.disease && (
                      <span className="text-[10px] bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full">
                        {result.disease}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none shrink-0 ml-2"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap
                      ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                      }`}
                  >
                    {msg.content}
                  </div>
                  {/* Listen button — only on AI messages */}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => speakMessage(msg.content, i)}
                      className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all
                        ${speakingIndex === i
                          ? "bg-primary/20 text-primary border-primary/40 animate-pulse"
                          : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/40"
                        }`}
                    >
                      {speakingIndex === i ? "⏹ Stop" : "🔊 Listen"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions */}
          {chatMessages.length <= 1 && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0">
              {t.suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendChat(s)}
                  className="text-[11px] bg-primary/10 text-primary border border-primary/20
                    rounded-full px-2.5 py-1 hover:bg-primary/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-border flex gap-2 shrink-0">
            <button
              onClick={toggleVoiceInput}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm border transition-all
                ${isListening
                  ? "bg-red-500 text-white border-red-500 animate-pulse"
                  : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/40"
                }`}
              title={isListening ? "Stop listening" : "Speak your question"}
            >
              {isListening ? "⏹" : "🎤"}
            </button>
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder={isListening ? (language === "hi" ? "सुन रहा हूं..." : language === "mr" ? "ऐकतोय..." : "Listening...") : t.inputPlaceholder}
              className="flex-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2
                border border-border focus:outline-none focus:border-primary
                placeholder:text-muted-foreground min-w-0"
            />
            <button
              onClick={() => sendChat()}
              disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center
                disabled:opacity-40 hover:opacity-90 transition-opacity shrink-0 text-sm"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section Component (unchanged from original) ───────────────────────────────

function Section({
  icon, title, items, color, numbered,
}: {
  icon: string;
  title: string;
  items: string[];
  color: "red" | "yellow" | "blue" | "green";
  numbered?: boolean;
}) {
  const colors = {
    red: "text-red-400 bg-red-400/10",
    yellow: "text-yellow-400 bg-yellow-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    green: "text-emerald-400 bg-emerald-400/10",
  };
  const dotColors = {
    red: "bg-red-400",
    yellow: "bg-yellow-400",
    blue: "bg-blue-400",
    green: "bg-emerald-400",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${colors[color]}`}>
          {icon}
        </span>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            {numbered ? (
              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${dotColors[color]}`}>
                {i + 1}
              </span>
            ) : (
              <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${dotColors[color]}`} />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}