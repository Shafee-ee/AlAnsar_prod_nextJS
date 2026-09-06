import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { sendEmailToImam } from "@/lib/email";
import { QNA_SUBMISSION_STATUS } from "@/lib/qna";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    const allowedStatuses = [
      QNA_SUBMISSION_STATUS.APPROVED,
      QNA_SUBMISSION_STATUS.REJECTED,
      QNA_SUBMISSION_STATUS.UNDER_REVIEW,
      QNA_SUBMISSION_STATUS.READY_TO_PROMOTE,
    ];

    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
    const currentStatus = data.status;

    /*
     * APPROVE
     *
     * pending → approved
     *
     * Approval sends the question to the Ustaad.
     */
    if (status === QNA_SUBMISSION_STATUS.APPROVED) {
      if (currentStatus !== QNA_SUBMISSION_STATUS.PENDING) {
        return NextResponse.json(
          {
            error: "Only pending submissions can be approved",
          },
          { status: 409 },
        );
      }
      const emailResult = await sendEmailToImam({
        questionOriginal: data.question_original,
        questionEnglish: data.translated_question_en,
        questionKannada: data.question_kn,
        language: data.language,
        submissionId: id,
      });
      if (!emailResult) {
        return NextResponse.json(
          {
            error: "Failed to send question to Ustaad",
          },
          { status: 500 },
        );
      }

      await docRef.update({
        status: QNA_SUBMISSION_STATUS.APPROVED,
        email_sent: true,
        email_sent_at: FieldValue.serverTimestamp(),
        answeredAt: null,
      });

      return NextResponse.json({ success: true });
    }

    /*
     * REJECT
     *
     * pending → rejected
     */
    if (status === QNA_SUBMISSION_STATUS.REJECTED) {
      if (currentStatus !== QNA_SUBMISSION_STATUS.PENDING) {
        return NextResponse.json(
          {
            error: "Only pending submissions can be rejected",
          },
          { status: 409 },
        );
      }

      await docRef.update({
        status: QNA_SUBMISSION_STATUS.REJECTED,
        rejectedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    /*
     * START REVIEW
     *
     * answered_received → under_review
     */
    if (status === QNA_SUBMISSION_STATUS.UNDER_REVIEW) {
      if (currentStatus !== QNA_SUBMISSION_STATUS.ANSWERED_RECEIVED) {
        return NextResponse.json(
          {
            error: "Only submissions with received answers can enter review",
          },
          { status: 409 },
        );
      }

      await docRef.update({
        status: QNA_SUBMISSION_STATUS.UNDER_REVIEW,
        reviewStartedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    /*
     * READY TO PROMOTE
     *
     * under_review → ready_to_promote
     *
     * Step 8 will make the promotion endpoint
     * accept this state.
     */
    if (status === QNA_SUBMISSION_STATUS.READY_TO_PROMOTE) {
      if (currentStatus !== QNA_SUBMISSION_STATUS.UNDER_REVIEW) {
        return NextResponse.json(
          {
            error:
              "Only submissions under review can be marked ready for promotion",
          },
          { status: 409 },
        );
      }

      await docRef.update({
        status: QNA_SUBMISSION_STATUS.READY_TO_PROMOTE,
        readyToPromoteAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported status" }, { status: 400 });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
