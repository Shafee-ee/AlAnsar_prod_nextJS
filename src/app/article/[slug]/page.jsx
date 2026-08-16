import ArticleView from "@/components/ArticleView";
import RelatedArticles from "@/components/RelatedArticles";
import ArticleAd from "@/components/ads/ArticleAd";

export default async function ArticlePage({ params, searchParams }) {
  const { slug } = await params;
  const { lang = "kn" } = await searchParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/articles/by-slug?slug=${slug}&lang=${lang}`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) {
    return <div>Article not found</div>;
  }

  const article = await res.json();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* ARTICLE */}
          <div className="lg:col-span-8">
            <ArticleView article={article} />
          </div>
          {/* SIDEBAR */}
          <div className="space-y-6 self-start lg:col-span-4 lg:sticky lg:top-8">
            {/* AD 1 */}
            <ArticleAd />

            {/* RELATED (placeholder for now) */}
            <div className="rounded-2xl bg-white shadow-lg border border-slate-200 p-2">
              <RelatedArticles
                category={article.category}
                currentSlug={article.slug}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
