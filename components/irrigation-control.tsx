"use client"

import { useState, useEffect, useCallback } from "react"
import { Power, Zap, Timer, ShieldCheck, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/lib/app-context"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function IrrigationControl() {
  const {
    language,
    isMotorOn,
    setIsMotorOn,
    isAutoMode,
    setIsAutoMode,
    moistureLevel,
    moistureThreshold,
    setMoistureThreshold,
    safetyTimer,
    setSafetyTimer,
  } = useApp()

  const [timeRemaining, setTimeRemaining] = useState(safetyTimer * 60)
  const [isTimerActive, setIsTimerActive] = useState(false)

  useEffect(() => {
    if (isAutoMode && moistureLevel < moistureThreshold && !isMotorOn) {
      setIsMotorOn(true)
    } else if (isAutoMode && moistureLevel >= moistureThreshold + 10 && isMotorOn) {
      setIsMotorOn(false)
    }
  }, [isAutoMode, moistureLevel, moistureThreshold, isMotorOn, setIsMotorOn])

  useEffect(() => {
    if (isMotorOn && !isTimerActive) {
      setIsTimerActive(true)
      setTimeRemaining(safetyTimer * 60)
    } else if (!isMotorOn) {
      setIsTimerActive(false)
    }
  }, [isMotorOn, safetyTimer, isTimerActive])

  useEffect(() => {
    if (!isTimerActive || timeRemaining <= 0) {
      if (timeRemaining <= 0 && isMotorOn) {
        setIsMotorOn(false)
      }
      return
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerActive, timeRemaining, isMotorOn, setIsMotorOn])

  const toggleMotor = useCallback(() => {
    if (!isAutoMode) {
      setIsMotorOn(!isMotorOn)
    }
  }, [isAutoMode, isMotorOn, setIsMotorOn])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" />
          {t("irrigationControl", language)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Motor Status */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500",
                isMotorOn
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Power className="h-5 w-5" />
              {isMotorOn && (
                <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
              )}
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {t("motorStatus", language)}
              </div>
              <div className={cn("text-sm font-medium", isMotorOn ? "text-primary" : "text-muted-foreground")}>
                {isMotorOn ? t("motorOn", language) : t("motorOff", language)}
              </div>
            </div>
          </div>

          <Button
            onClick={toggleMotor}
            disabled={isAutoMode}
            variant={isMotorOn ? "destructive" : "default"}
            className="min-w-[100px]"
          >
            {isMotorOn ? t("turnOff", language) : t("turnOn", language)}
          </Button>
        </div>

        {/* Auto Mode */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium text-foreground">{t("autoMode", language)}</div>
              <div className="text-xs text-muted-foreground">
                {t("moistureThreshold", language)}: {moistureThreshold}%
              </div>
            </div>
          </div>
          <Switch checked={isAutoMode} onCheckedChange={setIsAutoMode} />
        </div>

        {/* Moisture Threshold Slider */}
        {isAutoMode && (
          <div className="space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">{t("moistureThreshold", language)}</span>
              <span className="font-bold text-primary">{moistureThreshold}%</span>
            </div>
            <Slider
              value={[moistureThreshold]}
              onValueChange={([value]) => setMoistureThreshold(value)}
              min={10}
              max={80}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10%</span>
              <span>80%</span>
            </div>
          </div>
        )}

        {/* Safety Timer */}
        <div className="space-y-3 p-3 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t("safetyTimer", language)}</span>
            </div>
            <span className="text-sm text-muted-foreground">{safetyTimer} {t("minutes", language)}</span>
          </div>
          <Slider
            value={[safetyTimer]}
            onValueChange={([value]) => setSafetyTimer(value)}
            min={5}
            max={120}
            step={5}
            className="w-full"
          />
          {isMotorOn && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  {t("lastUpdated", language)}
                </span>
                <span className="font-mono font-bold text-primary">{formatTime(timeRemaining)}</span>
              </div>
              <Progress
                value={(timeRemaining / (safetyTimer * 60)) * 100}
                className="h-1.5"
              />
            </div>
          )}
        </div>

        {/* Soil Moisture Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">{t("soilMoisture", language)}</span>
            <span className={cn(
              "font-bold",
              moistureLevel < moistureThreshold ? "text-destructive" : "text-primary"
            )}>
              {moistureLevel}%
            </span>
          </div>
          <Progress
            value={moistureLevel}
            className="h-3"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Dry</span>
            <span>Optimal</span>
            <span>Wet</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
