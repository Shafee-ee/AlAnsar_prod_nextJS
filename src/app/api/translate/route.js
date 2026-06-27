import { NextResponse } from "next/server";

const MODEL = "models/gemini-2.5-flash";

function cleanOutput(text) {
  if (!text) return "";

  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/[*#>_`]/g, "");

  return text.trim();
}

export async function POST(req) {
  try {
    const body = await req.json();

    const { text, title, content, sourceLang, targetLang } = body;

    const languageNames = {
      en: "English",
      kn: "Kannada",
    };

    const sourceLanguage = languageNames[sourceLang] || sourceLang;
    const targetLanguage = languageNames[targetLang] || targetLang;

    if (!targetLang || (!text && !title && !content)) {
      return NextResponse.json({ translated: null });
    }

    async function translateSingle(input) {
      if (!input) return "";

      const prompt = `
Translate the following ${sourceLanguage} text into ${targetLanguage}.

Rules:
- Return ONLY the translated text.
- Do NOT explain anything.
- Do NOT repeat the original language.
- Preserve Quranic verses, Arabic words, and Islamic terminology appropriately.
- Do NOT use markdown.

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
        },
      );

      const data = await response.json();

      const raw =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || input;

      console.log({
        sourceLanguage,
        targetLanguage,
        input,
        output: raw,
      });

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
