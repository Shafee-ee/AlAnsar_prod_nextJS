import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10)
        const limit = 20;
        const offset = (page - 1) * limit;

        //total count
        const countSnap = await adminDB.collection("qna_items").count().get();
        const totalCount = countSnap.data().count;



        //offset pagination
        let snap = await adminDB
            .collection("qna_items")
            .orderBy("createdAt", "desc")
            .offset(offset)
            .limit(limit)
            .get();

        const items = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))



        return NextResponse.json({
            success: true,
            items,
            totalCount,
            page,
            limit
        });

    } catch (err) {
        console.error("Pagination error:", err);
        return NextResponse.json(
            { success: false, message: err.toString() },
            { status: 500 }
        );
    }
}
