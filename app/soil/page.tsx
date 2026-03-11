"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/app-context";

// ── i18n ──────────────────────────────────────────────────────────────────────
const T = {
  en: {
    title: "🌱 Soil Health Tracker",
    subtitle: "Enter your soil values for AI-powered analysis",
    ph: "pH Level", nitrogen: "Nitrogen (kg/ha)", phosphorus: "Phosphorus (kg/ha)",
    potassium: "Potassium (kg/ha)", organicMatter: "Organic Matter (%)", moisture: "Moisture (%)",
    soilType: "Soil Type", crop: "Intended Crop",
    analyze: "Analyze Soil", analyzing: "Analyzing…",
    score: "Soil Health Score",
    params: "Nutrient Meter", warnings: "Warnings", recommendations: "Recommendations",
    fertilizers: "Fertilizer Plan", amendments: "Soil Amendments", suitableCrops: "Suitable Crops",
    yieldPrediction: "Estimated Yield", totalCost: "Total Cost / Hectare",
    fertilizer: "Fertilizer", dose: "Dose", cost: "Cost (₹)", timing: "Application Timing",
    perHa: "tons / hectare",
    irrigation: "Irrigation Advice", nextIrrigation: "Next Irrigation In",
    waterAmount: "Water Amount", days: "days",
    timeline: "Soil Improvement Timeline", year: "Year", score_lbl: "Score",
    slightlyLow: "Slightly Low", low: "Low", high: "High", ideal: "Ideal",
    good: "Good", excellent: "Excellent", poor: "Poor", moderate: "Moderate",
    slightlyHigh: "Slightly High",
    chatTitle: "Ask about your soil",
    chatPlaceholder: "Ask a follow-up question…",
    chatSend: "Send", chatThinking: "Thinking…",
    chatHint: "Ask me anything about your soil results",
    chatSuggestions: ["How can I improve my soil score?", "Which fertilizer is best for my crop?", "When should I apply compost?", "Is my pH safe for wheat?"],
    listening: "Listening...",
  },
  hi: {
    title: "🌱 मिट्टी स्वास्थ्य ट्रैकर",
    subtitle: "AI विश्लेषण के लिए मिट्टी के मान दर्ज करें",
    ph: "pH स्तर", nitrogen: "नाइट्रोजन (kg/ha)", phosphorus: "फास्फोरस (kg/ha)",
    potassium: "पोटेशियम (kg/ha)", organicMatter: "जैविक पदार्थ (%)", moisture: "नमी (%)",
    soilType: "मिट्टी का प्रकार", crop: "इच्छित फसल",
    analyze: "मिट्टी का विश्लेषण करें", analyzing: "विश्लेषण हो रहा है…",
    score: "मिट्टी स्वास्थ्य स्कोर",
    params: "पोषक मीटर", warnings: "चेतावनियाँ", recommendations: "सिफारिशें",
    fertilizers: "उर्वरक योजना", amendments: "मिट्टी सुधार", suitableCrops: "उपयुक्त फसलें",
    yieldPrediction: "अनुमानित उपज", totalCost: "कुल लागत / हेक्टेयर",
    fertilizer: "उर्वरक", dose: "खुराक", cost: "लागत (₹)", timing: "उपयोग समय",
    perHa: "टन / हेक्टेयर",
    irrigation: "सिंचाई सलाह", nextIrrigation: "अगली सिंचाई",
    waterAmount: "पानी की मात्रा", days: "दिन",
    timeline: "मिट्टी सुधार समयरेखा", year: "वर्ष", score_lbl: "स्कोर",
    slightlyLow: "थोड़ा कम", low: "कम", high: "अधिक", ideal: "आदर्श",
    good: "अच्छा", excellent: "उत्कृष्ट", poor: "खराब", moderate: "मध्यम",
    slightlyHigh: "थोड़ा अधिक",
    chatTitle: "अपनी मिट्टी के बारे में पूछें",
    chatPlaceholder: "अनुवर्ती प्रश्न पूछें…",
    chatSend: "भेजें", chatThinking: "सोच रहा है…",
    chatHint: "अपने मिट्टी परिणामों के बारे में कुछ भी पूछें",
    chatSuggestions: ["मेरा स्कोर कैसे सुधारें?", "मेरी फसल के लिए सबसे अच्छा खाद?", "कम्पोस्ट कब डालें?", "गेहूँ के लिए pH ठीक है?"],
    listening: "सुन रहा हूं...",
  },
  mr: {
    title: "🌱 माती आरोग्य ट्रॅकर",
    subtitle: "AI विश्लेषणासाठी मातीची मूल्ये प्रविष्ट करा",
    ph: "pH पातळी", nitrogen: "नायट्रोजन (kg/ha)", phosphorus: "फॉस्फरस (kg/ha)",
    potassium: "पोटॅशियम (kg/ha)", organicMatter: "सेंद्रिय पदार्थ (%)", moisture: "ओलावा (%)",
    soilType: "मातीचा प्रकार", crop: "इच्छित पीक",
    analyze: "माती विश्लेषण करा", analyzing: "विश्लेषण होत आहे…",
    score: "माती आरोग्य गुण",
    params: "पोषक मीटर", warnings: "इशारे", recommendations: "शिफारसी",
    fertilizers: "खत योजना", amendments: "माती सुधारणा", suitableCrops: "योग्य पिके",
    yieldPrediction: "अंदाजे उत्पन्न", totalCost: "एकूण खर्च / हेक्टर",
    fertilizer: "खत", dose: "डोस", cost: "खर्च (₹)", timing: "वापराची वेळ",
    perHa: "टन / हेक्टर",
    irrigation: "सिंचन सल्ला", nextIrrigation: "पुढील सिंचन",
    waterAmount: "पाण्याचे प्रमाण", days: "दिवस",
    timeline: "माती सुधारणा टाइमलाइन", year: "वर्ष", score_lbl: "गुण",
    slightlyLow: "किंचित कमी", low: "कमी", high: "जास्त", ideal: "आदर्श",
    good: "चांगले", excellent: "उत्कृष्ट", poor: "खराब", moderate: "मध्यम",
    slightlyHigh: "किंचित जास्त",
    chatTitle: "तुमच्या मातीबद्दल विचारा",
    chatPlaceholder: "पुढील प्रश्न विचारा…",
    chatSend: "पाठवा", chatThinking: "विचार करत आहे…",
    chatHint: "तुमच्या माती निकालांबद्दल काहीही विचारा",
    chatSuggestions: ["माझा स्कोर कसा सुधारावा?", "माझ्या पिकासाठी सर्वोत्तम खत?", "कंपोस्ट केव्हा द्यावे?", "गव्हासाठी pH योग्य आहे का?"],
    listening: "ऐकतोय...",
  },
};

