"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, share2 } from "lucide-react";

const ArticleView = ({ article }) => {
  const router = useRouter();

  const handleNavigate = (path) => {
    if (path === "home") {
      router.push("/");
    }
  };

  const handlePrint = () => window.print();

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard");
      }
    } catch (err) {
      console.error(err);
    }
  }

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
    <article className="max-w-3xl mx-auto px-4 md:px-0 py-8 bg-white rounded-xl">
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
      <div className="flex gap-3 mt-8">
        <button onClick={handleShare} className="px-4 py-2 border rounded">
          Share
        </button>

        <button onClick={handlePrint} className="px-4 py-2 border rounded">
          Print
        </button>
      </div>
      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
        Published on {formatDate(article.createdAt || new Date())} By{" "}
        {article.author}
      </footer>
    </article>
  );
};

export default ArticleView;
