import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ translated: null });
        }

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Translate to ${targetLang}. 
Return ONLY the translation. No quotes. No explanations.

${text}`
                                }
                            ]
                        }
                    ],
                    generationConfig: { responseMimeType: "text/plain" }
                })
            }
        );

        const data = await res.json();

        // If model rejected due to quota → data.candidates undefined
        const out = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

        return NextResponse.json({ translated: out });

    } catch (err) {
        console.error("Translation API error:", err);
        return NextResponse.json({ translated: null });
    }
}
