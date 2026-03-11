"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000)
    const removeTimer = setTimeout(() => setVisible(false), 2500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Glow ring */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute h-40 w-40 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="absolute h-32 w-32 rounded-full bg-primary/15" />
        <div className="relative h-28 w-28 drop-shadow-2xl">
          <Image
            src="/krishibot-logo.png"
            alt="KrishiBot"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* App name */}
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1">
        Krishi<span className="text-primary">Bot</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Smart Farming Assistant</p>

      {/* Loading bar */}
      <div className="w-40 h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ animation: "loadingBar 2s ease-in-out forwards" }}
        />
      </div>

      {/* Creator */}
      <p className="mt-8 text-[11px] text-muted-foreground/50">
        Made with 🌱 by <span className="font-semibold text-muted-foreground/70">Prathmesh Phalke</span>
      </p>

      <style>{`
        @keyframes loadingBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}