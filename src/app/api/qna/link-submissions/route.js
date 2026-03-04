import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
    try {
        const { submissionId, qnaId } = await req.json();

        if (!submissionId || !qnaId) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        await adminDB.collection("qna_submissions")
            .doc(submissionId)
            .update({
                promoted_qna_id: qnaId
            });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to link submission" },
            { status: 500 }
        );
    }
}