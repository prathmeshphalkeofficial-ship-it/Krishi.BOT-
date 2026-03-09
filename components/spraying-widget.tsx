'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types (mirror route.ts) ────────────────────────────────────
interface SprayingCondition {
  label: string;
  value: string;
  status: 'good' | 'bad' | 'warning';
  icon: string;
}

interface SprayingRecommendation {
  icon: string;
  title: string;
  description: string;
  severity: 'danger' | 'warning' | 'info';
}

interface SprayingResult {
  canSpray: boolean;
  statusLabel: string;
  conditions: SprayingCondition[];
  recommendations: SprayingRecommendation[];
  bestTimeToSpray: string;
  analyzedAt: string;
}

interface SprayingWidgetProps {
  // Pass your existing weather values here
  temperature?: number;   // °C
  windSpeed?: number;     // km/h
  humidity?: number;      // %
  rainProbability?: number; // %
  className?: string;
}

export default function SprayingWidget({
  temperature = 27,
  windSpeed = 15.6,
  humidity = 65,
  rainProbability = 32,
  className = '',
}: SprayingWidgetProps) {
  const [result, setResult]     = useState<SprayingResult | null>(null);
  const [loading, setLoading]   = useState(true);
  const [animIn, setAnimIn]     = useState(false);

  const analyze = useCallback(async () => {
    setLoading(true);
    setAnimIn(false);
    try {
      const params = new URLSearchParams({
        temp:     String(temperature),
        wind:     String(windSpeed),
        humidity: String(humidity),
        rain:     String(rainProbability),
      });
      const res  = await fetch(`/api/spraying?${params}`);
      const data = await res.json() as SprayingResult;
      setResult(data);
      setTimeout(() => setAnimIn(true), 50);
    } catch {
      // fallback: run logic client-side if API fails
      const fallback = clientFallback(temperature, windSpeed, humidity, rainProbability);
      setResult(fallback);
      setTimeout(() => setAnimIn(true), 50);
    } finally {
      setLoading(false);
    }
  }, [temperature, windSpeed, humidity, rainProbability]);

  useEffect(() => { analyze(); }, [analyze]);

  if (loading) return <SprayingShimmer />;
  if (!result)  return null;

  const { canSpray, statusLabel, conditions, recommendations, bestTimeToSpray, analyzedAt } = result;

  return (
    <div
      className={`font-sans ${className}`}
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        opacity:    animIn ? 1 : 0,
        transform:  animIn ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      {/* ── Status Card ── */}
      <div
        style={{
          background:   canSpray
            ? 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)'
            : 'linear-gradient(135deg, #fce4ec 0%, #fff8f8 100%)',
          borderRadius: '20px',
          padding:      '20px',
          marginBottom: '14px',
          border:       `1.5px solid ${canSpray ? '#a5d6a7' : '#f48fb1'}`,
          boxShadow:    '0 4px 20px rgba(0,0,0,0.07)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1a3c1a', letterSpacing: '-0.3px' }}>
              Current Spraying Status
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#888' }}>
              Analyzed at {analyzedAt}
            </p>
          </div>
          <button
            onClick={analyze}
            title="Refresh analysis"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border:     '1px solid #ddd',
              borderRadius: '50%',
              width: '32px', height: '32px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(180deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'rotate(0deg)')}
          >
            🔄
          </button>
        </div>

        {/* Status Badge */}
        <div style={{ marginBottom: '18px' }}>
          <span
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '7px',
              background:   canSpray ? '#fff' : '#fff',
              border:       `2px solid ${canSpray ? '#4caf50' : '#f44336'}`,
              borderRadius: '50px',
              padding:      '7px 18px',
              fontSize:     '14px',
              fontWeight:   800,
              color:        canSpray ? '#2e7d32' : '#c62828',
              boxShadow:    canSpray
                ? '0 2px 12px rgba(76,175,80,0.25)'
                : '0 2px 12px rgba(244,67,54,0.25)',
            }}
          >
            <span style={{
              width: '20px', height: '20px',
              background: canSpray ? '#4caf50' : '#f44336',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: '#fff', fontWeight: 900,
            }}>
              {canSpray ? '✓' : '✕'}
            </span>
            {statusLabel}
          </span>
        </div>

        {/* Conditions Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {conditions.map((c, i) => (
            <ConditionRow key={i} condition={c} />
          ))}
        </div>
      </div>

      {/* ── Recommendations Card ── */}
      <div
        style={{
          background:   '#fff',
          borderRadius: '20px',
          padding:      '20px',
          marginBottom: '14px',
          border:       '1.5px solid #e0e0e0',
          boxShadow:    '0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 800, color: '#1a3c1a' }}>
          Recommendations
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((r, i) => (
            <RecommendationRow key={i} rec={r} index={i} />
          ))}
        </div>
      </div>

      {/* ── Best Time Card ── */}
      <div
        style={{
          background:   'linear-gradient(135deg, #e3f2fd 0%, #f8fbff 100%)',
          borderRadius: '16px',
          padding:      '14px 18px',
          border:       '1.5px solid #bbdefb',
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          boxShadow:    '0 2px 12px rgba(33,150,243,0.1)',
        }}
      >
        <span style={{ fontSize: '24px' }}>⏰</span>
        <div>
          <p style={{ margin: 0, fontSize: '11px', color: '#1565c0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Best Time to Spray
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#0d47a1', fontWeight: 700 }}>
            {bestTimeToSpray}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────
function ConditionRow({ condition }: { condition: SprayingCondition }) {
  const colors = {
    good:    { dot: '#4caf50', bg: 'transparent', text: '#2e7d32' },
    bad:     { dot: '#f44336', bg: 'transparent', text: '#c62828' },
    warning: { dot: '#ff9800', bg: 'transparent', text: '#e65100' },
  };
  const c = colors[condition.status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Status dot */}
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: c.dot,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 2px 6px ${c.dot}55`,
      }}>
        <span style={{ fontSize: '11px', color: '#fff', fontWeight: 900 }}>
          {condition.status === 'good' ? '✓' : condition.status === 'bad' ? '✕' : '!'}
        </span>
      </div>
      {/* Label */}
      <span style={{ fontSize: '14px', color: '#444', flex: 1 }}>
        {condition.icon} {condition.label}:
      </span>
      {/* Value */}
      <span style={{ fontSize: '14px', fontWeight: 800, color: c.text }}>
        {condition.value}
      </span>
    </div>
  );
}

function RecommendationRow({ rec, index }: { rec: SprayingRecommendation; index: number }) {
  const severityColors = {
    danger:  { icon: '#f44336', bg: '#fff5f5', border: '#ffcdd2' },
    warning: { icon: '#ff9800', bg: '#fffbf0', border: '#ffe0b2' },
    info:    { icon: '#4caf50', bg: '#f1f8f1', border: '#c8e6c9' },
  };
  const s = severityColors[rec.severity];

  return (
    <div
      style={{
        display:      'flex',
        gap:          '12px',
        alignItems:   'flex-start',
        background:   s.bg,
        border:       `1px solid ${s.border}`,
        borderRadius: '12px',
        padding:      '12px 14px',
        animation:    `fadeUp 0.3s ease ${index * 0.08}s both`,
      }}
    >
      <span style={{
        fontSize:   '20px',
        flexShrink: 0,
        marginTop:  '1px',
        filter:     'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
      }}>
        {rec.icon}
      </span>
      <div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1a1a1a' }}>
          {rec.title}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#555', lineHeight: 1.45 }}>
          {rec.description}
        </p>
      </div>
    </div>
  );
}

function SprayingShimmer() {
  const pulse = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '10px',
  };
  return (
    <div style={{ padding: '4px' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ ...pulse, height: '160px', marginBottom: '14px' }} />
      <div style={{ ...pulse, height: '120px', marginBottom: '14px' }} />
      <div style={{ ...pulse, height: '56px' }} />
    </div>
  );
}

// ── Client-side fallback (if API unreachable) ──────────────────
function clientFallback(temp: number, wind: number, humidity: number, rain: number): SprayingResult {
  const issues: SprayingRecommendation[] = [];
  let canSpray = true;
  const conditions: SprayingCondition[] = [
    { label: 'Temperature',     value: `${temp}°C`,   status: temp > 35 || temp < 10 ? 'bad' : temp > 30 ? 'warning' : 'good', icon: '🌡️' },
    { label: 'Wind Speed',      value: `${wind} km/h`, status: wind > 20 ? 'bad' : wind > 15 ? 'warning' : 'good', icon: '💨' },
    { label: 'Humidity',        value: `${humidity}%`, status: humidity < 30 ? 'bad' : humidity > 90 ? 'warning' : 'good', icon: '💧' },
    { label: 'Rain Probability',value: `${rain}%`,     status: rain > 50 ? 'bad' : rain > 30 ? 'warning' : 'good', icon: '🌧️' },
  ];
  if (wind > 20)     { canSpray = false; issues.push({ icon: '💨', title: 'Wind speed too high', description: 'Postpone spraying until wind drops below 15 km/h.', severity: 'danger' }); }
  if (rain > 50)     { canSpray = false; issues.push({ icon: '🌧️', title: 'Rain likely', description: 'Wait for a dry window of at least 4–6 hours.', severity: 'danger' }); }
  if (temp > 35)     { canSpray = false; issues.push({ icon: '🌡️', title: 'Temperature too high', description: 'Spray early morning or evening when cooler.', severity: 'danger' }); }
  if (humidity < 30) { canSpray = false; issues.push({ icon: '🏜️', title: 'Humidity too low', description: 'Spray in early morning when humidity is higher.', severity: 'danger' }); }
  if (issues.length === 0) issues.push({ icon: '✅', title: 'All conditions are ideal', description: 'Safe to spray now.', severity: 'info' });
  return { canSpray, statusLabel: canSpray ? 'Recommended' : 'Not Recommended', conditions, recommendations: issues, bestTimeToSpray: 'Early morning (6–9 AM)', analyzedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
}