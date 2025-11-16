// app/lib/ai.js
// Helper utilities for calling Gemini (Google Generative Language API),
// simple JP detection, translation helpers, and small formatting helpers.

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function safeTrim(s) {
  if (!s && s !== "") return "";
  return String(s).trim();
}

export async function callGeminiRaw(prompt, apiKey, model = GEMINI_MODEL, maxOutputTokens = 400) {
  // Calls the Gemini generateContent endpoint and returns { text, status, rawJson }
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens,
      temperature: 0.4,
      // responseMimeType: "application/json" // avoid forcing mime; we parse returned text
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const status = res.status;
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    const txt = await res.text().catch(() => "");
    return { text: txt, status, rawJson: null };
  }

  // The returned structure contains `candidates` -> content -> parts[] -> text
  try {
    const candidates = json?.candidates || json?.candidate || [];
    if (Array.isArray(candidates) && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts || candidates[0]?.content || [];
      if (Array.isArray(parts) && parts.length > 0 && typeof parts[0]?.text === "string") {
        const text = parts.map(p => p.text).join("\n");
        return { text: safeTrim(text), status, rawJson: json };
      }
    }
    // Fallback: try older shape
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || json?.candidates?.[0]?.content?.parts || "";
    if (text) return { text: safeTrim(text), status, rawJson: json };
  } catch (e) {
    // ignore and fallback
  }

  // Fallback: stringified json or raw plain text
  return { text: safeTrim(JSON.stringify(json || "")), status, rawJson: json };
}

export async function callGemini(prompt, apiKey, model = GEMINI_MODEL, maxOutputTokens = 400) {
  // Thin wrapper that returns { raw: text, status }
  try {
    const r = await callGeminiRaw(prompt, apiKey, model, maxOutputTokens);
    return { raw: r.text, status: r.status, rawJson: r.rawJson };
  } catch (e) {
    return { raw: String(e || ""), status: 500, rawJson: null };
  }
}

// Heuristic for detecting Japanese text (hiragana/katakana/kanji)
export function isJapaneseText(text) {
  if (!text) return false;
  // If contains any Hiragana / Katakana / Kanji characters
  return /[\u3040-\u30ff\u4e00-\u9faf\u3000-\u303f]/.test(text);
}

// JP -> EN translator (uses a translation prompt)
export async function translateTextJPtoEN(textJP, apiKey, model = GEMINI_MODEL) {
  if (!textJP) return { text: "" };
  const prompt = `Translate the following Japanese text into natural, fluent English. Return ONLY the translation (no extra commentary):\n\n${textJP}`;
  const resp = await callGemini(prompt, apiKey, model, 300);
  return { text: resp.raw || "" };
}

// EN -> JP translator
export async function translateTextENtoJP(textEN, apiKey, model = GEMINI_MODEL) {
  if (!textEN) return { text: "" };
  const prompt = `Translate the following English text into natural Japanese. Return ONLY the translation (no extra commentary):\n\n${textEN}`;
  const resp = await callGemini(prompt, apiKey, model, 300);
  return { text: resp.raw || "" };
}

// Format structured results (title + bullets + summary) into a readable assistant string
export function formatStructuredToAssistantText(parsedStructured) {
  if (!parsedStructured) return "";
  const title = safeTrim(parsedStructured.title || "");
  let bullets = [];
  if (Array.isArray(parsedStructured.bullets)) {
    bullets = parsedStructured.bullets.map(b => safeTrim(b)).filter(Boolean);
  }
  const summary = safeTrim(parsedStructured.summary || "");
  const parts = [];
  if (title) parts.push(title);
  if (bullets.length) parts.push(bullets.map((b, i) => `${i + 1}. ${b}`).join("  "));
  if (summary) parts.push(summary);
  return parts.join("\n\n");
}
