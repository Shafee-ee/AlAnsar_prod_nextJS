import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { generateEmbedding } from "@/lib/vertexEmbedding";
/* -----------------------------
   EMBEDDING
----------------------------- */

/* -----------------------------
   UPDATE QNA
----------------------------- */
export async function POST(req) {
  try {
    const { id, updates } = await req.json();

    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: "Missing id or updates" },
        { status: 400 },
      );
    }

    const docRef = adminDB.collection("qna_items").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 },
      );
    }

    const oldData = snap.data();
    let embedding = oldData.embedding || [];

    let shouldRegenerate =
      !Array.isArray(embedding) || embedding.length !== 768;
    const newQuestion =
      updates.question_en !== undefined
        ? updates.question_en
        : oldData.question_en || "";

    const newAnswer =
      updates.answer_en !== undefined
        ? updates.answer_en
        : oldData.answer_en || "";

    if (
      newQuestion !== (oldData.question_en || "") ||
      newAnswer !== (oldData.answer_en || "")
    ) {
      shouldRegenerate = true;
    }

    if (shouldRegenerate) {
      const combinedText = `${newQuestion} ${newAnswer}`.trim();

      if (!combinedText) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot generate embedding from empty content",
          },
          { status: 400 },
        );
      }

      embedding = await generateEmbedding(combinedText);

      if (!Array.isArray(embedding) || embedding.length !== 768) {
        console.error("Invalid embedding generated for Q&A:", id);

        return NextResponse.json(
          { success: false, error: "Embedding generation failed" },
          { status: 500 },
        );
      }
    }

    await docRef.update({
      ...updates,
      embedding,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("QNA UPDATE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
