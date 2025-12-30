import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const rawLang = searchParams.get("lang") || "kn";
        const lang = rawLang.trim().toLowerCase();

        if (!slug) {
            return NextResponse.json({ error: "Slug required" }, { status: 400 });
        }

        // 1. construct article
        const articleSnap = await adminDB
            .collection("articles")
            .where("slug", "==", slug)
            .where("status", "==", "published")
            .limit(1)
            .get();



        if (articleSnap.empty) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        const articleDoc = articleSnap.docs[0];
        const article = { id: articleDoc.id, ...articleDoc.data() };

        const translationRef = adminDB
            .collection("articles")
            .doc(article.id)
            .collection("translations")
            .doc(lang);

        let translationSnap = await translationRef.get();

        let translation = null;

        if (
            translationSnap.exists &&
            translationSnap.data().status === "published" &&
            translationSnap.data().visibility === true
        ) {
            translation = translationSnap.data();
        }

        if (!translation && lang !== "kn") {
            const fallbackSnap = await adminDB
                .collection("articles")
                .doc(article.id)
                .collection("translations")
                .doc("kn")
                .get();

            if (
                fallbackSnap.exists &&
                fallbackSnap.data().status === "published" &&
                fallbackSnap.data().visibility === true
            ) {
                translation = fallbackSnap.data()
            }

        }

        if (!translation) {
            return NextResponse.json(
                { error: "No published translation found" },
                { status: 404 }
            );
        }



        // 4. merge + return
        return NextResponse.json({
            slug: article.slug,
            category: article.category,
            topics: article.topics,
            image: article.image,
            isFeatured: article.isFeatured,
            language: translation.language,
            title: translation.title,
            excerpt: translation.excerpt,
            content: translation.content,
            author: translation.author,
        });
    } catch (err) {
        console.error("Fetch by slug failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
