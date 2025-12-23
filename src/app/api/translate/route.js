import { NextResponse } from "next/server";

const MODEL = "models/gemini-2.0-flash";

// Much lighter cleaner: only removes markdown blocks, NOT JSON content.
function cleanOutput(text) {
    if (!text) return "";

    // strip ```code``` blocks
    text = text.replace(/```[\s\S]*?```/g, "");

    // remove markdown decorations
    text = text.replace(/[*#>_`]/g, "");

    return text.trim();
}

export async function POST(req) {
    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ translated: null });
        }

        const trimmed = text.trim();
        if (!trimmed) {
            return NextResponse.json({ translated: "" });
        }

        // language checks
        const looksKannada = /[\u0C80-\u0CFF]/.test(trimmed);



        // avoid unnecessary translation
        if (targetLang === "kn" && looksKannada) {

            return NextResponse.json({ translated: trimmed });
        }

        const prompt = `
Translate the text into ${targetLang}.
STRICT RULES:
- ONLY return the translated sentence.
- NO explanations.
- NO markdown.
- Preserve Islamic terms exactly: wudu, ghusl, salah, zakat, sunnah, takbir, qibla, mahr, talaq.

TEXT:
${trimmed}
        `;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.0 }
                })
            }
        );

        const data = await response.json();

        let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || trimmed;

        const cleaned = cleanOutput(raw);

        return NextResponse.json({ translated: cleaned });

    } catch (err) {
        console.error("Fatal translate error:", err);
        return NextResponse.json({ translated: null });
    }
}
