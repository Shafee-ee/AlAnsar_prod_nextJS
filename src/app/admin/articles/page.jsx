"use client";

import CreateArticlePage from "./new/page";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ArticlesPage() {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Articles</h1>

      {/* Tabs like QnA */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("create")}
          className={`pb-2 border-b-2 ${
            activeTab === "create"
              ? "border-blue-600 font-medium"
              : "border-transparent text-gray-500"
          }`}
        >
          Create Article
        </button>

        <button
          onClick={() => setActiveTab("manage")}
          className={`pb-2 border-b-2 ${
            activeTab === "manage"
              ? "border-blue-600 font-medium"
              : "border-transparent text-gray-500"
          }`}
        >
          Manage Articles
        </button>
      </div>

      {/* Content goes here */}
      <div>{activeTab === "create" && <CreateArticlePage />}</div>

      {activeTab === "manage" && <ManageArticles />}
    </div>
  );
}

function ManageArticles() {
  const [articles, setArticles] = useState([]);
  const router = useRouter();

  async function handleDelete(articleId) {
    const confirmed = confirm("Are you sure you want to delete this article?");

    if (!confirmed) return;

    const res = await fetch("/api/articles/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articleId,
      }),
    });

    if (!res.ok) {
      alert("Failed to delete article");
      return;
    }

    setArticles((prev) => prev.filter((article) => article.id !== articleId));
  }

  async function handleFeaturedToggle(articleId, isFeatured) {
    const res = await fetch("/api/articles/update-featured", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articleId,
        isFeatured: !isFeatured,
      }),
    });

    if (!res.ok) {
      alert("Failed to update featured status");
      return;
    }

    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId
          ? {
              ...article,
              isFeatured: !isFeatured,
            }
          : article,
      ),
    );
  }

  async function handleStatusChange(articleId, status) {
    const res = await fetch("/api/articles/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articleId,
        status,
      }),
    });

    if (!res.ok) {
      alert("Failed to update status");
      return;
    }

    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, status } : article,
      ),
    );
  }

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/articles");
      const data = await res.json();

      console.log("ARTICLES:", data); // critical
      setArticles(data.articles || []);
    }

    load();
  }, []);
  return (
    <div className="mt-4 bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Slug</th>
            <th className="p-3">Category</th>
            <th className="p-3">Status</th>
            <th className="p-3">Featured</th>
            <th className="p-3">Created</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {articles.map((a) => {
            console.log("createdAt:", a.createdAt); // 👈 here

            return (
              <tr
                key={a.id}
                onClick={() => router.push(`/admin/articles/${a.id}`)}
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3 font-medium">{a.slug}</td>
                <td className="p-3">{a.category || "-"}</td>
                <td className="p-3">
                  <span
                    className={
                      a.status === "published"
                        ? "text-green-600 font-medium"
                        : "text-orange-600 font-medium"
                    }
                  >
                    {a.status || "draft"}
                  </span>
                </td>
                <td className="p-3">{a.isFeatured ? "⭐ Yes" : "—"}</td>
                <td className="p-3">
                  {a.createdAt?._seconds
                    ? new Date(a.createdAt._seconds * 1000).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      handleStatusChange(
                        a.id,
                        a.status === "published" ? "draft" : "published",
                      );
                    }}
                    className="text-blue-600"
                  >
                    {a.status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeaturedToggle(a.id, a.isFeatured);
                    }}
                    className="text-amber-600"
                  >
                    {a.isFeatured ? "Unfeature" : "Feature"}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
