import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

// simple slugify helper
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { title, category, image, topics = [] } = body;

        if (!title || !category) {
            return NextResponse.json(
                { error: "Title and category are required" },
                { status: 400 }
            );
        }

        const slug = slugify(title);

        // ensure slug is unique
        const existing = await adminDB
            .collection("articles")
            .where("slug", "==", slug)
            .limit(1)
            .get();

        if (!existing.empty) {
            return NextResponse.json(
                { error: "Article with this title already exists" },
                { status: 409 }
            );
        }

        const docRef = await adminDB.collection("articles").add({
            slug,
            category,
            topics,
            image: image || null,
            isFeatured: false,
            status: "draft",
            createdAt: new Date(),
        });

        return NextResponse.json({
            id: docRef.id,
            slug,
        });
    } catch (err) {
        console.error("Create article failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
