import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { sendEmailToImam } from "@/lib/email";
import { geminiTranslate } from "@/lib/geminiTranslate";

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 },
      );
    }

    const docRef = adminDB.collection("qna_submissions").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    const data = doc.data();

    if (data.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved submissions can be resent" },
        { status: 400 },
      );
    }

    let questionKannada = data.question_kn;
    let questionEnglish = data.translated_question_en;

    const updates = {};

    if (!questionKannada) {
      if (data.language === "kn") {
        questionKannada = data.question_original;
      } else {
        questionKannada = await geminiTranslate(data.question_original, "kn");
      }

      if (!questionKannada) {
        return NextResponse.json(
          { error: "Unable to generate Kannada translation" },
          { status: 500 },
        );
      }

      updates.question_kn = questionKannada;
    }

    if (!questionEnglish) {
      if (data.language === "en") {
        questionEnglish = data.question_original;
      } else {
        questionEnglish = await geminiTranslate(data.question_original, "en");
      }

      if (!questionEnglish) {
        return NextResponse.json(
          { error: "Unable to generate English translation" },
          { status: 500 },
        );
      }

      updates.question_en = questionEnglish;
      updates.translated_question_en = questionEnglish;
    }

    if (Object.keys(updates).length > 0) {
      await docRef.update(updates);
    }
    const result = await sendEmailToImam({
      questionOriginal: data.question_original,
      questionEnglish,
      questionKannada,
      language: data.language,
      submissionId: id,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.error("Resend imam email failed:", err);

    return NextResponse.json(
      { error: "Failed to resend email" },
      { status: 500 },
    );
  }
}
