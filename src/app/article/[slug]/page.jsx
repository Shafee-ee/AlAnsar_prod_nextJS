import ArticleView from "@/components/ArticleView";

export default async function ArticlePage({ params, searchParams }) {
  const { slug } = await params;
  const { lang = "kn" } = await searchParams;

  const res = await fetch(
    `http://localhost:3000/api/articles/by-slug?slug=${slug}&lang=${lang}`,
    { next: { revalidate: 60 } },
  );

  if (!res.ok) {
    return <div>Article not found</div>;
  }

  const article = await res.json();

  return <ArticleView article={article} />;
}
