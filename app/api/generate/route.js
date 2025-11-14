// app/api/generate/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ------------------------------
// Helpers
// ------------------------------

function extractJson(text) {
  try {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1) return null;
    const jsonText = text.slice(first, last + 1);
    return JSON.parse(jsonText);
  } catch (err) {
    return null;
  }
}

function normalize(obj, category, weather) {
  const out = {
    title: obj?.title || `${category} suggestions for ${weather.city}`,
    bullets: Array.isArray(obj?.bullets) ? obj.bullets.map(String) : [],
    summary: obj?.summary || "",
    reason: obj?.reason || "",
  };

  // enforce exactly 3 bullets
  if (out.bullets.length > 3) out.bullets = out.bullets.slice(0, 3);
  while (out.bullets.length < 3) out.bullets.push("Adjust as needed.");

  return out;
}

async function callGemini(prompt, API_KEY, model = "gemini-2.0-flash") {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const json = await res.json();
  const rawText =
    json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return { rawText, full: json };
}

async function translateToJapanese(obj, API_KEY) {
  const prompt = `
Translate the VALUES of this JSON into natural Japanese.
Keep the same keys.
Return ONLY valid JSON.

${JSON.stringify(obj)}
  `;

  const resp = await callGemini(prompt, API_KEY, "gemini-2.0-flash");
  const parsed = extractJson(resp.rawText);
  if (parsed) return parsed;

  return { ...obj, _jp_translation_failed: true };
}

// ------------------------------
// MAIN HANDLER
// ------------------------------

export async function POST(req) {
  try {
    const body = await req.json();
    const { category, user_text, weather } = body || {};

    if (!user_text || !weather) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    console.log("Received request:", { category, user_text, weather });

    const API_KEY = process.env.GEMINI_API_KEY;

    // -------------------------
    // Step 1 — English generation
    // -------------------------
    const enPrompt = `
You are a domain specialist AI.
Category: ${category}

Weather:
- City: ${weather.city}
- Temp: ${weather.temp}°C
- Condition: ${weather.condition}
- Wind: ${weather.wind} m/s

User: ${user_text}

Generate EXACT JSON ONLY:
{
  "title": "...",
  "bullets": ["...", "...", "..."],
  "summary": "...",
  "reason": "..."
}
No markdown. No comments.
    `;

    const enGen = await callGemini(enPrompt, API_KEY);
    const enParsed = extractJson(enGen.rawText);

    const enFinal = normalize(enParsed, category, weather);

    // -------------------------
    // Step 2 — Japanese translation
    // -------------------------
    const jpFinal = await translateToJapanese(enFinal, API_KEY);

    // -------------------------
    // Response to frontend
    // -------------------------
    return NextResponse.json({
      en: enFinal,
      jp: jpFinal,
      _meta: {
        model: "gemini-2.0-flash",
        tokens: enGen.full?.usageMetadata,
        translationSuccess: !jpFinal._jp_translation_failed
      }
    });

  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
