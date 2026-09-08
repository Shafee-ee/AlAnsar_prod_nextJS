import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, reason: "missing-id" },
        { status: 400 },
      );
    }

    const snap = await adminDB.collection("qna_submissions").doc(id).get();

    if (!snap.exists) {
      return NextResponse.json(
        { success: false, reason: "submission-not-found" },
        { status: 404 },
      );
    }

    const data = snap.data();

    return NextResponse.json({
      success: true,
      email: data.email || "",
      phone: data.phone || "",
    });
  } catch (error) {
    console.error("Submission contact lookup failed:", error);

    return NextResponse.json(
      { success: false, reason: "server-error" },
      { status: 500 },
    );
  }
}
