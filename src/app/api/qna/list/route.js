import { adminDB } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const snapshot = await adminDB.collection("qna_items").orderBy("createdAt", "desc").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ success: true, items: data });
    } catch (err) {
        console.error("LIST ERROR:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
