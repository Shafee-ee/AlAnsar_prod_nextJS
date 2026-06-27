import ArticleView from "@/components/ArticleView";
import RelatedArticles from "@/components/RelatedArticles";

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
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* ARTICLE */}
          <div className="lg:col-span-8">
            <ArticleView article={article} />
          </div>
          {/* SIDEBAR */}
          <div className="space-y-6 self-start lg:col-span-4 lg:sticky lg:top-8">
            {/* AD 1 */}
            <div className="overflow-hidden rounded-2xl lg:mt-10 border border-slate-200 bg-white shadow-sm">
              <div className="px-4 pt-4">
                <p className="text-xs font-semibold uppercase  mb-2 tracking-widest text-slate-400">
                  Sponsored
                </p>
              </div>

              <a
                href="#"
                className="block transition-transform duration-300 hover:scale-[1.02]"
              >
                <img
                  src="/ad.png"
                  alt="Sponsored Advertisement"
                  className="w-full object-cover"
                />
              </a>
            </div>
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
