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
      <h3 className="mb-5 text-lg font-bold text-slate-900">
        Related Articles
      </h3>
      {articles.map((article) => (
        <div
          key={article.id}
          onClick={() => router.push(`/article/${article.slug}?lang=${lang}`)}
          className="group mb-4 flex cursor-pointer gap-4 rounded-xl p-2 transition hover:bg-slate-50"
        >
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
          />

          <div className="flex flex-col justify-center">
            <h4 className="line-clamp-2 text-sm font-semibold leading-6 text-slate-900 transition group-hover:text-blue-600">
              {article.title}
            </h4>

            <span className="mt-2 text-xs text-slate-500">
              {article.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
