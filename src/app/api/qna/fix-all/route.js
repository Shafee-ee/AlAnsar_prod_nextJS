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
                })
            }
        );

        const data = await response.json();
        return data?.embedding?.values || [];

    } catch (err) {
        console.error("Embedding error:", err);
        return [];
    }
}

export async function POST() {
    try {
        // Fetch all items
        const snap = await adminDB.collection("qna_items").get();

        const docs = snap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        // Filter those WITHOUT embeddings
        const missing = docs.filter(
            item => !item.embedding || item.embedding.length === 0
        );

        if (missing.length === 0) {
            return NextResponse.json({
                success: true,
                fixedCount: 0,
                message: "No missing embeddings found"
            });
        }

        const fixed = [];

        for (const item of missing) {

            // throttle to avoid 429 / quota ban
            await delay(1000);

            const newEmbedding = await generateEmbedding(item.question);

            await adminDB.collection("qna_items").doc(item.id).update({
                embedding: newEmbedding,
                updatedAt: new Date().toISOString()
            });

            fixed.push(item.id);
        }

        return NextResponse.json({
            success: true,
            fixedCount: fixed.length,
            fixed
        });

    } catch (err) {
        console.error("Fix-all error:", err);
        return NextResponse.json(
            { success: false, message: err.toString() },
            { status: 500 }
        );
    }
}
