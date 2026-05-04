import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();

    const { articleId, language, title, content, author, image } = body;

    if (!articleId || !language || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const normalizedLanguage = language.trim().toLowerCase();

    const supportedLangs = ["en", "kn"];

    if (!supportedLangs.includes(normalizedLanguage)) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 },
      );
    }

    const targetLang = supportedLangs.find(
      (lang) => lang !== normalizedLanguage,
    );

    // verify parent article exists
    const articleRef = adminDB.collection("articles").doc(articleId);
    const articleSnap = await articleRef.get();

    if (!articleSnap.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // TRANSLATE FIRST
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
      },
    );

    if (!translateRes.ok) {
      throw new Error("Translation API failed");
    }

    const translated = await translateRes.json();

    if (!translated?.title || !translated?.content) {
      throw new Error("Invalid translation response");
    }

    // helper
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
        { merge: true },
      );
    }

    // SAVE BOTH (atomic mindset)
    await upsert(normalizedLanguage, {
      title,
      content,
      author: author || "unknown",
    });

    await upsert(targetLang, {
      title: translated.title,
      content: translated.content,
      author: author || "unknown",
    });

    if (image !== undefined) {
      await adminDB
        .collection("articles")
        .doc(articleId)
        .update({
          coverImage: image || null,
          updatedAt: new Date(),
        });
    }

    return NextResponse.json({
      articleId,
      language: normalizedLanguage,
      success: true,
    });
  } catch (err) {
    console.error("Create/Upsert translation failed:", err);

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
