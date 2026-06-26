"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function AtticlesPage() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { lang } = useLanguage();
  const router = useRouter();

  const categories = [
    "All",
    "Hadith",
    "Fiqh",
    "Islamic History",
    "Smaniyaru",
    "Vishleshanagalu",
    "Vismaya Jagattu",
    "Quranic vyakhanagalu",
  ];

  async function loadArticles() {
    const res = await fetch(`/api/articles?lang=${lang}`);
    const data = await res.json();

    const published = data.articles.filter(
      (article) => article.status === "published",
    );

    setArticles(published);
  }

  useEffect(() => {
    loadArticles();
  }, [lang]);

  console.log(articles.title);

  const filteredArticles = articles
    .filter((article) => {
      const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;

      const matchesSearch = article.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (!searchTerm.trim()) return 0;
      const search = searchTerm.toLowerCase();

      const aStarts = a.title?.toLowerCase().startsWith(search);

      const bStarts = b.title?.toLowerCase().startsWith(search);

      return Number(bStarts) - Number(aStarts);
    });

  return (
    <section className="max-w-7xl mx-auto px-6  py-8">
      <h1 className="text-4xl font-bold mb-8">Articles</h1>

      <input
        type="text"
        placeholder="Search Articles"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border rounded-lg
        mb-4"
      />

      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-1 rounded-full inline-block mb-2 cursor-pointer ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-gray-900"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => router.push(`/article/${article.slug}?lang=${lang}`)}
            className="bg-white rounded-2xl  transition hover:-translate-y-1  hover:shadow-xl overflow-hidden shadow-lg  cursor-pointer "
          >
            <img
              src={article.coverImage}
              alt={article.slug}
              className="w-full h-60 object-cover "
            />

            <div className="p-5">
              <p className="text-sm text-gray-900 text-gray-900 mb-2  bg-green-100 inline-block p-1 rounded-full ">
                {article.category}
              </p>
              <h3 className="font-semibold text-lg text-gray-900 leading-snug">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
