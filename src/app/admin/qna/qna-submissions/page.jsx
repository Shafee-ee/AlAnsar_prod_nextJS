"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  ANSWERED_RECEIVED: "answered_received",
  UNDER_REVIEW: "under_review",
  READY_TO_PROMOTE: "ready_to_promote",
  PROMOTED: "promoted",
  REJECTED: "rejected",
};

export default function QnaSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [promotedSubmissions, setPromotedSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState(STATUS.PENDING);
  const [expandedId, setExpandedId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [selectedResponseIds, setSelectedResponseIds] = useState({});

  const router = useRouter();

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchSubmissions(activeStatus),
      fetchPromotedSubmissions(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [activeStatus]);

  const fetchSubmissions = async (status) => {
    try {
      const res = await fetch(`/api/qna/submissions-list?status=${status}`);

      if (!res.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await res.json();

      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setSubmissions([]);
    }
  };

  const fetchPromotedSubmissions = async () => {
    try {
      const res = await fetch("/api/qna/submissions-list?status=promoted");

      if (!res.ok) {
        throw new Error("Failed to fetch promoted submissions");
      }

      const data = await res.json();

      setPromotedSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setPromotedSubmissions([]);
    }
  };

  const deleteSubmission = async (id) => {
    if (!confirm("Delete this submission?")) return;

    try {
      const res = await fetch("/api/qna/delete-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete submission");
      }

      setSubmissions((prev) => prev.filter((item) => item.id !== id));

      setPromotedSubmissions((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete submission.");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch("/api/qna/update-submission-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }
      if (
        newStatus === STATUS.UNDER_REVIEW ||
        newStatus === STATUS.READY_TO_PROMOTE
      ) {
        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: newStatus,
                }
              : item,
          ),
        );

        setExpandedId(id);
      } else {
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update status.");
    }
  };

  const resendImamEmail = async (id) => {
    try {
      setResendingId(id);

      const res = await fetch("/api/qna/resend-imam-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend email");
      }

      alert("Email sent successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to resend email.");
    } finally {
      setResendingId(null);
    }
  };

  const handlePromote = (item) => {
    if (item.status !== STATUS.READY_TO_PROMOTE) {
      alert(
        "This submission must be reviewed and marked ready before promotion.",
      );
      return;
    }

    const responses = item.responses || [];

    const selectedResponseId = selectedResponseIds[item.id];

    if (!selectedResponseId) {
      alert("Please select which Ustaad response you want to promote.");
      return;
    }

    const selectedResponse = responses.find(
      (response, index) =>
        (response.id || response.responseId || index) === selectedResponseId,
    );

    if (!selectedResponse?.answer) {
      alert("The selected Ustaad response has no answer.");
      return;
    }

    const answer = selectedResponse.answer;

    const encodedQuestion = encodeURIComponent(
      item.question_en ||
        item.translated_question_en ||
        item.question_original ||
        "",
    );

    const encodedAnswer = encodeURIComponent(answer);

    const responseParam =
      selectedResponseId === "legacy"
        ? ""
        : `&responseId=${encodeURIComponent(selectedResponseId)}`;

    router.push(
      `/admin/qna?fromSubmission=true&submissionId=${item.id}${responseParam}&question=${encodedQuestion}&answer=${encodedAnswer}`,
    );
  };

  const getStatusLabel = (status) => {
    if (status === STATUS.PENDING) return "Pending";
    if (status === STATUS.APPROVED) return "Awaiting answer";
    if (status === STATUS.ANSWERED_RECEIVED) return "Answer received";
    if (status === STATUS.UNDER_REVIEW) return "Under review";
    if (status === STATUS.READY_TO_PROMOTE) return "Ready to promote";
    if (status === STATUS.PROMOTED) return "Promoted";
    if (status === STATUS.REJECTED) return "Rejected";

    return status?.toUpperCase() || "-";
  };

  const getStatusClasses = (status) => {
    if (status === STATUS.PENDING) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === STATUS.APPROVED) {
      return "bg-blue-100 text-blue-700";
    }

    if (
      status === STATUS.ANSWERED_RECEIVED ||
      status === STATUS.UNDER_REVIEW ||
      status === STATUS.READY_TO_PROMOTE
    ) {
      return "bg-green-100 text-green-700";
    }

    if (status === STATUS.PROMOTED) {
      return "bg-purple-100 text-purple-700";
    }

    if (status === STATUS.REJECTED) {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString();
    }

    const date = new Date(timestamp);

    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  };

  const renderResponses = (item) => {
    const responses = item.responses || [];

    if (responses.length === 0 && item.ustaad_answer) {
      const responseId = "legacy";
      const isSelected = selectedResponseIds[item.id] === responseId;

      return (
        <div className="mt-3 border-t pt-3">
          <div className="font-medium text-gray-700 mb-2">Ustaad response</div>

          <label
            className={`block rounded-md border p-3 cursor-pointer ${
              isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name={`response-${item.id}`}
                value={responseId}
                checked={isSelected}
                onChange={() =>
                  setSelectedResponseIds((prev) => ({
                    ...prev,
                    [item.id]: responseId,
                  }))
                }
                className="mt-1"
              />

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Response 1
                </div>

                <div className="whitespace-pre-wrap text-gray-700">
                  {item.ustaad_answer}
                </div>
              </div>
            </div>
          </label>
        </div>
      );
    }

    if (responses.length === 0) {
      return null;
    }

    const selectedResponseId = selectedResponseIds[item.id];

    return (
      <div className="mt-3 border-t pt-3 space-y-3">
        <div className="font-medium text-gray-700">
          Ustaad responses ({responses.length})
        </div>

        {responses.map((response, index) => {
          const responseId = response.id || response.responseId || index;
          const isSelected = selectedResponseId === responseId;

          return (
            <label
              key={responseId}
              className={`block rounded-md border p-3 cursor-pointer ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name={`response-${item.id}`}
                  value={responseId}
                  checked={isSelected}
                  onChange={() =>
                    setSelectedResponseIds((prev) => ({
                      ...prev,
                      [item.id]: responseId,
                    }))
                  }
                  className="mt-1"
                />

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Response {index + 1}
                  </div>

                  <div className="text-xs text-gray-500 mb-1">
                    {response.ustaadEmail || "Ustaad"}{" "}
                    {response.receivedAt
                      ? `• ${formatDate(response.receivedAt)}`
                      : ""}
                  </div>

                  <div className="whitespace-pre-wrap text-gray-700">
                    {response.answer || "-"}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Manage Submissions</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {status === STATUS.PENDING
              ? "PENDING"
              : status === STATUS.APPROVED
                ? "ANSWER WORKFLOW"
                : "REJECTED"}
          </button>
        ))}
      </div>

      {/* Main table */}
      <div className="border border-gray-300">
        <div className="grid grid-cols-5 bg-gray-200 px-4 py-3 text-sm font-semibold">
          <div>Question</div>
          <div>Submitted on</div>
          <div>Status</div>
          <div>Contact</div>
          <div className="text-center">Actions</div>
        </div>

        {submissions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            No submissions found.
          </div>
        ) : (
          submissions.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="grid grid-cols-5 items-start px-4 py-3 border-t text-sm"
              >
                {/* Question + Responses */}
                <div className="pr-4">
                  <div
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === item.id ? null : item.id,
                      )
                    }
                    className={`cursor-pointer ${isExpanded ? "" : "truncate"}`}
                  >
                    {item.question_original || item.question_en || "-"}
                  </div>
                  {(isExpanded || item.status === STATUS.READY_TO_PROMOTE) &&
                    renderResponses(item)}
                </div>

                {/* Submitted Date */}
                <div>{formatDate(item.createdAt)}</div>

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

                {/* Contact */}
                <div>
                  {item.email && item.phone ? (
                    <div>
                      <div>{item.phone}</div>
                      <div>{item.email}</div>
                    </div>
                  ) : item.phone ? (
                    item.phone
                  ) : item.email ? (
                    item.email
                  ) : (
                    "Anonymous"
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {item.status === STATUS.PENDING && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, STATUS.APPROVED)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(item.id, STATUS.REJECTED)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* Answer received → start review */}
                  {item.status === STATUS.ANSWERED_RECEIVED && (
                    <button
                      onClick={() => updateStatus(item.id, STATUS.UNDER_REVIEW)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                    >
                      Review Answer
                    </button>
                  )}

                  {/* Under review → mark ready */}
                  {item.status === STATUS.UNDER_REVIEW && (
                    <button
                      onClick={() =>
                        updateStatus(item.id, STATUS.READY_TO_PROMOTE)
                      }
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                    >
                      Ready to Promote
                    </button>
                  )}

                  {/* Ready → enter promotion workflow */}
                  {item.status === STATUS.READY_TO_PROMOTE &&
                    !item.promoted_qna_id && (
                      <button
                        onClick={() => handlePromote(item)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        Promote
                      </button>
                    )}

                  {/* Approved → resend question */}
                  {item.status === STATUS.APPROVED && (
                    <button
                      onClick={() => resendImamEmail(item.id)}
                      disabled={resendingId === item.id}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded disabled:opacity-50"
                    >
                      {resendingId === item.id ? "Sending..." : "Resend Email"}
                    </button>
                  )}

                  <button
                    onClick={() => deleteSubmission(item.id)}
                    className="text-red-600 hover:text-red-800 text-lg"
                    title="Delete submission"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Promoted Questions */}
      {activeStatus === STATUS.APPROVED && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Promoted Questions</h2>

          <div className="border border-gray-300">
            <div className="grid grid-cols-3 bg-gray-200 px-4 py-3 text-sm font-semibold">
              <div>Question</div>
              <div>Promoted on</div>
              <div className="text-center">Actions</div>
            </div>

            {promotedSubmissions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No promoted questions yet.
              </div>
            ) : (
              promotedSubmissions.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-3 items-center px-4 py-3 border-t text-sm"
                >
                  <div className="truncate">
                    {item.question_original || item.question_en || "-"}
                  </div>

                  <div>
                    {formatDate(
                      item.promotedAt || item.updatedAt || item.createdAt,
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => deleteSubmission(item.id)}
                      className="text-red-600 hover:text-red-800 text-lg"
                      title="Delete submission"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
