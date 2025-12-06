import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

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
        return data?.embedding?.values || [];

    } catch (err) {
        console.error("Embedding error:", err);
        return [];
    }
}

export async function POST(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, message: "Missing ID" });
        }

        const docRef = adminDB.collection("qna_items").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ success: false, message: "Not found" });
        }

        const data = docSnap.data();

        // Generate new embedding
        const embedding = await generateEmbedding(data.question);

        await docRef.update({
            embedding,
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json({ success: true, embedding });

    } catch (err) {
        console.error("Fix-Embedding Error:", err);
        return NextResponse.json({ success: false, message: err.toString() });
    }
}
