// file: /path/to/your/qa-search (Next.js route)
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* ---------------------------
 * Helpers
 * --------------------------- */

async function translateWithRetry(text, target = "en", retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/translate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, targetLang: target }),
                }
            );
            const j = await res.json();
            if (j?.translated && j.translated.trim() !== "") {
                // If translation returns identical text repeatedly, treat as failure
                if (j.translated.trim() !== (text || "").trim() || target === "en") {
                    return j.translated;
                }
            }
        } catch (e) {
            // swallow and retry
            console.error("translate attempt failed:", e?.message || e);
        }
        await new Promise((r) => setTimeout(r, 300 + i * 200));
    }
    return null;
}

async function embed(text) {
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: "text-embedding-004", content: { parts: [{ text }] } }),
            }
        );
        const data = await res.json();
        return Array.isArray(data?.embedding?.values) ? data.embedding.values : [];
    } catch (e) {
        console.error("Embedding error:", e);
        return [];
    }
}

function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    const len = Math.min((a || []).length, (b || []).length);
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    na = Math.sqrt(na);
    nb = Math.sqrt(nb);
    return na === 0 || nb === 0 ? 0 : dot / (na * nb);
}

const GREETINGS = ["hello", "hi", "hey", "assalamualaikum", "salaam"];
function isGreeting(txt) {
    if (!txt) return false;
    return GREETINGS.includes(txt.toLowerCase().trim());
}

/* ---------------------------
 * Route handler
 * --------------------------- */
export async function POST(req) {
    try {
        const { query, selectedLang = "en" } = await req.json();
        if (!query || !query.trim()) {
            return NextResponse.json({ success: false, answer: "No query provided." });
        }

        const cleanQuery = query.trim();

        // 1) quick greeting short-circuit
        if (isGreeting(cleanQuery)) {
            const botAnswer =
                "I am an Islamic Q&A bot. Ask me any Islamic question, and I will check the clouds for your answer.";
            // translate greeting reply if user requested a different language
            if (selectedLang && selectedLang !== "en") {
                const t = await translateWithRetry(botAnswer, selectedLang);
                return NextResponse.json({
                    success: true,
                    bestMatch: { question: cleanQuery, answer: t || botAnswer },
                    related: [],
                });
            }
            return NextResponse.json({
                success: true,
                bestMatch: { question: cleanQuery, answer: botAnswer },
                related: [],
            });
        }

        // 2) Translate incoming query → EN (always) for embedding/search
        const englishQuery = (await translateWithRetry(cleanQuery, "en")) || cleanQuery;

        // 3) embed englishQuery
        const userEmbedding = await embed(englishQuery);
        if (!userEmbedding || userEmbedding.length === 0) {
            return NextResponse.json({ success: false, answer: "Embedding failed." });
        }

        // 4) fetch qna items from firestore
        const snap = await adminDB.collection("qna_items").get();
        const items = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((i) => Array.isArray(i.embedding) && i.embedding.length);

        if (!items.length) {
            return NextResponse.json({ success: false, answer: "No QnA data available." });
        }

        // 5) score items (cosine) + keyword boost
        const qLower = (englishQuery || "").toLowerCase();
        const results = items.map((item) => {
            const score = cosine(userEmbedding, item.embedding) || 0;
            let boosted = score;
            if (Array.isArray(item.keywords)) {
                for (const kw of item.keywords) {
                    try {
                        const k = (kw || "").toString().toLowerCase();
                        if (k && qLower.includes(k)) boosted += 0.35;
                    } catch { }
                }
            }
            return { ...item, score: boosted };
        });

        // 6) sort desc
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
        const best = results[0];

        // 7) threshold logic (keep your existing thresholds)
        const wc = (englishQuery || "").split(/\s+/).filter(Boolean).length || 1;
        let threshold = 0.6;
        if (wc === 1) threshold = 0.12;
        else if (wc === 2) threshold = 0.22;

        if ((best.score || 0) < threshold) {
            return NextResponse.json({ success: false, answer: "I do not know the answer to that." });
        }

        // 8) prepare related: require both absolute and relative thresholds
        const ABS_MIN = 0.30; // absolute minimum score for related
        const REL_MIN = Math.max(0.5, (best.score || 0) * 0.5); // related must be >= 50% of best (and at least REL_MIN)
        const relatedRaw = results
            .filter((r) => r.id !== best.id && (r.score || 0) >= ABS_MIN && (r.score || 0) >= REL_MIN)
            .slice(0, 3); // up to 3

        // 9) prepare response texts in user's language (if requested)
        // prefer stored translated* or original* fields, otherwise attempt on-the-fly translate
        async function localizeText(itemTextEnOrOrig, targetLang) {
            if (!targetLang || targetLang === "en") return itemTextEnOrOrig;
            // if the text already contains Kannada characters, just return it (quick heuristic)
            if (/[\u0C80-\u0CFF]/.test(itemTextEnOrOrig || "")) return itemTextEnOrOrig;
            // else try translate
            const t = await translateWithRetry(itemTextEnOrOrig || "", targetLang);
            return t || itemTextEnOrOrig;
        }

        // Best match: prefer translatedQuestion/Answer (english) stored; then originalQuestion if english not present
        const bestQuestionEn = best.translatedQuestion || best.originalQuestion || "";
        const bestAnswerEn = best.translatedAnswer || best.originalAnswer || "";

        const bestQuestionForUser =
            selectedLang && selectedLang !== "en"
                ? await localizeText(bestQuestionEn, selectedLang)
                : bestQuestionEn;
        const bestAnswerForUser =
            selectedLang && selectedLang !== "en"
                ? await localizeText(bestAnswerEn, selectedLang)
                : bestAnswerEn;

        // Related localized
        const related = [];
        for (const r of relatedRaw) {
            const qEn = r.translatedQuestion || r.originalQuestion || "";
            const aEn = r.translatedAnswer || r.originalAnswer || "";
            const qForUser =
                selectedLang && selectedLang !== "en" ? await localizeText(qEn, selectedLang) : qEn;
            const aForUser =
                selectedLang && selectedLang !== "en" ? await localizeText(aEn, selectedLang) : aEn;

            related.push({
                question: qForUser,
                answer: aForUser,
                // keep originalQuestion so client can re-search by original if needed
                originalQuestion: r.originalQuestion || r.translatedQuestion || "",
            });
        }

        // 10) return
        return NextResponse.json({
            success: true,
            bestMatch: { question: bestQuestionForUser, answer: bestAnswerForUser },
            related,
        });
    } catch (e) {
        console.error("Search error:", e);
        return NextResponse.json(
            { success: false, answer: "Server error occurred." },
            { status: 500 }
        );
    }
}
