"use client";

import { useEffect, useRef, useState } from "react";

interface KrishiRobotAvatarProps {
  size?: number;
  className?: string;
}

export default function KrishiRobotAvatar({ size = 120, className = "" }: KrishiRobotAvatarProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const maxDist = 3.5;
      setEyeOffset({
        x: Math.cos(angle) * maxDist,
        y: Math.sin(angle) * maxDist,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 130);
      setTimeout(blink, 3000 + Math.random() * 3000);
    };
    const t = setTimeout(blink, 2500);
    return () => clearTimeout(t);
  }, []);

  const LEX = 46, LEY = 52;
  const REX = 74, REY = 52;

  return (
    <svg
      ref={containerRef}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer select-none ${className}`}
      style={{
        transition: "transform 0.25s, filter 0.25s",
        transform: isHovered ? "scale(1.1)" : "scale(1)",
        filter: isHovered
          ? "drop-shadow(0 0 16px rgba(34,197,94,0.8))"
          : "drop-shadow(0 0 6px rgba(34,197,94,0.4))",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setEyeOffset({ x: 0, y: 0 });
      }}
    >
      <defs>
        <clipPath id="circ"><circle cx="60" cy="60" r="58" /></clipPath>
        <radialGradient id="skygrad" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#f5c842" />
          <stop offset="60%" stopColor="#a8d448" />
          <stop offset="100%" stopColor="#3a7d1e" />
        </radialGradient>
        <radialGradient id="helmetgrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#6dbe2e" />
          <stop offset="70%" stopColor="#2d7a0a" />
          <stop offset="100%" stopColor="#1a4f05" />
        </radialGradient>
        <radialGradient id="bodygrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
        <radialGradient id="eyeglow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffff44" />
          <stop offset="50%" stopColor="#ccee00" />
          <stop offset="100%" stopColor="#669900" />
        </radialGradient>
      </defs>

      <circle cx="60" cy="60" r="59" fill="#1a1a1a" stroke="#22c55e" strokeWidth="2.5" />

      <g clipPath="url(#circ)">
        <rect x="0" y="0" width="120" height="120" fill="url(#skygrad)" />
        <ellipse cx="60" cy="108" rx="68" ry="28" fill="#3a7d1e" />
        <ellipse cx="60" cy="105" rx="55" ry="18" fill="#4a9a24" />
        <ellipse cx="18" cy="78" rx="12" ry="14" fill="#2d6e10" />
        <rect x="15" y="85" width="6" height="10" fill="#5a3010" />
        <ellipse cx="102" cy="78" rx="12" ry="14" fill="#2d6e10" />
        <rect x="99" y="85" width="6" height="10" fill="#5a3010" />
        <path d="M28 44 Q22 38 26 32" stroke="#22c55e" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M24 48 Q14 39 20 28" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M92 44 Q98 38 94 32" stroke="#22c55e" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M96 48 Q106 39 100 28" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        <rect x="38" y="72" width="44" height="34" rx="10" fill="url(#bodygrad)" stroke="#222" strokeWidth="1" />
        <rect x="22" y="74" width="18" height="28" rx="9" fill="url(#bodygrad)" stroke="#222" strokeWidth="1" />
        <rect x="80" y="74" width="18" height="28" rx="9" fill="url(#bodygrad)" stroke="#222" strokeWidth="1" />
        <ellipse cx="31" cy="104" rx="11" ry="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <ellipse cx="89" cy="104" rx="11" ry="6" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <ellipse cx="60" cy="103" rx="18" ry="8" fill="#6b3a1f" />
        <ellipse cx="60" cy="101" rx="14" ry="5" fill="#7c4a25" />
        <rect x="58.5" y="84" width="3" height="18" rx="1.5" fill="#2d7a0a" />
        <ellipse cx="52" cy="86" rx="8" ry="5" fill="#3aaa18" transform="rotate(-30 52 86)" />
        <ellipse cx="68" cy="86" rx="8" ry="5" fill="#3aaa18" transform="rotate(30 68 86)" />
        <rect x="52" y="60" width="16" height="14" rx="4" fill="#1e1e1e" />
        <ellipse cx="60" cy="50" rx="28" ry="30" fill="url(#helmetgrad)" stroke="#1a5c0a" strokeWidth="1.5" />
        <ellipse cx="52" cy="36" rx="8" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-20 52 36)" />
        <ellipse cx="60" cy="60" rx="28" ry="7" fill="#111" stroke="#1a5c0a" strokeWidth="1.2" />
        <ellipse cx="60" cy="59" rx="22" ry="5" fill="#0d1a0d" opacity="0.8" />
        <rect x="58.5" y="20" width="3" height="10" rx="1.5" fill="#2d7a0a" />
        <ellipse cx="60" cy="18" rx="7" ry="5" fill="#4ade80" transform="rotate(-15 60 18)" />

        {/* Eyes white */}
        <circle cx={LEX} cy={LEY} r="8" fill="white" />
        <circle cx={REX} cy={REY} r="8" fill="white" />
        <circle cx={LEX} cy={LEY} r="8" fill="none" stroke="#aaee00" strokeWidth="1.5" opacity="0.6" />
        <circle cx={REX} cy={REY} r="8" fill="none" stroke="#aaee00" strokeWidth="1.5" opacity="0.6" />

        {/* Pupils */}
        {!isBlinking ? (
          <>
            <circle cx={LEX + eyeOffset.x} cy={LEY + eyeOffset.y} r="5" fill="url(#eyeglow)" />
            <circle cx={REX + eyeOffset.x} cy={REY + eyeOffset.y} r="5" fill="url(#eyeglow)" />
            <circle cx={LEX + eyeOffset.x - 2} cy={LEY + eyeOffset.y - 2} r="1.8" fill="white" opacity="0.7" />
            <circle cx={REX + eyeOffset.x - 2} cy={REY + eyeOffset.y - 2} r="1.8" fill="white" opacity="0.7" />
          </>
        ) : (
          <>
            <ellipse cx={LEX} cy={LEY} rx="5" ry="1" fill="url(#eyeglow)" />
            <ellipse cx={REX} cy={REY} rx="5" ry="1" fill="url(#eyeglow)" />
          </>
        )}
      </g>

      {/* Swoosh (logo style) */}
      <path d="M10 112 Q40 100 60 108 Q80 116 110 104" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M10 115 Q40 103 60 111 Q80 119 110 107" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />

      <circle cx="60" cy="60" r="58" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.8" />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#4ade80" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}