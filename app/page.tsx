"use client"

import { SensorCards, WeatherWidget } from "@/components/weather-widget"
import { IrrigationControl } from "@/components/irrigation-control"
import { MoistureGraph } from "@/components/moisture-graph"
import { useApp } from "@/lib/app-context"
import { t } from "@/lib/i18n"
import { Leaf } from "lucide-react"

export default function DashboardPage() {
  const { language } = useApp()

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground text-balance">{t("welcome", language)}</h1>
          <p className="text-sm text-muted-foreground">{t("liveMonitoring", language)}</p>
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
    </main>
  )
}
