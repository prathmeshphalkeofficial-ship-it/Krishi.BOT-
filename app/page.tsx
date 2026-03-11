"use client"

import Image from "next/image"
import { SensorCards, WeatherWidget } from "@/components/weather-widget"
import { IrrigationControl } from "@/components/irrigation-control"
import { MoistureGraph } from "@/components/moisture-graph"
import { useApp } from "@/lib/app-context"
import { t } from "@/lib/i18n"

export default function DashboardPage() {
  const { language } = useApp()

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
        {/* Subtle glow blob */}
        <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-4 right-8 h-24 w-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />

        <div className="relative flex items-center gap-4">
          {/* Logo — fully transparent, no box */}
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src="/krishibot-logo.png"
              alt="KrishiBot"
              fill
              className="object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]"
              priority
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground leading-tight">
              {t("welcome", language)}
            </h1>
            <p className="text-sm text-muted-foreground">{t("liveMonitoring", language)}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[11px] text-primary/70 font-medium">
                {language === "hi"
                  ? "निर्मित: Prathmesh Phalke"
                  : language === "mr"
                  ? "निर्मित: Prathmesh Phalke"
                  : "by Prathmesh Phalke"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Cards */}
      <SensorCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IrrigationControl />
        <WeatherWidget />
      </div>

      {/* Moisture Graph */}
      <MoistureGraph />

      {/* ── Footer credit ── */}
      <div className="flex items-center justify-center gap-2 py-3 opacity-50 hover:opacity-80 transition-opacity">
        <div className="relative h-5 w-5 flex-shrink-0">
          <Image src="/krishibot-logo.png" alt="KrishiBot" fill className="object-contain" />
        </div>
        <p className="text-[11px] text-muted-foreground">
          KrishiBot AI &nbsp;·&nbsp; Made with 🌱 by Prathmesh Phalke
        </p>
      </div>

    </main>
  )
}