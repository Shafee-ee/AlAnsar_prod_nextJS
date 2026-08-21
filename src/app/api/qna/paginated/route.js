import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    const limit = 20;
    const offset = (page - 1) * limit;

    /*
     * NORMAL PAGINATION
     * No search = let Firestore do the pagination.
     */
    if (!search) {
      const countSnap = await adminDB.collection("qna_items").count().get();

      const totalCount = countSnap.data().count;

      const snapshot = await adminDB
        .collection("qna_items")
        .orderBy("createdAt", "desc")
        .offset(offset)
        .limit(limit)
        .get();

      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return NextResponse.json({
        success: true,
        items,
        totalCount,
        page,
        limit,
      });
    }

    /*
     * SEARCH
     *
     * Firestore cannot do "contains" searches.
     * So fetch ONLY the fields needed for searching,
     * rather than downloading the entire Q&A documents.
     */
    const snapshot = await adminDB
      .collection("qna_items")
      .select("question_en")
      .get();

    const matchingDocs = snapshot.docs.filter((doc) => {
      const question = doc.data().question_en || "";
      return question.toLowerCase().includes(search);
    });

    const totalCount = matchingDocs.length;

    const paginatedDocs = matchingDocs.slice(offset, offset + limit);

    /*
     * Now fetch the complete documents only for
     * the 20 records we actually need to display.
     */
    const fullDocs = await Promise.all(
      paginatedDocs.map((doc) =>
        adminDB.collection("qna_items").doc(doc.id).get(),
      ),
    );

    const items = fullDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    return NextResponse.json({
      success: true,
      items,
      totalCount,
      page,
      limit,
    });
  } catch (err) {
    console.error("Pagination error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.toString(),
      },
      { status: 500 },
    );
  }
}
