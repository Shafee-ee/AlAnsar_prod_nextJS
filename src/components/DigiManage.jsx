"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import toast from "react-hot-toast";

const TYPE_LABELS = {
  weekly: "Weekly",
  monthly: "Moilanjee",
  special: "Special",
};

export default function DigiManage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const fetchIssues = async () => {
    try {
      const q = query(
        collection(db, "digipaper_issues"),
        orderBy("createdAt", "desc"),
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setIssues(data);
    } catch (err) {
      toast.error("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this issue?",
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "digipaper_issues", id));
      toast.success("Issue deleted");
      fetchIssues();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "digipaper_issues", id), {
        status: currentStatus === "published" ? "draft" : "published",
      });

      toast.success(
        currentStatus === "published" ? "Issue unpublished" : "Issue published",
      );

      fetchIssues();
    } catch {
      toast.error("Status update failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  if (issues.length === 0)
    return <div className="text-gray-500">No issues found.</div>;

  const filteredIssues = issues.filter((issue) => {
    const matchesType = filterType === "all" || issue.type === filterType;

    const matchesSearch = issue.title
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 mb-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* Type filter */}
        <div className="flex gap-2">
          {["all", "weekly", "monthly", "special"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded ${
                filterType === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {filteredIssues.map((issue) => (
        <div
          key={issue.id}
          className="border rounded-lg p-4 flex justify-between items-center shadow-sm"
        >
          <div>
            <div className="font-semibold text-lg">{issue.title}</div>

            <div className="text-sm text-gray-500">
              {issue.slug} •{" "}
              {issue.publishDate
                ? new Date(
                    issue.publishDate.seconds * 1000,
                  ).toLocaleDateString()
                : "No date"}
            </div>

            <div className="text-xs text-gray-400 mt-1">
              Type: {TYPE_LABELS[issue.type] || "Weekly"}{" "}
            </div>

            <div className="mt-2">
              {issue.status === "published" ? (
                <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                  Published
                </span>
              ) : (
                <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                  Draft
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => toggleStatus(issue.id, issue.status)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              {issue.status === "published" ? "Unpublish" : "Publish"}
            </button>

            <button
              onClick={() => handleDelete(issue.id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
