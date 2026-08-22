import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
  const snap = await adminDB.collection("qna_items").get();

  const problems = [];
  const lengths = {};

  for (const doc of snap.docs) {
    const data = doc.data();

    const embedding = data.embedding;

    let status = "valid";
    let length = 0;

    if (!Array.isArray(embedding)) {
      status = "not_array";
    } else {
      length = embedding.length;

      if (length === 0) {
        status = "empty";
      } else {
        lengths[length] = (lengths[length] || 0) + 1;
      }
    }

    if (status !== "valid") {
      problems.push({
        id: doc.id,
        question_en: data.question_en || "",
        status,
        embeddingLength: length,
      });
    }
  }

  return NextResponse.json({
    success: true,
    total: snap.size,
    problematicCount: problems.length,
    validCount: snap.size - problems.length,
    embeddingLengths: lengths,
    problems,
  });
}
