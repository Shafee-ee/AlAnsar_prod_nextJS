"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ArticlePage() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/articles/by-slug?slug=${slug}`);
      const data = await res.json();

      setArticle(data);

      // fetch related
      const relRes = await fetch(
        `/api/articles/related?category=${data.category}&exclude=${data.id}`,
      );
      const relData = await relRes.json();

      setRelated(relData.articles || []);
      setLoading(false);
    }

    if (slug) load();
  }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!article) return <div className="p-6">Not found</div>;

  const t = article.translations?.[lang] || article.translations?.["kn"];

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-8">
      {/* HERO */}
      {article.coverImage && (
        <img
          src={article.coverImage}
          className="w-full h-72 object-cover rounded"
        />
      )}

      {/* HEADER */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500 uppercase">{article.category}</p>

        <h1 className="text-3xl font-bold">{t.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>By {t.author || "Unknown"}</span>

          {/* LANG SWITCH */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setLang("kn")}
              className={`px-2 py-1 border ${
                lang === "kn" ? "bg-black text-white" : ""
              }`}
            >
              KN
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 border ${
                lang === "en" ? "bg-black text-white" : ""
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* ARTICLE */}
        <div className="md:col-span-2 max-w-3xl space-y-4">
          {t.content.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* ADS */}
          <div className="border p-4 rounded">
            <h3 className="font-semibold mb-2">Sponsored</h3>
            <p className="text-sm">Local Business Ad Space</p>
          </div>

          <div className="border p-4 rounded">
            <p className="text-sm">
              Promote your business here. Contact: 1234567890
            </p>
          </div>

          {/* RELATED */}
          <div className="border p-4 rounded space-y-3">
            <h3 className="font-semibold">Related Articles</h3>

            {related.map((r) => (
              <a
                key={r.id}
                href={`/article/${r.slug}`}
                className="block text-sm hover:underline"
              >
                {r.translations?.[lang]?.title || r.translations?.["kn"]?.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* NEXT / PREV */}
      <div className="flex justify-between border-t pt-6">
        <button className="text-sm text-gray-600 hover:underline">
          ← Previous
        </button>

        <button className="text-sm text-gray-600 hover:underline">
          Next →
        </button>
      </div>
    </div>
  );
}
