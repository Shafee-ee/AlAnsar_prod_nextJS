import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* -------------------------------------------------------
   Detect Kannada (simple + reliable for our use case)
------------------------------------------------------- */
function isKannada(text = "") {
    return /[\u0C80-\u0CFF]/.test(text);
}

/* -------------------------------------------------------
   Translate using your existing pipeline
------------------------------------------------------- */
async function translate(text, targetLang) {
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
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
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
        throw new Error("Gemini translate failed");
    }

    const data = await r.json();

    return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text
    );
}




/* -------------------------------------------------------
   Generate embedding (English only)
------------------------------------------------------- */
async function generateEmbedding(text) {
    try {
        const url =
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`;

        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "text-embedding-004",
                content: { parts: [{ text }] }
            })
        });

        const j = await r.json();
        return Array.isArray(j?.embedding?.values) ? j.embedding.values : null;
    } catch (err) {
        console.error("Embedding error:", err);
        return null;
    }
}

/* -------------------------------------------------------
   MAIN HANDLER (new schema, auto-detect override)
------------------------------------------------------- */
export async function POST(req) {
    try {
        const { question, answer, lang: userLang, keywords = [] } = await req.json();

        if (!question || !answer || !userLang) {
            return NextResponse.json({ success: false, reason: "missing-fields" });
        }

        const q = question.trim();
        const a = answer.trim();

        if (q.length < 2 || a.length < 2) {
            return NextResponse.json({ success: false, reason: "too-short" });
        }

        /* -------------------------------------------------------
           AUTO-DETECT AND OVERRIDE USER SELECTION
        ------------------------------------------------------- */
        let detectedLang = isKannada(q) ? "kn" : "en";

        // If text is short (< 6 chars), user may be right → fallback to user selection
        const finalLang =
            q.length < 6 ? userLang : detectedLang;

        /* -------------------------------------------------------
           CREATE EN + KN VERSIONS
        ------------------------------------------------------- */
        let question_en, answer_en, question_kn, answer_kn;

        if (finalLang === "en") {
            // original is English
            question_en = q;
            answer_en = a;

            // auto-translate to Kannada
            question_kn = await translate(q, "kn");
            answer_kn = await translate(a, "kn");

        } else {
            // original is Kannada
            question_kn = q;
            answer_kn = a;

            // auto-translate to English
            question_en = await translate(q, "en");
            answer_en = await translate(a, "en");

            if (!question_en || !answer_en) {
                return NextResponse.json({ success: false, reason: "translation-failed" });
            }
        }

        /* -------------------------------------------------------
           GENERATE EMBEDDING USING ENGLISH VERSION
        ------------------------------------------------------- */
        const embedding = await generateEmbedding(question_en);
        if (!embedding) {
            return NextResponse.json({ success: false, reason: "embedding-failed" });
        }

        /* -------------------------------------------------------
           SAVE IN CLEAN FORMAT
        ------------------------------------------------------- */
        await adminDB.collection("qna_items").add({
            question_en,
            answer_en,
            question_kn,
            answer_kn,
            lang_original: finalLang,
            keywords,
            embedding,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json(
            { success: false, reason: "server-error" },
            { status: 500 }
        );
    }
}
