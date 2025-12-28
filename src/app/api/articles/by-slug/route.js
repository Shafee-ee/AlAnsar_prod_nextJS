import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const lang = searchParams.get("lang") || "kn"; // default Kannada

        if (!slug) {
            return NextResponse.json({ error: "Slug required" }, { status: 400 });
        }

        // 1. get parent article
        const articleSnap = await adminDB
            .collection("articles")
            .where("slug", "==", slug)
            .limit(1)
            .get();

        if (articleSnap.empty) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        const articleDoc = articleSnap.docs[0];
        const article = { id: articleDoc.id, ...articleDoc.data() };

        // 2. try requested language
        let translationSnap = await adminDB
            .collection("article_translations")
            .where("parentArticleId", "==", article.id)
            .where("language", "==", lang)
            .where("status", "==", "published")
            .limit(1)
            .get();

        // 3. fallback to Kannada
        if (translationSnap.empty && lang !== "kn") {
            translationSnap = await adminDB
                .collection("article_translations")
                .where("parentArticleId", "==", article.id)
                .where("language", "==", "kn")
                .where("status", "==", "published")
                .limit(1)
                .get();
        }

        if (translationSnap.empty) {
            return NextResponse.json(
                { error: "No published translation found" },
                { status: 404 }
            );
        }

        const translationDoc = translationSnap.docs[0];
        const translation = translationDoc.data();

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
