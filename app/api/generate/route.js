// app/api/generate/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Full Option-C pipeline using Google Gemini (gemini-2.0-flash)
 * - Detect JP / EN (simple unicode check)
 * - If JP: translate JP -> EN via Gemini
 * - Call domain model prompt (EN) via Gemini to get structured JSON
 * - Normalize/validate schema (title, bullets[3], summary, reason)
 * - Translate EN JSON -> JP via Gemini
 * - Return { en, jp, _meta }
 *
 * Env:
 * - GEMINI_API_KEY must be set
 *
 * Notes:
 * - This is server-side only. Never expose GEMINI_API_KEY to the browser.
 * - If any LLM call fails, deterministic local fallback will be used.
 */

function isJapaneseText(s) {
  if (!s || typeof s !== "string") return false;
  // basic check for Hiragana, Katakana, or common Kanji range
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(s);
}

function extractJsonFromText(text) {
  if (!text || typeof text !== "string") return null;
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  const sub = text.slice(first, last + 1);
  try {
    return JSON.parse(sub);
  } catch (e) {
    return null;
  }
}

// Normalizers & deterministic fallbacks (safe outputs)
function fashionFallback(weather) {
  const t = Number(weather?.temp);
  if (!isNaN(t)) {
    if (t <= 0) {
      return {
        title: "Extreme cold — heavy protection",
        bullets: ["Heavy insulated coat (down)", "Scarf, gloves, warm hat", "Insulated boots"],
        summary: `${t}°C — very cold, prioritize insulation.`,
        reason: "Local fallback: temperature indicates extreme cold."
      };
    }
    if (t <= 8) {
      return {
        title: "Cold — warm layers",
        bullets: ["Thick jacket or sweater", "Scarf and gloves", "Warm shoes/boots"],
        summary: `${t}°C — cold; use warm layers.`,
        reason: "Local fallback: cool temperature."
      };
    }
    if (t <= 20) {
      return {
        title: "Mild — light jacket",
        bullets: ["Light jacket or long sleeve", "Comfortable trousers", "Normal shoes fine"],
        summary: `${t}°C — mild; light outerwear recommended.`,
        reason: "Local fallback: mild temperature."
      };
    }
    return {
      title: "Hot — light & breathable",
      bullets: ["Breathable short sleeves and shorts", "Hat and sunglasses", "Drink water frequently"],
      summary: `${t}°C — hot; choose breathable clothes.`,
      reason: "Local fallback: warm temperature."
    };
  }
  return {
    title: "Clothing suggestions",
    bullets: ["Check local forecast", "Dress in layers", "Keep hydration in mind"],
    summary: "No temperature data.",
    reason: "Local fallback: missing temperature."
  };
}

function agriFallback(weather) {
  const t = Number(weather?.temp);
  if (!isNaN(t) && t >= 30) {
    return {
      title: `Irrigation & heat precautions (${weather?.city || "location"})`,
      bullets: ["Increase irrigation in early morning/late evening", "Provide shade for sensitive crops", "Monitor soil moisture closely"],
      summary: "High temperature; take measures to protect crops from heat stress.",
      reason: "Local fallback for hot and dry conditions."
    };
  }
  if (weather?.condition && /rain/i.test(weather.condition)) {
    return {
      title: `Rain & drainage (${weather?.city || "location"})`,
      bullets: ["Ensure drainage to avoid waterlogging", "Delay fertilizer until fields dry", "Check for fungal signs"],
      summary: "Rain increases disease risk; protect fields and manage drainage.",
      reason: "Local fallback for rainy conditions."
    };
  }
  return {
    title: `General farm guidance (${weather?.city || "location"})`,
    bullets: ["Inspect irrigation schedule and soil moisture", "Check pest/disease signs", "Adjust field work schedule for safety"],
    summary: "General actionable farm tips.",
    reason: "Local fallback: default safe guidance."
  };
}

