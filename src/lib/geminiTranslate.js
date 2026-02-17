export async function geminiTranslate(text, targetLang) {
    const prompt = `
Translate the text into ${targetLang}.
STRICT RULES:
- ONLY return the translated sentence.
- NO explanations.
- NO markdown.
- Preserve Islamic terms exactly: wudu, ghusl, salah, zakat, sunnah, takbir, qibla, mahr, talaq.

TEXT:
${text}
    `;

    const r = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.0 }
            })
        }
    );

    if (!r.ok) {
        console.error("Gemini translation failed");
        return "";
    }

    const data = await r.json();

    return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
    );
}
