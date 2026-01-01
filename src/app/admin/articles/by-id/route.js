import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Article ID is required" },
                { status: 400 }
            );
        }

        const docRef = adminDB.collection("articles").doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            )
        }

        const data = docSnap.data();

        return NextResponse.json({
            id: docSnap.id,
            slug: data.slug,
            category: data.category,
            status: data.status,
            isFeatured: data.isFeatured,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    } catch (err) {
        console.error("Fetch article by id failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}