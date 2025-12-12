import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
    const snap = await adminDB.collection("qna_items").get();

    const items = snap.docs.map(doc => {
        const d = doc.data();

        return {
            // id: doc.id,
            question_en: d.question_en || null,
            answer_en: d.answer_en || null,
            question_kn: d.question_kn || null,
            answer_kn: d.answer_kn || null,
            // lang_original: d.lang_original || null,
            // keywords: d.keywords || [],
            // createdAt: d.createdAt || null,
        };
    });

    return NextResponse.json({ success: true, items });
}
