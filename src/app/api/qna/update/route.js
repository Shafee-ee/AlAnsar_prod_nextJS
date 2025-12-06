import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

// --- Gemini Embedding (your working version) ---
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

export async function POST(req) {
    try {
        const { id, question, answer, lang } = await req.json();

        if (!id || !question || !answer) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        const docRef = adminDB.collection("qna_items").doc(id);
        const oldDoc = await docRef.get();
        const oldData = oldDoc.data();

        if (!oldData) {
            return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
        }

        let newEmbedding = oldData.embedding;

        // Only regenerate if question changed
        if (oldData.question !== question) {
            newEmbedding = await generateEmbedding(question);
        }

        // Update Firestore
        await docRef.update({
            question,
            answer,
            lang,
            embedding: newEmbedding,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("UPDATE ERROR:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