// ── Nutrient ranges ────────────────────────────────────────────────────────────
const RANGES: Record<string, { critLow: number; slightLow: number; idealHigh: number; slightHigh: number; max: number }> = {
  ph:            { critLow: 5.5, slightLow: 6.0, idealHigh: 7.5, slightHigh: 8.0, max: 14  },
  nitrogen:      { critLow: 150, slightLow: 220, idealHigh: 450, slightHigh: 550, max: 700 },
  phosphorus:    { critLow: 8,   slightLow: 15,  idealHigh: 40,  slightHigh: 55,  max: 80  },
  potassium:     { critLow: 80,  slightLow: 150, idealHigh: 350, slightHigh: 450, max: 600 },
  organicMatter: { critLow: 0.5, slightLow: 1.5, idealHigh: 4.0, slightHigh: 5.5, max: 8   },
  moisture:      { critLow: 15,  slightLow: 30,  idealHigh: 65,  slightHigh: 80,  max: 100 },
};

function getNutrientStatus(key: string, value: number) {
  const r = RANGES[key];
  if (!r) return { label: "—", color: "text-gray-400", bar: "bg-gray-400", dot: "🔵", pct: 50 };
  const pct = Math.min(100, Math.max(2, (value / r.max) * 100));
  if (value < r.critLow)     return { label: "low",          color: "text-red-400",    bar: "bg-red-400",    dot: "🔴", pct };
  if (value < r.slightLow)   return { label: "slightlyLow",  color: "text-yellow-400", bar: "bg-yellow-400", dot: "🟡", pct };
  if (value <= r.idealHigh)  return { label: "ideal",        color: "text-green-400",  bar: "bg-green-400",  dot: "🟢", pct };
  if (value <= r.slightHigh) return { label: "slightlyHigh", color: "text-yellow-400", bar: "bg-yellow-400", dot: "🟡", pct };
  return                            { label: "high",         color: "text-orange-400", bar: "bg-orange-400", dot: "🟠", pct };
}

