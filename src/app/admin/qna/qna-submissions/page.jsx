"use client";

import { useEffect, useState } from "react";

export default function QnaSubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState("pending");

    useEffect(() => {
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
            await fetch("/api/qna/delete-submission", {
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
            await fetch("/api/qna/update-submission-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            setSubmissions((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">Manage Submissions</h1>

            <div className="flex gap-3 mb-4">
                {["pending", "approved", "rejected"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveStatus(status)}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${activeStatus === status
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        {status.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="border border-gray-300">

                {/* Header */}
                <div className="grid grid-cols-4 bg-gray-200 px-4 py-3 text-sm font-semibold">
                    <div>Question (EN)</div>
                    <div>Submitted on</div>
                    <div>Status</div>
                    <div className="text-center">Delete</div>
                </div>

                {/* Rows */}
                {submissions.map((item) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-4 items-center px-4 py-3 border-t text-sm"
                    >
                        {/* Question */}
                        <div className="truncate pr-4">
                            {item.question_original}
                        </div>

                        {/* Submitted Date */}


                        <div>
                            {item.createdAt
                                ? new Date(item.createdAt._seconds * 1000).toLocaleDateString()
                                : "-"}
                        </div>


                        {/* Status */}
                        <div>
                            <span
                                className={`px-2 py-1 rounded text-xs font-medium ${item.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : item.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {item.status.toUpperCase()}
                            </span>
                        </div>

                        {/* Update */}
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

                            <button
                                onClick={() => deleteSubmission(item.id)}
                                className="text-red-600 hover:text-red-800 text-lg"
                            >
                                🗑
                            </button>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );

}
