// app/api/generate/route.js
import { NextResponse } from "next/server";

function buildPrompt(weather, user_text, theme) {
  return `
You are a Japanese assistant. Respond in Japanese.

Weather:
- City: ${weather.city}
- Temperature: ${weather.temp}°C
- Condition: ${weather.condition}
- Wind: ${weather.wind} m/s

Theme: ${theme}
User message: ${user_text}

Return ONLY a valid JSON object like this:
{
  "title": "...",
  "bullets": ["...", "...", "..."],
  "summary": "..."
}
No markdown fences.
`.trim();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { user_text, weather, theme = "travel" } = body;

    if (!user_text) return NextResponse.json({ error: "user_text required" }, { status: 400 });
    if (!weather) return NextResponse.json({ error: "weather required" }, { status: 400 });

    const API_KEY = process.env.OPENROUTER_API_KEY;
    const MODEL = process.env.OPENROUTER_MODEL || "openrouter/gpt-4o-mini";

    const prompt = buildPrompt(weather, user_text, theme);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are a Japanese assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.4
      })
    });

    console.log("OpenRouter response status:", response);

    const json = await response.json();

    let text = json?.choices?.[0]?.message?.content || "";

    text = text.replace(/```json|```/g, "").trim();

    try {
      return NextResponse.json(JSON.parse(text));
    } catch (e) {
      return NextResponse.json({ raw: text });
    }

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
