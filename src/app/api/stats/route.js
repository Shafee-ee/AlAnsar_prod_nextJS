import { adminDB } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await adminDB.collection("qna_items").get();

  return Response.json(
    { total: snapshot.size },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
