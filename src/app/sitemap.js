import { adminDB } from "@/lib/firebaseAdmin";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.alansarweekly.com";
function safeDate(value, fallback) {
  if (!value) return fallback;

  const date =
    typeof value.toDate === "function" ? value.toDate() : new Date(value);

  return Number.isNaN(date.getTime()) ? fallback : date;
}

export default async function sitemap() {
  const now = new Date();

  const urls = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  //public QNA pages
  console.log("[sitemap] Q&A query started", Date.now());
  const qnaSnapshot = await adminDB.collection("qna_items").get();
  console.log(
    "[sitemap] Q&A query finished",
    Date.now(),
    "documents:",
    qnaSnapshot.size,
  );

  for (const doc of qnaSnapshot.docs) {
    const data = doc.data();

    if (
      (data.question_kn || data.question_en) &&
      (data.answer_kn || data.answer_en)
    ) {
      urls.push({
        url: `${SITE_URL}/qna/${doc.id}`,
        lastModified: safeDate(data.updatedAt || data.createdAt, now),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  //published articles
  console.time("sitemap:article query");
  const articleSnapshot = await adminDB
    .collection("articles")
    .where("status", "==", "published")
    .get();
  console.timeEnd("sitemap:article query");

  console.log(
    "[sitemap] article loop started",
    Date.now(),
    "documents:",
    articleSnapshot.size,
  );

  for (const doc of articleSnapshot.docs) {
    const article = doc.data();
    if (!article.slug) continue;

    const translationDoc = await doc.ref
      .collection("translations")
      .doc("en")
      .get();
    if (translationDoc.exists) {
      const translation = translationDoc.data();

      if (translation.title && translation.content) {
        urls.push({
          url: `${SITE_URL}/article/${article.slug}?lang=en`,
          lastModified: safeDate(article.updatedAt, now),
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    }
  }

  console.log("[sitemap] article loop finished", Date.now());

  //published Digipaper issues

  console.time("sitemap: digipaper query");
  const issuesSnapshot = await adminDB
    .collection("digipaper_issues")
    .where("status", "==", "published")
    .get();
  console.timeEnd("sitemap: digipaper query");
  for (const doc of issuesSnapshot.docs) {
    urls.push({
      url: `${SITE_URL}/digipaper/${encodeURIComponent(doc.id)}`,
      lastModified: safeDate(doc.data().updatedAt, now),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return urls;
}
