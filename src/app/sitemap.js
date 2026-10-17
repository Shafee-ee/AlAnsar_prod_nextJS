import { adminDB } from "@/lib/firebaseAdmin";

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
  const qnaSnapshot = await adminDB.collection("qna_items").get();

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
  const articleSnapshot = await adminDB
    .collection("articles")
    .where("status", "==", "published")
    .get();

  for (const doc of articleSnapshot.docs) {
    const article = doc.data();
    if (!article.slug) continue;

    const translationsSnapshot = await doc.ref.collection("translations").get();

    for (const translationDoc of translationsSnapshot.docs) {
      const translation = translationDoc.data();
      const lang = translationDoc.id;

      //match the existing article route's availability behaviour

      if (!translation.title || !translation.content) continue;

      urls.push({
        url: `${SITE_URL}/article/${article.slug}?lang=${lang}`,
        lastModified: safeDate(article.updatedAt, now),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  //published Digipaper issues

  const issuesSnapshot = await adminDB
    .collection("digipaper_issues")
    .where("status", "==", "published")
    .get();

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
