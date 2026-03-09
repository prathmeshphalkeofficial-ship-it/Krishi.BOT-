'use client';

import { useState, useEffect } from 'react';
import SprayingWidget from '@/components/spraying-widget';

// ─────────────────────────────────────────────────────────────────
// HOW THIS PAGE WORKS:
//   1. It reads your existing weather data from /api/weather
//   2. Passes the values (temp, wind, humidity, rainChance) to
//      SprayingWidget which calls /api/spraying for the analysis
//   3. Shows a Forecast tab + Spraying tab just like the screenshot
// ─────────────────────────────────────────────────────────────────

interface WeatherData {
  temp:          number;   // °C
  feelsLike:     number;
  humidity:      number;   // %
  windSpeed:     number;   // km/h  ← adjust key if yours is different
  windKph?:      number;
  description:   string;
  city:          string;
  country:       string;
  rainProb:      number;   // % — set to 0 if your API doesn't return it
  icon:          string;
  forecast?:     ForecastDay[];
}

interface ForecastDay {
  day:       string;
  icon:      string;
  high:      number;
  low:       number;
  rainProb:  number;
}

type Tab = 'forecast' | 'spraying';

export default function SprayingPage() {
  const [weather, setWeather]   = useState<WeatherData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<Tab>('spraying');
  const [error, setError]       = useState('');

  // Fetch from YOUR existing weather API
  useEffect(() => {
    async function load() {
      try {
        // ── Adjust this URL to match your weather route ──────
        // If you use location: /api/weather?lat=XX&lon=YY
        // If you use city:     /api/weather?city=Pune
        // For now we call /api/weather — change as needed:
        const res  = await fetch('/api/weather');
        const data = await res.json();

        // ── Map your weather API response fields here ────────
        // This handles both OpenWeatherMap and common formats.
        // Adjust the field names to match YOUR actual response:
        const mapped: WeatherData = {
          temp:        data.main?.temp         ?? data.temp         ?? 27,
          feelsLike:   data.main?.feels_like   ?? data.feelsLike    ?? 26,
          humidity:    data.main?.humidity     ?? data.humidity     ?? 65,
          windSpeed:   (data.wind?.speed ?? data.windSpeed ?? 10) * 3.6,  // m/s → km/h if needed
          description: data.weather?.[0]?.description ?? data.description ?? 'Clear sky',
          city:        data.name               ?? data.city         ?? 'Your Location',
          country:     data.sys?.country       ?? data.country      ?? 'IN',
          icon:        data.weather?.[0]?.icon ?? data.icon         ?? '01d',
          rainProb:    data.pop != null
                         ? Math.round(data.pop * 100)
                         : (data.rainProbability ?? data.rainProb ?? 10),
        };
        setWeather(mapped);
      } catch (e) {
        setError('Could not load weather data. Using sample values.');
        // Fallback sample — real values will show once weather API responds
        setWeather({
          temp: 27, feelsLike: 28, humidity: 65, windSpeed: 15.6,
          description: 'Partly cloudy', city: 'Pune', country: 'IN',
          icon: '02d', rainProb: 32,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div
      style={{
        minHeight:   '100vh',
        background:  'linear-gradient(160deg, #d4edda 0%, #f0f7ee 40%, #e8f5e9 100%)',
        padding:     '0 0 40px',
        fontFamily:  "'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Top Header ── */}
      <div
        style={{
          background:    'linear-gradient(135deg, #2e7d32 0%, #388e3c 60%, #43a047 100%)',
          padding:       '28px 20px 0',
          borderRadius:  '0 0 28px 28px',
          boxShadow:     '0 6px 24px rgba(46,125,50,0.35)',
          marginBottom:  '20px',
        }}
      >
        {/* App name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <span style={{ fontSize: '26px' }}>🌱</span>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.5px' }}>
            Agri AI Weather
          </span>
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', cursor: 'pointer',
          }}>
            ❓
          </span>
        </div>

        {/* Location + temp strip */}
        {weather && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              style={{ width: '48px', height: '48px' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <p style={{ margin: 0, color: '#fff', fontWeight: 900, fontSize: '22px' }}>
                {weather.temp.toFixed(1)}°C
              </p>
              <p style={{ margin: 0, color: '#c8e6c9', fontSize: '13px', textTransform: 'capitalize' }}>
                {weather.description} · {weather.city}
              </p>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['forecast', 'spraying'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex:          1,
                padding:       '10px 0',
                border:        'none',
                cursor:        'pointer',
                borderRadius:  '12px 12px 0 0',
                fontWeight:    700,
                fontSize:      '14px',
                transition:    'all 0.2s',
                background:    tab === t ? '#fff' : 'transparent',
                color:         tab === t ? '#2e7d32' : 'rgba(255,255,255,0.75)',
                boxShadow:     tab === t ? '0 -2px 12px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t === 'forecast' ? '📅 Forecast' : '🪣 Spraying'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: '0 16px' }}>
        {error && (
          <div style={{
            background: '#fff3e0', border: '1px solid #ffcc80',
            borderRadius: '12px', padding: '10px 14px',
            fontSize: '13px', color: '#e65100', marginBottom: '14px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {tab === 'spraying' && (
          loading || !weather ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌾</div>
              <p style={{ fontWeight: 700 }}>Loading weather data…</p>
            </div>
          ) : (
            <SprayingWidget
              temperature={weather.temp}
              windSpeed={weather.windSpeed}
              humidity={weather.humidity}
              rainProbability={weather.rainProb}
            />
          )
        )}

        {tab === 'forecast' && (
          <ForecastTab weather={weather} loading={loading} />
        )}
      </div>
    </div>
  );
}

// ── Forecast Tab ───────────────────────────────────────────────
function ForecastTab({ weather, loading }: { weather: WeatherData | null; loading: boolean }) {
  if (loading || !weather) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
      <p>Loading forecast…</p>
    </div>
  );

  // Show today's detailed stats since we may not have multi-day forecast
  const stats = [
    { label: 'Temperature', value: `${weather.temp.toFixed(1)}°C`,   icon: '🌡️' },
    { label: 'Feels Like',  value: `${weather.feelsLike.toFixed(1)}°C`, icon: '🤚' },
    { label: 'Humidity',    value: `${weather.humidity}%`,            icon: '💧' },
    { label: 'Wind Speed',  value: `${weather.windSpeed.toFixed(1)} km/h`, icon: '💨' },
    { label: 'Rain Chance', value: `${weather.rainProb}%`,             icon: '🌧️' },
  ];

  return (
    <div>
      <div
        style={{
          background:   '#fff',
          borderRadius: '20px',
          padding:      '20px',
          boxShadow:    '0 4px 20px rgba(0,0,0,0.07)',
          border:       '1.5px solid #e0e0e0',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#1a3c1a', fontSize: '16px' }}>
          Today's Weather — {weather.city}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background:   '#f9fbe7',
                borderRadius: '14px',
                padding:      '14px',
                border:       '1px solid #dcedc8',
                textAlign:    'center',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#2e7d32' }}>{s.value}</p>
              <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#888', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spraying hint */}
      <div
        style={{
          marginTop: '14px',
          background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
          borderRadius: '16px',
          padding: '14px 18px',
          border: '1.5px solid #a5d6a7',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', color: '#2e7d32', fontWeight: 700 }}>
          💡 Switch to the Spraying tab to see if today is safe to spray your crops
        </p>
      </div>
    </div>
  );
}