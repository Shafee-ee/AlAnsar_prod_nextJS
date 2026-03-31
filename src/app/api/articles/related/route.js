import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const exclude = searchParams.get("exclude");

  const snap = await adminDB
    .collection("articles")
    .where("category", "==", category)
    .limit(5)
    .get();

  const articles = [];

  for (const doc of snap.docs) {
    if (doc.id === exclude) continue;

    const tSnap = await doc.ref.collection("translations").get();

    const translations = {};
    tSnap.forEach((t) => {
      translations[t.id] = t.data();
    });

    articles.push({
      id: doc.id,
      ...doc.data(),
      translations,
    });
  }

  return NextResponse.json({ articles });
}