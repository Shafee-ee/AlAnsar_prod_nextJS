import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "kn";

    const snapshot = await adminDB
      .collection("articles")
      .orderBy("createdAt", "desc")
      .get();

    const articles = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const articleData = doc.data();

        const translationSnap = await adminDB
          .collection("articles")
          .doc(doc.id)
          .collection("translations")
          .doc(lang)
          .get();

        return {
          id: doc.id,
          ...articleData,
          title: translationSnap.exists
            ? translationSnap.data().title
            : articleData.slug,
        };
      }),
    );

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Articles API error:", error);
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}
