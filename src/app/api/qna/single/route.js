import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { generateEmbedding } from "@/lib/vertexEmbedding";
import { sendEmailToUser } from "@/lib/email";
import { QNA_SUBMISSION_STATUS } from "@/lib/qna";

/* -------------------------------------------------------
   Detect Kannada
------------------------------------------------------- */
function isKannada(text = "") {
  return /[\u0C80-\u0CFF]/.test(text);
}

/* -------------------------------------------------------
   Translate
------------------------------------------------------- */
async function translate(text, targetLang) {
  const prompt = `
Translate the text into ${targetLang}.
STRICT RULES:
- ONLY return the translated sentence.
- NO explanations.
- NO markdown.
- Preserve Islamic terms exactly: wudu, ghusl, salah, zakat, sunnah, takbir, qibla, mahr, talaq.

TEXT:
${text}
  `;

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.0,
        },
      }),
    },
  );

  if (!r.ok) {
    const errorBody = await r.text();

    console.error("========== GEMINI ERROR ==========");
    console.error("Status:", r.status);
    console.error("Body:", errorBody);
    console.error("Target Language:", targetLang);
    console.error("Text Length:", text.length);
    console.error("=================================");

    throw new Error(`Gemini translate failed (${r.status})`);
  }

  const data = await r.json();

  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error("========== GEMINI EMPTY RESPONSE ==========");
    console.error(JSON.stringify(data, null, 2));
    console.error("==========================================");

    throw new Error("Gemini returned empty response");
  }

  return data.candidates[0].content.parts[0].text.trim();
}

/* -------------------------------------------------------
   Get the answer that was received from the Ustaad
------------------------------------------------------- */
async function getSubmissionResponse(submissionId) {
  const responsesSnap = await adminDB
    .collection("qna_submissions")
    .doc(submissionId)
    .collection("responses")
    .get();

  const responses = responsesSnap.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => {
      const dateA = a.receivedAt?._seconds
        ? a.receivedAt._seconds
        : new Date(a.receivedAt || 0).getTime() / 1000;

      const dateB = b.receivedAt?._seconds
        ? b.receivedAt._seconds
        : new Date(b.receivedAt || 0).getTime() / 1000;

      return dateB - dateA;
    });

  if (responses.length > 0) {
    return responses[0];
  }

  return null;
}

