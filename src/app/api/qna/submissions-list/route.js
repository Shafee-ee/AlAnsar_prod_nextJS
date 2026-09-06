import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { QNA_SUBMISSION_STATUS } from "@/lib/qna";

async function attachResponses(doc) {
  const data = doc.data();

  const responsesSnap = await adminDB
    .collection("qna_submissions")
    .doc(doc.id)
    .collection("responses")
    .get();

  const responses = responsesSnap.docs
    .map((responseDoc) => ({
      id: responseDoc.id,
      ...responseDoc.data(),
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

  return {
    id: doc.id,
    ...data,
    responses,
    responseCount: responses.length,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || QNA_SUBMISSION_STATUS.PENDING;

    let docs = [];
    if (status === QNA_SUBMISSION_STATUS.APPROVED) {
      const [approvedSnap, answeredSnap, reviewSnap, readySnap] =
        await Promise.all([
          adminDB
            .collection("qna_submissions")
            .where("status", "==", QNA_SUBMISSION_STATUS.APPROVED)
            .orderBy("createdAt", "desc")
            .get(),

          adminDB
            .collection("qna_submissions")
            .where("status", "==", QNA_SUBMISSION_STATUS.ANSWERED_RECEIVED)
            .orderBy("createdAt", "desc")
            .get(),

          adminDB
            .collection("qna_submissions")
            .where("status", "==", QNA_SUBMISSION_STATUS.UNDER_REVIEW)
            .orderBy("createdAt", "desc")
            .get(),

          adminDB
            .collection("qna_submissions")
            .where("status", "==", QNA_SUBMISSION_STATUS.READY_TO_PROMOTE)
            .orderBy("createdAt", "desc")
            .get(),
        ]);

      docs = [
        ...approvedSnap.docs,
        ...answeredSnap.docs,
        ...reviewSnap.docs,
        ...readySnap.docs,
      ];
    } else if (status === QNA_SUBMISSION_STATUS.PROMOTED) {
      // New workflow uses "promoted".
      const promotedSnap = await adminDB
        .collection("qna_submissions")
        .where("status", "==", QNA_SUBMISSION_STATUS.PROMOTED)
        .orderBy("createdAt", "desc")
        .get();

      // Keep compatibility with older submissions that were promoted
      // while their status was still "answered".
      const legacySnap = await adminDB
        .collection("qna_submissions")
        .where("status", "==", "answered")
        .orderBy("createdAt", "desc")
        .get();

      docs = [
        ...promotedSnap.docs,
        ...legacySnap.docs.filter((doc) => doc.data().promoted_qna_id),
      ];
    } else {
      const snapshot = await adminDB
        .collection("qna_submissions")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .get();

      docs = snapshot.docs;
    }

    const submissions = await Promise.all(
      docs.map((doc) => attachResponses(doc)),
    );

    submissions.sort((a, b) => {
      const dateA = a.createdAt?._seconds
        ? a.createdAt._seconds
        : new Date(a.createdAt || 0).getTime() / 1000;

      const dateB = b.createdAt?._seconds
        ? b.createdAt._seconds
        : new Date(b.createdAt || 0).getTime() / 1000;

      return dateB - dateA;
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
