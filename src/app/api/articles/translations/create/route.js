import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

    const article = articleSnap.data();

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
    console.log("TRANSLATION RESPONSE:", translated);

    if (!translated?.title || !translated?.content) {
      throw new Error("Invalid translation response");
    }

    //create slug automatically
    let slug = article.slug;

    if (!slug) {
      const englishTitle =
        normalizedLanguage === "en" ? title : translated.title;

      const baseSlug = slugify(englishTitle);

      slug = baseSlug;
      let counter = 2;

      while (true) {
        const existing = await adminDB
          .collection("articles")
          .where("slug", "==", slug)
          .limit(1)
          .get();

        if (existing.empty || existing.docs[0].id === articleId) {
          break;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
      }
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

    const articleUpdate = {
      slug,
      updatedAt: new Date(),
    };

    if (image !== undefined) {
      articleUpdate.coverImage = image || null;
    }

    await articleRef.update(articleUpdate);

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
