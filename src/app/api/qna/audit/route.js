import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

const KANNADA_REGEX = /[\u0C80-\u0CFF]/;

export async function GET() {
    const snap = await adminDB.collection("qna_items").get();

    const audited = snap.docs.map(doc => {
        const d = doc.data();

        const sameQuestion = d.question_en === d.question_kn;
        const sameAnswer = d.answer_en === d.answer_kn;

        const hasKannadaQ = KANNADA_REGEX.test(d.question_kn || "");
        const hasKannadaA = KANNADA_REGEX.test(d.answer_kn || "");

        const isBroken =
            sameQuestion ||
            sameAnswer ||
            !hasKannadaQ ||
            !hasKannadaA;

        return {
            id: doc.id,
            question_en: d.question_en,
            question_kn: d.question_kn,
            answer_kn: d.answer_kn,
            flags: {
                sameQuestion,
                sameAnswer,
                hasKannadaQ,
                hasKannadaA,
            },
            isBroken,
        };
    });

    return NextResponse.json({
        total: audited.length,
        brokenCount: audited.filter(i => i.isBroken).length,
        brokenItems: audited.filter(i => i.isBroken),
    });
}