/* -------------------------------------------------------
   MAIN HANDLER
------------------------------------------------------- */
export async function POST(req) {
  try {
    const body = await req.json();

    /* -------------------------------------------------------
       TRANSLATION REQUEST
    ------------------------------------------------------- */
    if (body.action === "translate") {
      const { text, targetLang } = body;

      if (!text?.trim() || !targetLang) {
        return NextResponse.json(
          {
            success: false,
            reason: "missing-translation-fields",
          },
          { status: 400 },
        );
      }

      const translation = await translate(text.trim(), targetLang);

      return NextResponse.json({
        success: true,
        translation,
      });
    }
    let {
      question_en = "",
      question_kn = "",
      answer_en = "",
      answer_kn = "",
      lang: userLang,
      keywords = [],
      editor_note_en = "",
      editor_note_kn = "",
      imam_name = null,
      source_title = null,
      samputa = null,
      sanchike = null,
      image_urls = [],
      email = "",
      phone = "",
      submissionId = null,
      responseId = null,
    } = body;
    /* -------------------------------------------------------
       SUBMISSION-BASED PROMOTION
       
       If this is promoting a user submission, the submission
       MUST already be ready for promotion.
    ------------------------------------------------------- */
    let submission = null;
    let submissionResponse = null;

    if (submissionId) {
      const submissionRef = adminDB
        .collection("qna_submissions")
        .doc(submissionId);

      const submissionSnap = await submissionRef.get();

      if (!submissionSnap.exists) {
        return NextResponse.json(
          {
            success: false,
            reason: "submission-not-found",
          },
          { status: 404 },
        );
      }

      submission = submissionSnap.data();

      // Backend is the source of truth for contact information.
      if (!email.trim()) {
        email = submission.email || "";
      }

      if (!phone.trim()) {
        phone = submission.phone || "";
      }

      /* -------------------------------------------------------
         Prevent duplicate promotion
      ------------------------------------------------------- */
      if (submission.promoted_qna_id) {
        return NextResponse.json(
          {
            success: false,
            reason: "already-promoted",
            id: submission.promoted_qna_id,
          },
          { status: 409 },
        );
      }

      /* -------------------------------------------------------
         Enforce review workflow on the backend
      ------------------------------------------------------- */
      if (
        submission.status !== QNA_SUBMISSION_STATUS.ANSWERED_RECEIVED &&
        submission.status !== QNA_SUBMISSION_STATUS.READY_TO_PROMOTE
      ) {
        return NextResponse.json(
          {
            success: false,
            reason: "submission-not-ready",
            status: submission.status,
          },
          { status: 409 },
        );
      }

      /* -------------------------------------------------------
         Get answer from response records.
         
         The response subcollection is now the source of truth.
      ------------------------------------------------------- */
      submissionResponse = responseId
        ? await adminDB
            .collection("qna_submissions")
            .doc(submissionId)
            .collection("responses")
            .doc(responseId)
            .get()
            .then((doc) =>
              doc.exists
                ? {
                    id: doc.id,
                    ...doc.data(),
                  }
                : null,
            )
        : await getSubmissionResponse(submissionId);
      if (!submissionResponse?.answer) {
        return NextResponse.json(
          {
            success: false,
            reason: "no-ustaad-response",
          },
          { status: 409 },
        );
      }
      /* -------------------------------------------------------
   Fill only fields that are missing.
   
   The values already supplied by SingleUpload are preserved.
------------------------------------------------------- */

      // Question
      if (!question_en.trim() && !question_kn.trim()) {
        if (submission.language === "kn") {
          question_kn =
            submission.question_original || submission.question_kn || "";

          question_en =
            submission.translated_question_en || submission.question_en || "";
        } else {
          question_en =
            submission.question_original || submission.question_en || "";

          question_kn = submission.question_kn || "";
        }
      }

      // Answer
      if (!answer_en.trim() && !answer_kn.trim()) {
        if (isKannada(submissionResponse.answer)) {
          answer_kn = submissionResponse.answer;
        } else {
          answer_en = submissionResponse.answer;
        }
      }
    }
    /* -------------------------------------------------------
   Trim bilingual fields
------------------------------------------------------- */

    /* -------------------------------------------------------
       Normalize contact information
    ------------------------------------------------------- */
    const normalizedEmail = email && email.trim() !== "" ? email.trim() : null;

    const normalizedPhone = phone && phone.trim() !== "" ? phone.trim() : null;
    question_en = question_en.trim();
    question_kn = question_kn.trim();
    answer_en = answer_en.trim();
    answer_kn = answer_kn.trim();

    /* -------------------------------------------------------
   Validate question + answer
------------------------------------------------------- */
    /* -------------------------------------------------------
   Require complete bilingual Q&A
------------------------------------------------------- */

    if (!question_en || !question_kn || !answer_en || !answer_kn) {
      return NextResponse.json(
        {
          success: false,
          reason: "missing-bilingual-fields",
        },
        { status: 400 },
      );
    }

    if (
      (question_en && question_en.length < 2) ||
      (question_kn && question_kn.length < 2) ||
      (answer_en && answer_en.length < 2) ||
      (answer_kn && answer_kn.length < 2)
    ) {
      return NextResponse.json(
        {
          success: false,
          reason: "too-short",
        },
        { status: 400 },
      );
    }
    /* -------------------------------------------------------
   Determine original language
------------------------------------------------------- */
    const detectedLang = isKannada(question_kn) && !question_en ? "kn" : "en";

    const finalLang = submission?.language || userLang || detectedLang;

    /* -------------------------------------------------------
       Generate embedding from English question
    ------------------------------------------------------- */
    const embedding = await generateEmbedding(question_en);

    if (!Array.isArray(embedding) || embedding.length !== 768) {
      return NextResponse.json(
        {
          success: false,
          reason: "embedding-failed",
        },
        { status: 500 },
      );
    }

    /* -------------------------------------------------------
       Normalize metadata
    ------------------------------------------------------- */
    const normalizedImam =
      imam_name && imam_name.trim() !== "" ? imam_name.trim() : null;

    const normalizedSource =
      source_title && source_title.trim() !== "" ? source_title.trim() : null;

    const normalizedSamputa =
      samputa && samputa.trim() !== "" ? samputa.trim() : null;

    const normalizedSanchike =
      sanchike && sanchike.trim() !== "" ? sanchike.trim() : null;

    const normalizedImages = Array.isArray(image_urls) ? image_urls : [];

    /* -------------------------------------------------------
       Create final Q&A document
    ------------------------------------------------------- */
    const qnaRef = adminDB.collection("qna_items").doc();

    const qnaData = {
      question_en,
      answer_en,
      question_kn,
      answer_kn,

      editor_note_en,
      editor_note_kn,

      lang_original: finalLang,

      keywords,

      embedding,

      imam_name: normalizedImam,
      source_title: normalizedSource,
      samputa: normalizedSamputa,
      sanchike: normalizedSanchike,
      image_urls: normalizedImages,

      email: normalizedEmail,
      phone: normalizedPhone,
      submissionId: submissionId || null,

      user_notification_sent: false,
      user_notification_sent_at: null,
      user_notification_error: null,

      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    /* -------------------------------------------------------
       Save final Q&A
    ------------------------------------------------------- */
    await qnaRef.set(qnaData);

    const newQnaId = qnaRef.id;

    /* -------------------------------------------------------
       Link submission after successful promotion
    ------------------------------------------------------- */
    if (submissionId && submission) {
      const submissionRef = adminDB
        .collection("qna_submissions")
        .doc(submissionId);

      await submissionRef.update({
        promoted_qna_id: newQnaId,
        status: QNA_SUBMISSION_STATUS.PROMOTED,
        promotedAt: new Date(),
      });

      // Mark the selected response as promoted
      if (responseId) {
        const responsesRef = adminDB
          .collection("qna_submissions")
          .doc(submissionId)
          .collection("responses");

        const responsesSnap = await responsesRef.get();

        const batch = adminDB.batch();

        responsesSnap.docs.forEach((doc) => {
          batch.update(doc.ref, {
            status: doc.id === responseId ? "promoted" : "rejected",
          });
        });

        await batch.commit();
      }
    }

    /* -------------------------------------------------------
       Notify questioner

       Works for:
       1. Submission-based promotion
       2. Regular Single Upload

       Email failure must NOT undo Q&A creation.
    ------------------------------------------------------- */
    const shouldNotify =
      normalizedEmail && !(submissionId && submission?.isAnonymous);

    if (shouldNotify) {
      try {
        const notificationQuestion =
          finalLang === "kn" ? question_kn : question_en;

        const notificationAnswer = finalLang === "kn" ? answer_kn : answer_en;

        await sendEmailToUser({
          email: normalizedEmail,
          question: notificationQuestion,
          answer: notificationAnswer,
        });

        await qnaRef.update({
          user_notification_sent: true,
          user_notification_sent_at: new Date(),
          user_notification_error: null,
        });

        // Keep submission notification status updated too.
        if (submissionId && submission) {
          await adminDB.collection("qna_submissions").doc(submissionId).update({
            user_notification_sent: true,
            user_notification_sent_at: new Date(),
            user_notification_error: null,
          });
        }
      } catch (emailError) {
        console.error(
          "User notification failed after Q&A creation:",
          emailError,
        );

        await qnaRef.update({
          user_notification_sent: false,
          user_notification_error: emailError?.message || "Unknown email error",
        });

        // Keep submission notification status updated too.
        if (submissionId && submission) {
          await adminDB
            .collection("qna_submissions")
            .doc(submissionId)
            .update({
              user_notification_sent: false,
              user_notification_error:
                emailError?.message || "Unknown email error",
            });
        }
      }
    } else {
      console.log(
        "No user notification sent (anonymous, missing email, or no contact email)",
      );
    }
    console.log("Q&A created successfully:", newQnaId);

    return NextResponse.json({
      success: true,
      id: newQnaId,
    });
  } catch (err) {
    console.error("Upload error:", err);

    return NextResponse.json(
      {
        success: false,
        reason: "server-error",
      },
      { status: 500 },
    );
  }
}
