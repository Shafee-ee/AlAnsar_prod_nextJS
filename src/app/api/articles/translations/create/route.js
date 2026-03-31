import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      articleId,
      language,
      title,
      content,
      author,
    } = body;

    if (!articleId || !language || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedLanguage = language.trim().toLowerCase();

    // verify parent article exists
    const articleRef = adminDB.collection("articles").doc(articleId);
    const articleSnap = await articleRef.get();

    if (!articleSnap.exists) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // 🔹 helper: UPSERT
    async function upsert(lang, data) {
      const ref = adminDB
        .collection("articles")
        .doc(articleId)
        .collection("translations")
        .doc(lang);

      await ref.set(
        {
          language: lang,
          ...data,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    //Save original
    await upsert(normalizedLanguage, {
      title,
      content,
      author: author || "unknown",
    });

    // Translate
    const targetLang = normalizedLanguage === "kn" ? "en" : "kn";

    const translateRes = await fetch(
       `${req.headers.get("origin")}/api/translate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLang: normalizedLanguage,
          targetLang,
          title,
          content,
        }),
      }
    );


    if (!translateRes.ok) {
  throw new Error("Translation API failed");
}

    const translated = await translateRes.json();
    console.log("Translated data:",translated);

    //Save translated
    await upsert(targetLang, {
      title: translated.title || "",
      content: translated.content || "",
      author: author || "unknown",
    });

    return NextResponse.json({
      articleId,
      language: normalizedLanguage,
      success: true,
    });

  } catch (err) {
    console.error("Create/Upsert translation failed:", err);

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}