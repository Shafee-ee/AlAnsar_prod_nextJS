import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const limit = 20;

        let query = adminDB
            .collection("qna_items")
            .orderBy("createdAt", "desc")
            .limit(limit);

        if (cursor) {
            query = query.startAfter(cursor);
        }

        const snap = await query.get();

        const items = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Last cursor = createdAt of last item
        const lastCursor =
            items.length > 0 ? items[items.length - 1].createdAt : null;

        return NextResponse.json({
            success: true,
            items,
            lastCursor,
            noMore: items.length < limit
        });

    } catch (err) {
        console.error("Pagination error:", err);
        return NextResponse.json(
            { success: false, message: err.toString() },
            { status: 500 }
        );
    }
}
