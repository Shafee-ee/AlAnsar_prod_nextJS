import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

async function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function generateEmbedding(text) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "text-embedding-004",
                    content: {
                        parts: [{ text }]
                    }
                }),
            }
        );

        const data = await response.json();

        const values = data?.embedding?.values;
        if (!values) {
            console.error("Embedding error:", data);
            return [];
        }

        return values;
    } catch (err) {
        console.error("Gemini embedding error:", err);
        return [];
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
            return NextResponse.json({ success: false, message: "No file uploaded" });
        }

        const text = await file.text();
        const items = JSON.parse(text);

        let uploaded = 0;

        for (const item of items) {
            const question = item.question_kn || item.question_en;
            const answer = item.answer_kn || item.answer_en;
            const lang = item.lang || (item.question_kn ? "kn" : "en");

            if (!question || !answer) continue;

            // THROTTLE — REQUIRED OR GOOGLE WILL FLAG YOU
            await delay(1000);

            const embedding = await generateEmbedding(question);

            await adminDB.collection("qna_items").add({
                question,
                answer,
                lang,
                embedding,
                createdAt: new Date().toISOString(),
            });

            uploaded++;
        }

        return NextResponse.json({
            success: true,
            message: `Uploaded ${uploaded} items successfully`,
        });

    } catch (err) {
        console.error("Bulk upload error:", err);
        return NextResponse.json(
            { success: false, message: "Server error", error: err.toString() },
            { status: 500 }
        );
    }
}
