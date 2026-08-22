import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { generateEmbedding } from "@/lib/vertexEmbedding";

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Missing ID",
      });
    }

    const docRef = adminDB.collection("qna_items").doc(id);
    const docSnap = await docRef.get();

    console.log("FIX EMBEDDING DEBUG:", {
      id,
      exists: docSnap.exists,
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    if (!docSnap.exists) {
      return NextResponse.json({
        success: false,
        message: "Not found",
      });
    }

    const data = docSnap.data();

    const embedding = await generateEmbedding(data.question_en);

    if (!Array.isArray(embedding) || embedding.length !== 768) {
      return NextResponse.json({
        success: false,
        message: "Failed to generate a valid 768-dimensional embedding",
      });
    }

    await docRef.update({
      embedding,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      embeddingLength: embedding.length,
    });
  } catch (err) {
    console.error("Fix-Embedding Error:", err);

    return NextResponse.json({
      success: false,
      message: err.toString(),
    });
  }
}
