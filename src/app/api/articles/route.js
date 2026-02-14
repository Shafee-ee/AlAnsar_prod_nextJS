import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
    try {
        const snapshot = await adminDB
            .collection("articles")
            .orderBy("createdAt", "desc")
            .get();

        const articles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ articles });
    } catch (error) {
        console.error("Articles API error:", error);
        return NextResponse.json({ articles: [] }, { status: 500 });
    }
}
