import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
    try {
        const {
            articleId,
            language,
            title,
            excerpt,
            content,
            visibility,
        } = await req.json();

        if (!articleId || !language) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            )
        }

        const ref = adminDB
            .collection("articles")
            .doc(articleId)
            .collection("translations")
            .doc(language);

        const snap = await ref.get();

        if (!snap.exists) {
            return NextResponse.json(
                { error: "Translation not found" },
                { status: 404 }
            )
        }

        await ref.update({
            title,
            excerpt,
            content,
            visibility,
            updatedAt: new Date(),
        })
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}