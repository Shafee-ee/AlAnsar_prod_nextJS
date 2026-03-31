import { NextResponse } from "next/server";

const MODEL = "models/gemini-2.0-flash";

function cleanOutput(text) {
  if (!text) return "";

  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/[*#>_`]/g, "");

  return text.trim();
}

export async function POST(req) {
  try {
    const body = await req.json();

    const { text, title, content, targetLang } = body;

    if (!targetLang || (!text && !title && !content)) {
      return NextResponse.json({ translated: null });
    }

    async function translateSingle(input) {
      if (!input) return "";

      const prompt = `
Translate the text into ${targetLang}.
STRICT RULES:
- ONLY return the translated sentence.
- NO explanations.
- NO markdown.
- Preserve Islamic terms exactly.

TEXT:
${input}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.0 },
          }),
        }
      );

      const data = await response.json();

      const raw =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || input;

      return cleanOutput(raw);
    }

    // 🔹 OLD SYSTEM (QnA, etc.)
    if (text) {
      const trimmed = text.trim();

      if (!trimmed) {
        return NextResponse.json({ translated: "" });
      }

      const looksKannada = /[\u0C80-\u0CFF]/.test(trimmed);

      if (targetLang === "kn" && looksKannada) {
        return NextResponse.json({ translated: trimmed });
      }

      const translatedText = await translateSingle(trimmed);

      return NextResponse.json({ translated: translatedText });
    }

    // 🔹 NEW ARTICLES SYSTEM
    const translatedTitle = await translateSingle(title || "");
    const translatedContent = await translateSingle(content || "");

    return NextResponse.json({
      title: translatedTitle,
      content: translatedContent,
    });

  } catch (err) {
    console.error("Fatal translate error:", err);

    return NextResponse.json({ translated: null });
  }
}