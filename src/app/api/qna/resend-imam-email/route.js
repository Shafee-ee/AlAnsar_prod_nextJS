import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { sendEmailToImam } from "@/lib/email";

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

    const result = await sendEmailToImam({
      questionOriginal: data.question_original,
      questionEnglish: data.translated_question_en,
      questionKannada: data.question_kn,
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
