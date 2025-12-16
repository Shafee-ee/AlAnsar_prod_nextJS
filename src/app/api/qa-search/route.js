export const runtime = "node.js";
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* ----------------------------------
   Detect Kannada
---------------------------------- */
function isKannada(text = "") {
    return /[\u0C80-\u0CFF]/.test(text);
}

/* ----------------------------------
   Normalize text
---------------------------------- */
function normalize(s = "") {
    return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/* ----------------------------------
   Translate ONLY if Kannada (ONCE)
---------------------------------- */
async function translate(text) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: "en" }),
    });
    const j = await res.json();
    return j?.translated || text;
}

/* ----------------------------------
   Embed English text
---------------------------------- */
async function embed(text) {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: { parts: [{ text }] },
            }),
        }
    );
    const j = await res.json();
    return j?.embedding?.values || [];
}

/* ----------------------------------
   Cosine similarity
---------------------------------- */
function cosine(a = [], b = []) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/* ----------------------------------
   SEARCH (HYBRID)
---------------------------------- */
export async function POST(req) {
    const { query, lang = "en" } = await req.json();

    if (!query?.trim()) {
        return NextResponse.json({ success: false });
    }

    // 🔹 Translate ONCE if Kannada
    const englishQuery = isKannada(query) ? await translate(query) : query;
    const qNorm = normalize(englishQuery);

    const queryEmbedding = await embed(englishQuery);
    if (!queryEmbedding.length) {
        return NextResponse.json({ success: false });
    }

    const snap = await adminDB.collection("qna_items").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    let confidence = "low";

    const scored = items.map(item => {
        const itemQ = item.question_en || "";
        const itemNorm = normalize(itemQ);

        let score = 0;

        // 1️⃣ EXACT / NEAR EXACT (FTS-style)
        if (itemNorm === qNorm) {
            score = 3;
            confidence = "high";
        } else if (
            itemNorm.includes(qNorm) ||
            qNorm.includes(itemNorm)
        ) {
            score = 2;
            confidence = "high";
        } else {
            // 2️⃣ Semantic fallback
            score = cosine(queryEmbedding, item.embedding || []);
        }

        return { ...item, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    if (!best || best.score < 0.25) {
        return NextResponse.json({
            success: false,
            message: "No confident match found",
        });
    }

    /* ----------------------------------
       RELATED (semantic neighbors)
    ---------------------------------- */
    const related = scored
        .filter(i => i.id !== best.id && i.score > 0.3)
        .slice(0, 3)
        .map(i => ({
            id: i.id,
            question: lang === "kn" ? i.question_kn : i.question_en,
        }));

    return NextResponse.json({
        success: true,
        confidence,
        bestMatch: {
            id: best.id,
            question: lang === "kn" ? best.question_kn : best.question_en,
            answer: lang === "kn" ? best.answer_kn : best.answer_en,
        },
        related,
    });
}
