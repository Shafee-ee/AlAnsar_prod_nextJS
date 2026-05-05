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
            <th className="p-3">Created</th>
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
                <td className="p-3">{a.status || "draft"}</td>

                <td className="p-3">
                  {a.createdAt?.seconds
                    ? new Date(a.createdAt.seconds * 1000).toLocaleDateString()
                    : a.createdAt?.toDate
                      ? a.createdAt.toDate().toLocaleDateString()
                      : "-"}
                </td>

                <td className="p-3 flex gap-2">
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
