import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req) {
    try {
        const body = await req.json();
        const { question, isAnonymous, email } = body;

        // Basic validation
        if (!question || question.trim().length < 10) {
            return NextResponse.json(
                { error: "Question too short" },
                { status: 400 }
            );
        }

        if (!isAnonymous && (!email || !email.includes("@"))) {
            return NextResponse.json(
                { error: "Valid email required" },
                { status: 400 }
            );
        }

        const trimmedQuestion = question.trim();

        // Simple language detection (basic for now)
        const isKannada = /[\u0C80-\u0CFF]/.test(trimmedQuestion);
        const language = isKannada ? "kn" : "en";

        await adminDB.collection("qna_submissions").add({
            question_original: trimmedQuestion,
            translated_question_en: language === "en" ? trimmedQuestion : null,
            language,
            isAnonymous,
            email: isAnonymous ? null : email,
            status: "pending",
            createdAt: FieldValue.serverTimestamp(),
            answeredAt: null,
            promoted_qna_id: null,
            email_sent: false,
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Submission error:", err);
        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}
