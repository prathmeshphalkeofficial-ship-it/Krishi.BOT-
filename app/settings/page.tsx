"use client"

import { Settings, Globe, Moon, Bell, Droplets, Activity, Leaf, Sun } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useApp } from "@/lib/app-context"
import { t, languages, type Language } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function SettingsPage() {
  const { language, setLanguage, moistureThreshold, setMoistureThreshold, isAutoMode, setIsAutoMode, safetyTimer, setSafetyTimer } = useApp()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("settings", language)}</h1>
          <p className="text-sm text-muted-foreground">{t("generalSettings", language)}</p>
        </div>
      </div>

      {/* Language Selection */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            {t("language", language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center",
                  language === lang.code
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/50 text-foreground hover:border-primary/30"
                )}
              >
                <span className="text-lg font-semibold">{lang.nativeLabel}</span>
                <span className="text-xs text-muted-foreground">{lang.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="h-4 w-4 text-primary" />
            {t("theme", language)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <div className="text-sm font-medium text-foreground">{t("darkMode", language)}</div>
                <div className="text-xs text-muted-foreground">
                  {language === "hi" ? "गहरा थीम चालू/बंद करें" : language === "mr" ? "डार्क थीम चालू/बंद करा" : "Toggle dark theme"}
                </div>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" />
            {t("notifications", language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">{t("notifications", language)}</div>
              <div className="text-xs text-muted-foreground">
                {language === "hi" ? "मोटर और नमी अलर्ट" : language === "mr" ? "मोटर आणि ओलावा सूचना" : "Motor & moisture alerts"}
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Device Settings */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            {t("deviceSettings", language)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Auto Irrigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">{t("autoIrrigation", language)}</div>
                <div className="text-xs text-muted-foreground">
                  {language === "hi" ? "नमी आधारित स्वचालित सिंचाई" : language === "mr" ? "ओलावा आधारित स्वयंचलित सिंचन" : "Moisture-based auto irrigation"}
                </div>
              </div>
            </div>
            <Switch checked={isAutoMode} onCheckedChange={setIsAutoMode} />
          </div>

          <Separator />

          {/* Moisture Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{t("moistureThreshold", language)}</span>
              </div>
              <span className="font-bold text-primary">{moistureThreshold}%</span>
            </div>
            <Slider
              value={[moistureThreshold]}
              onValueChange={([v]) => setMoistureThreshold(v)}
              min={10}
              max={80}
              step={5}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Safety Timer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{t("safetyTimer", language)}</span>
              <span className="font-bold text-primary">{safetyTimer} {t("minutes", language)}</span>
            </div>
            <Slider
              value={[safetyTimer]}
              onValueChange={([v]) => setSafetyTimer(v)}
              min={5}
              max={120}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full h-12 text-base font-semibold">
        {saved ? t("success", language) + "!" : t("save", language)}
      </Button>
    </main>
  )
}
