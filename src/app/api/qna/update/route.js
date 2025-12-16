import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

/* -----------------------------
   EMBEDDING
----------------------------- */
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
        const values = data?.embedding?.values;

        if (!values) {
            console.error("Embedding error:", data);
            return [];
        }

        return values;
    } catch (err) {
        console.error("Embedding exception:", err);
        return [];
    }
}

/* -----------------------------
   UPDATE QNA
----------------------------- */
export async function POST(req) {
    try {
        const { id, updates } = await req.json();

        if (!id || !updates) {
            return NextResponse.json(
                { success: false, error: "Missing id or updates" },
                { status: 400 }
            );
        }

        const docRef = adminDB.collection("qna_items").doc(id);
        const snap = await docRef.get();

        if (!snap.exists) {
            return NextResponse.json(
                { success: false, error: "Document not found" },
                { status: 404 }
            );
        }

        const oldData = snap.data();

        let embedding = oldData.embedding || [];

        // regenerate embedding ONLY if English question changed
        if (
            updates.question_en &&
            updates.question_en !== oldData.question_en
        ) {
            embedding = await generateEmbedding(updates.question_en);
        }

        await docRef.update({
            ...updates,
            embedding,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("QNA UPDATE ERROR:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
