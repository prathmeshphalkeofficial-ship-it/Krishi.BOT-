"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { type Language } from "@/lib/i18n"

interface AppState {
  language: Language
  setLanguage: (lang: Language) => void
  isMotorOn: boolean
  setIsMotorOn: (on: boolean) => void
  isAutoMode: boolean
  setIsAutoMode: (auto: boolean) => void
  moistureLevel: number
  setMoistureLevel: (level: number) => void
  moistureThreshold: number
  setMoistureThreshold: (threshold: number) => void
  safetyTimer: number
  setSafetyTimer: (timer: number) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [isMotorOn, setIsMotorOn] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [moistureLevel, setMoistureLevel] = useState(45)
  const [moistureThreshold, setMoistureThreshold] = useState(30)
  const [safetyTimer, setSafetyTimer] = useState(30)

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
  }, [])

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        isMotorOn,
        setIsMotorOn,
        isAutoMode,
        setIsAutoMode,
        moistureLevel,
        setMoistureLevel,
        moistureThreshold,
        setMoistureThreshold,
        safetyTimer,
        setSafetyTimer,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useApp must be used within AppProvider")
  return context
}
