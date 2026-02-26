"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { useApp } from "@/lib/app-context"
import { t } from "@/lib/i18n"

function generateMoistureData() {
  const data = []
  const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
  for (let i = 0; i < hours.length; i++) {
    data.push({
      time: hours[i],
      moisture: Math.max(20, Math.min(80, 45 + Math.sin(i * 0.5) * 15 + (Math.random() * 10 - 5))),
      threshold: 30,
    })
  }
  return data
}

export function MoistureGraph() {
  const { language, moistureThreshold } = useApp()
  const data = useMemo(() => generateMoistureData(), [])

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("moistureHistory", language)}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {t("lastUpdated", language)}: 2 min ago
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.18 150)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.18 150)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 148)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "oklch(0.50 0.03 150)" }}
                axisLine={{ stroke: "oklch(0.90 0.02 148)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.50 0.03 150)" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.18 0.04 150)",
                  border: "1px solid oklch(0.28 0.05 150)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0.01 150)",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="threshold"
                stroke="oklch(0.577 0.245 27.325)"
                strokeDasharray="5 5"
                fill="none"
                strokeWidth={1}
                name="Threshold"
              />
              <Area
                type="monotone"
                dataKey="moisture"
                stroke="oklch(0.55 0.18 150)"
                fill="url(#moistureGradient)"
                strokeWidth={2}
                name="Moisture %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {t("soilMoisture", language)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {t("moistureThreshold", language)}: {moistureThreshold}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
