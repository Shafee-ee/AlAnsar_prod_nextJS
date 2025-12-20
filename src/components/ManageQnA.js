'use client';

import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function ManageQnA() {
    const [items, setItems] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [badIds, setBadIds] = useState(new Set());

    // filters
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [qualityFilter, setQualityFilter] = useState("all"); // all | good | bad

    // modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // pagination
    const [cursor, setCursor] = useState(null);
    const [noMore, setNoMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    /* -----------------------------
       INITIAL LOAD
    ----------------------------- */
    useEffect(() => {
        fetchAudit();
        fetchPaginated();
    }, []);

    /* -----------------------------
       DATA FETCHING
    ----------------------------- */
    async function fetchPaginated() {
        const res = await fetch("/api/qna/paginated");
        const data = await res.json();

        if (data.success) {
            setItems(data.items);
            setFiltered(data.items);
            setCursor(data.lastCursor);
            setNoMore(data.noMore);
        }
    }

    async function fetchAll() {
        const res = await fetch("/api/qna/list");
        const data = await res.json();

        if (data.success) {
            setItems(data.items);
        }
    }

    async function fetchAudit() {
        const res = await fetch("/api/qna/audit");
        const data = await res.json();

        const bad = new Set(
            (data.brokenItems || []).map(i => i.id)
        );
        setBadIds(bad);
    }

    /* -----------------------------
       QUALITY FILTER HANDLING
    ----------------------------- */
    useEffect(() => {
        if (qualityFilter === "all") {
            fetchPaginated();
        } else {
            fetchAll();
        }
    }, [qualityFilter]);

    async function loadMore() {
        if (noMore || qualityFilter !== "all") return;

        setIsLoadingMore(true);

        const res = await fetch(`/api/qna/paginated?cursor=${cursor}`);
        const data = await res.json();

        if (data.success) {
            setItems(prev => [...prev, ...data.items]);
            setFiltered(prev => [...prev, ...data.items]);
            setCursor(data.lastCursor);
            setNoMore(data.noMore);
        }

        setIsLoadingMore(false);
    }

    /* -----------------------------
       FILTER + SORT
    ----------------------------- */
    useEffect(() => {
        let data = [...items];

        if (search.trim()) {
            data = data.filter(i =>
                (i.question_en || "")
                    .toLowerCase()
                    .includes(search.toLowerCase())
            );
        }

        if (qualityFilter !== "all") {
            data = data.filter(i =>
                qualityFilter === "bad"
                    ? badIds.has(i.id)
                    : !badIds.has(i.id)
            );
        }

        data.sort((a, b) => {
            const tA = new Date(a.createdAt).getTime();
            const tB = new Date(b.createdAt).getTime();
            return sortBy === "newest" ? tB - tA : tA - tB;
        });

        setFiltered(data);
    }, [search, sortBy, qualityFilter, items, badIds]);

    /* -----------------------------
       ACTIONS
    ----------------------------- */
    async function handleDelete(id) {
        if (!confirm("Delete this QnA?")) return;

        const res = await fetch("/api/qna/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });

        const data = await res.json();
        if (data.success) {
            setItems(items.filter(i => i.id !== id));
            setIsModalOpen(false);
        }
    }

    async function toggleStatus(item) {
        const newStatus =
            item.status === "inactive" ? "active" : "inactive";

        await fetch("/api/qna/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: item.id,
                updates: { status: newStatus }
            })
        });

        setItems(prev =>
            prev.map(i =>
                i.id === item.id ? { ...i, status: newStatus } : i
            )
        );
    }

    // retranslate
    async function translateText(text, targetLang) {
        if (!text) return "";

        const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLang })
        });

        const data = await res.json();
        return data.translated || "";
    }

    async function saveChanges() {
        if (!selectedItem) return;

        const res = await fetch("/api/qna/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: selectedItem.id,
                updates: {
                    question_en: selectedItem.question_en || "",
                    answer_en: selectedItem.answer_en || "",
                    question_kn: selectedItem.question_kn || "",
                    answer_kn: selectedItem.answer_kn || "",
                    editorNote_en: selectedItem.editorNote_en || "",
                    editorNote_kn: selectedItem.editorNote_kn || ""
                }
            })
        });

        const text = await res.text();
        console.log("UPDATE RESPONSE:", res.status, text);

        if (!res.ok) {
            alert(`Save failed: ${text}`);
            return;
        }

        const data = JSON.parse(text);
    }


    /* -----------------------------
       RENDER
    ----------------------------- */
    return (
        <div className="space-y-4 text-sm">

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search English question..."
                    className="p-2 border rounded w-64 text-xs"
                />

                <select
                    value={qualityFilter}
                    onChange={e => setQualityFilter(e.target.value)}
                    className="p-2 border rounded text-xs"
                >
                    <option value="all">All</option>
                    <option value="good">Good</option>
                    <option value="bad">Bad</option>
                </select>

                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="p-2 border rounded text-xs"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 text-left">Question (EN)</th>
                            <th className="p-2">Quality</th>
                            <th className="p-2">Lang</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Active</th>
                            <th className="p-2">Delete</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map(item => {
                            const isBad = badIds.has(item.id);
                            const lang =
                                item.question_en && item.question_kn
                                    ? "EN+KN"
                                    : item.question_en
                                        ? "EN"
                                        : "KN";

                            return (
                                <tr
                                    key={item.id}
                                    className="border-b hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <td className="p-2 max-w-[420px] truncate font-medium">
                                        {item.question_en || (
                                            <span className="text-red-600 italic">
                                                Missing English translation
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-2 text-center">
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-semibold ${isBad
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {isBad ? "BAD" : "GOOD"}
                                        </span>
                                    </td>

                                    <td className="p-2 text-center font-semibold">{lang}</td>

                                    <td className="p-2 text-center">
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    <td
                                        className="p-2 text-center"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={item.status !== "inactive"}
                                            onChange={() => toggleStatus(item)}
                                        />
                                    </td>

                                    <td
                                        className="p-2 text-center"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                    >
                                        <FiTrash2 className="text-red-600 hover:text-red-800 text-lg" />
                                    </td>
                                </tr>
                            );
                        })}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center p-3 text-gray-500">
                                    No QnA found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {qualityFilter === "all" && !noMore && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="bg-gray-800 text-white px-4 py-2 rounded text-xs hover:bg-black disabled:opacity-50"
                    >
                        {isLoadingMore ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">

                        <h2 className="text-lg font-bold text-[#1D3F9A]">
                            QnA Editor
                        </h2>

                        {/* English */}
                        <div>
                            <h3 className="text-xs font-semibold mb-1">Question (English)</h3>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={selectedItem.question_en || ""}
                                onChange={e =>
                                    setSelectedItem({ ...selectedItem, question_en: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold mb-1">Answer (English)</h3>
                            <textarea
                                className="w-full p-2 border rounded h-24"
                                value={selectedItem.answer_en || ""}
                                onChange={e =>
                                    setSelectedItem({ ...selectedItem, answer_en: e.target.value })
                                }
                            />
                        </div>

                        <hr />

                        {/* Kannada */}
                        <div>
                            <h3 className="text-xs font-semibold mb-1">Question (Kannada)</h3>
                            <textarea
                                className="w-full p-2 border rounded"
                                value={selectedItem.question_kn || ""}
                                onChange={e =>
                                    setSelectedItem({ ...selectedItem, question_kn: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold mb-1">Answer (Kannada)</h3>
                            <textarea
                                className="w-full p-2 border rounded h-24"
                                value={selectedItem.answer_kn || ""}
                                onChange={e =>
                                    setSelectedItem({ ...selectedItem, answer_kn: e.target.value })
                                }
                            />
                        </div>

                        <hr />

                        {/* Editor's Notes */}
                        <div>
                            <h3 className="text-xs font-semibold mb-1">
                                Editor’s Notes
                            </h3>
                            <textarea
                                className="w-full p-2 border rounded h-20 text-xs"
                                placeholder="Optional. Clarifications, usage notes, sources, etc."
                                value={selectedItem.editorNote_en || ""}
                                onChange={e =>
                                    setSelectedItem({
                                        ...selectedItem,
                                        editorNote_en: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold mb-1">
                                Editor’s Note (Kannada)
                            </h3>
                            <textarea
                                className="w-full p-2 border rounded h-20 text-xs"
                                placeholder="ಐಚ್ಛಿಕ. ವಿವರಣೆ, ಬಳಕೆಯ ಮಾಹಿತಿ, ಮೂಲಗಳು ಇತ್ಯಾದಿ."
                                value={selectedItem.editorNote_kn || ""}
                                onChange={e =>
                                    setSelectedItem({
                                        ...selectedItem,
                                        editorNote_kn: e.target.value
                                    })
                                }
                            />
                        </div>


                        {/* Translation buttons (UI only) */}
                        <div className="flex justify-between pt-2">
                            <button
                                disabled={!selectedItem.question_kn}
                                onClick={async () => {
                                    const question = await translateText(selectedItem.question_kn, "en");
                                    const answer = await translateText(selectedItem.answer_kn, "en");

                                    setSelectedItem(
                                        prev => ({
                                            ...prev,
                                            question_en: question,
                                            answer_en: answer
                                        }));
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded text-xs disabled:opacity-40"
                            >
                                Translate to English
                            </button>


                            <button
                                disabled={!selectedItem.question_en}
                                onClick={async () => {
                                    const q = await translateText(selectedItem.question_en, "kn");
                                    const a = await translateText(selectedItem.answer_en || "", "kn");

                                    setSelectedItem(prev => ({
                                        ...prev,
                                        question_kn: q,
                                        answer_kn: a
                                    }));
                                }}
                                className="bg-indigo-600 text-white px-4 py-2 rounded text-xs disabled:opacity-40"
                            >
                                Translate to Kannada
                            </button>

                        </div>

                        <div className="flex justify-end pt-2">

                            <div className="flex justify-end gap-3 pt-2">


                                <button
                                    onClick={saveChanges}
                                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>


                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
