// app/api/weather/route.js
import { NextResponse } from "next/server";

/**
 * Enhanced weather route:
 * - GET /api/weather?city=Tokyo
 * - GET /api/weather?lat=35.68&lon=139.76
 *
 * Uses OpenWeatherMap Current Weather API (requires OPENWEATHER_KEY)
 * Docs: https://api.openweathermap.org/data/2.5/weather
 */

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = (searchParams.get("city") || "").trim();
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!city && !(lat && lon)) {
      return NextResponse.json({ error: "Provide city or lat+lon" }, { status: 400 });
    }

    const key = process.env.OPENWEATHER_KEY;
    if (!key) {
      return NextResponse.json({ error: "OPENWEATHER_KEY not configured" }, { status: 500 });
    }

    let url;
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${key}`;
    } else {
      // lat & lon present: use coordinates
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=metric&appid=${key}`;
    }

    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ error: "weather fetch failed", details: txt }, { status: r.status });
    }

    const data = await r.json();

    // map to normalized response
    const result = {
      city: data.name || (data?.sys?.country ? `${data?.sys?.country}` : ""),
      temp: data?.main?.temp ?? null,
      condition: data?.weather?.[0]?.description || "",
      wind: data?.wind?.speed ?? null,
      icon: data?.weather?.[0]?.icon || null, // e.g., "01d" - you can map to your icons on frontend
      raw: data
    };

    return NextResponse.json(result, { status: 200 });

  } catch (err) {
    console.error("weather route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
