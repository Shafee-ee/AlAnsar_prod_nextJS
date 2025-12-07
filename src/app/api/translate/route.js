import { NextResponse } from "next/server";

const MODEL = "models/gemini-2.0-flash"; // your BEST AND MOST STABLE MODEL

export async function POST(req) {
    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ translated: null });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `
Translate the following text into "${targetLang}".
Return **ONLY** the translated text.
Do NOT add quotes, explanations, notes, comments, disclaimers, or formatting.

Text:
${text}
                  `
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        responseMimeType: "text/plain",
                        temperature: 0.2
                    }
                })
            }
        );

        const data = await response.json();

        // Log failures
        if (!data?.candidates) {
            console.error("Translation error:", data);
            return NextResponse.json({ translated: null });
        }

        let output =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

        // Remove accidental quotes ("text")
        if (output?.startsWith('"') && output?.endsWith('"')) {
            output = output.slice(1, -1).trim();
        }

        return NextResponse.json({ translated: output });
    } catch (err) {
        console.error("Fatal translate error:", err);
        return NextResponse.json({ translated: null });
    }
}
