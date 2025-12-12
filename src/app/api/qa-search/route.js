// file: /app/api/qa-search/route.js
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* ---------------------------------------------------------
   Helper: Detect Kannada automatically
--------------------------------------------------------- */
function isKannada(text = "") {
    return /[\u0C80-\u0CFF]/.test(text);
}

/* ---------------------------------------------------------
   Normalize text
--------------------------------------------------------- */
function normalizeText(s = "") {
    return s.toString().replace(/\s+/g, " ").trim().toLowerCase();
}

/* ---------------------------------------------------------
   Translate using FE translate API
--------------------------------------------------------- */
async function translate(text, target = "en") {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLang: target })
        });

        const j = await res.json();
        return j?.translated || text;
    } catch (err) {
        console.error("Translate error:", err);
        return text;
    }
}

/* ---------------------------------------------------------
   Embedding (English text only)
--------------------------------------------------------- */
async function embed(text) {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "text-embedding-004",
                    content: { parts: [{ text }] }
                })
            }
        );

        const data = await res.json();
        return Array.isArray(data?.embedding?.values) ? data.embedding.values : [];
    } catch (err) {
        console.error("Embedding error:", err);
        return [];
    }
}

/* ---------------------------------------------------------
   Cosine similarity
--------------------------------------------------------- */
function cosine(a = [], b = []) {
    let dot = 0, na = 0, nb = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom === 0 ? 0 : dot / denom;
}

/* ---------------------------------------------------------
   POST: Main QnA Search Handler
--------------------------------------------------------- */
export async function POST(req) {
    try {
        const body = await req.json();
        const rawQuery = (body?.query || "").toString();

        if (!rawQuery.trim()) {
            return NextResponse.json({ success: false, answer: "No query provided." });
        }

        const cleanQuery = rawQuery.trim();

        // 1) Detect Kannada → translate once
        let englishQuery = cleanQuery;
        if (isKannada(cleanQuery)) {
            englishQuery = await translate(cleanQuery, "en");
        }

        // Normalize for checks
        const englishQueryNorm = normalizeText(englishQuery);

        // 2) Embed
        const userEmbedding = await embed(englishQuery);
        if (!userEmbedding.length) {
            return NextResponse.json({ success: false, answer: "Embedding failed." });
        }

        // 3) Load items
        const snap = await adminDB.collection("qna_items").get();
        const items = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(i => Array.isArray(i.embedding) && i.embedding.length);

        if (!items.length) {
            return NextResponse.json({ success: false, answer: "No QnA data available." });
        }

        // 4) Score items
        const results = items.map(item => {
            const base = Number(cosine(userEmbedding, item.embedding)) || 0;
            let boosted = base;

            // keyword boost
            for (const kw of item.keywords || []) {
                const k = normalizeText(kw || "");
                if (k && englishQueryNorm.includes(k)) boosted += 0.35;
            }

            // substring / exact match boost
            const tq = normalizeText(item.translatedQuestion || item.originalQuestion || "");
            if (tq) {
                if (tq.includes(englishQueryNorm) || englishQueryNorm.includes(tq)) {
                    boosted += 0.25;
                }
            }

            /* ---------------------------------------------------------
               HOW-INTENT BOOSTER (fix for wrong wudu ranking)
            --------------------------------------------------------- */
            const howIntent =
                /\b(how|method|steps|perform|procedure|way|do)\b/i.test(englishQueryNorm);

            const itemIsHow =
                /\b(how|perform|steps|method|procedure|way)\b/i.test(tq);

            if (howIntent && itemIsHow) {
                boosted += 0.35; // safely lifts correct "how" answers
            }

            return { ...item, score: boosted };
        });

        // 5) Sort & best
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
        const best = results[0];
        const bestScore = Number(best?.score || 0);

        // threshold
        const wc = englishQueryNorm.split(/\s+/).filter(Boolean).length;
        let threshold = 0.6;
        if (wc === 1) threshold = 0.12;
        else if (wc === 2) threshold = 0.22;

        if (bestScore < threshold) {
            return NextResponse.json({ success: false, answer: "I do not know the answer to that." });
        }

        // 6) Build EN best match
        const bestQ_en = best.translatedQuestion || best.originalQuestion || "";
        const bestA_en = best.translatedAnswer || best.originalAnswer || "";

        // 7) Related — stricter, clean
        const ABS_MIN = 0.30;
        const REL_MIN = Math.max(ABS_MIN, bestScore * 0.5);

        const relatedRaw = results
            .filter(r =>
                r.id !== best.id &&
                (r.score || 0) >= ABS_MIN &&
                (r.score || 0) >= REL_MIN
            )
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 10);

        // dedupe
        const seen = new Set();
        const related = [];
        for (const r of relatedRaw) {
            const qEn = r.translatedQuestion || r.originalQuestion || "";
            const qNorm = normalizeText(qEn);
            if (!qNorm || seen.has(qNorm)) continue;
            seen.add(qNorm);

            related.push({
                question: qEn,
                answer: r.translatedAnswer || r.originalAnswer || "",
                originalQuestion: r.originalQuestion || qEn
            });

            if (related.length >= 3) break;
        }

        return NextResponse.json({
            success: true,
            bestMatch: { question: bestQ_en, answer: bestA_en },
            related
        });

    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json(
            { success: false, answer: "Server error occurred." },
            { status: 500 }
        );
    }
}
