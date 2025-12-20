import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* ----------------------------------
   Normalize
---------------------------------- */
function normalize(s = "") {
    return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/* ----------------------------------
   BASIC INTENT GATE
   (prevents junk queries)
---------------------------------- */
function hasValidIntent(query = "") {
    const q = normalize(query);

    // too short
    if (q.length < 10) return false;

    // must have multiple words
    const words = q.split(" ");
    if (words.length < 3) return false;

    // common question starters
    const questionStarters = [
        "can", "is", "are", "does", "do",
        "what", "how", "when", "where",
        "should", "must", "may", "will"
    ];

    // ends with question mark OR starts with a question word
    const looksLikeQuestion =
        q.endsWith("?") ||
        questionStarters.some(w => q.startsWith(w + " "));

    return looksLikeQuestion;
}

/* ----------------------------------
   Embed text (language-agnostic)
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
   SEARCH
---------------------------------- */
export async function POST(req) {
    const { query, lang = "en", excludeId } = await req.json();

    if (!query?.trim()) {
        return NextResponse.json({ success: false });
    }

    /* ---------- INTENT GATE ---------- */
    if (!hasValidIntent(query)) {
        return NextResponse.json({
            success: true,
            noMatch: true,
            reason: "invalid_intent",
        });
    }

    const queryEmbedding = await embed(query);
    if (!queryEmbedding.length) {
        return NextResponse.json({ success: false });
    }

    const snap = await adminDB.collection("qna_items").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    /* ----------------------------------
       SCORE ITEMS
       - rankScore: ordering only
       - confidenceScore: cosine only
    ---------------------------------- */
    const scored = items.map(item => {
        const question =
            lang === "kn" ? item.question_kn : item.question_en;

        if (!question || !item.embedding) {
            return { ...item, rankScore: 0, confidenceScore: 0 };
        }

        const qNorm = normalize(query);
        const itemNorm = normalize(question);

        const confidenceScore = cosine(queryEmbedding, item.embedding);

        let rankScore = confidenceScore;

        // lexical bonus ONLY for ranking (not confidence)
        if (itemNorm === qNorm) rankScore += 0.3;
        else if (itemNorm.includes(qNorm) || qNorm.includes(itemNorm))
            rankScore += 0.15;

        return {
            ...item,
            rankScore,
            confidenceScore,
        };
    });

    scored.sort((a, b) => b.rankScore - a.rankScore);
    const best = scored[0];

    /* ---------- CONFIDENCE GATE ---------- */
    if (!best || best.confidenceScore < 0.35) {
        return NextResponse.json({
            success: true,
            noMatch: true,
            reason: "low_confidence",
        });
    }

    /* ----------------------------------
       RELATED QUESTIONS
    ---------------------------------- */
    const seen = new Set();
    seen.add(best.id);
    if (excludeId) seen.add(excludeId);

    const related = [];

    for (const item of scored) {
        if (related.length === 3) break;
        if (item.confidenceScore < 0.4) continue;
        if (seen.has(item.id)) continue;

        const qText =
            lang === "kn" ? item.question_kn : item.question_en;

        if (!qText) continue;

        seen.add(item.id);

        related.push({
            id: item.id,
            question: qText,
        });
    }

    return NextResponse.json({
        success: true,
        bestMatch: {
            id: best.id,
            question:
                lang === "kn" ? best.question_kn : best.question_en,
            answer:
                lang === "kn" ? best.answer_kn : best.answer_en,
            score: best.confidenceScore,
            editorNote_en: best.editorNote_en || "",
            editorNote_kn: best.editorNote_kn || "",
        },
        related,
    });
}
