import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req) {
    try {

        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0] ||
            "unknown";

        const rateRef = adminDB
            .collection("submission_rate_limits")
            .doc(ip);

        const rateDoc = await rateRef.get();

        const now = Date.now();
        const WINDOW_MS = 60 * 60 * 1000; // 1 hour
        const MAX_SUBMISSIONS = 3;

        if (rateDoc.exists) {
            const data = rateDoc.data();
            const windowStart = data.windowStart;
            const count = data.count;

            if (now - windowStart < WINDOW_MS) {
                if (count >= MAX_SUBMISSIONS) {
                    return NextResponse.json(
                        { error: "Too many submissions. Try again later." },
                        { status: 429 }
                    );
                }

                await rateRef.update({
                    count: count + 1
                });

            } else {
                await rateRef.set({
                    count: 1,
                    windowStart: now
                });
            }

        } else {
            await rateRef.set({
                count: 1,
                windowStart: now
            });
        }

        const body = await req.json();
        const { question, isAnonymous, email,name } = body;

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

        if(!isAnonymous &&(!name || name.trim().length<2)){
            return NextResponse.json(
                {error:"Name is required"},
                {status:400}
            )
        }

        const trimmedQuestion = question.trim();

        const isKannada = /[\u0C80-\u0CFF]/.test(trimmedQuestion);
        const language = isKannada ? "kn" : "en";

        await adminDB.collection("qna_submissions").add({
            question_original: trimmedQuestion,
            translated_question_en: language === "en" ? trimmedQuestion : null,
            language,
            isAnonymous,
            email: isAnonymous ? null : email,
            name:isAnonymous ? null: name.trim(),
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