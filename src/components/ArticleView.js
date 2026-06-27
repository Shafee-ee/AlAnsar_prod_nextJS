"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, CalendarDays, User, Clock } from "lucide-react";
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

  const wordCount = article.content.trim().split(/\s+/).filter(Boolean).length;

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  React.useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  return (
    <article className="w-full py-8">
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
          <span className="inline-block bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full uppercase tracking-wide font-semibold">
            {article.category?.replace("-", " ")}
          </span>
        </div>

        <h1 className="text-5xl font-serif font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
          {article.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{article.author}</span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <time>{formatDate(article.createdAt || new Date())}</time>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </header>
      {/* Content */}
      <div className="mx-auto mt-10 max-w-2xl space-y-7 text-[18px] leading-9 text-slate-800">
        {article.content.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-2xl gap-3">
        <button
          onClick={handleShare}
          className="px-4 py-2 border text-gray-900 rounded flex"
        >
          <Share2 className="h-3 w-3 mt-[6px] mr-2" />
          <span>Share</span>
        </button>
      </div>
      {/* Footer */}
      <footer className="mx-auto mt-10 max-w-2xl border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        Published on {formatDate(article.createdAt || new Date())} By{" "}
        {article.author}
      </footer>
    </article>
  );
};

export default ArticleView;
