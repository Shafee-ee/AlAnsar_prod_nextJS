import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
    const snapshot = await adminDB.collection("qna_items").get();
    return Response.json({ total: snapshot.size });
}