import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 },
      );
    }

    const articleRef = adminDB.collection("articles").doc(articleId);

    await articleRef.set(
      {
        views: FieldValue.increment(1),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Article view error:", error);

    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 },
    );
  }
}
