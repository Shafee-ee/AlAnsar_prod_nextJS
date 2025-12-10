import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* ---------------------------------------
   ISLAMIC TERMS TO PRESERVE ONLY IF THEY EXIST IN ORIGINAL
--------------------------------------- */
const ISLAMIC_TERMS = [
    "salah", "salat", "namaz", "prayer",
    "wudu", "wudhu", "ghusl", "tayammum",
    "fard", "sunnah", "mustahab", "makruh", "haram", "halal",
    "takbir", "takbeer", "takbiratul ihram",
    "rukoo", "sujud", "sujood", "rakah", "rakat",
    "ramadan", "fasting", "sawm", "qada", "fidya",
    "najis", "najasah", "impure",
    "nikah", "talaq", "mahr", "dowry",
    "mahram", "non-mahram",
    "imam", "ma'mum", "jama'ah", "jamah", "iqamah",
    "jumuah", "jummah",
    "mayyit", "janazah", "funeral prayer",
    "jinn", "shaytan", "iblis",
    "malaikah", "angels",
    "niyyah", "intention",
    "surah", "fatiha",
    "masbuq",
    "kohl", "surmah"
];

/* ---------------------------------------
   TRANSLATE USING FE PIPELINE
--------------------------------------- */
async function translate(text, target = "en") {
    try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        const r = await fetch(`${base}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLang: target })
        });

        const j = await r.json();
        return j?.translated?.trim() || null;

    } catch (err) {
        console.error("translate() error:", err);
        return null;
    }
}

/* ---------------------------------------
   EMBEDDING GENERATOR
--------------------------------------- */
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

/* ---------------------------------------
   TERM PRESERVATION (ONLY IF ORIGINAL HAS IT)
--------------------------------------- */
function checkPreservedTerms(original, translated) {
    const missing = [];

    const o = original.toLowerCase();
    const t = translated.toLowerCase();

    for (const term of ISLAMIC_TERMS) {
        // Only enforce if ORIGINAL contains the term
        if (o.includes(term) && !t.includes(term)) {
            missing.push(term);
        }
    }
    return missing;
}

/* ---------------------------------------
   MAIN HANDLER (FINAL VERSION)
--------------------------------------- */
export async function POST(req) {
    try {
        const { question, answer, lang, keywords = [] } = await req.json();

        if (!question || !answer || !lang) {
            return NextResponse.json({ success: false, reason: "missing-fields" });
        }

        const q = question.trim();
        const a = answer.trim();

        if (q.length < 2 || a.length < 2) {
            return NextResponse.json({ success: false, reason: "too-short" });
        }

        let translatedQ = q;
        let translatedA = a;
        let embedText = q;

        /* ---------------------------------------
           NON-ENGLISH PROCESSING
        --------------------------------------- */
        if (lang !== "en") {
            translatedQ = await translate(q, "en");
            translatedA = await translate(a, "en");

            if (!translatedQ || !translatedA) {
                return NextResponse.json({
                    success: false,
                    reason: "translation-failed"
                });
            }

            // Short answers allowed now.

            embedText = translatedQ;

            // Term preservation check only if original contains them
            const missingTerms = checkPreservedTerms(q, translatedQ);

            if (missingTerms.length > 0) {
                return NextResponse.json({
                    success: false,
                    reason: "missing-key-terms",
                    details: { missingTerms }
                });
            }
        }

        /* ---------------------------------------
           CREATE EMBEDDING
        --------------------------------------- */
        const embedding = await generateEmbedding(embedText);

        if (!embedding) {
            return NextResponse.json({
                success: false,
                reason: "embedding-failed"
            });
        }

        /* ---------------------------------------
           SAVE TO FIRESTORE
        --------------------------------------- */
        await adminDB.collection("qna_items").add({
            originalQuestion: q,
            originalAnswer: a,
            translatedQuestion: translatedQ,
            translatedAnswer: translatedA,
            lang,
            keywords,
            embedding,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("upload error:", err);
        return NextResponse.json(
            { success: false, reason: "server-error" },
            { status: 500 }
        );
    }
}
