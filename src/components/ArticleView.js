"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Save } from "lucide-react";

const ArticleView = ({ article }) => {
  const router = useRouter();
  const [lang, setLang] = useState("en"); // keeping it
  const [isSaved, setIsSaved] = useState(false);

  const handleNavigate = (path) => {
    if (path === "home") {
      router.push("/");
    }
  };

  const handleSaveArticle = () => {
    setIsSaved((prev) => !prev);
  };

  const handlePrint = () => window.print();

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!article) {
    return <div className="p-6 text-center">Article not found</div>;
  }

  const [shareUrl, setShareUrl] = useState("");

  React.useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  return (
    <article className="max-w-3xl mx-auto px-4 md:px-0 py-8">
      {/* Back */}
      <nav className="mb-6">
        <button
          onClick={() => handleNavigate("home")}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </button>
      </nav>

      {/* Image */}
      {article.image && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-6">
        <div className="mb-3">
          <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full uppercase tracking-wide font-semibold">
            {article.category?.replace("-", " ")}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center text-gray-600 gap-3 text-sm">
          <span className="font-medium">{article.author}</span>
          <span>•</span>
          <time>{formatDate(article.createdAt || new Date())}</time>
        </div>
      </header>

      {/* Content */}
      <div className="text-[18px] leading-9 text-gray-800 space-y-6">
        {article.content.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Actions */}

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        Published on {formatDate(article.createdAt || new Date())} By{" "}
        {article.author}
      </footer>
    </article>
  );
};

export default ArticleView;
