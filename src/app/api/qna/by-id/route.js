export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
    const { id, lang = "kn" } = await req.json();

    if (!id) {
        return NextResponse.json({ success: false });
    }

    const doc = await adminDB.collection("qna_items").doc(id).get();

    if (!doc.exists) {
        return NextResponse.json({ success: false });
    }

    const data = doc.data();

    return NextResponse.json({
        success: true,
        question: lang === "kn" ? data.question_kn : data.question_en,
        answer: lang === "kn" ? data.answer_kn : data.answer_en,
        id
    });
}
