// file: /app/api/qa-search/route.js
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* ---------------------------------------------------------
   Helper: Detect Kannada automatically
   - returns true if text contains Kannada Unicode range
--------------------------------------------------------- */
function isKannada(text = "") {
    return /[\u0C80-\u0CFF]/.test(text);
}

/* ---------------------------------------------------------
   Helper: Normalize text for comparison (light)
   - collapse whitespace, trim, lower-case
--------------------------------------------------------- */
function normalizeText(s = "") {
    return s.toString().replace(/\s+/g, " ").trim().toLowerCase();
}

/* ---------------------------------------------------------
   Helper: Translate using your /api/translate
   - used only when query is detected as Kannada (or other non-en)
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
   Helper: Embedding (always English text!)
   - calls Google embedding endpoint and returns vector (array)
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
   Helper: Cosine similarity
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
   POST -> main search handler
   Input: { query } (query can be English or Kannada)
   Behavior:
     1) validate + normalize
     2) detect Kannada -> translate query -> English ONCE
     3) embed englishQuery
     4) score stored items (assumed embeddings in EN) with:
         - cosine similarity
         - keyword boost when query contains keyword
         - exact-question substring boost (helps short queries)
     5) thresholding + select best
     6) build related (tight thresholds, de-dupe, top-3)
     7) return results in EN (frontend will translate for display)
--------------------------------------------------------- */
export async function POST(req) {
    try {
        const body = await req.json();
        const rawQuery = (body?.query || "").toString();

        if (!rawQuery || !rawQuery.trim()) {
            return NextResponse.json({ success: false, answer: "No query provided." });
        }

        const cleanQuery = rawQuery.trim();
        // If the client sends a selectedLang in future, we ignore it here:
        // language detection must be based on text content, not UI.

        // 1) Detect and translate if Kannada (only once)
        let englishQuery = cleanQuery;
        if (isKannada(cleanQuery)) {
            englishQuery = await translate(cleanQuery, "en");
        }

        // Normalize for string checks
        const englishQueryNorm = normalizeText(englishQuery);

        // 2) Embed englishQuery
        const userEmbedding = await embed(englishQuery);
        if (!userEmbedding || userEmbedding.length === 0) {
            return NextResponse.json({ success: false, answer: "Embedding failed." });
        }

        // 3) Load QnA items (assume english embeddings stored)
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

            // Keyword boost: if englishQuery contains a keyword found in item.keywords
            for (const kw of item.keywords || []) {
                try {
                    const k = normalizeText(kw || "");
                    if (k && englishQueryNorm.includes(k)) boosted += 0.35;
                } catch { /* ignore */ }
            }

            // Substring/exact match boost:
            // if the item's translatedQuestion (EN) contains the query or vice versa,
            // this helps short queries (1-3 words) match exact Qs.
            const tq = normalizeText(item.translatedQuestion || item.originalQuestion || "");
            if (tq) {
                if (tq.includes(englishQueryNorm) || englishQueryNorm.includes(tq)) {
                    boosted += 0.25;
                }
            }

            return { ...item, score: boosted };
        });

        // 5) Sort and pick best
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
        const best = results[0];

        // 6) Thresholding (preserve your prior behavior but more robust)
        const wc = (englishQuery || "").split(/\s+/).filter(Boolean).length || 1;
        let threshold = 0.6;
        if (wc === 1) threshold = 0.12;
        else if (wc === 2) threshold = 0.22;

        const bestScore = Number(best?.score || 0);
        if (bestScore < threshold) {
            return NextResponse.json({ success: false, answer: "I do not know the answer to that." });
        }

        // 7) Build EN results (frontend translates for display)
        const bestQ_en = best.translatedQuestion || best.originalQuestion || "";
        const bestA_en = best.translatedAnswer || best.originalAnswer || "";

        // Related: use a slightly stricter policy to avoid noisy relateds
        const ABS_MIN = 0.30; // absolute minimum score for related candidate
        const REL_MIN = Math.max(ABS_MIN, bestScore * 0.5); // relative min vs best

        const relatedRaw = results
            .filter(r => r.id !== best.id && (r.score || 0) >= ABS_MIN && (r.score || 0) >= REL_MIN)
            .slice(0, 10) // take top candidates first, then dedupe & limit
            .sort((a, b) => (b.score || 0) - (a.score || 0));

        // De-duplicate related by normalized question text and return up to 3
        const seen = new Set();
        const related = [];
        for (const r of relatedRaw) {
            const qEn = r.translatedQuestion || r.originalQuestion || "";
            const qNorm = normalizeText(qEn);
            if (!qNorm) continue;
            if (seen.has(qNorm)) continue;
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