function travelFallback(weather) {
  if (weather?.condition && /rain/i.test(weather.condition)) {
    return {
      title: `Rain day tips (${weather?.city || "location"})`,
      bullets: ["Carry an umbrella & waterproof shoes", "Prefer indoor activities or covered walks", "Check public transport for delays"],
      summary: "Rain may disrupt outdoor plans; prepare accordingly.",
      reason: "Local fallback for rainy travel situations."
    };
  }
  const t = Number(weather?.temp);
  if (!isNaN(t) && t >= 30) {
    return {
      title: `Hot day tips (${weather?.city || "location"})`,
      bullets: ["Plan activities in early morning/late evening", "Carry water and wear a hat", "Avoid strenuous activities during peak heat"],
      summary: "High temperature; plan accordingly for heat safety.",
      reason: "Local fallback for hot travel days."
    };
  }
  return {
    title: `Travel suggestions (${weather?.city || "location"})`,
    bullets: ["Bring a light jacket", "Plan flexible itinerary with indoor options", "Check local transit & opening hours"],
    summary: "General travel guidance.",
    reason: "Local fallback: default travel suggestions."
  };
}

function musicFallback(weather) {
  const t = Number(weather?.temp);
  if (weather?.condition && /rain/i.test(weather.condition)) {
    return {
      title: `Rainy day comfort (${weather?.city || "location"})`,
      bullets: ["Lo-fi rain beats", "Mellow jazz", "Acoustic warmth"],
      summary: "Comforting tracks for rainy moods.",
      reason: "Local fallback for rainy weather music."
    };
  }
  if (!isNaN(t) && t >= 30) {
    return {
      title: `Upbeat summer picks (${weather?.city || "location"})`,
      bullets: ["Upbeat pop/dance", "Tropical house", "Summer hits playlist"],
      summary: "Energizing music for hot days.",
      reason: "Local fallback for sunny/hot conditions."
    };
  }
  return {
    title: `Chill suggestions (${weather?.city || "location"})`,
    bullets: ["Indie chill playlist", "Singer-songwriter set", "Relaxed instrumental mix"],
    summary: "General mellow listening suggestions.",
    reason: "Local fallback: default music."
  };
}

// Normalize parsed JSON and enforce 3 bullets
function normalizeParsed(parsed, category, weather) {
  if (!parsed || typeof parsed !== "object") {
    // return deterministic fallback
    if (category === "agri" || category === "agriculture") return agriFallback(weather);
    if (category === "travel") return travelFallback(weather);
    if (category === "music") return musicFallback(weather);
    return fashionFallback(weather);
  }
  const out = {
    title: parsed.title || `${category} suggestions (${weather?.city || "location"})`,
    bullets: Array.isArray(parsed.bullets) ? parsed.bullets.map(String) : [],
    summary: parsed.summary || "",
    reason: parsed.reason || ""
  };
  // enforce 3 bullets
  if (out.bullets.length > 3) out.bullets = out.bullets.slice(0, 3);
  while (out.bullets.length < 3) out.bullets.push("Adjust as needed.");
  return out;
}

// Gemini call helper
async function callGemini(prompt, apiKey, model = "gemini-2.0-flash", maxOutputTokens = 400) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens, responseMimeType: "text/plain" } // text/plain helps avoid strict MIME issues
    })
  });
  const json = await res.json();
  const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return { ok: res.ok, status: res.status, json, raw };
}

// High-level translate wrapper: expects an object -> returns parsed JSON or null
async function translateObjectToJapanese(obj, apiKey) {
  const prompt = `
Translate the VALUES of this JSON into natural Japanese. Keep the same keys and return only valid JSON.

${JSON.stringify(obj, null, 2)}
`;
  const r = await callGemini(prompt, apiKey);
  const parsed = extractJsonFromText(r.raw);
  return { parsed, raw: r.raw, meta: r };
}

async function translateTextJPtoEN(text, apiKey) {
  const prompt = `
Detect language and if the text is Japanese, translate it to fluent English. Return only the translated text as plain text (no JSON wrappers).
Text:
"""${text}"""
`;
  const r = await callGemini(prompt, apiKey);
  const raw = r.raw || "";
  // raw may contain extra commentary; return raw trimmed
  return { text: raw.trim(), meta: r };
}

