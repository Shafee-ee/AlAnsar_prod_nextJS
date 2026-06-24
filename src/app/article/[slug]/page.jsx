import ArticleView from "@/components/ArticleView";
import RelatedArticles from "@/components/RelatedArticles";

export default async function ArticlePage({ params, searchParams }) {
  const { slug } = await params;
  const { lang = "kn" } = await searchParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/articles/by-slug?slug=${slug}&lang=${lang}`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) {
    return <div>Article not found</div>;
  }

  const article = await res.json();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* ARTICLE */}
        <div className="md:col-span-2">
          <ArticleView article={article} />
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* AD 1 */}
          <div className="border p-4 h-180 bg-red-50 mt-18 rounded">
            <h3 className="font-semibold mb-2">Sponsored</h3>
            <p className="text-sm">Promote your business here.</p>
          </div>

          {/* RELATED (placeholder for now) */}
          <div className="border-2 border-blue-200 p-4 rounded-lg">
            <RelatedArticles
              category={article.category}
              currentSlug={article.slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
