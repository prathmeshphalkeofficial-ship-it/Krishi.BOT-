"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/app-context";

const translations = {
  en: {
    title: "Spraying Advisor",
    subtitle: "Check if conditions are safe for spraying today",
    detecting: "Detecting your location...",
    fetchingWeather: "Fetching weather data...",
    allowLocation: "Allow Location",
    allowDesc: "We need your location to fetch local weather conditions",
    retry: "Try Again",
    safe: "Safe to Spray ✅",
    caution: "Spray with Caution ⚠️",
    unsafe: "Not Safe to Spray ❌",
    score: "Safety Score",
    temperature: "Temperature",
    wind: "Wind Speed",
    humidity: "Humidity",
    rain: "Rain Probability",
    cloud: "Cloud Cover",
    rainLastHour: "Rain Last Hour",
    visibility: "Visibility",
    sunrise: "Sunrise",
    sunset: "Sunset",
    conditions: "Conditions Check",
    recommendations: "Recommendations",
    bestTime: "Best Spray Time",
    safetyTips: "Safety Tips",
    good: "Good",
    warning: "Warning",
    danger: "Danger",
    tip1: "Wear protective clothing and gloves",
    tip2: "Avoid spraying near water bodies",
    tip3: "Check wind direction before spraying",
    tip4: "Wash hands thoroughly after spraying",
    morning: "Early Morning (6–9 AM)",
    evening: "Evening (5–7 PM)",
    notRecommended: "Not Recommended Today",
    locationError: "Could not get location. Please allow location access.",
    weatherError: "Could not fetch weather data. Please try again.",
  },
  hi: {
    title: "छिड़काव सलाहकार",
    subtitle: "जाँचें कि आज छिड़काव के लिए स्थिति सुरक्षित है या नहीं",
    detecting: "आपका स्थान पता लगाया जा रहा है...",
    fetchingWeather: "मौसम डेटा प्राप्त हो रहा है...",
    allowLocation: "स्थान अनुमति दें",
    allowDesc: "स्थानीय मौसम जानने के लिए आपका स्थान चाहिए",
    retry: "पुनः प्रयास करें",
    safe: "छिड़काव सुरक्षित है ✅",
    caution: "सावधानी से छिड़काव करें ⚠️",
    unsafe: "छिड़काव सुरक्षित नहीं है ❌",
    score: "सुरक्षा स्कोर",
    temperature: "तापमान",
    wind: "हवा की गति",
    humidity: "आर्द्रता",
    rain: "बारिश की संभावना",
    cloud: "बादल",
    rainLastHour: "पिछले घंटे बारिश",
    visibility: "दृश्यता",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    conditions: "स्थिति जाँच",
    recommendations: "सुझाव",
    bestTime: "सबसे अच्छा छिड़काव समय",
    safetyTips: "सुरक्षा सुझाव",
    good: "अच्छा",
    warning: "चेतावनी",
    danger: "खतरा",
    tip1: "सुरक्षात्मक कपड़े और दस्ताने पहनें",
    tip2: "पानी के पास छिड़काव से बचें",
    tip3: "छिड़काव से पहले हवा की दिशा देखें",
    tip4: "छिड़काव के बाद हाथ अच्छी तरह धोएं",
    morning: "सुबह जल्दी (6–9 बजे)",
    evening: "शाम (5–7 बजे)",
    notRecommended: "आज अनुशंसित नहीं",
    locationError: "स्थान नहीं मिला। कृपया अनुमति दें।",
    weatherError: "मौसम डेटा नहीं मिला। पुनः प्रयास करें।",
  },
  mr: {
    title: "फवारणी सल्लागार",
    subtitle: "आज फवारणीसाठी परिस्थिती सुरक्षित आहे का ते तपासा",
    detecting: "तुमचे स्थान शोधत आहे...",
    fetchingWeather: "हवामान डेटा मिळवत आहे...",
    allowLocation: "स्थान परवानगी द्या",
    allowDesc: "स्थानिक हवामान जाणण्यासाठी तुमचे स्थान आवश्यक आहे",
    retry: "पुन्हा प्रयत्न करा",
    safe: "फवारणी सुरक्षित आहे ✅",
    caution: "सावधानीने फवारणी करा ⚠️",
    unsafe: "फवारणी सुरक्षित नाही ❌",
    score: "सुरक्षा स्कोर",
    temperature: "तापमान",
    wind: "वाऱ्याचा वेग",
    humidity: "आर्द्रता",
    rain: "पावसाची शक्यता",
    cloud: "ढग",
    rainLastHour: "मागील तासात पाऊस",
    visibility: "दृश्यमानता",
    sunrise: "सूर्योदय",
    sunset: "सूर्यास्त",
    conditions: "परिस्थिती तपासणी",
    recommendations: "शिफारसी",
    bestTime: "सर्वोत्तम फवारणी वेळ",
    safetyTips: "सुरक्षा टिप्स",
    good: "चांगले",
    warning: "इशारा",
    danger: "धोका",
    tip1: "संरक्षणात्मक कपडे आणि हातमोजे घाला",
    tip2: "पाण्याजवळ फवारणी टाळा",
    tip3: "फवारणीपूर्वी वाऱ्याची दिशा तपासा",
    tip4: "फवारणीनंतर हात नीट धुवा",
    morning: "पहाटे (सकाळी ६–९)",
    evening: "संध्याकाळी (५–७)",
    notRecommended: "आज शिफारस नाही",
    locationError: "स्थान मिळाले नाही. कृपया परवानगी द्या.",
    weatherError: "हवामान डेटा मिळाला नाही. पुन्हा प्रयत्न करा.",
  },
};

