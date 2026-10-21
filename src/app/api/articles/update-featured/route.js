import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { invalidateArticleCache } from "@/lib/articleCache";

export async function POST(req) {
  try {
    const { articleId, isFeatured } = await req.json();
    if (!articleId) {
      return NextResponse.json(
        { error: "Article Id Not found" },
        {
          status: 400,
        },
      );
    }

    const ref = adminDB.collection("articles").doc(articleId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 400 });
    }

    await ref.update({
      isFeatured,
      updatedAt: new Date(),
    });

    invalidateArticleCache();
    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("Update featured failed:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
