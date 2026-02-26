import { NextRequest, NextResponse } from "next/server";

const ESP_IP = process.env.ESP8266_IP;

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "status";

  if (!ESP_IP) {
    return NextResponse.json({ success: false, error: "ESP8266_IP not set in .env.local" }, { status: 500 });
  }

  const paths: Record<string, string> = {
    on:     "/pump/on",
    off:    "/pump/off",
    status: "/status",
  };

  const path = paths[action];
  if (!path) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  try {
    const res = await fetch(`http://${ESP_IP}${path}`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch {
    return NextResponse.json({ success: false, error: "Cannot reach ESP8266. Check IP and WiFi." }, { status: 503 });
  }
}
