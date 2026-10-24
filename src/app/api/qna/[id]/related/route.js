import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

let cachedItems = null;
let lastLoadTime = 0;
const cachedResults = new Map();
const RESULT_CACHE_TTL = 10 * 60 * 1000;

async function loadItems() {
  const now = Date.now();

  if (cachedItems && now - lastLoadTime < 10 * 60 * 1000) {
    return cachedItems;
  }

  const snapshot = await adminDB
    .collection("qna_items")
    .select("embedding", "question_en", "question_kn", "image_urls")
    .get();

  cachedItems = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  lastLoadTime = now;
  return cachedItems;
}

function cosine(a = [], b = []) {
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const cached = cachedResults.get(id);

    if (cached && Date.now() - cached.timestamp < RESULT_CACHE_TTL) {
      return NextResponse.json({
        success: true,
        results: cached.results,
      });
    }

    const currentDoc = await adminDB.collection("qna_items").doc(id).get();

    if (!currentDoc.exists) {
      return NextResponse.json(
        { success: false, reason: "not-found" },
        { status: 404 },
      );
    }

    const embedding = currentDoc.data().embedding || [];

    if (!embedding.length) {
      return NextResponse.json({ success: true, results: [] });
    }

    const items = await loadItems();

    const results = items
      .filter((item) => item.id !== id && item.embedding?.length)
      .map((item) => ({
        id: item.id,
        question_en: item.question_en || "",
        question_kn: item.question_kn || "",
        image_urls: item.image_urls || [],
        score: cosine(embedding, item.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    cachedResults.set(id, {
      results,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Related questions error:", error);

    return NextResponse.json(
      { success: false, reason: "server-error" },
      { status: 500 },
    );
  }
}
