import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    let submissions = [];

    if (status === "approved") {
      // Answer workflow:
      // approved = answer pending
      // answered_received = answer received
      const [approvedSnap, answeredSnap] = await Promise.all([
        adminDB
          .collection("qna_submissions")
          .where("status", "==", "approved")
          .orderBy("createdAt", "desc")
          .get(),

        adminDB
          .collection("qna_submissions")
          .where("status", "==", "answered_received")
          .orderBy("createdAt", "desc")
          .get(),
      ]);

      submissions = [...approvedSnap.docs, ...answeredSnap.docs]
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const dateA = a.createdAt?._seconds
            ? a.createdAt._seconds
            : new Date(a.createdAt || 0).getTime() / 1000;

          const dateB = b.createdAt?._seconds
            ? b.createdAt._seconds
            : new Date(b.createdAt || 0).getTime() / 1000;

          return dateB - dateA;
        });
    } else if (status === "promoted") {
      const snapshot = await adminDB
        .collection("qna_submissions")
        .where("status", "==", "answered")
        .orderBy("createdAt", "desc")
        .get();

      submissions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item) => item.promoted_qna_id);
    } else {
      const snapshot = await adminDB
        .collection("qna_submissions")
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .get();

      submissions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
