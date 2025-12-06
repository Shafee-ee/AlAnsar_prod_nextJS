import { adminDB } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
        }

        await adminDB.collection("qna_items").doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
