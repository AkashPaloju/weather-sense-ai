// app/api/chat/route.js
import { NextResponse } from "next/server";
import {
  GEMINI_MODEL,
  callGemini,
  isJapaneseText,
  translateTextJPtoEN,
  translateTextENtoJP,
} from "../../lib/ai";

export const runtime = "nodejs";

function buildChatSystemText(category = "general", weather = {}) {
  return `You are a helpful assistant specialized in ${category}. Use the weather context when relevant.
Weather: ${weather?.city || "unknown"}, ${weather?.temp ?? "N/A"}°C, ${weather?.condition || "N/A"}, wind ${weather?.wind ?? "N/A"} m/s.
Keep responses practical, concise, and user-focused.`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid JSON" }, { status: 400 });

    const { history = [], message = "", context = {} } = body;
    if (!Array.isArray(history)) return NextResponse.json({ error: "history must be array" }, { status: 400 });
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    const meta = { detectedUserLanguage: null, messageTranslated: false, geminiStatus: null };

    // 1) Translate incoming message if Japanese
    const userIsJP = isJapaneseText(message);
    meta.detectedUserLanguage = userIsJP ? "ja" : "en";

    let enMessage = message;
    if (userIsJP) {
      const t = await translateTextJPtoEN(message, API_KEY);
      enMessage = t.text || message;
      meta.messageTranslated = !!t.text;
    }

    // 2) Build prompt using EN-only history and enMessage
    // History must be array of objects { role, text } where text is EN
    const trimmedHistory = history.slice(-8);
    const historyText = trimmedHistory
      .map(m => `${(m.role || "user").toUpperCase()}: ${String(m.text || "").replace(/\n/g, " ")}`)
      .join("\n");

    const category = (context?.category || "general").toLowerCase();
    const weather = context?.weather || {};

    const systemText = buildChatSystemText(category, weather);

    const prompt = `
System: ${systemText}

Conversation history:
${historyText}

User: ${enMessage}

Reply in clear helpful English. Be concise. Use the weather info if relevant.
Return plain text only (no JSON).
`.trim();

    // 3) Call Gemini
    const gem = await callGemini(prompt, API_KEY, GEMINI_MODEL, 800);
    meta.geminiStatus = gem.status;
    const reply_en = (gem.raw || "").trim();

    // 4) Translate reply_en -> Japanese
    let reply_jp = "";
    try {
      const tr = await translateTextENtoJP(reply_en, API_KEY);
      reply_jp = tr.text || "";
    } catch (e) {
      reply_jp = "";
    }

    // 5) Return reply_en + reply_jp + message_en so frontend can store
    return NextResponse.json({
      message_en: enMessage,
      reply_en,
      reply_jp,
      raw: gem.raw,
      _meta: {
        detectedUserLanguage: meta.detectedUserLanguage,
        messageTranslated: meta.messageTranslated,
        geminiStatus: meta.geminiStatus
      }
    }, { status: 200 });

  } catch (err) {
    console.error("chat route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
