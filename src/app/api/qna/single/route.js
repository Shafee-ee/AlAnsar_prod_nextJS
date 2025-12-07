import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

/* ------------------------------------------------------------------
   TRANSLATION (uses your working /api/translate endpoint)
------------------------------------------------------------------ */
async function translate(text, target = "en") {
    try {
        const r = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/translate`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, targetLang: target })
            }
        );

        const j = await r.json();

        return j?.translated?.trim() || null;
    } catch (err) {
        console.error("translate() error:", err);
        return null;
    }
}

/* ------------------------------------------------------------------
   EMBEDDING
------------------------------------------------------------------ */
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
    } catch (err) {
        console.error("Embedding error:", err);
        return null;
    }
}

/* ------------------------------------------------------------------
   SINGLE UPLOAD HANDLER
------------------------------------------------------------------ */
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

        // English → no translation needed
        if (lang === "en") {
            embedText = q;
        }

        // Non-english → translate to English
        else {
            tq = await translate(q, "en");
            ta = await translate(a, "en");

            if (!tq) {
                console.error("Question translation failed:", q);
                return NextResponse.json({ success: false, reason: "translation-failed" });
            }

            if (!ta) {
                console.error("Answer translation failed:", a);
                return NextResponse.json({ success: false, reason: "translation-failed" });
            }

            embedText = tq;
        }

        // Generate embedding
        let emb = await generateEmbedding(embedText);

        if (!emb) {
            await wait(200);
            emb = await generateEmbedding(embedText);
        }

        if (!emb) {
            return NextResponse.json({ success: false, reason: "embedding-failed" });
        }

        // Save to Firestore
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

    } catch (err) {
        console.error("single upload error:", err);
        return NextResponse.json({ success: false, reason: "server-error" });
    }
}
