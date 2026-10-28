import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { invalidateArticleCache } from "@/lib/articleCache";

const ALLOWED_CATEGORIES = [
  "Smariniyaru",
  "Islamic History",
  "Hadith",
  "Fiqh",
  "Vismaya Jagattu",
  "Vishleshanagalu",
  "Quranic vyakhanagalu",
  "Prophets in Qur'an",
  "History",
  "Serial",
  "Poem",
  "Health",
  "Editorial",
  "Hajj / Umrah",
];

export async function PATCH(req) {
  try {
    const { articleId, category } = await req.json();

    if (!articleId || !category) {
      return NextResponse.json(
        { error: "Article ID and category are required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const articleRef = adminDB.collection("articles").doc(articleId);
    const articleSnap = await articleRef.get();

    if (!articleSnap.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await articleRef.update({
      category,
      updatedAt: new Date(),
    });

    invalidateArticleCache();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update article category failed:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
