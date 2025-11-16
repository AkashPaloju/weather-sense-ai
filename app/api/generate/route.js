// app/api/generate/route.js
import { NextResponse } from "next/server";
import { callGemini, translateTextENtoJP, translateTextJPtoEN, formatStructuredToAssistantText } from "../../lib/ai";

export const runtime = "nodejs";

function buildGeneratePrompt_EN({ weather, user_text, category = "general" }) {
  // Return prompt asking model to produce ONLY JSON in English with specific fields
  const summary = `Weather: ${weather?.city || "unknown"}, ${weather?.temp ?? "N/A"}°C, ${weather?.condition || "N/A"}, wind ${weather?.wind ?? "N/A"} m/s.`;
  return `
You are a helpful domain specialist writing short actionable suggestions in English.

Context:
${summary}
Category: ${category}

User question:
${user_text}

Task:
Return ONLY a valid JSON object (no surrounding text) with the following fields:
{
  "title": "<short title>",
  "bullets": ["short bullet 1","short bullet 2","short bullet 3"],
  "summary": "<one or two sentence summary>",
  "reason": "<one-line reason why these suggestions>"
}

Bullets: give 3 concise actionable bullets targeted to the category and weather.
Be practical and concise. Use natural English.
  `.trim();
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "invalid JSON" }, { status: 400 });

    const { user_text, weather = {}, category = "general" } = body;
    if (!user_text || typeof user_text !== "string" || !user_text.trim()) {
      return NextResponse.json({ error: "user_text required" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

    // Ensure english prompt generation
    const promptEN = buildGeneratePrompt_EN({ weather, user_text, category });

    // Call Gemini to get JSON text (ask it to return ONLY JSON)
    const gen = await callGemini(promptEN, API_KEY, undefined, 700);
    const rawText = (gen.raw || "").trim();

    // Try to parse returned JSON. If parsing fails, attempt to strip fences and try again.
    let enParsed = null;
    let attemptText = rawText.replace(/```json|```/g, "").trim();

    try {
      enParsed = JSON.parse(attemptText);
    } catch (e) {
      // fallback: attempt to extract JSON substring
      const jsonMatch = attemptText.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        try {
          enParsed = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          enParsed = null;
        }
      }
    }

    // If still null, fallback to basic structured object with raw text in summary
    if (!enParsed) {
      enParsed = {
        title: "",
        bullets: [],
        summary: attemptText,
        reason: ""
      };
    }

    // Build Japanese version by translating each field separately (clean)
    const jp = { title: "", bullets: [], summary: "", reason: "" };
    // translate title
    if (enParsed.title) {
      const t = await translateTextENtoJP(enParsed.title, API_KEY);
      jp.title = t.text || "";
    }
    // translate bullets
    if (Array.isArray(enParsed.bullets)) {
      for (const b of enParsed.bullets) {
        const t = await translateTextENtoJP(b, API_KEY);
        jp.bullets.push(t.text || "");
      }
    }
    // translate summary & reason
    if (enParsed.summary) {
      const t = await translateTextENtoJP(enParsed.summary, API_KEY);
      jp.summary = t.text || "";
    }
    if (enParsed.reason) {
      const t = await translateTextENtoJP(enParsed.reason, API_KEY);
      jp.reason = t.text || "";
    }

    return NextResponse.json({
      en: enParsed,
      jp,
      _meta: { modelStatus: gen.status || null }
    }, { status: 200 });

  } catch (err) {
    console.error("generate route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
