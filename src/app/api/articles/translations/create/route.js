import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            articleId,
            language,
            title,
            excerpt,
            content,
            author,
            visibility = true,
            status = "draft",
        } = body;

        if (!articleId || !language || !title || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const normalizedLanguage = language.trim().toLowerCase();

        // verify parent article exists
        const articleRef = adminDB.collection("articles").doc(articleId);
        const articleSnap = await articleRef.get();

        if (!articleSnap.exists) {
            return NextResponse.json(
                { error: " article not found" },
                { status: 404 }
            );
        }

        const translationRef = adminDB
            .collection("articles")
            .doc(articleId)
            .collection("translations")
            .doc(normalizedLanguage);

        const existingTranslation = await translationRef.get();
        if (existingTranslation.exists) {
            return NextResponse.json(
                { error: "Translation already exists for this language" },
                { status: 409 }
            )
        }

        await translationRef.set({
            language: normalizedLanguage,
            title,
            excerpt: excerpt || "",
            content,
            author: author || "unknown",
            visibility,
            status,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        return NextResponse.json({
            articleId,
            language: normalizedLanguage,
        });
    } catch (err) {
        console.error("Create translation failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
