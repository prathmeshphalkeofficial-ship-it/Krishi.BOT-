"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";

// ── i18n labels ──────────────────────────────────────────────────────────────
const T = {
  en: {
    title: "🌱 Soil Health Tracker",
    subtitle: "Enter your soil values for AI-powered analysis",
    ph: "pH Level",
    nitrogen: "Nitrogen (kg/ha)",
    phosphorus: "Phosphorus (kg/ha)",
    potassium: "Potassium (kg/ha)",
    organicMatter: "Organic Matter (%)",
    moisture: "Moisture (%)",
    soilType: "Soil Type",
    crop: "Intended Crop",
    analyze: "Analyze Soil",
    analyzing: "Analyzing…",
    score: "Soil Health Score",
    health: "Overall Health",
    params: "Soil Parameters",
    nutrientStatus: "Nutrient Status",
    warnings: "Warnings",
    recommendations: "Recommendations",
    fertilizers: "Fertilizer Recommendations",
    amendments: "Soil Amendments",
    suitableCrops: "Suitable Crops",
    yieldPrediction: "Estimated Yield",
    fertCost: "Fertilizer Cost Estimate",
    totalCost: "Total Cost / Hectare",
    parameter: "Parameter",
    value: "Value",
    status: "Status",
    fertilizer: "Fertilizer",
    dose: "Dose",
    cost: "Cost (₹)",
    perHa: "per hectare",
    adequate: "Adequate",
    slightlyLow: "Slightly Low",
    low: "Low",
    high: "High",
    ideal: "Ideal",
    good: "Good",
    excellent: "Excellent",
    poor: "Poor",
    moderate: "Moderate",
  },
  hi: {
    title: "🌱 मिट्टी स्वास्थ्य ट्रैकर",
    subtitle: "AI विश्लेषण के लिए मिट्टी के मान दर्ज करें",
    ph: "pH स्तर",
    nitrogen: "नाइट्रोजन (kg/ha)",
    phosphorus: "फास्फोरस (kg/ha)",
    potassium: "पोटेशियम (kg/ha)",
    organicMatter: "जैविक पदार्थ (%)",
    moisture: "नमी (%)",
    soilType: "मिट्टी का प्रकार",
    crop: "इच्छित फसल",
    analyze: "मिट्टी का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है…",
    score: "मिट्टी स्वास्थ्य स्कोर",
    health: "समग्र स्वास्थ्य",
    params: "मिट्टी पैरामीटर",
    nutrientStatus: "पोषक तत्व स्थिति",
    warnings: "चेतावनियाँ",
    recommendations: "सिफारिशें",
    fertilizers: "उर्वरक सिफारिशें",
    amendments: "मिट्टी सुधार",
    suitableCrops: "उपयुक्त फसलें",
    yieldPrediction: "अनुमानित उपज",
    fertCost: "उर्वरक लागत अनुमान",
    totalCost: "कुल लागत / हेक्टेयर",
    parameter: "पैरामीटर",
    value: "मान",
    status: "स्थिति",
    fertilizer: "उर्वरक",
    dose: "खुराक",
    cost: "लागत (₹)",
    perHa: "प्रति हेक्टेयर",
    adequate: "पर्याप्त",
    slightlyLow: "थोड़ा कम",
    low: "कम",
    high: "अधिक",
    ideal: "आदर्श",
    good: "अच्छा",
    excellent: "उत्कृष्ट",
    poor: "खराब",
    moderate: "मध्यम",
  },
  mr: {
    title: "🌱 माती आरोग्य ट्रॅकर",
    subtitle: "AI विश्लेषणासाठी मातीची मूल्ये प्रविष्ट करा",
    ph: "pH पातळी",
    nitrogen: "नायट्रोजन (kg/ha)",
    phosphorus: "फॉस्फरस (kg/ha)",
    potassium: "पोटॅशियम (kg/ha)",
    organicMatter: "सेंद्रिय पदार्थ (%)",
    moisture: "ओलावा (%)",
    soilType: "मातीचा प्रकार",
    crop: "इच्छित पीक",
    analyze: "माती विश्लेषण करा",
    analyzing: "विश्लेषण होत आहे…",
    score: "माती आरोग्य गुण",
    health: "एकूण आरोग्य",
    params: "माती पॅरामीटर्स",
    nutrientStatus: "पोषक स्थिती",
    warnings: "इशारे",
    recommendations: "शिफारसी",
    fertilizers: "खत शिफारसी",
    amendments: "माती सुधारणा",
    suitableCrops: "योग्य पिके",
    yieldPrediction: "अंदाजे उत्पन्न",
    fertCost: "खत खर्च अंदाज",
    totalCost: "एकूण खर्च / हेक्टर",
    parameter: "पॅरामीटर",
    value: "मूल्य",
    status: "स्थिती",
    fertilizer: "खत",
    dose: "डोस",
    cost: "खर्च (₹)",
    perHa: "प्रति हेक्टर",
    adequate: "पुरेसे",
    slightlyLow: "किंचित कमी",
    low: "कमी",
    high: "जास्त",
    ideal: "आदर्श",
    good: "चांगले",
    excellent: "उत्कृष्ट",
    poor: "खराब",
    moderate: "मध्यम",
  },
};

