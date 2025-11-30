import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

// --- Gemini Embedding ---
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
                        parts: [
                            { text }
                        ]
                    }
                }),
            }
        );

        const data = await response.json();

        // Correct response path:
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


export async function POST(req) {
    try {
        const { question, answer, lang } = await req.json();

        if (!question || !answer || !lang) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate embedding
        const embedding = await generateEmbedding(question);

        // Save to Firestore
        await adminDB.collection("qna_items").add({
            question,
            answer,
            lang,
            embedding,
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            message: "QnA added successfully",
        });

    } catch (err) {
        console.error("Single QnA upload error:", err);
        return NextResponse.json(
            { success: false, message: "Server error", error: err.toString() },
            { status: 500 }
        );
    }
}