// Build domain prompt for English domain model
function buildDomainPrompt(category, weather, user_text) {
  const weatherSummary = `Weather: ${weather?.city || "unknown"}, temp: ${weather?.temp}°C, condition: ${weather?.condition || "unknown"}, wind: ${weather?.wind ?? "N/A"} m/s.`;
  if (category === "agri" || category === "agriculture") {
    return `
You are an experienced agricultural advisor. Use the weather facts below and the user request to produce a concise JSON ONLY with the following schema:
{
  "title": "string",
  "bullets": ["string","string","string"],
  "summary": "string",
  "reason": "string"
}
Rules:
- Use numeric weather facts (temp, condition, wind) in reasoning.
- Provide three practical actions for farmers.
- Return ONLY valid JSON. No extra text.
Weather: ${weatherSummary}
User: ${user_text}
    `.trim();
  }
  if (category === "music") {
    return `
You are a music recommendation engine. Based on weather and user request, produce ONLY a JSON object:
{
  "title": "string",
  "bullets": ["string","string","string"],
  "summary": "string",
  "reason": "string"
}
Rules:
- Bullets should be 3 short music recommendations (genre/playlist/artist).
- No extra text other than the JSON.
Weather: ${weatherSummary}
User: ${user_text}
    `.trim();
  }
  if (category === "travel") {
    return `
You are a travel/outings advisor. Produce ONLY a JSON object with keys: title, bullets (3), summary, reason.
Rules:
- Provide 3 practical tips for travel/outings based on weather.
- No extra commentary.
Weather: ${weatherSummary}
User: ${user_text}
    `.trim();
  }
  // default: fashion
  return `
You are a clothing/outfit advisor. Produce ONLY a JSON object with keys: title, bullets (3), summary, reason.
Rules:
- Use numeric temperature and condition to suggest appropriate outfit components.
- Return ONLY valid JSON and nothing else.
Weather: ${weatherSummary}
User: ${user_text}
  `.trim();
}

// Main handler
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });

    const { category = "fashion", user_text = "", weather = {} } = body;
    if (!user_text || typeof weather.temp === "undefined") {
      return NextResponse.json({ error: "user_text and weather.temp required" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    const meta = {
      detectedUserLanguage: null,
      jpToEn: null,
      domainRaw: null,
      domainParsed: null,
      domainModel: "gemini-2.0-flash",
      en: null,
      jp: null
    };

    // 1) Detect if user_text is Japanese (quick heuristic)
    const userIsJP = isJapaneseText(user_text);
    meta.detectedUserLanguage = userIsJP ? "ja" : "en";

    // 2) If JP input -> translate JP -> EN
    let enUserText = user_text;
    if (userIsJP) {
      const trans = await translateTextJPtoEN(user_text, API_KEY);
      meta.jpToEn = { raw: trans.text, meta: trans.meta };
      enUserText = trans.text || user_text; // fallback to original if empty
    }

    // 3) Build domain prompt with enUserText and call Gemini domain model
    const domainPrompt = buildDomainPrompt(category, weather, enUserText);
    const domainResp = await callGemini(domainPrompt, API_KEY);
    meta.domainRaw = domainResp.raw;
    // Try to parse
    let parsed = extractJsonFromText(domainResp.raw);
    meta.domainParsed = parsed ? true : false;

    // Normalize (if parse failed, fallback)
    const enFinal = normalizeParsed(parsed, category, weather);
    meta.en = { sourceParsed: !!parsed, value: enFinal };

    // 4) Translate enFinal -> JP (attempt)
    const jpResult = await translateObjectToJapanese(enFinal, API_KEY);
    const jpParsed = jpResult.parsed;
    let jpFinal;
    if (jpParsed) {
      // ensure bullets length etc
      jpFinal = normalizeParsed(jpParsed, category, weather);
      meta.jp = { translated: true, raw: jpResult.raw };
    } else {
      // translation failed -> attempt a lightweight prompt to translate values one by one
      // As fallback, use English object but mark translation failed
      jpFinal = { ...enFinal, _translation_failed: true };
      meta.jp = { translated: false, raw: jpResult.raw || null };
    }

    // 5) Add meta and return both
    const out = {
      en: enFinal,
      jp: jpFinal,
      _meta: {
        model: meta.domainModel,
        detectedUserLanguage: meta.detectedUserLanguage,
        domainParsed: meta.domainParsed,
        domainRawSnippet: String(meta.domainRaw).slice(0, 800),
        translationSuccess: !!(jpParsed),
      }
    };

    return NextResponse.json(out, { status: 200 });
  } catch (err) {
    console.error("generate error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