// ── Nutrient status helper ───────────────────────────────────────────────────
function getNutrientStatus(key: string, value: number) {
  const ranges: Record<string, { low: number; high: number; ideal: [number, number] }> = {
    ph:           { low: 5.5, high: 8.0, ideal: [6.0, 7.5] },
    nitrogen:     { low: 150, high: 600, ideal: [250, 450] },
    phosphorus:   { low: 10,  high: 50,  ideal: [20, 40]   },
    potassium:    { low: 100, high: 500, ideal: [180, 350]  },
    organicMatter:{ low: 1.0, high: 5.0, ideal: [2.0, 4.0] },
    moisture:     { low: 20,  high: 80,  ideal: [40, 65]   },
  };
  const r = ranges[key];
  if (!r) return { label: "—", color: "text-gray-400", dot: "🔵" };
  if (value < r.low)  return { label: "low",        color: "text-red-400",    dot: "🔴" };
  if (value > r.high) return { label: "high",       color: "text-orange-400", dot: "🟠" };
  if (value >= r.ideal[0] && value <= r.ideal[1])
                      return { label: "ideal",      color: "text-green-400",  dot: "🟢" };
  return               { label: "slightlyLow",     color: "text-yellow-400", dot: "🟡" };
}

// ── Score badge colour ────────────────────────────────────────────────────────
function scoreMeta(score: number) {
  if (score >= 90) return { label: "excellent", ring: "border-emerald-400", text: "text-emerald-400" };
  if (score >= 75) return { label: "good",      ring: "border-green-400",   text: "text-green-400"  };
  if (score >= 60) return { label: "moderate",  ring: "border-yellow-400",  text: "text-yellow-400" };
  return                  { label: "poor",      ring: "border-red-400",     text: "text-red-400"    };
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FertilizerRec { name: string; dose: string; reason: string; costPerDose?: number }
interface YieldPrediction { crop: string; minYield: string; maxYield: string; unit: string }
interface SoilResult {
  score: number;
  overallHealth: string;
  warnings: string[];
  recommendations: string[];
  fertilizers: FertilizerRec[];
  amendments: string[];
  suitableCrops: string[];
  yieldPrediction?: YieldPrediction;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SoilPage() {
  const { language } = useApp();
  const t = T[language as keyof typeof T] ?? T.en;

  const [form, setForm] = useState({
    ph: "6.8",
    nitrogen: "310",
    phosphorus: "18",
    potassium: "240",
    organicMatter: "2.8",
    moisture: "52",
    soilType: "Loamy",
    crop: "Wheat",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoilResult | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const analyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
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

  // Soil parameter rows for the table
  const paramRows = [
    { key: "ph",            label: t.ph,            value: form.ph,            unit: "" },
    { key: "nitrogen",      label: t.nitrogen,       value: form.nitrogen,      unit: "kg/ha" },
    { key: "phosphorus",    label: t.phosphorus,     value: form.phosphorus,    unit: "kg/ha" },
    { key: "potassium",     label: t.potassium,      value: form.potassium,     unit: "kg/ha" },
    { key: "organicMatter", label: t.organicMatter,  value: form.organicMatter, unit: "%" },
    { key: "moisture",      label: t.moisture,       value: form.moisture,      unit: "%" },
  ];

  // Fertilizer cost table (₹ per bag, approximate 2024 India prices)
  const fertPrices: Record<string, number> = {
    DAP: 1400,  // per 50 kg bag
    MOP: 950,   // per 50 kg bag
    Urea: 266,  // per 45 kg bag (govt MRP)
    SSP: 450,   // per 50 kg bag
    NPK: 1200,  // per 50 kg bag
  };

  const getFertCost = (fert: FertilizerRec): number => {
    if (fert.costPerDose) return fert.costPerDose;
    for (const [k, price] of Object.entries(fertPrices)) {
      if (fert.name.toUpperCase().includes(k)) return price;
    }
    return 0;
  };

  const totalFertCost = result?.fertilizers
    ? result.fertilizers.reduce((sum, f) => sum + getFertCost(f), 0)
    : 0;

  const sm = result ? scoreMeta(result.score) : null;

  return (
    <div className="min-h-screen bg-background p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-1">{t.title}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t.subtitle}</p>

      {/* ── Input form ── */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {paramRows.map(({ key, label, value }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground block mb-1">{label}</label>
              <input
                name={key}
                value={value}
                onChange={handleChange}
                type="number"
                step="0.1"
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{t.soilType}</label>
            <select
              name="soilType"
              value={form.soilType}
              onChange={handleChange}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              {["Loamy","Clayey","Sandy","Silty","Black","Red","Laterite"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">{t.crop}</label>
            <select
              name="crop"
              value={form.crop}
              onChange={handleChange}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
            >
              {["Wheat","Rice","Maize","Soybean","Chickpea","Groundnut","Cotton","Sugarcane","Sorghum","Onion","Tomato","Potato"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? t.analyzing : t.analyze}
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      {/* ── Results ── */}
      {result && sm && (
        <div className="space-y-4">

          {/* Score */}
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

          {/* Parameter Table */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-base font-semibold text-primary mb-3">{t.params}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left pb-2">{t.parameter}</th>
                  <th className="text-right pb-2">{t.value}</th>
                  <th className="text-right pb-2">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paramRows.map(({ key, label, value, unit }) => {
                  const ns = getNutrientStatus(key, parseFloat(value));
                  return (
                    <tr key={key}>
                      <td className="py-2 text-foreground">{label}</td>
                      <td className="py-2 text-right text-foreground font-mono">{value}{unit ? ` ${unit}` : ""}</td>
                      <td className={`py-2 text-right font-medium capitalize ${ns.color}`}>
                        {ns.dot} {t[ns.label as keyof typeof t] ?? ns.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-yellow-400 mb-2">⚠️ {t.warnings}</h2>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span>•</span><span>{w}</span>
                  </li>
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

          {/* Fertilizer Recommendations */}
          {result.fertilizers.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <h2 className="text-base font-semibold text-primary mb-3">🌿 {t.fertilizers}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left pb-2">{t.fertilizer}</th>
                    <th className="text-right pb-2">{t.dose}</th>
                    <th className="text-right pb-2">{t.cost}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.fertilizers.map((f, i) => {
                    const cost = getFertCost(f);
                    return (
                      <tr key={i}>
                        <td className="py-2 text-foreground font-medium">{f.name}</td>
                        <td className="py-2 text-right text-muted-foreground">{f.dose}</td>
                        <td className="py-2 text-right text-green-400 font-mono">
                          {cost ? `₹${cost.toLocaleString("en-IN")}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Total cost */}
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
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      {result.yieldPrediction.unit} {t.perHa}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">{result.yieldPrediction.crop}</p>
                </div>
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
    </div>
  );
}