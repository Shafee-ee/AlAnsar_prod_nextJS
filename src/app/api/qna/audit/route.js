import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

const KANNADA_REGEX = /[\u0C80-\u0CFF]/;

export async function GET() {
  const snap = await adminDB.collection("qna_items").get();

  const audited = snap.docs.map((doc) => {
    const d = doc.data();

    // -----------------------------
    // CONTENT AUDIT
    // -----------------------------

    const sameQuestion = d.question_en === d.question_kn;
    const sameAnswer = d.answer_en === d.answer_kn;

    const hasKannadaQ = KANNADA_REGEX.test(d.question_kn || "");
    const hasKannadaA = KANNADA_REGEX.test(d.answer_kn || "");

    const contentBroken =
      sameQuestion || sameAnswer || !hasKannadaQ || !hasKannadaA;

    // -----------------------------
    // EMBEDDING AUDIT
    // -----------------------------

    const embedding = d.embedding;

    const embeddingValid =
      Array.isArray(embedding) &&
      embedding.length === 768 &&
      embedding.every(
        (value) => typeof value === "number" && Number.isFinite(value),
      );

    return {
      id: doc.id,
      question_en: d.question_en,
      question_kn: d.question_kn,
      answer_kn: d.answer_kn,

      content: {
        broken: contentBroken,
        flags: {
          sameQuestion,
          sameAnswer,
          hasKannadaQ,
          hasKannadaA,
        },
      },

      embedding: {
        valid: embeddingValid,
        length: Array.isArray(embedding) ? embedding.length : 0,
      },
    };
  });

  return NextResponse.json({
    total: audited.length,

    content: {
      brokenCount: audited.filter((i) => i.content.broken).length,
    },

    embedding: {
      brokenCount: audited.filter((i) => !i.embedding.valid).length,
    },

    items: audited,
  });
}
