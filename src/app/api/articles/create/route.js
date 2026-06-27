import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { category, image, topics = [], isFeatured = false } = body;

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    const docRef = await adminDB.collection("articles").add({
      slug: "",
      category,
      topics,
      image: image || null,
      isFeatured,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      id: docRef.id,
    });
  } catch (err) {
    console.error("Create article failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
