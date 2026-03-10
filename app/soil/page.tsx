"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";

const translations = {
  en: {
    title: "Soil Health Tracker",
    subtitle: "Enter your soil test values for AI-powered recommendations",
    analyze: "Analyze Soil",
    analyzing: "Analyzing...",
    reset: "Test Another Sample",
    results: "Soil Analysis Report",
    ph: "pH Level",
    phHint: "0–14 scale (ideal: 6.0–7.5)",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    npkHint: "kg/hectare",
    organic: "Organic Matter %",
    organicHint: "0–10%",
    moisture: "Moisture %",
    moistureHint: "0–100%",
    crop: "Intended Crop",
    cropPlaceholder: "e.g. Wheat, Tomato, Cotton...",
    soilType: "Soil Type",
    soilTypes: ["Black (Regur)", "Red", "Alluvial", "Sandy", "Clay", "Loamy"],
    overall: "Overall Health",
    recommendations: "Recommendations",
    fertilizers: "Suggested Fertilizers",
    amendments: "Soil Amendments",
    suitable: "Suitable Crops",
    warnings: "Warnings",
    score: "Soil Score",
  },
  hi: {
    title: "मिट्टी स्वास्थ्य ट्रैकर",
    subtitle: "AI सुझावों के लिए अपने मिट्टी परीक्षण मूल्य दर्ज करें",
    analyze: "मिट्टी विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    reset: "दूसरा नमूना जांचें",
    results: "मिट्टी विश्लेषण रिपोर्ट",
    ph: "pH स्तर",
    phHint: "0–14 (आदर्श: 6.0–7.5)",
    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फास्फोरस (P)",
    potassium: "पोटेशियम (K)",
    npkHint: "kg/हेक्टेयर",
    organic: "जैविक पदार्थ %",
    organicHint: "0–10%",
    moisture: "नमी %",
    moistureHint: "0–100%",
    crop: "इच्छित फसल",
    cropPlaceholder: "जैसे गेहूं, टमाटर, कपास...",
    soilType: "मिट्टी का प्रकार",
    soilTypes: ["काली (रेगुर)", "लाल", "जलोढ़", "रेतीली", "चिकनी", "दोमट"],
    overall: "समग्र स्वास्थ्य",
    recommendations: "सुझाव",
    fertilizers: "सुझाए गए उर्वरक",
    amendments: "मिट्टी सुधार",
    suitable: "उपयुक्त फसलें",
    warnings: "चेतावनियाँ",
    score: "मिट्टी स्कोर",
  },
  mr: {
    title: "माती आरोग्य ट्रॅकर",
    subtitle: "AI शिफारसींसाठी तुमची माती चाचणी मूल्ये प्रविष्ट करा",
    analyze: "माती विश्लेषण करा",
    analyzing: "विश्लेषण होत आहे...",
    reset: "दुसरा नमुना तपासा",
    results: "माती विश्लेषण अहवाल",
    ph: "pH पातळी",
    phHint: "0–14 (आदर्श: 6.0–7.5)",
    nitrogen: "नायट्रोजन (N)",
    phosphorus: "फॉस्फरस (P)",
    potassium: "पोटॅशियम (K)",
    npkHint: "kg/हेक्टर",
    organic: "सेंद्रिय पदार्थ %",
    organicHint: "0–10%",
    moisture: "ओलावा %",
    moistureHint: "0–100%",
    crop: "अपेक्षित पीक",
    cropPlaceholder: "उदा. गहू, टोमॅटो, कापूस...",
    soilType: "मातीचा प्रकार",
    soilTypes: ["काळी (रेगुर)", "लाल", "गाळाची", "वाळूची", "चिकणमाती", "चिकट"],
    overall: "एकूण आरोग्य",
    recommendations: "शिफारसी",
    fertilizers: "सुचवलेली खते",
    amendments: "माती सुधारणा",
    suitable: "योग्य पिके",
    warnings: "इशारे",
    score: "माती स्कोर",
  },
};

type SoilResult = {
  score?: number;
  overall_health?: string;
  summary?: string;
  recommendations?: string[];
  fertilizers?: string[];
  amendments?: string[];
  suitable_crops?: string[];
  warnings?: string[];
  error?: string;
  message?: string;
};

