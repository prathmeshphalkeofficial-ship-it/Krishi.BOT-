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

// ── KrishiBot Avatar — cursor-tracking glowing eyes ───────────────────────────
function KrishiRobotAvatar({
  size = 72,
  chatOpen = false,
  hasNotification = false,
}: {
  size?: number;
  chatOpen?: boolean;
  hasNotification?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const angle = Math.atan2(
        e.clientY - (rect.top + rect.height / 2),
        e.clientX - (rect.left + rect.width / 2)
      );
      const d = 4.5;
      setEyeOffset({ x: Math.cos(angle) * d, y: Math.sin(angle) * d });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
      setTimeout(blink, 2800 + Math.random() * 3500);
    };
    const t = setTimeout(blink, 2000);
    return () => clearTimeout(t);
  }, []);

  const LEX = 46, LEY = 52;
  const REX = 74, REY = 52;
  const lx = chatOpen ? LEX : LEX + eyeOffset.x;
  const ly = chatOpen ? LEY : LEY + eyeOffset.y;
  const rx = chatOpen ? REX : REX + eyeOffset.x;
  const ry = chatOpen ? REY : REY + eyeOffset.y;

  const borderColor = chatOpen ? "#f97316" : "#22c55e";
  const glowColor = chatOpen ? "rgba(249,115,22,0.75)" : "rgba(34,197,94,0.6)";
  const eyeRingColor = chatOpen ? "#f97316" : "#aaee00";
  const irisColor = chatOpen ? "#ff6600" : "#bbee00";

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
        onMouseLeave={() => { setHovered(false); setEyeOffset({ x: 0, y: 0 }); }}
      >
        <defs>
          <clipPath id="kb-dis-circ"><circle cx="60" cy="60" r="58" /></clipPath>
          <radialGradient id="kb-dis-sky" cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="#f5c842" />
            <stop offset="60%" stopColor="#a8d448" />
            <stop offset="100%" stopColor="#3a7d1e" />
          </radialGradient>
          <radialGradient id="kb-dis-helm" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6dbe2e" />
            <stop offset="70%" stopColor="#2d7a0a" />
            <stop offset="100%" stopColor="#1a4f05" />
          </radialGradient>
          <radialGradient id="kb-dis-body" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3a3a3a" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </radialGradient>
          <radialGradient id="kb-dis-iris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffff66" />
            <stop offset="45%" stopColor={irisColor} />
            <stop offset="100%" stopColor="#336600" />
          </radialGradient>
        </defs>

        <circle cx="60" cy="60" r="59" fill="#1a1a1a" stroke={borderColor} strokeWidth="2.5" />

        <g clipPath="url(#kb-dis-circ)">
          <rect x="0" y="0" width="120" height="120" fill="url(#kb-dis-sky)" />
          <ellipse cx="60" cy="110" rx="70" ry="28" fill="#3a7d1e" />
          <ellipse cx="60" cy="106" rx="56" ry="18" fill="#4a9a24" />
          <ellipse cx="17" cy="79" rx="12" ry="14" fill="#2d6e10" />
          <rect x="14" y="86" width="6" height="10" fill="#5a3010" />
          <ellipse cx="103" cy="79" rx="12" ry="14" fill="#2d6e10" />
          <rect x="100" y="86" width="6" height="10" fill="#5a3010" />
          <path d="M28 44 Q22 38 26 32" stroke="#22c55e" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M24 48 Q14 39 20 28" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
          <path d="M92 44 Q98 38 94 32" stroke="#22c55e" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M96 48 Q106 39 100 28" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
          <rect x="38" y="72" width="44" height="34" rx="10" fill="url(#kb-dis-body)" stroke="#222" strokeWidth="1" />
          <rect x="22" y="74" width="18" height="28" rx="9" fill="url(#kb-dis-body)" stroke="#222" strokeWidth="1" />
          <rect x="80" y="74" width="18" height="28" rx="9" fill="url(#kb-dis-body)" stroke="#222" strokeWidth="1" />
          <ellipse cx="31" cy="104" rx="11" ry="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <ellipse cx="89" cy="104" rx="11" ry="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
          <ellipse cx="60" cy="104" rx="18" ry="8" fill="#6b3a1f" />
          <ellipse cx="60" cy="101" rx="14" ry="5" fill="#7c4a25" />
          <rect x="58.5" y="84" width="3" height="18" rx="1.5" fill="#2d7a0a" />
          <ellipse cx="52" cy="86" rx="8" ry="5" fill="#3aaa18" transform="rotate(-30 52 86)" />
          <ellipse cx="68" cy="86" rx="8" ry="5" fill="#3aaa18" transform="rotate(30 68 86)" />
          <rect x="52" y="60" width="16" height="14" rx="4" fill="#1e1e1e" />
          <ellipse cx="60" cy="50" rx="28" ry="30" fill="url(#kb-dis-helm)" stroke="#1a5c0a" strokeWidth="1.5" />
          <ellipse cx="52" cy="36" rx="8" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-20 52 36)" />
          <ellipse cx="60" cy="60" rx="28" ry="7" fill="#111" stroke="#1a5c0a" strokeWidth="1.2" />
          <ellipse cx="60" cy="59" rx="22" ry="5" fill="#0d1a0d" opacity="0.85" />
          <rect x="58.5" y="20" width="3" height="10" rx="1.5" fill="#2d7a0a" />
          <ellipse cx="60" cy="18" rx="7" ry="5" fill="#4ade80" transform="rotate(-15 60 18)" />

          {/* Eye whites */}
          <circle cx={LEX} cy={LEY} r="9.5" fill="white" />
          <circle cx={REX} cy={REY} r="9.5" fill="white" />
          <circle cx={LEX} cy={LEY} r="9.5" fill="none" stroke={eyeRingColor} strokeWidth="1.8" opacity="0.6" />
          <circle cx={REX} cy={REY} r="9.5" fill="none" stroke={eyeRingColor} strokeWidth="1.8" opacity="0.6" />

          {chatOpen ? (
            <>
              <line x1={LEX - 5} y1={LEY - 5} x2={LEX + 5} y2={LEY + 5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              <line x1={LEX + 5} y1={LEY - 5} x2={LEX - 5} y2={LEY + 5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              <line x1={REX - 5} y1={REY - 5} x2={REX + 5} y2={REY + 5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              <line x1={REX + 5} y1={REY - 5} x2={REX - 5} y2={REY + 5} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : !isBlinking ? (
            <>
              <circle cx={lx} cy={ly} r="6" fill="url(#kb-dis-iris)" />
              <circle cx={rx} cy={ry} r="6" fill="url(#kb-dis-iris)" />
              <circle cx={lx} cy={ly} r="2.5" fill="#1a3300" opacity="0.75" />
              <circle cx={rx} cy={ry} r="2.5" fill="#1a3300" opacity="0.75" />
              <circle cx={lx - 2.5} cy={ly - 2.5} r="2.2" fill="white" opacity="0.85" />
              <circle cx={rx - 2.5} cy={ry - 2.5} r="2.2" fill="white" opacity="0.85" />
            </>
          ) : (
            <>
              <ellipse cx={LEX} cy={LEY} rx="6" ry="1.2" fill="#ccee00" />
              <ellipse cx={REX} cy={REY} rx="6" ry="1.2" fill="#ccee00" />
            </>
          )}
        </g>

        <path d="M10 112 Q40 100 60 108 Q80 116 110 104" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M10 115 Q40 103 60 111 Q80 119 110 107" stroke="#22c55e" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
        <circle cx="60" cy="60" r="58" fill="none" stroke={borderColor} strokeWidth="2" opacity="0.85" />
        <circle cx="60" cy="60" r="55" fill="none" stroke="#4ade80" strokeWidth="0.8" opacity="0.35" />
      </svg>

      {hasNotification && !chatOpen && (
        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-background animate-pulse" />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DiseasePage() {
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setChatMessages([{
      role: "assistant",
      content: result && !result.error ? t.chatGreetingWithResult : t.chatGreetingNoResult,
    }]);
  }, [result, language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (chatOpen) setTimeout(() => chatInputRef.current?.focus(), 100);
  }, [chatOpen]);

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

  async function sendChat(text?: string) {
    const message = (text ?? chatInput).trim();
    if (!message || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);
    setChatLoading(true);
    try {
      const ctx = buildContext();
      const res = await fetch("/api/chat-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, imageBase64: image ?? "", language, context: ctx }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.text ?? t.error }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: t.error }]);
    } finally {
      setChatLoading(false);
    }
  }

  function cleanForSpeech(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/[🌿🔬💊🧫🔍🛡️⏰✅⚠️🌾📷☀️🍃]/g, "")
      .replace(/[•*#_~`>|]/g, "")
      .replace(/\n+/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function speakMessage(text: string, index: number) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingIndex === index) { setSpeakingIndex(null); return; }
    const cleaned = cleanForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utteranceRef.current = utterance;
    utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
  }

  function toggleVoiceInput() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input not supported on this browser. Try Chrome."); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
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
      setTimeout(() => { setChatInput(""); sendChatWithText(transcript); }, 400);
    };
    recognition.start();
  }

  async function sendChatWithText(message: string) {
    if (!message.trim() || chatLoading) return;
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);
    setChatLoading(true);
    try {
      const ctx = buildContext();
      const res = await fetch("/api/chat-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, imageBase64: image ?? "", language, context: ctx }),
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

        {/* Analyze Button */}
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

      {/* ── Floating KrishiBot Avatar (replaces old 💬 button) ── */}
      <div className="fixed bottom-20 right-4 md:bottom-6 z-50">
        <button
          onClick={() => setChatOpen(o => !o)}
          className="transition-all active:scale-95"
          aria-label="Open Plant Doctor chat"
        >
          <KrishiRobotAvatar
            size={72}
            chatOpen={chatOpen}
            hasNotification={!chatOpen && result != null && !result.error}
          />
        </button>
      </div>

      {/* ── Chat Popup ─────────────────────────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed bottom-36 right-4 md:bottom-24 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden
            border border-border bg-card w-[calc(100vw-2rem)] max-w-sm"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-primary/10 shrink-0">
            <KrishiRobotAvatar size={32} chatOpen={false} />
            <div className="flex-1 min-w-0">
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
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <KrishiRobotAvatar size={18} chatOpen={false} />
                      <span className="text-[10px] text-primary font-medium">KrishiBot</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap
                      ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                      }`}
                  >
                    {msg.content}
                  </div>
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

// ── Section Component ─────────────────────────────────────────────────────────
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