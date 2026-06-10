import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const lang = searchParams.get("lang") || "kn";

  const snap = await adminDB.collection("qna_items").get();

  const items = snap.docs.map((doc) => doc.data());

  const content = items
    .map(
      (item, index) => `
Question ${index + 1}
==================================================

${lang === "en" ? item.question_en || "" : item.question_kn || ""}

Answer
--------------------------------------------------

${lang === "en" ? item.answer_en || "" : item.answer_kn || ""}

`,
    )
    .join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="alansar-qna-${lang}.txt"`,
    },
  });
}
