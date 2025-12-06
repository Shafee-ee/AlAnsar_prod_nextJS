import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
    const snap = await adminDB.collection("qna_items").get();

    const items = snap.docs.map(doc => {
        const d = doc.data();

        return {
            id: doc.id,
            originalQuestion: d.originalQuestion || null,
            originalAnswer: d.originalAnswer || null,
            translatedQuestion: d.translatedQuestion || null,
            translatedAnswer: d.translatedAnswer || null,
            lang: d.lang || null,
            keywords: d.keywords || []
        };
    });

    return NextResponse.json({ success: true, items });
}