function scoreMeta(score: number) {
  if (score >= 90) return { label: "excellent", ring: "border-emerald-400", text: "text-emerald-400", bar: "bg-emerald-400" };
  if (score >= 75) return { label: "good",      ring: "border-green-400",   text: "text-green-400",  bar: "bg-green-400"  };
  if (score >= 60) return { label: "moderate",  ring: "border-yellow-400",  text: "text-yellow-400", bar: "bg-yellow-400" };
  return                  { label: "poor",      ring: "border-red-400",     text: "text-red-400",    bar: "bg-red-400"    };
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface FertilizerRec {
  name: string; dose: string; reason: string;
  costPerDose?: number; timing?: string[];
}
interface IrrigationAdvice { nextInDays: number; waterAmountMm: number; note: string }
interface TimelineYear { year: number; score: number; note: string }
interface YieldPrediction { crop: string; minYield: string; maxYield: string; unit: string }
interface SoilResult {
  score: number; overallHealth: string;
  warnings: string[]; recommendations: string[];
  fertilizers: FertilizerRec[]; amendments: string[]; suitableCrops: string[];
  yieldPrediction?: YieldPrediction;
  irrigationAdvice?: IrrigationAdvice;
  improvementTimeline?: TimelineYear[];
}

const FERT_PRICES: Record<string, number> = { DAP: 1350, MOP: 850, UREA: 266, SSP: 400, NPK: 1100 };
function getFertCost(f: FertilizerRec): number {
  if (f.costPerDose) return f.costPerDose;
  for (const [k, price] of Object.entries(FERT_PRICES))
    if (f.name.toUpperCase().includes(k)) return price;
  return 0;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SoilPage() {
  const { language } = useApp();
  const t = T[language as keyof typeof T] ?? T.en;

  const [form, setForm] = useState({
    ph: "6.8", nitrogen: "310", phosphorus: "18", potassium: "240",
    organicMatter: "2.8", moisture: "52", soilType: "Loamy", crop: "Wheat",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [error, setError] = useState("");

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Voice state ────────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Strip emojis/symbols for clean TTS ────────────────────────────────────
  function cleanForSpeech(text: string): string {
    return text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/[🌱🌿💧📅📈✅⚠️🪨🌻🌾💡→•]/g, "")
      .replace(/[*#_~`>|]/g, "")
      .replace(/\n+/g, ". ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  // ── Speak an AI message ────────────────────────────────────────────────────
  function speakMessage(text: string, index: number) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Tap again to stop
    if (speakingIndex === index) { setSpeakingIndex(null); return; }
    const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text));
    utteranceRef.current = utterance;
    utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utterance);
  }

  // ── Voice input (mic) ──────────────────────────────────────────────────────
  function toggleVoiceInput() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported. Please use Chrome."); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput("");
      sendChatWithText(transcript);
    };
    recognition.start();
  }

  // ── Build soil system prompt ───────────────────────────────────────────────
  const buildSoilSystemPrompt = () => {
    const langMap: Record<string, string> = { en: "English", hi: "Hindi", mr: "Marathi" };
    let sys = `You are KrishiBot, an expert Indian soil scientist and farming advisor.
The farmer has already run a soil analysis. Use this data for ALL answers.
Always respond in ${langMap[language] ?? "English"}.
Be practical, specific, use Indian farming context and local product names.
Keep answers concise (under 200 words). Use numbered steps when helpful.

FARMER'S SOIL DATA:
pH: ${form.ph}
Nitrogen: ${form.nitrogen} kg/ha
Phosphorus: ${form.phosphorus} kg/ha
Potassium: ${form.potassium} kg/ha
Organic Matter: ${form.organicMatter}%
Moisture: ${form.moisture}%
Soil Type: ${form.soilType}
Crop: ${form.crop}`;
    if (result) {
      sys += `\n\nANALYSIS RESULTS:
Score: ${result.score}/100 (${result.overallHealth})
Warnings: ${result.warnings.join("; ")}
Recommendations: ${result.recommendations.join("; ")}
Suitable Crops: ${result.suitableCrops.join(", ")}`;
    }
    return sys;
  };

  // ── Shared send function (used by text input + voice) ─────────────────────
  const sendChatWithText = async (text: string) => {
    if (!text.trim() || chatLoading) return;
    setChatMessages(prev => [...prev, { role: "user", text }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildSoilSystemPrompt() + "\n\nFarmer question: " + text,
          language,
        }),
      });
      const data = await res.json();
      const reply = data.text ?? data.reply ?? data.message ?? "No response.";
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Send from text input box ───────────────────────────────────────────────
  const sendChat = async (overrideText?: string) => {
    const text = (overrideText ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput("");
    await sendChatWithText(text);
  };

  const analyze = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/soil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const paramRows = [
    { key: "ph",            label: t.ph,           value: form.ph,            unit: ""       },
    { key: "nitrogen",      label: t.nitrogen,      value: form.nitrogen,      unit: " kg/ha" },
    { key: "phosphorus",    label: t.phosphorus,    value: form.phosphorus,    unit: " kg/ha" },
    { key: "potassium",     label: t.potassium,     value: form.potassium,     unit: " kg/ha" },
    { key: "organicMatter", label: t.organicMatter, value: form.organicMatter, unit: "%"      },
    { key: "moisture",      label: t.moisture,      value: form.moisture,      unit: "%"      },
  ];

  const totalFertCost = result?.fertilizers?.reduce((sum, f) => sum + getFertCost(f), 0) ?? 0;
  const sm = result ? scoreMeta(result.score) : null;

  return (
    <div className="min-h-screen bg-background p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-1">{t.title}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t.subtitle}</p>

      {/* Input form */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {paramRows.map(({ key, label, value }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <input name={key} value={value} onChange={handleChange} type="number" step="0.1"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{t.soilType}</label>
            <select name="soilType" value={form.soilType} onChange={handleChange}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              {["Loamy","Clayey","Sandy","Silty","Black","Red","Laterite"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{t.crop}</label>
            <select name="crop" value={form.crop} onChange={handleChange}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              {["Wheat","Rice","Maize","Soybean","Chickpea","Groundnut","Cotton","Sugarcane","Sorghum","Onion","Tomato","Potato"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <button onClick={analyze} disabled={loading}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-60">
          {loading ? t.analyzing : t.analyze}
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {/* Results */}
      {result && sm && (
        <div className="space-y-4">

          {/* Score ring */}
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-5">
            <div className={`w-24 h-24 rounded-full border-4 ${sm.ring} flex flex-col items-center justify-center flex-shrink-0`}>
              <span className={`text-3xl font-bold ${sm.text}`}>{result.score}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t.score}</p>
              <p className={`text-lg font-bold capitalize ${sm.text}`}>{t[sm.label as keyof typeof t]}</p>
              <p className="text-sm text-foreground mt-1">{result.overallHealth}</p>
            </div>
          </div>

          {/* Nutrient Meter Bars */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-base font-semibold text-primary mb-4">{t.params}</h2>
            <div className="space-y-3">
              {paramRows.map(({ key, label, value, unit }) => {
                const ns = getNutrientStatus(key, parseFloat(value));
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{value}{unit}</span>
                        <span className={`text-xs font-semibold ${ns.color}`}>
                          {ns.dot} {t[ns.label as keyof typeof t] ?? ns.label}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${ns.bar}`}
                        style={{ width: `${ns.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-yellow-400 mb-2">⚠️ {t.warnings}</h2>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2"><span>•</span><span>{w}</span></li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-2">✅ {t.recommendations}</h2>
              <ul className="space-y-1">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="text-green-400">→</span><span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fertilizer Plan */}
          {result.fertilizers.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-3">🌿 {t.fertilizers}</h2>
              <div className="space-y-3">
                {result.fertilizers.map((f, i) => {
                  const cost = getFertCost(f);
                  return (
                    <div key={i} className="bg-secondary rounded-xl p-3 border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-foreground">{f.name}</span>
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">{f.dose}</span>
                          {cost > 0 && <span className="text-xs font-bold text-green-400">₹{cost.toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                      {f.timing && f.timing.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.timing}</p>
                          {f.timing.map((step, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">{j + 1}</span>
                              <span className="text-xs text-foreground">{step}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {totalFertCost > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">{t.totalCost}</span>
                  <span className="text-lg font-bold text-green-400">₹{totalFertCost.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>
          )}

          {/* Yield Prediction */}
          {result.yieldPrediction && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-2">📈 {t.yieldPrediction}</h2>
              <div className="flex items-center gap-4">
                <div className="text-3xl">🌾</div>
                <div>
                  <p className="text-2xl font-bold text-green-400">
                    {result.yieldPrediction.minYield} – {result.yieldPrediction.maxYield}
                    <span className="text-sm font-normal text-muted-foreground ml-2">{t.perHa}</span>
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{result.yieldPrediction.crop}</p>
                </div>
              </div>
            </div>
          )}

          {/* Irrigation Advice */}
          {result.irrigationAdvice && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-3">💧 {t.irrigation}</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.nextIrrigation}</p>
                  <p className="text-2xl font-bold text-blue-400">{result.irrigationAdvice.nextInDays}</p>
                  <p className="text-xs text-blue-300">{t.days}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.waterAmount}</p>
                  <p className="text-2xl font-bold text-blue-400">{result.irrigationAdvice.waterAmountMm}</p>
                  <p className="text-xs text-blue-300">mm</p>
                </div>
              </div>
              {result.irrigationAdvice.note && (
                <p className="text-sm text-foreground bg-secondary rounded-lg p-3">
                  💡 {result.irrigationAdvice.note}
                </p>
              )}
            </div>
          )}

          {/* Soil Improvement Timeline */}
          {result.improvementTimeline && result.improvementTimeline.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-4">📅 {t.timeline}</h2>
              <div className="space-y-2">
                {result.improvementTimeline.map((yr, i) => {
                  const yrMeta = scoreMeta(yr.score);
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 ${yrMeta.ring} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-xs font-bold text-foreground">{yr.year}</span>
                        </div>
                        {i < result.improvementTimeline!.length - 1 && (
                          <div className="w-0.5 h-5 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{t.score_lbl}</span>
                          <span className={`text-base font-bold ${yrMeta.text}`}>{yr.score}</span>
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${yrMeta.bar}`} style={{ width: `${yr.score}%` }} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{yr.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amendments */}
          {result.amendments.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-2">🪨 {t.amendments}</h2>
              <div className="flex flex-wrap gap-2">
                {result.amendments.map((a, i) => (
                  <span key={i} className="bg-secondary border border-border text-foreground text-sm px-3 py-1 rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suitable Crops */}
          {result.suitableCrops.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-2">🌻 {t.suitableCrops}</h2>
              <div className="flex flex-wrap gap-2">
                {result.suitableCrops.map((c, i) => (
                  <span key={i} className="bg-secondary border border-border text-foreground text-sm px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Floating Chat Button ── */}
      <button
        onClick={() => setChatOpen(o => !o)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center transition-all active:scale-95"
        aria-label="Open soil chat"
      >
        {chatOpen
          ? <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        }
        {!chatOpen && result && chatMessages.length === 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
        )}
      </button>

      {/* ── Chat Popup ── */}
      {chatOpen && (
        <div
          className="fixed bottom-36 right-4 z-50 flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: "320px", maxWidth: "calc(100vw - 2rem)", height: "460px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-base flex-shrink-0">🌱</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary leading-tight">{t.chatTitle}</p>
              <p className="text-xs text-muted-foreground truncate">{t.chatHint}</p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Context pills */}
          <div className="flex gap-1.5 px-3 pt-2 flex-shrink-0 flex-wrap">
            <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
              🧪 {t.ph} {form.ph} · {form.soilType}
            </span>
            <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
              🌾 {form.crop}
            </span>
            {result && (
              <span className="text-xs bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                ✅ Score {result.score}/100
              </span>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">

            {/* Greeting + suggestions when empty */}
            {chatMessages.length === 0 && (
              <div className="space-y-2">
                <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-3 py-2.5 text-xs text-foreground leading-relaxed">
                  {result
                    ? `I have analysed your soil (Score: ${result.score}/100). Ask me anything about the results!`
                    : `Hi! Enter your soil values and run the analysis first, then I can give you specific advice.`
                  }
                </div>
                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  {t.chatSuggestions.map((s, i) => (
                    <button key={i} onClick={() => sendChat(s)} disabled={chatLoading}
                      className="text-left text-xs bg-secondary border border-border rounded-xl px-3 py-2 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages with Listen button on AI replies */}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary border border-border text-foreground rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                  {/* 🔊 Listen button — AI messages only */}
                  {m.role === "assistant" && (
                    <button
                      onClick={() => speakMessage(m.text, i)}
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

            {/* Typing dots */}
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

          {/* Input row — mic + text + send */}
          <div className="flex gap-2 px-3 py-3 border-t border-border flex-shrink-0 bg-card">
            {/* 🎤 Mic button */}
            <button
              onClick={toggleVoiceInput}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm border transition-all
                ${isListening
                  ? "bg-red-500 text-white border-red-500 animate-pulse"
                  : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/40"
                }`}
              title={isListening ? "Stop listening" : "Speak your question"}
            >
              {isListening ? "⏹" : "🎤"}
            </button>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder={isListening ? t.listening : t.chatPlaceholder}
              disabled={chatLoading}
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 disabled:opacity-60"
            />
            <button
              onClick={() => sendChat()}
              disabled={!chatInput.trim() || chatLoading}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
            >
              {chatLoading
                ? <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                : <svg className="w-4 h-4 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              }
            </button>
          </div>

        </div>
      )}

    </div>
  );
}