type WeatherData = {
  temp: number;
  windSpeed: number;
  windDeg: number;
  humidity: number;
  rainProbability: number;
  cloudCover: number;
  rainLastHour: number;
  visibility: number;
  sunrise: number;
  sunset: number;
  description: string;
  city: string;
};

function calcScore(w: WeatherData): number {
  let score = 100;
  if (w.windSpeed > 15) score -= 40;
  else if (w.windSpeed > 10) score -= 20;
  else if (w.windSpeed > 5) score -= 10;
  if (w.rainProbability > 60) score -= 30;
  else if (w.rainProbability > 30) score -= 15;
  if (w.rainLastHour > 0) score -= 20;
  if (w.temp > 35) score -= 15;
  else if (w.temp < 10) score -= 10;
  if (w.humidity > 90) score -= 10;
  if (w.cloudCover > 80) score -= 5;
  return Math.max(0, Math.min(100, score));
}

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SprayingPage() {
  const { language } = useApp();
  const tr = translations[language as keyof typeof translations] || translations.en;

  const [status, setStatus] = useState<"idle" | "locating" | "fetching" | "done" | "error">("idle");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");

  const fetchWeather = () => {
    setStatus("locating");
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("fetching");
        try {
          const res = await fetch(
            `/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          setWeather(data);
          setStatus("done");
        } catch {
          setError(tr.weatherError);
          setStatus("error");
        }
      },
      () => {
        setError(tr.locationError);
        setStatus("error");
      }
    );
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = weather ? calcScore(weather) : 0;
  const verdict = score >= 60 ? "safe" : score >= 40 ? "caution" : "unsafe";
  const verdictText = verdict === "safe" ? tr.safe : verdict === "caution" ? tr.caution : tr.unsafe;
  const verdictColor =
    verdict === "safe"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
      : verdict === "caution"
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
      : "text-red-400 bg-red-400/10 border-red-400/30";
  const scoreColor =
    verdict === "safe" ? "text-emerald-400" : verdict === "caution" ? "text-yellow-400" : "text-red-400";

  const conditionStatus = (type: string): "good" | "warning" | "danger" => {
    if (!weather) return "good";
    switch (type) {
      case "wind":
        return weather.windSpeed > 15 ? "danger" : weather.windSpeed > 10 ? "warning" : "good";
      case "rain":
        return weather.rainProbability > 60 || weather.rainLastHour > 0
          ? "danger"
          : weather.rainProbability > 30
          ? "warning"
          : "good";
      case "temp":
        return weather.temp > 35 || weather.temp < 10 ? "danger" : weather.temp > 30 ? "warning" : "good";
      case "humidity":
        return weather.humidity > 90 ? "danger" : weather.humidity > 75 ? "warning" : "good";
      default:
        return "good";
    }
  };

  const statusColor = (s: "good" | "warning" | "danger") =>
    s === "good"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : s === "warning"
      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      : "text-red-400 bg-red-400/10 border-red-400/20";

  const statusLabel = (s: "good" | "warning" | "danger") =>
    s === "good" ? tr.good : s === "warning" ? tr.warning : tr.danger;

  const recommendations: string[] = [];
  if (weather) {
    if (weather.windSpeed > 10)
      recommendations.push(language === "hi" ? "हवा बहुत तेज है — छिड़काव न करें" : language === "mr" ? "वारा खूप जोरात आहे — फवारणी करू नका" : "Wind too high — avoid spraying");
    if (weather.rainProbability > 50)
      recommendations.push(language === "hi" ? "बारिश की संभावना अधिक है — कल प्रयास करें" : language === "mr" ? "पावसाची शक्यता जास्त — उद्या प्रयत्न करा" : "High rain chance — try tomorrow");
    if (weather.rainLastHour > 0)
      recommendations.push(language === "hi" ? "पिछले घंटे बारिश हुई — पत्तियाँ गीली हैं" : language === "mr" ? "मागील तासात पाऊस — पाने ओली आहेत" : "Recent rain — leaves are wet");
    if (weather.temp > 32)
      recommendations.push(language === "hi" ? "तापमान अधिक है — सुबह या शाम छिड़काव करें" : language === "mr" ? "तापमान जास्त — सकाळी किंवा संध्याकाळी फवारणी करा" : "High temp — spray in morning or evening");
    if (recommendations.length === 0)
      recommendations.push(language === "hi" ? "स्थितियाँ अनुकूल हैं — छिड़काव कर सकते हैं" : language === "mr" ? "परिस्थिती अनुकूल आहे — फवारणी करता येईल" : "Conditions are favorable — safe to spray");
  }

  const bestTime =
    verdict === "unsafe" ? tr.notRecommended : score >= 70 ? tr.morning : tr.evening;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border bg-card/50">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, var(--color-primary) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl">
              💧
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{tr.title}</h1>
              <p className="text-sm text-muted-foreground">{tr.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Loading States */}
        {(status === "locating" || status === "fetching") && (
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">
              {status === "locating" ? tr.detecting : tr.fetchingWeather}
            </p>
          </div>
        )}

        {/* Idle / Error */}
        {(status === "idle" || status === "error") && (
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">📍</div>
            <div>
              <p className="font-medium text-foreground mb-1">{tr.allowLocation}</p>
              <p className="text-sm text-muted-foreground">{error || tr.allowDesc}</p>
            </div>
            <button
              onClick={fetchWeather}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {status === "error" ? tr.retry : tr.allowLocation}
            </button>
          </div>
        )}

        {/* Results */}
        {status === "done" && weather && (
          <>
            {/* Score + Verdict */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {weather.city && (
                    <p className="text-xs text-muted-foreground mb-1">📍 {weather.city}</p>
                  )}
                  <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${scoreColor}`}>{score}</div>
                  <div className="text-xs text-muted-foreground">{tr.score}</div>
                </div>
              </div>
              <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm ${verdictColor}`}>
                {verdictText}
              </div>
            </div>

            {/* Weather Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: tr.temperature, value: `${Math.round(weather.temp)}°C`, icon: "🌡️" },
                { label: tr.wind, value: `${weather.windSpeed} km/h`, icon: "💨" },
                { label: tr.humidity, value: `${weather.humidity}%`, icon: "💧" },
                { label: tr.rain, value: `${weather.rainProbability}%`, icon: "🌧️" },
                { label: tr.cloud, value: `${weather.cloudCover}%`, icon: "☁️" },
                { label: tr.rainLastHour, value: `${weather.rainLastHour} mm`, icon: "🌂" },
                { label: tr.sunrise, value: formatTime(weather.sunrise), icon: "🌅" },
                { label: tr.sunset, value: formatTime(weather.sunset), icon: "🌇" },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                  <span className="text-xl">{stat.icon}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Conditions Check */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">🔍 {tr.conditions}</h3>
              <div className="grid grid-cols-2 gap-2">
                {(["wind", "rain", "temp", "humidity"] as const).map((type) => {
                  const s = conditionStatus(type);
                  const labels = { wind: tr.wind, rain: tr.rain, temp: tr.temperature, humidity: tr.humidity };
                  return (
                    <div key={type} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium ${statusColor(s)}`}>
                      <span>{labels[type]}</span>
                      <span>{statusLabel(s)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">💡 {tr.recommendations}</h3>
              <ul className="space-y-2">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Best Time */}
            <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-xs text-muted-foreground">{tr.bestTime}</p>
                <p className="font-semibold text-foreground text-sm">{bestTime}</p>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground text-sm mb-3">🛡️ {tr.safetyTips}</h3>
              <ul className="space-y-2">
                {[tr.tip1, tr.tip2, tr.tip3, tr.tip4].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Retry */}
            <button
              onClick={fetchWeather}
              className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary transition-colors"
            >
              🔄 {tr.retry}
            </button>
          </>
        )}
      </div>
    </div>
  );
}