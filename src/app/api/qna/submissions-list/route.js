import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    let snapshot;

    if (status === "approved") {
      const [approvedSnap, answeredSnap] = await Promise.all([
        adminDB
          .collection("qna_submissions")
          .where("status", "==", "approved")
          .get(),

        adminDB
          .collection("qna_submissions")
          .where("status", "==", "answered_received")
          .get(),
      ]);

      const docs = [...approvedSnap.docs, ...answeredSnap.docs];

      docs.sort((a, b) => {
        const aTime = a.data().createdAt?._seconds || 0;
        const bTime = b.data().createdAt?._seconds || 0;

        return bTime - aTime;
      });

      return NextResponse.json({
        submissions: docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      });
    }

    snapshot = await adminDB
      .collection("qna_submissions")
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .get();

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
