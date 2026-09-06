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
    let {
      question,
      answer,
      lang: userLang,
      keywords = [],
      editor_note_en = "",
      editor_note_kn = "",
      imam_name = null,
      source_title = null,
      samputa = null,
      sanchike = null,
      image_urls = [],
      submissionId = null,
      responseId = null,
    } = await req.json();

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
         For submissions, use the stored question.
         Do not trust the browser to provide a different one.
      ------------------------------------------------------- */
      question =
        submission.question_original ||
        submission.question_en ||
        submission.translated_question_en ||
        question;

      answer = submissionResponse.answer;
    }

    /* -------------------------------------------------------
       Validate final question + answer
    ------------------------------------------------------- */
    if (!question || !answer) {
      return NextResponse.json(
        {
          success: false,
          reason: "missing-fields",
        },
        { status: 400 },
      );
    }

    const q = question.trim();
    const a = answer.trim();

    if (q.length < 2 || a.length < 2) {
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
    const detectedLang = isKannada(q) ? "kn" : "en";

    const finalLang = q.length < 6 ? userLang || detectedLang : detectedLang;

    /* -------------------------------------------------------
       CREATE BOTH ENGLISH + KANNADA VERSIONS
    ------------------------------------------------------- */
    let question_en;
    let answer_en;
    let question_kn;
    let answer_kn;

    if (finalLang === "en") {
      question_en = q;
      answer_en = a;

      question_kn = await translate(q, "kn");
      answer_kn = await translate(a, "kn");
    } else {
      question_kn = q;
      answer_kn = a;

      question_en = await translate(q, "en");
      answer_en = await translate(a, "en");
    }

    /* -------------------------------------------------------
       Final bilingual validation
    ------------------------------------------------------- */
    if (!question_en || !answer_en || !question_kn || !answer_kn) {
      return NextResponse.json(
        {
          success: false,
          reason: "translation-failed",
        },
        { status: 500 },
      );
    }

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
      if (submissionId && responseId) {
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

      /* -------------------------------------------------------
         Notify user.
         
         Email failure must NOT undo the promotion.
      ------------------------------------------------------- */
      if (submission.email && !submission.isAnonymous) {
        try {
          await sendEmailToUser({
            email: submission.email,
            question: submission.question_original || question_en,
            answer: submission.language === "kn" ? answer_kn : answer_en,
          });

          await submissionRef.update({
            user_notification_sent: true,
            user_notification_sent_at: new Date(),
          });
        } catch (emailError) {
          console.error(
            "User notification failed after promotion:",
            emailError,
          );

          await submissionRef.update({
            user_notification_sent: false,
            user_notification_error:
              emailError?.message || "Unknown email error",
          });
        }
      } else {
        console.log("No user notification sent (anonymous or missing email)");
      }
    }

    console.log("Q&A promoted successfully:", newQnaId);

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
