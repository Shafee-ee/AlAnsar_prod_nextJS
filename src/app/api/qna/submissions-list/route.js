import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
    try {
        const snapshot = await adminDB
            .collection("qna_submissions")
            .orderBy("createdAt", "desc")
            .get();

        const submissions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ submissions });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}
