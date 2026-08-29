"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QnaSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [expandedId, setExpandedId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetchSubmissions(activeStatus);
  }, [activeStatus]);

  const fetchSubmissions = async (status) => {
    try {
      const res = await fetch(`/api/qna/submissions-list?status=${status}`);

      const data = await res.json();

      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (id) => {
    if (!confirm("Delete this submission?")) return;

    try {
      await fetch("/api/qna/delete-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setSubmissions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/qna/update-submission-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = (item) => {
    const encodedQuestion = encodeURIComponent(
      item.translated_question_en || item.question_original,
    );

    const encodedAnswer = encodeURIComponent(item.ustaad_answer || "");

    router.push(
      `/admin/qna?fromSubmission=true&submissionId=${item.id}&question=${encodedQuestion}&answer=${encodedAnswer}`,
    );
  };

  const getStatusLabel = (status) => {
    if (status === "pending") return "PENDING";
    if (status === "approved") return "ANSWER PENDING";
    if (status === "answered_received") return "ANSWERED";
    if (status === "rejected") return "REJECTED";

    return status?.toUpperCase() || "-";
  };

  const getStatusClasses = (status) => {
    if (status === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "approved") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "answered_received") {
      return "bg-green-100 text-green-700";
    }

    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Manage Submissions</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {["pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {status === "pending"
              ? "PENDING"
              : status === "approved"
                ? "APPROVED"
                : "REJECTED"}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div className="border border-gray-300">
        <div className="grid grid-cols-4 bg-gray-200 px-4 py-3 text-sm font-semibold">
          <div>Question (EN)</div>
          <div>Submitted on</div>
          <div>Status</div>
          <div className="text-center">Actions</div>
        </div>

        {submissions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No submissions found.
          </div>
        ) : (
          submissions.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 items-center px-4 py-3 border-t text-sm"
            >
              {/* Question + Answer */}
              <div
                onClick={() =>
                  setExpandedId((prev) => (prev === item.id ? null : item.id))
                }
                className={`pr-4 cursor-pointer ${
                  expandedId === item.id ? "" : "truncate"
                }`}
              >
                <div>{item.question_original}</div>

                {activeStatus === "approved" &&
                  item.status === "answered_received" && (
                    <div className="mt-2 text-gray-600">
                      <span className="font-medium">Answer:</span>{" "}
                      {item.ustaad_answer || "-"}
                    </div>
                  )}
              </div>

              {/* Submitted Date */}
              <div>
                {item.createdAt?._seconds
                  ? new Date(
                      item.createdAt._seconds * 1000,
                    ).toLocaleDateString()
                  : "-"}
              </div>

              {/* Status */}
              <div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(
                    item.status,
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-center">
                {item.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(item.id, "approved")}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, "rejected")}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                    >
                      Reject
                    </button>
                  </>
                )}

                {activeStatus === "approved" &&
                  item.status === "answered_received" &&
                  !item.promoted_qna_id && (
                    <button
                      onClick={() => handlePromote(item)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                    >
                      Promote
                    </button>
                  )}

                <button
                  onClick={() => deleteSubmission(item.id)}
                  className="text-red-600 hover:text-red-800 text-lg"
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Promoted Questions */}
      {activeStatus === "approved" && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Promoted Questions</h2>

          <div className="border border-gray-300">
            <div className="grid grid-cols-2 bg-gray-200 px-4 py-3 text-sm font-semibold">
              <div>Question (EN)</div>
              <div>Promoted on</div>
            </div>

            <div className="px-4 py-6 text-center text-sm text-gray-500">
              Promoted questions will appear here.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
