"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

export default function AtticlesPage() {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ARTICLES_PER_PAGE = 20;
  const { lang } = useLanguage();
  const router = useRouter();

  const categories = [
    { value: "All", label: lang === "kn" ? "ಬರಹಗಳು" : "All" },

    { value: "Hadith", label: lang === "kn" ? "ಹದೀಸ್ ದರ್ಪಣ" : "Hadith" },

    { value: "Fiqh", label: lang === "kn" ? "ಕರ್ಮ ಶಾಸ್ತ್ರಿ" : "Fiqh" },

    {
      value: "Islamic History",
      label: lang === "kn" ? "ಇತಿಹಾಸ" : "Islamic History",
    },

    {
      value: "Smariniyaru",
      label: lang === "kn" ? "ಸರಣಿ" : "Eminent Personalities",
    },

    {
      value: "Vishleshanagalu",
      label: lang === "kn" ? "ವಿಶ್ವಕೋಶ" : "Analysis",
    },

    {
      value: "Vismaya Jagattu",
      label: lang === "kn" ? "ವಿಸ್ಮಯ" : "Wonders of the World",
    },

    {
      value: "Quranic vyakhanagalu",
      label: lang === "kn" ? "ಖುರ್ಆನ್ ವ್ಯಾಖ್ಯಾನ" : "Quran Translation",
    },
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
    setCurrentPage(1);
    loadArticles();
  }, [lang]);

  const categoryCounts = articles.reduce((counts, article) => {
    counts[article.category] = (counts[article.category] || 0) + 1;
    return counts;
  }, {});

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;

    const matchesSearch = article.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  let displayedArticles = filteredArticles;

  // Mix categories together when "All" is selected.
  // Each category keeps its newest articles first.
  if (selectedCategory === "All" && !searchTerm.trim()) {
    const categoryGroups = categories
      .filter((category) => category.value !== "All")
      .map((category) =>
        articles
          .filter((article) => article.category === category.value)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
      );

    const mixed = [];
    const maxLength = Math.max(
      0,
      ...categoryGroups.map((group) => group.length),
    );

    for (let i = 0; i < maxLength; i++) {
      for (const group of categoryGroups) {
        if (group[i]) {
          mixed.push(group[i]);
        }
      }
    }

    displayedArticles = mixed;
  } else if (searchTerm.trim()) {
    const search = searchTerm.toLowerCase();

    displayedArticles = filteredArticles.sort((a, b) => {
      const aStarts = a.title?.toLowerCase().startsWith(search);
      const bStarts = b.title?.toLowerCase().startsWith(search);

      return Number(bStarts) - Number(aStarts);
    });
  }

  const totalPages = Math.ceil(displayedArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;

  const paginatedArticles = displayedArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE,
  );

  return (
    <section className="max-w-7xl mx-auto px-6  py-8">
      <h1 className="text-4xl font-bold mb-8">Articles</h1>

      <input
        type="text"
        placeholder="Search Articles"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full p-3 border rounded-lg
        mb-4"
      />
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((category) => {
          const count =
            category.value === "All"
              ? articles.length
              : categoryCounts[category.value] || 0;

          const isActive = selectedCategory === category.value;

          return (
            <button
              key={category.value}
              type="button"
              onClick={() => {
                setSelectedCategory(category.value);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
          transition-all duration-200 active:scale-95
          ${
            isActive
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-blue-50 text-gray-800 hover:bg-blue-100"
          }`}
            >
              <span>{category.label}</span>

              <span
                className={`min-w-6 h-5 px-1.5 inline-flex items-center justify-center
            rounded-full text-xs font-semibold
            ${isActive ? "bg-white/20 text-white" : "bg-white text-gray-600"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => router.push(`/article/${article.slug}?lang=${lang}`)}
            className="bg-white rounded-2xl transition hover:-translate-y-1 hover:shadow-xl overflow-hidden shadow-lg cursor-pointer active:scale-[0.98]"
          >
            <img
              src={article.coverImage}
              alt={article.slug}
              className="w-full h-60 object-cover "
            />

            <div className="p-5">
              <p className="text-sm text-gray-900 mb-2  bg-green-100 inline-block p-1 rounded-full ">
                {article.category}
              </p>
              <h3 className="font-semibold text-lg text-gray-900 leading-snug">
                {article.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium
        text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
        hover:bg-gray-200"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-medium
        text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed
        hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
