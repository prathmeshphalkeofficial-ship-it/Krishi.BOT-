"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/app-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiseaseResult {
  disease: string;
  confidence: string;
  crop: string;
  causes: string[];
  symptoms: string[];
  treatment: string[];
  urgency: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── i18n strings ─────────────────────────────────────────────────────────────

const t = {
  en: {
    title: "Crop Disease Detection",
    subtitle: "Upload a photo of your crop to detect diseases, pests, or deficiencies",
    uploadLabel: "Tap or drag to upload crop image",
    uploadHint: "Supports JPG, PNG, WEBP",
    analyze: "Analyze Image",
    analyzing: "Analyzing...",
    disease: "Disease Detected",
    confidence: "Confidence",
    crop: "Crop",
    causes: "Causes",
    symptoms: "Symptoms",
    treatment: "Treatment",
    urgency: "Urgency",
    chatTitle: "Plant Doctor Chat",
    chatGreetingNoResult: "Hi! Upload a crop image first, then I can help you understand the disease and treatment. 🌿",
    chatGreetingWithResult: "I've analyzed your crop! Ask me anything about the disease, treatment, or prevention. 🔬",
    inputPlaceholder: "Ask about the disease...",
    suggestions: ["What causes this?", "How to treat it?", "Is it spreading?", "Prevention tips"],
    typing: "Thinking...",
    contextLabel: "Disease Context",
  },
  hi: {
    title: "फसल रोग पहचान",
    subtitle: "अपनी फसल की फोटो अपलोड करें — रोग, कीट या कमी का पता लगाएं",
    uploadLabel: "फसल की छवि अपलोड करें",
    uploadHint: "JPG, PNG, WEBP समर्थित",
    analyze: "विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    disease: "रोग की पहचान",
    confidence: "विश्वसनीयता",
    crop: "फसल",
    causes: "कारण",
    symptoms: "लक्षण",
    treatment: "उपचार",
    urgency: "तात्कालिकता",
    chatTitle: "पौधा डॉक्टर चैट",
    chatGreetingNoResult: "नमस्ते! पहले फसल की छवि अपलोड करें, फिर मैं रोग और उपचार में मदद करूंगा। 🌿",
    chatGreetingWithResult: "आपकी फसल का विश्लेषण हो गया! रोग, उपचार या बचाव के बारे में पूछें। 🔬",
    inputPlaceholder: "रोग के बारे में पूछें...",
    suggestions: ["इसका कारण क्या है?", "उपचार कैसे करें?", "क्या फैल रहा है?", "बचाव के उपाय"],
    typing: "सोच रहा हूं...",
    contextLabel: "रोग संदर्भ",
  },
  mr: {
    title: "पीक रोग ओळख",
    subtitle: "पिकाचा फोटो अपलोड करा — रोग, कीड किंवा कमतरता ओळखा",
    uploadLabel: "पिकाची प्रतिमा अपलोड करा",
    uploadHint: "JPG, PNG, WEBP समर्थित",
    analyze: "विश्लेषण करा",
    analyzing: "विश्लेषण होत आहे...",
    disease: "रोग आढळला",
    confidence: "विश्वासार्हता",
    crop: "पीक",
    causes: "कारणे",
    symptoms: "लक्षणे",
    treatment: "उपचार",
    urgency: "तातडी",
    chatTitle: "वनस्पती डॉक्टर चॅट",
    chatGreetingNoResult: "नमस्कार! आधी पिकाची प्रतिमा अपलोड करा, मग मी रोग आणि उपचारात मदत करेन। 🌿",
    chatGreetingWithResult: "तुमच्या पिकाचे विश्लेषण झाले! रोग, उपचार किंवा प्रतिबंधाबद्दल विचारा। 🔬",
    inputPlaceholder: "रोगाबद्दल विचारा...",
    suggestions: ["याचे कारण काय?", "उपचार कसा करायचा?", "हे पसरत आहे का?", "प्रतिबंध उपाय"],
    typing: "विचार करतोय...",
    contextLabel: "रोग संदर्भ",
  },
};

// ─── Urgency colors ───────────────────────────────────────────────────────────

