"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function featuredArticles() {
  const [articles, setArticles] = useState([]);
  const router = useRouter();
  const { lang } = useLanguage();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/articles?lang=${lang}`);
      const data = await res.json();

      const featured = (data.articles || [])
        .filter((a) => a.status === "published" && a.isFeatured === true)
        .slice(0, 3);

      setArticles(featured);
    }

    load();
  }, [lang]);

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            onClick={() => router.push(`/article/${article.slug}`)}
            className="bg-white rounded-xl shadow overflow-hidden cursor-pointer"
          >
            <div className="h-48 bg-gray-200">
              {article.coverImage && (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-2">
                {article.category}
              </div>

              <h3 className="font-semibold">{article.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
