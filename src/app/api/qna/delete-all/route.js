import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BATCH_SIZE = 100;

export async function DELETE() {
    try {
        const ref = adminDB.collection("qna_items");
        let totalDeleted = 0;

        while (true) {
            const snap = await ref.limit(BATCH_SIZE).get();
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
        console.error("Delete-all failed:", err);
        return NextResponse.json(
            { success: false },
            { status: 500 }
        );
    }
}
