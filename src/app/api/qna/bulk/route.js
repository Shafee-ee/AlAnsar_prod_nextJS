import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
export const runtime = "nodejs";

/* -----------------------------------------
   Detect Kannada script (Unicode only)
----------------------------------------- */
function isKannada(text = "") {
    return /[\u0C80-\u0CFF]/.test(text);
}

/* -----------------------------------------
   Translate via internal API
----------------------------------------- */
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


/* -----------------------------------------
   Generate English embedding
----------------------------------------- */
async function generateEmbedding(text) {
    try {
        const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "text-embedding-004",
                    content: { parts: [{ text }] },
                }),
            }
        );

        const j = await r.json();
        return Array.isArray(j?.embedding?.values)
            ? j.embedding.values
            : null;
    } catch (err) {
        console.error("Embedding error:", err);
        return null;
    }
}

/* -----------------------------------------
   Simple CSV parser (safe + predictable)
----------------------------------------- */
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines.shift().split(",").map(h => h.trim().toLowerCase());

    return lines.map(line => {
        const cols = line.split(",").map(c => c.trim());
        const obj = {};
        header.forEach((h, i) => (obj[h] = cols[i] || ""));
        return obj;
    });
}

/* -----------------------------------------
   BULK UPLOAD HANDLER
----------------------------------------- */
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" });
        }

        const raw = await file.text();
        let items = [];

        // CSV vs JSON
        if (file.name.endsWith(".csv")) {
            items = parseCSV(raw).map(row => ({
                question: row.question || "",
                answer: row.answer || "",
                keywords: row.keywords
                    ? row.keywords.split(";").map(k => k.trim())
                    : [],
            }));
        } else {
            try {
                items = JSON.parse(raw);
            } catch {
                return NextResponse.json({
                    success: false,
                    message: "Invalid JSON format",
                });
            }
        }

        let uploaded = 0;
        const failed = [];

        for (let i = 0; i < items.length; i++) {
            const { question, answer, keywords = [] } = items[i];

            if (!question || !answer) {
                failed.push({ index: i, reason: "missing-fields" });
                continue;
            }

            const q = question.trim();
            const a = answer.trim();

            // 🔒 CANONICAL: English first
            let question_en, answer_en;
            let question_kn = null, answer_kn = null;

            if (isKannada(q)) {
                // Kannada input
                question_kn = q;
                answer_kn = a;

                question_en = await translate(q, "en");
                answer_en = await translate(a, "en");
            } else {
                // English input
                question_en = q;
                answer_en = a;

                question_kn = await translate(q, "kn");
                answer_kn = await translate(a, "kn");
            }

            // 🚨 FINAL SAFETY: validate Kannada again
            if (!isKannada(question_kn)) question_kn = null;
            if (!isKannada(answer_kn)) answer_kn = null;

            const embedding = await generateEmbedding(question_en);
            if (!embedding) {
                failed.push({ index: i, reason: "embedding-failed" });
                continue;
            }

            await adminDB.collection("qna_items").add({
                question_en,
                answer_en,
                question_kn,
                answer_kn,
                lang_original: isKannada(q) ? "kn" : "en",
                keywords,
                embedding,
                createdAt: new Date().toISOString(),
            });

            uploaded++;
        }

        return NextResponse.json({
            success: true,
            total: items.length,
            uploaded,
            failed,
        });
    } catch (err) {
        console.error("BulkUpload Server Error:", err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
