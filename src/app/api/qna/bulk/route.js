import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

// detect Kannada script
function isKannada(text = "") {
    return /[\u0C80-\u0CFF]/.test(text);
}

// translate via your existing FE pipeline
async function translate(text, target = "en") {
    try {
        const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const r = await fetch(`${base}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLang: target }),
        });

        const j = await r.json();
        return j?.translated || text;
    } catch (err) {
        console.error("translate() failed:", err);
        return text;
    }
}

// generate English embedding
async function generateEmbedding(text) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`;

        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "text-embedding-004",
                content: { parts: [{ text }] },
            }),
        });

        const j = await r.json();
        return Array.isArray(j?.embedding?.values) ? j.embedding.values : null;
    } catch (err) {
        console.error("Embedding error:", err);
        return null;
    }
}

// simple CSV parser (no dependencies)
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

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No file uploaded",
            });
        }

        const raw = await file.text();

        let items = [];

        // Detect CSV vs JSON
        if (file.name.endsWith(".csv")) {
            items = parseCSV(raw).map(row => ({
                question: row.question || row.q || "",
                answer: row.answer || row.a || "",
                keywords: row.keywords ? row.keywords.split(";").map(k => k.trim()) : []
            }));
        } else {
            try {
                items = JSON.parse(raw);
            } catch (err) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid JSON format",
                    error: err.toString(),
                });
            }
        }

        let uploaded = 0;
        const failed = [];

        // MAIN LOOP
        for (let i = 0; i < items.length; i++) {
            const { question, answer, keywords = [] } = items[i];

            if (!question || !answer) {
                failed.push({ index: i, reason: "missing-fields" });
                continue;
            }

            const q = question.trim();
            const a = answer.trim();

            let lang = isKannada(q) ? "kn" : "en";

            let question_en, answer_en, question_kn, answer_kn;

            try {
                if (lang === "en") {
                    question_en = q;
                    answer_en = a;
                    question_kn = await translate(q, "kn");
                    answer_kn = await translate(a, "kn");
                } else {
                    question_kn = q;
                    answer_kn = a;
                    question_en = await translate(q, "en");
                    answer_en = await translate(a, "en");
                }

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
                    lang_original: lang,
                    keywords,
                    embedding,
                    createdAt: new Date().toISOString()
                });

                uploaded++;
            } catch (err) {
                console.error("Bulk row error:", err);
                failed.push({ index: i, reason: "exception" });
            }
        }

        return NextResponse.json({
            success: true,
            total: items.length,
            uploaded,
            failed
        });

    } catch (err) {
        console.error("BulkUpload Server Error:", err);
        return NextResponse.json(
            {
                success: false,
                message: "Server error",
                error: err.toString(),
            },
            { status: 500 }
        );
    }
}
