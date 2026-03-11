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

      {/* ── Header with logo ── */}
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 drop-shadow-md">
          <Image
            src="/krishibot-logo.png"
            alt="KrishiBot Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {t("welcome", language)}
          </h1>
          <p className="text-sm text-muted-foreground">{t("liveMonitoring", language)}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            {language === "hi"
              ? "निर्माता: Prathmesh Phalke"
              : language === "mr"
              ? "निर्माता: Prathmesh Phalke"
              : "Created by Prathmesh Phalke"}
          </p>
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
      <div className="flex items-center justify-center gap-2 pt-2 pb-1">
        <div className="relative h-6 w-6 flex-shrink-0 opacity-70">
          <Image src="/krishibot-logo.png" alt="KrishiBot" fill className="object-contain" />
        </div>
        <p className="text-[11px] text-muted-foreground/60 text-center">
          KrishiBot AI &nbsp;·&nbsp;
          {language === "hi" ? "निर्मित: Prathmesh Phalke" : language === "mr" ? "निर्मित: Prathmesh Phalke" : "Made with 🌱 by Prathmesh Phalke"}
        </p>
      </div>

    </main>
  )
}