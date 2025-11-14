// app/api/geocode/route.js
import { NextResponse } from "next/server";

/**
 * GET /api/geocode?query=...  (autocomplete)
 * GET /api/geocode?lat=..&lon=..  (reverse)
 *
 * Uses Open-Meteo Geocoding:
 * - https://geocoding-api.open-meteo.com/v1/search?name={query}&count=7&language=en&format=json
 * - https://geocoding-api.open-meteo.com/v1/reverse?latitude={lat}&longitude={lon}&format=json
 */

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!query && !(lat && lon)) {
      return NextResponse.json({ error: "Provide query or lat+lon" }, { status: 400 });
    }

    if (query) {
      const q = encodeURIComponent(query);
      // limit results to 7
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=7&language=en&format=json`;
      const r = await fetch(url);
      if (!r.ok) {
        const txt = await r.text();
        return NextResponse.json({ error: "geocoding fetch failed", details: txt }, { status: r.status });
      }
      const j = await r.json();
      const results = (j.results || []).map((it) => ({
        name: it.name || "",
        country: it.country || "",
        admin1: it.admin1 || "",
        lat: it.latitude,
        lon: it.longitude,
        timezone: it.timezone || null,
        // display label useful for autocomplete UI
        display: `${it.name}${it.admin1 ? ", " + it.admin1 : ""}${it.country ? ", " + it.country : ""}`
      }));
      return NextResponse.json({ results }, { status: 200 });
    }

    // reverse geocode
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&format=json`;
    const rr = await fetch(url);
    if (!rr.ok) {
      const txt = await rr.text();
      return NextResponse.json({ error: "reverse geocoding failed", details: txt }, { status: rr.status });
    }
    const jr = await rr.json();
    // open-meteo reverse returns "results" as well
    const results = (jr.results || []).map((it) => ({
      name: it.name || "",
      country: it.country || "",
      admin1: it.admin1 || "",
      lat: it.latitude,
      lon: it.longitude,
      timezone: it.timezone || null,
      display: `${it.name}${it.admin1 ? ", " + it.admin1 : ""}${it.country ? ", " + it.country : ""}`
    }));
    return NextResponse.json({ results }, { status: 200 });

  } catch (err) {
    console.error("geocode error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