const healthColors: Record<string, string> = {
  Excellent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Good: "text-green-400 bg-green-400/10 border-green-400/30",
  Fair: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  Poor: "text-red-400 bg-red-400/10 border-red-400/30",
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
};

export default function SoilPage() {
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [form, setForm] = useState({
    ph: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    organic: "",
    moisture: "",
    crop: "",
    soilType: t.soilTypes[0],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilResult | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/soil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "server_error", message: "Analysis failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.ph && form.nitrogen && form.phosphorus && form.potassium;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border bg-card/50">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #a16207 0%, transparent 60%), radial-gradient(circle at 80% 20%, var(--color-primary) 0%, transparent 50%)",
          }}
        />
        <div className="relative px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
              🌱
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!result ? (
          <>
            {/* Form */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              {/* Soil Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t.soilType}</label>
                <div className="flex flex-wrap gap-2">
                  {t.soilTypes.map((s) => (
                    <button
                      key={s}
                      onClick={() => set("soilType", s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        form.soilType === s
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* NPK Row */}
              <div className="grid grid-cols-3 gap-3">
                {(["nitrogen", "phosphorus", "potassium"] as const).map((key) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t[key]}</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.npkHint}</p>
                  </div>
                ))}
              </div>

              {/* pH + Organic + Moisture */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.ph}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    placeholder="6.5"
                    value={form.ph}
                    onChange={(e) => set("ph", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.phHint}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.organic}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="2.5"
                    value={form.organic}
                    onChange={(e) => set("organic", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.organicHint}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.moisture}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="40"
                    value={form.moisture}
                    onChange={(e) => set("moisture", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t.moistureHint}</p>
                </div>
              </div>

              {/* Crop */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.crop}</label>
                <input
                  type="text"
                  placeholder={t.cropPlaceholder}
                  value={form.crop}
                  onChange={(e) => set("crop", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyze}
              disabled={loading || !isFormValid}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base
                hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50
                flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>🔬 {t.analyze}</>
              )}
            </button>
            {!isFormValid && (
              <p className="text-center text-xs text-muted-foreground">
                * pH, N, P, K values are required
              </p>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {result.error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-red-400">{result.message}</p>
              </div>
            ) : (
              <>
                {/* Score Card */}
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t.results}</p>
                      <p className="text-sm text-muted-foreground">{result.summary}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${scoreColor(result.score || 0)}`}>
                        {result.score}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.score}</div>
                    </div>
                  </div>
                  {result.overall_health && (
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${healthColors[result.overall_health] || "text-muted-foreground bg-secondary border-border"}`}>
                      🌍 {t.overall}: {result.overall_health}
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
                    <h3 className="font-semibold text-red-400 text-sm mb-2 flex items-center gap-2">
                      ⚠️ {t.warnings}
                    </h3>
                    <ul className="space-y-1.5">
                      {result.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <Section icon="💡" title={t.recommendations} items={result.recommendations} color="blue" />
                )}
                {result.fertilizers && result.fertilizers.length > 0 && (
                  <Section icon="🌿" title={t.fertilizers} items={result.fertilizers} color="green" numbered />
                )}
                {result.amendments && result.amendments.length > 0 && (
                  <Section icon="🪨" title={t.amendments} items={result.amendments} color="yellow" />
                )}
                {result.suitable_crops && result.suitable_crops.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center text-sm">🌾</span>
                      {t.suitable}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.suitable_crops.map((crop, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-medium border border-emerald-400/20">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary transition-colors"
            >
              🔄 {t.reset}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  icon, title, items, color, numbered,
}: {
  icon: string; title: string; items: string[]; color: "red" | "yellow" | "blue" | "green"; numbered?: boolean;
}) {
  const colors = {
    red: "text-red-400 bg-red-400/10", yellow: "text-yellow-400 bg-yellow-400/10",
    blue: "text-blue-400 bg-blue-400/10", green: "text-emerald-400 bg-emerald-400/10",
  };
  const dotColors = {
    red: "bg-red-400", yellow: "bg-yellow-400", blue: "bg-blue-400", green: "bg-emerald-400",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${colors[color]}`}>{icon}</span>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            {numbered ? (
              <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${dotColors[color]}`}>{i + 1}</span>
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