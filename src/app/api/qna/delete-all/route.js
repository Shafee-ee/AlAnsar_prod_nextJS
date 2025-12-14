import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export const runtime = "nodejs"; // REQUIRED for Firestore batch ops

export async function POST() {
    try {
        const collectionRef = adminDB.collection("qna_items");
        let totalDeleted = 0;

        while (true) {
            const snap = await collectionRef.limit(500).get();
            if (snap.empty) break;

            const batch = adminDB.batch();
            snap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            totalDeleted += snap.size;
        }

        return NextResponse.json({
            success: true,
            deleted: totalDeleted,
        });
    } catch (err) {
        console.error("QnA delete-all failed:", err);
        return NextResponse.json(
            { success: false, message: "Delete failed" },
            { status: 500 }
        );
    }
}
