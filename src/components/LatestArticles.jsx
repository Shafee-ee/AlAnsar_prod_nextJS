"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "@/context/LanguageContext";

export default function LatestArticles() {
  const [articles, setArticles] = useState([]);
  const scrollref = useRef(null);
  const { lang } = useLanguage();

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
    <section>
      <h2>Latest Articles</h2>

      {articles.map((article) => (
        <div
          key={article.id}
          className="relative  bg-white rounded-2xl overflow-hidden shadow-lg w-80"
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
    </section>
  );
}
