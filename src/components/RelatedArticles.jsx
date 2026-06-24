"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RelatedArticles({ category, currentSlug }) {
  const [articles, setArticles] = useState([]);
  const { lang } = useLanguage();
  const router = useRouter();

  async function loadRelatedArticles() {
    const res = await fetch(`/api/articles?lang=${lang}`);
    const data = await res.json();

    const related = data.articles
      .filter(
        (article) =>
          article.category === category &&
          article.slug !== currentSlug &&
          article.status === "published",
      )
      .slice(0, 3);

    setArticles(related);
  }

  useEffect(() => {
    loadRelatedArticles();
  }, [category, currentSlug, lang]);

  return (
    <div>
      <h3 className="font-semibold mb-4">Related Articles</h3>

      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => router.push(`/article/${article.slug}?lang=${lang}`)}
          className="flex gap-3 mb-4  py-3 cursor-pointer border-b border-blue-200"
        >
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div>
            <h4 className="font-medium text-sm leading-snug">
              {article.title}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
