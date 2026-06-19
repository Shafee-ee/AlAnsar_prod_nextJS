import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 },
      );
    }

    const docRef = adminDB.collection("articles").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const data = docSnap.data();

    const enSnap = await adminDB
      .collection("articles")
      .doc(id)
      .collection("translations")
      .doc("en")
      .get();

    const knSnap = await adminDB
      .collection("articles")
      .doc(id)
      .collection("translations")
      .doc("kn")
      .get();

    return NextResponse.json({
      article: {
        id: docSnap.id,
        ...data,
        translations: {
          en: enSnap.exists ? enSnap.data() : null,
          kn: knSnap.exists ? knSnap.data() : null,
        },
      },
    });
  } catch (err) {
    console.error("Fetch article by id failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
