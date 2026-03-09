import { NextRequest, NextResponse } from 'next/server';

// ── Types ──────────────────────────────────────────────────────
export interface SprayingCondition {
  label: string;
  value: string;
  status: 'good' | 'bad' | 'warning';
  icon: string;
}

export interface SprayingRecommendation {
  icon: string;
  title: string;
  description: string;
  severity: 'danger' | 'warning' | 'info';
}

export interface SprayingResult {
  canSpray: boolean;           // true = Recommended, false = Not Recommended
  statusLabel: string;
  conditions: SprayingCondition[];
  recommendations: SprayingRecommendation[];
  bestTimeToSpray: string;     // e.g. "Early morning 6–8 AM"
  analyzedAt: string;
}

// ── Core Decision Logic ────────────────────────────────────────
function analyzeSprayingConditions(
  tempC: number,
  windKmh: number,
  humidityPct: number,
  rainProbPct: number,
): SprayingResult {

  const issues: SprayingRecommendation[] = [];
  const conditions: SprayingCondition[] = [];
  let canSpray = true;

  // ── Temperature ─────────────────────────────────────────────
  // Ideal: 15–30°C  |  Too hot >35°C causes rapid evaporation
  // Too cold <10°C reduces effectiveness
  let tempStatus: 'good' | 'bad' | 'warning' = 'good';
  if (tempC > 35) {
    tempStatus = 'bad';
    canSpray = false;
    issues.push({
      icon: '🌡️',
      title: 'Temperature too high',
      description: 'Spray evaporates quickly above 35°C. Apply early morning or evening when cooler.',
      severity: 'danger',
    });
  } else if (tempC < 10) {
    tempStatus = 'bad';
    canSpray = false;
    issues.push({
      icon: '❄️',
      title: 'Temperature too low',
      description: 'Pesticide effectiveness drops below 10°C. Wait for warmer conditions.',
      severity: 'danger',
    });
  } else if (tempC > 30) {
    tempStatus = 'warning';
    issues.push({
      icon: '🌡️',
      title: 'Temperature slightly high',
      description: 'Spray early morning (before 9 AM) to avoid rapid evaporation.',
      severity: 'warning',
    });
  }
  conditions.push({
    label: 'Temperature',
    value: `${tempC.toFixed(1)}°C`,
    status: tempStatus,
    icon: '🌡️',
  });

  // ── Wind Speed ───────────────────────────────────────────────
  // Ideal: <15 km/h  |  Dangerous: >20 km/h (spray drift)
  let windStatus: 'good' | 'bad' | 'warning' = 'good';
  if (windKmh > 20) {
    windStatus = 'bad';
    canSpray = false;
    issues.push({
      icon: '💨',
      title: 'Wind speed too high',
      description: 'Postpone spraying until wind drops below 15 km/h to prevent chemical drift onto other crops.',
      severity: 'danger',
    });
  } else if (windKmh > 15) {
    windStatus = 'warning';
    issues.push({
      icon: '💨',
      title: 'Moderate wind — spray with care',
      description: 'Wind is borderline. Spray low to the crop and avoid drift to neighbours.',
      severity: 'warning',
    });
  } else if (windKmh < 3) {
    windStatus = 'warning';
    issues.push({
      icon: '🍃',
      title: 'Very calm wind',
      description: 'Very low wind can cause spray to concentrate in one spot. Move the sprayer steadily.',
      severity: 'info',
    });
  }
  conditions.push({
    label: 'Wind Speed',
    value: `${windKmh.toFixed(1)} km/h`,
    status: windStatus,
    icon: '💨',
  });

  // ── Humidity ─────────────────────────────────────────────────
  // Ideal: 40–80%  |  Too low <30% = rapid evaporation  |  Too high >90% = disease risk
  let humStatus: 'good' | 'bad' | 'warning' = 'good';
  if (humidityPct > 90) {
    humStatus = 'warning';
    issues.push({
      icon: '💧',
      title: 'Very high humidity',
      description: 'High humidity slows drying and may promote fungal growth. Ensure good ventilation after spraying.',
      severity: 'warning',
    });
  } else if (humidityPct < 30) {
    humStatus = 'bad';
    canSpray = false;
    issues.push({
      icon: '🏜️',
      title: 'Humidity too low',
      description: 'Below 30% humidity causes rapid spray evaporation before absorption. Spray in early morning when humidity is higher.',
      severity: 'danger',
    });
  }
  conditions.push({
    label: 'Humidity',
    value: `${humidityPct}%`,
    status: humStatus,
    icon: '💧',
  });

  // ── Rain Probability ─────────────────────────────────────────
  // If >30% rain chance, spray can wash off before being effective
  let rainStatus: 'good' | 'bad' | 'warning' = 'good';
  if (rainProbPct > 50) {
    rainStatus = 'bad';
    canSpray = false;
    issues.push({
      icon: '🌧️',
      title: 'Rain likely',
      description: 'High rain probability will wash off the spray. Wait for a dry window of at least 4–6 hours.',
      severity: 'danger',
    });
  } else if (rainProbPct > 30) {
    rainStatus = 'warning';
    issues.push({
      icon: '🌦️',
      title: 'Rain possible',
      description: 'Check product label for required rain-free period after application. Plan for 4+ dry hours.',
      severity: 'warning',
    });
  }
  conditions.push({
    label: 'Rain Probability',
    value: `${rainProbPct}%`,
    status: rainStatus,
    icon: '🌧️',
  });

  // ── Best Time To Spray ───────────────────────────────────────
  let bestTime = 'Early morning (6–9 AM) or evening (5–7 PM)';
  if (!canSpray) {
    bestTime = 'Wait for better conditions — check again in a few hours';
  } else if (tempC > 28) {
    bestTime = 'Early morning (6–8 AM) — before heat builds';
  } else if (humidityPct > 80) {
    bestTime = 'Mid-morning (9–11 AM) — after dew has dried';
  }

  // ── If no issues found ───────────────────────────────────────
  if (issues.length === 0) {
    issues.push({
      icon: '✅',
      title: 'All conditions are ideal',
      description: 'Temperature, wind, humidity and rain outlook are all within safe spraying range.',
      severity: 'info',
    });
  }

  return {
    canSpray,
    statusLabel: canSpray ? 'Recommended' : 'Not Recommended',
    conditions,
    recommendations: issues,
    bestTimeToSpray: bestTime,
    analyzedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

// ── API Handler ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Accept weather params directly from query string
  // so the frontend can pass its already-fetched weather data
  const temp     = parseFloat(searchParams.get('temp')     || '25');
  const wind     = parseFloat(searchParams.get('wind')     || '10');
  const humidity = parseFloat(searchParams.get('humidity') || '60');
  const rain     = parseFloat(searchParams.get('rain')     || '10');

  const result = analyzeSprayingConditions(temp, wind, humidity, rain);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { temp = 25, wind = 10, humidity = 60, rain = 10 } = body;
    const result = analyzeSprayingConditions(
      parseFloat(temp),
      parseFloat(wind),
      parseFloat(humidity),
      parseFloat(rain),
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}