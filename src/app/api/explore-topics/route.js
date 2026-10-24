import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

const ALLOWED_TOPICS = [
  "Namaz",
  "Zakat",
  "Wudu",
  "Dua",
  "Fasting",
  "Hajj and Umrah",
  "Qiyamah",
  "Festivals",
  "Marriage",
  "Birth",
  "Inheritance",
  "Transactions",
  "Death",
  "Vows",
  "Dress and Adornment",
  "Children",
];

export async function POST(req) {
  try {
    const body = await req.json();

    const topic = String(body.topic || "").trim();
    const lang = body.lang === "en" ? "en" : "kn";

    if (!ALLOWED_TOPICS.includes(topic)) {
      return NextResponse.json(
        {
          success: false,
          reason: "invalid-topic",
        },
        { status: 400 },
      );
    }

    const snapshot = await adminDB
      .collection("qna_items")
      .where("keywords", "array-contains", topic)
      .limit(10)
      .get();

    const results = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          question:
            lang === "en" ? data.question_en || "" : data.question_kn || "",
        };
      })
      .filter((item) => item.question.trim() !== "");

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Explore topics error:", error);

    return NextResponse.json(
      {
        success: false,
        reason: "server-error",
      },
      { status: 500 },
    );
  }
}
