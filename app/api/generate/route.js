// app/api/generate/route.js
import { NextResponse } from "next/server";
import { callGemini, extractJsonFromText, isJapaneseText, translateTextJPtoEN, translateObjectToJapanese, buildDomainPrompt, normalizeParsed } from "../../lib/ai";

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
