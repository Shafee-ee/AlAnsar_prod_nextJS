import ArticleView from "@/components/ArticleView";

export default async function ArticlePage({ params, searchParams }) {
  const { slug } = params;
  const { lang = "kn" } = searchParams;

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

          {/* AD 2 */}
          <div className="border h-40  bg-red-50 p-4 rounded">
            <p className="text-sm">Contact: 1234567890</p>
          </div>

          {/* RELATED (placeholder for now) */}
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Related Articles</h3>
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
