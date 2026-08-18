"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturedArticles() {
  const [articles, setArticles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const router = useRouter();
  const { lang } = useLanguage();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/articles?lang=${lang}`);
      const data = await res.json();

      const featured = (data.articles || [])
        .filter(
          (article) =>
            article.status === "published" && article.isFeatured === true,
        )
        .slice(0, 5);

      setArticles(featured);
      setActiveIndex(0);
    }

    load();
  }, [lang]);

  if (!articles.length) {
    return null;
  }

  const activeArticle = articles[activeIndex];

  return (
    <section className="mt-8 px-1">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Featured Articles
      </h2>

      <div className="relative">
        {/* Folder tabs */}
        <div className="flex justify-end items-end pr-1 -mb-px relative z-20">
          {articles.map((article, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={article.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`
    relative
    w-10
    h-8
    text-xs
    font-medium
    border
    border-gray-300
    -ml-px
    transition-all
    duration-150
    ${
      isActive
        ? "bg-blue-600 text-white z-30 -translate-y-1"
        : "bg-gray-100 text-gray-700 z-10 hover:bg-gray-200"
    }
  `}
                style={{
                  clipPath: "polygon(0 0, 82% 0, 100% 28%, 100% 100%, 0 100%)",
                }}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Main card */}
        <div
          onClick={() =>
            router.push(`/article/${activeArticle.slug}?lang=${lang}`)
          }
          className="
      relative
      z-10
      bg-white
      shadow-md
      overflow-hidden
      cursor-pointer
      border
      border-gray-300
    "
        >
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] min-h-[240px]">
            {/* Image */}
            <div className="h-56 md:h-[280px] bg-gray-200 overflow-hidden">
              {activeArticle.coverImage && (
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col justify-center">
              <div className="text-xs text-gray-900 inline-block bg-green-100 px-3 py-1 rounded-full mb-3 w-fit">
                {activeArticle.category}
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {activeArticle.title}
              </h3>

              <p className="mt-4 text-sm text-gray-500">
                Read featured article →
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
