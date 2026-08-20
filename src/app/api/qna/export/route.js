import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
  const target =
    "what should every parent teach their children first and foremost?";

  const snap = await adminDB
    .collection("qna_items")
    .where("question_en", "==", target)
    .get();

  const items = snap.docs.map((doc) => {
    const d = doc.data();

    return {
      id: doc.id,
      question_en: d.question_en || null,
      answer_en: d.answer_en || null,
      question_kn: d.question_kn || null,
      answer_kn: d.answer_kn || null,
      embeddingExists: Array.isArray(d.embedding),
      embeddingLength: Array.isArray(d.embedding) ? d.embedding.length : 0,
    };
  });

  return NextResponse.json({
    success: true,
    count: items.length,
    items,
  });
}
