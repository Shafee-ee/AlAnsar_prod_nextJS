import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

// ----------------------------------------
// Delay helper
// ----------------------------------------
function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ----------------------------------------
// Translation with RETRY
// ----------------------------------------
async function translateWithRetry(text, targetLang = "en", retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/translate`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, targetLang })
                }
            );

            const data = await res.json();
            const out = data?.translated?.trim();

            if (out && out !== "") {
                return out;
            }
        } catch (err) {
            console.error(`Translate attempt ${attempt} failed:`, err);
        }

        await delay(500);
    }

    return null;
}

// ----------------------------------------
// Embedding with safety
// ----------------------------------------
async function generateEmbedding(text) {
    try {
        const response = await fetch(
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

        const data = await response.json();
        return Array.isArray(data?.embedding?.values)
            ? data.embedding.values
            : null;
    } catch (err) {
        console.error("Embedding error:", err);
        return null;
    }
}

// ----------------------------------------
// Process a single entry
// ----------------------------------------
async function processItem(item) {
    const { question, answer, lang, keywords = [] } = item;

    if (!question || !answer || !lang) return false;

    // small delay to avoid rate limits
    await delay(600);

    let translatedQuestion = null;
    let translatedAnswer = null;
    let textForEmbedding = "";

    // Case 1: English → no translation
    if (lang === "en") {
        textForEmbedding = question;
    }

    // Case 2: Kannada → must translate
    else {
        translatedQuestion = await translateWithRetry(question, "en");
        translatedAnswer = await translateWithRetry(answer, "en");

        if (!translatedQuestion || !translatedAnswer) {
            console.error("Translation failed.");
            return false;
        }

        textForEmbedding = translatedQuestion;
    }

    // Generate embedding
    const embedding = await generateEmbedding(textForEmbedding);
    if (!embedding || embedding.length === 0) {
        console.error("Embedding failed.");
        return false;
    }

    // Save record
    await adminDB.collection("qna_items").add({
        originalQuestion: question,
        originalAnswer: answer,
        translatedQuestion,
        translatedAnswer,
        lang,
        keywords,
        embedding,
        createdAt: new Date().toISOString(),
    });

    return true;
}

// ----------------------------------------
// BULK HANDLER
// ----------------------------------------
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No file uploaded"
            });
        }

        const text = await file.text();
        const items = JSON.parse(text);

        const total = items.length;
        let uploaded = 0;
        const failed = [];

        for (let i = 0; i < items.length; i++) {
            let ok = await processItem(items[i]);

            // retry once
            if (!ok) ok = await processItem(items[i]);

            if (ok) uploaded++;
            else failed.push(i);
        }

        return NextResponse.json({
            success: true,
            total,
            uploaded,
            failed
        });

    } catch (err) {
        console.error("Bulk Upload Error:", err);
        return NextResponse.json(
            { success: false, message: "Server error", error: err.toString() },
            { status: 500 }
        );
    }
}
