import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const articleId = searchParams.get("articleId");

        if (!articleId) {
            return NextResponse.json(
                { error: "Article ID is required" },
                { status: 400 }
            );
        }

        const snap = await adminDB
            .collection("articles")
            .doc(articleId)
            .collection("translations")
            .get();

        const translations = snap.docs.map(doc => ({
            language: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json({ translations });
    } catch (err) {
        console.error("List translations failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
