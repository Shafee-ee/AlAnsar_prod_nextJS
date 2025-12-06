import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

// small wait helper
const wait = ms => new Promise(res => setTimeout(res, ms));

// ---- FIXED: REMOVE overly strict language check ----
function looksLikeSameLanguage(output, original) {
    if (!output) return true;

    // only reject if BOTH contain Kannada script
    const kannadaRe = /[\u0C80-\u0CFF]/;

    const origHas = kannadaRe.test(original);
    const outHas = kannadaRe.test(output);

    // If original Kannada but output still Kannada → fail
    if (origHas && outHas) return true;

    // Otherwise → allow it ALWAYS
    return false;
}

// lightweight translator
async function lightTranslate(text, target = "en") {
    try {
        const r = await fetch(
            (process.env.NEXT_PUBLIC_BASE_URL || "") + "/api/translate",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, targetLang: target })
            }
        );

        if (!r.ok) return null;

        const j = await r.json();
        let out = j?.translated?.trim();

        if (!out) return null;
        return out;
    } catch {
        return null;
    }
}

// strict fallback
async function strictTranslate(text, target = "en") {
    try {
        const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { parts: [{ text: `Translate ONLY to ${target}. ${text}` }] }
                    ],
                    generationConfig: { responseMimeType: "text/plain" }
                })
            }
        );

        if (!r.ok) return null;

        const j = await r.json();
        let out = j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        out = out.replace(/^"(.*)"$/, "$1").trim();

        return out || null;
    } catch {
        return null;
    }
}

async function translateWithFallback(text) {
    // attempt 1
    let a = await lightTranslate(text, "en");
    if (a && !looksLikeSameLanguage(a, text)) return a;

    // attempt 2
    await wait(200);
    a = await lightTranslate(text, "en");
    if (a && !looksLikeSameLanguage(a, text)) return a;

    // strict fallback
    let b = await strictTranslate(text, "en");
    if (b && !looksLikeSameLanguage(b, text)) return b;

    // strict retry
    await wait(300);
    b = await strictTranslate(text, "en");
    if (b && !looksLikeSameLanguage(b, text)) return b;

    return null;
}

// embedding
async function generateEmbedding(text) {
    try {
        const r = await fetch(
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
        const j = await r.json();
        return j?.embedding?.values || null;
    } catch {
        return null;
    }
}

export async function POST(req) {
    try {
        const { question, answer, lang, keywords = [] } = await req.json();

        if (!question || !answer || !lang) {
            return NextResponse.json({ success: false, reason: "missing-fields" });
        }

        const q = question.trim();
        const a = answer.trim();

        let tq = null;
        let ta = null;
        let embedText = "";

        if (lang === "en") {
            embedText = q;
        } else {
            tq = await translateWithFallback(q);
            ta = await translateWithFallback(a);

            if (!tq) {
                console.error("Q translation failed:", q);
                return NextResponse.json({ success: false, reason: "translation-failed" });
            }
            if (!ta) {
                console.error("A translation failed:", a);
                return NextResponse.json({ success: false, reason: "translation-failed" });
            }

            embedText = tq;
        }

        let emb = await generateEmbedding(embedText);

        if (!emb) {
            await wait(200);
            emb = await generateEmbedding(embedText);
        }

        if (!emb) {
            return NextResponse.json({ success: false, reason: "embedding-failed" });
        }

        await adminDB.collection("qna_items").add({
            originalQuestion: q,
            originalAnswer: a,
            translatedQuestion: tq,
            translatedAnswer: ta,
            lang,
            keywords,
            embedding: emb,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("single upload error:", e);
        return NextResponse.json({ success: false, reason: "server-error" });
    }
}
