import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 },
      );
    }

    const articleRef = adminDB.collection("articles").doc(articleId);

    const articleSnap = await articleRef.get();

    if (!articleSnap.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    const translationsSnap = await articleRef.collection("translations").get();
    const batch = adminDB.batch();

    translationsSnap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(articleRef);

    await batch.commit();

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error("Delete article failed:", err);
    return NextResponse.json(
      { error: "internal Server Error" },
      { status: 500 },
    );
  }
}
