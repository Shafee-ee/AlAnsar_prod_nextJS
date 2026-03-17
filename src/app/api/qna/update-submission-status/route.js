import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sendEmailToImam } from "@/lib/email";

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
        const docRef = adminDB.collection("qna_submissions").doc(id);

        await docRef.update({
            status,
            answeredAt: FieldValue.serverTimestamp(),
        });

        // Send email only if approved
        if (status === "approved") {

            //debugging 
            console.log("Approval detected, sending email...");

            const doc = await docRef.get();

            if (doc.exists) {
                const data = doc.data();

                await sendEmailToImam(
                    data.question_original,
                    id
                );
            }
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        );
    }
}
