import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
  const id = "euS6bue44WZLeJTJ5SQ";

  const ref = adminDB.collection("qna_items").doc(id);
  const snap = await ref.get();

  return NextResponse.json({
    id,
    exists: snap.exists,
    data: snap.exists ? snap.data() : null,
  });
}
