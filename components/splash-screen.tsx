"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fadeout" | "gone">("show")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fadeout"), 2200)
    const t2 = setTimeout(() => setPhase("gone"), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === "gone") return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.12) 0%, rgba(0,0,0,0) 70%), var(--background)",
        opacity: phase === "fadeout" ? 0 : 1,
        transition: "opacity 0.6s ease-out",
      }}
    >
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Outer glow rings */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="absolute rounded-full border border-primary/10"
          style={{ width: 200, height: 200, animation: "ringPulse 2s ease-out infinite" }}
        />
        <div
          className="absolute rounded-full border border-primary/15"
          style={{ width: 160, height: 160, animation: "ringPulse 2s ease-out 0.3s infinite" }}
        />
        <div
          className="absolute rounded-full bg-primary/8 blur-2xl"
          style={{ width: 140, height: 140 }}
        />

        {/* Logo */}
        <div
          className="relative z-10"
          style={{
            width: 110,
            height: 110,
            animation: "logoFloat 3s ease-in-out infinite",
            filter: "drop-shadow(0 0 20px rgba(34,197,94,0.5))",
          }}
        >
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
      <div className="text-center mb-2" style={{ animation: "fadeUp 0.6s ease-out 0.3s both" }}>
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-foreground">Krishi</span>
          <span className="text-primary">Bot</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 tracking-widest uppercase text-[11px]">
          Smart Farming Assistant
        </p>
      </div>

      {/* Loading dots */}
      <div
        className="flex items-center gap-1.5 my-6"
        style={{ animation: "fadeUp 0.6s ease-out 0.5s both" }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Creator */}
      <div style={{ animation: "fadeUp 0.6s ease-out 0.7s both" }}>
        <p className="text-[11px] text-muted-foreground/40 tracking-wide">
          Made with{" "}
          <span className="text-primary/60">🌱</span>{" "}
          by{" "}
          <span className="text-muted-foreground/60 font-semibold">Prathmesh Phalke</span>
        </p>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(0.95); opacity: 0.6; }
          50%  { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-6px);  }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40%           { transform: scale(1.3); opacity: 1;   }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  )
}