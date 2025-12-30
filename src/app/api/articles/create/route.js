import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";



export async function POST(req) {
    try {
        const body = await req.json();
        const { slug, category, image, topics = [] } = body;

        if (!slug || !category) {
            return NextResponse.json(
                { error: "Slug and category are required" },
                { status: 400 }
            );
        }

        const normalizedSlug = slug.trim();

        // ensure slug is unique
        const existing = await adminDB
            .collection("articles")
            .where("slug", "==", normalizedSlug)
            .limit(1)
            .get();

        if (!existing.empty) {
            return NextResponse.json(
                { error: "Article with this slug already exists" },
                { status: 409 }
            );
        }

        const docRef = await adminDB.collection("articles").add({
            slug: normalizedSlug,
            category,
            topics,
            image: image || null,
            isFeatured: false,
            status: "draft",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({
            id: docRef.id,
            slug: normalizedSlug,
        });

    } catch (err) {
        console.error("Create article failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
