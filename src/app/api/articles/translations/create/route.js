import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            parentArticleId,
            language,
            title,
            excerpt,
            content,
            author,
        } = body;

        if (!parentArticleId || !language || !title || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // verify parent article exists
        const parentRef = adminDB.collection("articles").doc(parentArticleId);
        const parentSnap = await parentRef.get();

        if (!parentSnap.exists) {
            return NextResponse.json(
                { error: "Parent article not found" },
                { status: 404 }
            );
        }

        // ensure unique language per article
        const existing = await adminDB
            .collection("article_translations")
            .where("parentArticleId", "==", parentArticleId)
            .where("language", "==", language)
            .limit(1)
            .get();

        if (!existing.empty) {
            return NextResponse.json(
                { error: "Translation already exists for this language" },
                { status: 409 }
            );
        }

        const docRef = await adminDB.collection("article_translations").add({
            parentArticleId,
            language,
            title,
            excerpt: excerpt || "",
            content,
            author: author || "Unknown",
            status: "draft",
            lastUpdated: new Date(),
        });

        return NextResponse.json({
            id: docRef.id,
            language,
        });
    } catch (err) {
        console.error("Create translation failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
