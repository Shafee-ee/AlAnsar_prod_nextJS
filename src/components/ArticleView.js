"use client";
import {
  ArrowLeft,
  Share2,
  CalendarDays,
  User,
  Clock,
  Heart,
  Eye,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const ArticleView = ({ article }) => {
  console.log("ARTICLE PROP:", article);
  const router = useRouter();
  const [likes, setLikes] = useState(article.likes || 0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [views, setViews] = useState(article.views || 0);

  useEffect(() => {
    if (!article?.id) return;

    const likedKey = `alansar_article_liked_${article.id}`;

    if (localStorage.getItem(likedKey) === "true") {
      setLiked(true);
    }
  }, [article?.id]);

  useEffect(() => {
    if (!article?.id) return;

    const viewKey = `alansar_article_viewed_${article.id}`;

    if (sessionStorage.getItem(viewKey)) return;

    const recordView = async () => {
      try {
        const res = await fetch("/api/articles/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleId: article.id,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to record view");
        }

        sessionStorage.setItem(viewKey, "true");
        setViews((prev) => prev + 1);
      } catch (error) {
        console.error("View error:", error);
      }
    };

    recordView();
  }, [article?.id]);

  const handleLike = async () => {
    if (liking || !article?.id) return;

    try {
      setLiking(true);

      let likeId = localStorage.getItem("alansar_like_id");

      if (!likeId) {
        likeId = crypto.randomUUID();
        localStorage.setItem("alansar_like_id", likeId);
      }

      const method = liked ? "DELETE" : "POST";

      const res = await fetch("/api/articles/like", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId: article.id,
          likeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update like");
      }

      if (liked) {
        localStorage.removeItem(`alansar_article_liked_${article.id}`);
        setLiked(false);
        setLikes((prev) => Math.max(0, prev - 1));
      } else {
        localStorage.setItem(`alansar_article_liked_${article.id}`, "true");
        setLiked(true);

        if (!data.alreadyLiked) {
          setLikes((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Like error:", error);
    } finally {
      setLiking(false);
    }
  };

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

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold leading-tight tracking-tight text-slate-900">
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
      <div
        className="mx-auto mt-10 max-w-2xl space-y-7 text-[18px] leading-9 text-slate-800 select-none"
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {article.content.split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-2xl items-center gap-3">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`px-4 py-2 border rounded flex items-center gap-2 active:scale-95 transition-transform ${
            liked
              ? "border-red-300 bg-red-50 text-red-600"
              : "text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
          <span>{likes}</span>
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 border text-gray-900 rounded flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <Eye className="h-4 w-4" />
          <span>{views}</span>
        </div>
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
