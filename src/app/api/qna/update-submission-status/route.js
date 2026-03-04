import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !["approved", "rejected"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid request" },
                { status: 400 }
            );
        }

        await adminDB.collection("qna_submissions").doc(id).update({
            status,
            answeredAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        );
    }
}