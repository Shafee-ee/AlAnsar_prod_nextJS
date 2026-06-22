"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function LatestArticles() {
  const [articles, setArticles] = useState([]);
  const scrollref = useRef(null);
  const { lang } = useLanguage();
  const router = useRouter();

  async function loadArticles() {
    const res = await fetch(`/api/articles?lang=${lang}`);
    const data = await res.json();

    const latest = data.articles
      .filter((article) => article.status === "published")
      .slice(0, 12);

    setArticles(latest);
  }
  useEffect(() => {
    loadArticles();
  }, [lang]);

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>

      <div ref={scrollref} className="flex overflow-x-auto gap-6  pb-5">
        {articles.map((article) => (
          <div
            key={article.id}
            onClick={() => router.push(`/article/${article.slug}`)}
            className="relative  bg-white rounded-2xl overflow-hidden  cursor-pointer shadow-lg w-80 flex-shrink-0"
          >
            <img
              src={article.coverImage}
              alt={article.slug}
              className="w-full h-52 object-cover"
            />

            <button className="absolute right-4 top-[calc(13rem-20px)] w-10 h-10 rounded-full border border-white bg-[#1d3f9a] text-white shadow-lg">
              →
            </button>

            <div className="p-5">
              <p className="text-sm text-gray-900 mb-2 bg-green-100 px-3 py-1 inline-block rounded-full">
                {article.category}
              </p>
              <h3 className="font-semibold text-lg leading-snug">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
