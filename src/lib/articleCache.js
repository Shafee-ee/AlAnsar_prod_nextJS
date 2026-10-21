import { adminDB } from "@/lib/firebaseAdmin";

const CACHE_TTL = 10 * 60 * 1000; //10 minutes
const articleCache = new Map();

export async function getCachedArticles(lang = "kn") {
  const cached = articleCache.get(lang);
  const now = Date.now();

  if (cached && now < cached.expiresAt) {
    console.log(`Article cache HIT:${lang}`);
    return cached.articles;
  }

  console.log(`Article Cache MISS:${lang}`);

  const snapshot = await adminDB
    .collection("articles")
    .orderBy("createdAt", "desc")
    .get();

  const articles = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const articleData = doc.data();

      const translationSnap = await adminDB
        .collection("articles")
        .doc(doc.id)
        .collection("translations")
        .doc(lang)
        .get();

      return {
        id: doc.id,
        ...articleData,
        title: translationSnap.exists
          ? translationSnap.data().title
          : articleData.slug,
      };
    }),
  );

  articleCache.set(lang, {
    articles,
    expiresAt: now + CACHE_TTL,
  });
  return articles;
}

export function invalidateArticleCache() {
  articleCache.clear();
}