function urgencyColor(urgency: string) {
  const u = urgency?.toLowerCase() ?? "";
  if (u.includes("high") || u.includes("urgent") || u.includes("उच्च") || u.includes("तातडी"))
    return "text-red-400 bg-red-400/10 border-red-400/30";
  if (u.includes("medium") || u.includes("moderate") || u.includes("मध्यम"))
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  return "text-green-400 bg-green-400/10 border-green-400/30";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DiseasePage() {
  const { language } = useApp();
  const lang = (language as keyof typeof t) in t ? (language as keyof typeof t) : "en";
  const strings = t[lang];

  // Upload state
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // ── Init chat greeting ──────────────────────────────────────────────────────
  useEffect(() => {
    setChatMessages([
      {
        role: "assistant",
        content: result ? strings.chatGreetingWithResult : strings.chatGreetingNoResult,
      },
    ]);
  }, [result, lang]);

  // ── Auto-scroll chat ────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // ── Focus input when chat opens ─────────────────────────────────────────────
  useEffect(() => {
    if (chatOpen) setTimeout(() => chatInputRef.current?.focus(), 100);
  }, [chatOpen]);

  // ── Image upload ────────────────────────────────────────────────────────────
  function handleFile(file: File) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── Analyze image ───────────────────────────────────────────────────────────
  async function analyzeImage() {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(",")[1];
      const res = await fetch("/api/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          prompt: "Analyze this crop image for diseases, pests, or deficiencies.",
          mode: "crop",
          language: lang,
        }),
      });
      const data = await res.json();
      // Parse result — API returns { result: "..." } as JSON string or object
      let parsed: DiseaseResult;
      if (typeof data.result === "string") {
        try {
          parsed = JSON.parse(data.result);
        } catch {
          // Fallback: treat as plain text disease description
          parsed = {
            disease: data.result,
            confidence: "—",
            crop: "—",
            causes: [],
            symptoms: [],
            treatment: [data.result],
            urgency: "medium",
          };
        }
      } else {
        parsed = data.result;
      }
      setResult(parsed);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // ── Build disease context for chat ──────────────────────────────────────────
  function buildDiseaseContext(): string {
    if (!result) return "";
    return `
Disease Analysis Results:
- Detected Disease: ${result.disease}
- Crop: ${result.crop}
- Confidence: ${result.confidence}
- Urgency: ${result.urgency}
- Causes: ${result.causes?.join(", ") || "—"}
- Symptoms: ${result.symptoms?.join(", ") || "—"}
- Treatment: ${result.treatment?.join("; ") || "—"}
    `.trim();
  }

  // ── Send chat message ────────────────────────────────────────────────────────
  async function sendChat(text?: string) {
    const message = (text ?? chatInput).trim();
    if (!message || chatLoading) return;
    setChatInput("");

    const userMsg: ChatMessage = { role: "user", content: message };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const diseaseContext = buildDiseaseContext();
      const systemPrompt = diseaseContext
        ? `You are a plant disease expert and farming advisor. The farmer has uploaded a crop image and the AI analysis result is:\n\n${diseaseContext}\n\nAnswer all questions based on this analysis. Be concise, practical, and farmer-friendly. Respond in ${lang === "hi" ? "Hindi" : lang === "mr" ? "Marathi" : "English"}.`
        : `You are a plant disease expert and farming advisor. Help the farmer identify diseases, pests, deficiencies in their crops. Give practical advice. Respond in ${lang === "hi" ? "Hindi" : lang === "mr" ? "Marathi" : "English"}.`;

      const fullPrompt = `${systemPrompt}\n\nFarmer's question: ${message}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await res.json();
      const reply = data.text ?? "Sorry, no response.";
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{strings.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{strings.subtitle}</p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
            ${dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-card"}
            ${image ? "p-2" : "p-10"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !image && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {image ? (
            <div className="relative">
              <img src={image} alt="crop" className="w-full max-h-72 object-cover rounded-lg" />
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full px-3 py-1 text-xs hover:bg-black/80"
                onClick={(e) => { e.stopPropagation(); setImage(null); setImageFile(null); setResult(null); }}
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-4xl">🌿</div>
              <p className="text-foreground font-medium">{strings.uploadLabel}</p>
              <p className="text-xs text-muted-foreground">{strings.uploadHint}</p>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {image && (
          <button
            onClick={analyzeImage}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm
              disabled:opacity-60 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> {strings.analyzing}
              </>
            ) : (
              <>🔬 {strings.analyze}</>
            )}
          </button>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">

            {/* Disease + Urgency */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{strings.disease}</p>
                  <p className="text-lg font-bold text-foreground">{result.disease}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${urgencyColor(result.urgency)}`}>
                  {result.urgency}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{strings.crop}: </span>
                  <span className="text-foreground font-medium">{result.crop}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{strings.confidence}: </span>
                  <span className="text-foreground font-medium">{result.confidence}</span>
                </div>
              </div>
            </div>

            {/* Causes */}
            {result.causes?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">{strings.causes}</p>
                <ul className="space-y-1">
                  {result.causes.map((c, i) => (
                    <li key={i} className="text-sm text-foreground flex gap-2">
                      <span className="text-orange-400">⚠️</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Symptoms */}
            {result.symptoms?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">{strings.symptoms}</p>
                <ul className="space-y-1">
                  {result.symptoms.map((s, i) => (
                    <li key={i} className="text-sm text-foreground flex gap-2">
                      <span className="text-yellow-400">🔍</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Treatment */}
            {result.treatment?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">{strings.treatment}</p>
                <ul className="space-y-1">
                  {result.treatment.map((tr, i) => (
                    <li key={i} className="text-sm text-foreground flex gap-2">
                      <span className="text-green-400">💊</span> {tr}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Floating Chat Button ──────────────────────────────────────────────── */}
      <div className="fixed bottom-20 right-4 md:bottom-6 z-50">
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="relative w-14 h-14 rounded-full bg-primary text-white shadow-lg
              flex items-center justify-center text-2xl hover:scale-110 transition-transform"
            title={strings.chatTitle}
          >
            💬
            {result && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
            )}
          </button>
        )}
      </div>

      {/* ── Chat Popup ────────────────────────────────────────────────────────── */}
      {chatOpen && (
        <div className="fixed bottom-20 right-4 md:bottom-6 z-50 w-[calc(100vw-2rem)] max-w-sm
          bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌿</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{strings.chatTitle}</p>
                {result && (
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {result.crop}
                    </span>
                    <span className="text-[10px] bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full">
                      {result.disease}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-2 flex gap-1 items-center">
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
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
              {strings.suggestions.map((s, i) => (
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
          <div className="px-3 pb-3 pt-1 border-t border-border flex gap-2">
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder={strings.inputPlaceholder}
              className="flex-1 bg-secondary text-foreground text-sm rounded-xl px-3 py-2
                border border-border focus:outline-none focus:border-primary placeholder:text-muted-foreground"
            />
            <button
              onClick={() => sendChat()}
              disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center
                disabled:opacity-40 hover:opacity-90 transition-opacity text-sm"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}