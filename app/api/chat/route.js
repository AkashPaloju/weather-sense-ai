// app/api/chat/route.js
import { NextResponse } from "next/server";
import {
  GEMINI_MODEL,
  callGemini,
  isJapaneseText,
  translateTextJPtoEN,
} from "../../lib/ai"; // adjust path if your lib is elsewhere

export const runtime = "nodejs";

/**
Strict contract:
- Request body:
  {
    "history": [ { "role": "user"|"assistant"|"system", "text": "<EN text>" }, ... ],
    "message": "<user message in EN or JP>",
    "context": { "category": "...", "weather": {"city","temp","condition","wind"} }
  }

- Response:
  {
    "reply_en": "...",
    "reply_jp": "...",
    "raw": "...",
    "_meta": { ... }
  }

Notes:
- FRONTEND MUST send history[].text in EN only.
- Backend will translate message->EN if it detects JP.
- Backend always returns both reply_en and reply_jp.
*/

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid JSON" }, { status: 400 });

    const { history = [], message = "", context = {} } = body;
    if (!Array.isArray(history)) return NextResponse.json({ error: "history must be array" }, { status: 400 });
    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    console.log(history, message, context);

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    const meta = { detectedUserLanguage: null, messageTranslated: false, geminiStatus: null };

    // 1) If message is Japanese -> translate to English (only the incoming message)
    const userIsJP = isJapaneseText(message);
    meta.detectedUserLanguage = userIsJP ? "ja" : "en";

    let enMessage = message;
    if (userIsJP) {
      const tr = await translateTextJPtoEN(message, API_KEY);
      enMessage = tr.text || message;
      meta.messageTranslated = !!tr.text;
    }

    // 2) Build the English prompt using history (which must already be English) + enMessage
    // Limit history length to last 8 messages to save tokens
    const trimmedHistory = history.slice(-8);
    const historyText = trimmedHistory
      .map((m) => `${(m.role || "user").toUpperCase()}: ${String(m.text || "").replace(/\n/g, " ")}`)
      .join("\n");

    const weather = context.weather || {};
    const category = context.category || "general";

    const systemText = `You are a helpful assistant specialized in ${category}. Use the weather context when relevant. Weather: ${weather.city || "unknown"}, ${weather.temp ?? "N/A"}°C, ${weather.condition || "N/A"}, wind ${weather.wind ?? "N/A"} m/s. Keep answers practical and concise.`;

    const prompt = `
System: ${systemText}

Conversation history:
${historyText}

User: ${enMessage}

Reply in clear, helpful English. Do not return JSON; return plain text.
`.trim();

    // 3) Call Gemini (English)
    const gemResp = await callGemini(prompt, API_KEY, GEMINI_MODEL, 800);
    meta.geminiStatus = gemResp.status;
    const reply_en = (gemResp.raw || "").trim();

    // 4) Translate reply_en -> Japanese (single call), always return reply_jp
    let reply_jp = null;
    try {
      // Use a safe translate prompt; callGemini returns raw text
      const translatePrompt = `Translate the following English text into natural Japanese. Return only the translation as plain text.\n\n${reply_en}`;
      const trResp = await callGemini(translatePrompt, API_KEY, GEMINI_MODEL, 400);
      reply_jp = (trResp.raw || "").trim();
    } catch (e) {
      // fallback: blank or small copy
      reply_jp = "";
      console.error("translate EN->JP error:", e);
    }

    // 5) Return both English and Japanese replies
    return NextResponse.json({
      message_en: enMessage,
      reply_en,
      reply_jp,
      raw: gemResp.raw,
      _meta: {
        detectedUserLanguage: meta.detectedUserLanguage,
        messageTranslated: meta.messageTranslated,
        geminiStatus: meta.geminiStatus,
      },
    }, { status: 200 });

  } catch (err) {
    console.error("chat route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
