import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
    try {
        const { articleId, status } = await req.json();

        if (!articleId || !status) {
            return NextResponse.json(
                { error: "Missing articleId or Status" },
                { status: 400 }
            );
        }

        if (!["draft", "published"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid Status" },
                { status: 400 }
            );
        }

        const ref = adminDB.collection("articles").doc(articleId);
        const snap = await ref.get();

        if (!snap.exists) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            )
        }

        await ref.update({
            status,
            updatedAt: new Date(),
        })

        return NextResponse.json({ success: true });


    } catch (err) {
        console.error("Update article status failed:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}