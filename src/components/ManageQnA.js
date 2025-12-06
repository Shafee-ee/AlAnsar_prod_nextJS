'use client';

import { useState, useEffect } from "react";
import { FiTrash2 } from "react-icons/fi";

export default function ManageQnA() {

    const [items, setItems] = useState([]);
    const [filtered, setFiltered] = useState([]);

    // Filters
    const [search, setSearch] = useState("");
    const [keywordSearch, setKeywordSearch] = useState("");
    const [langFilter, setLangFilter] = useState("all");
    const [validityFilter, setValidityFilter] = useState("all"); // all | valid | invalid
    const [sortBy, setSortBy] = useState("newest");

    // modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // pagination
    const [cursor, setCursor] = useState(null);
    const [noMore, setNoMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const res = await fetch("/api/qna/paginated");
        const data = await res.json();

        if (data.success) {
            setItems(data.items);
            setFiltered(data.items);
            setCursor(data.lastCursor);
            setNoMore(data.noMore);
        }
    }

    async function loadMore() {
        if (noMore) return;

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

    function isItemValid(item) {
        const embeddingOK = item.embedding && item.embedding.length > 0;
        const translationOK =
            item.originalQuestion !== item.translatedQuestion ||
            item.originalAnswer !== item.translatedAnswer;

        return embeddingOK && translationOK;
    }

    // -------------------------------
    // FILTER + SORT LOGIC FIXED
    // -------------------------------
    useEffect(() => {
        let data = [...items];

        // search question
        if (search.trim() !== "") {
            data = data.filter(i =>
                i.originalQuestion?.toLowerCase().includes(search.toLowerCase())
            );
        }

        // keyword filter
        if (keywordSearch.trim() !== "") {
            data = data.filter(i =>
                (i.keywords || [])
                    .join(" ")
                    .toLowerCase()
                    .includes(keywordSearch.toLowerCase())
            );
        }

        // language filter
        if (langFilter !== "all") {
            data = data.filter(i => i.lang === langFilter);
        }

        // validity filter
        if (validityFilter === "valid") {
            data = data.filter(i => isItemValid(i));
        } else if (validityFilter === "invalid") {
            data = data.filter(i => !isItemValid(i));
        }

        // FIXED sorting (convert createdAt to timestamps)
        data.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return sortBy === "newest" ? timeB - timeA : timeA - timeB;
        });

        setFiltered(data);
    }, [search, keywordSearch, langFilter, validityFilter, sortBy, items]);

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

    return (
        <div className="space-y-4 text-sm">

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search question..."
                    className="p-2 border rounded w-52 text-xs"
                />

                <input
                    type="text"
                    value={keywordSearch}
                    onChange={e => setKeywordSearch(e.target.value)}
                    placeholder="Search keywords..."
                    className="p-2 border rounded w-40 text-xs"
                />

                <select value={langFilter} onChange={(e) => setLangFilter(e.target.value)} className="p-2 border rounded text-xs">
                    <option value="all">All Lang</option>
                    <option value="kn">Kannada</option>
                    <option value="en">English</option>
                </select>

                <select value={validityFilter} onChange={(e) => setValidityFilter(e.target.value)} className="p-2 border rounded text-xs">
                    <option value="all">All Items</option>
                    <option value="valid">Valid Only</option>
                    <option value="invalid">Invalid Only</option>
                </select>

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-2 border rounded text-xs">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-gray-200 text-xs">
                            <th className="p-2">Status</th>
                            <th className="p-2">Question</th>
                            <th className="p-2">Keywords</th>
                            <th className="p-2">Lang</th>
                            <th className="p-2">Date</th>
                            <th className="p-2">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map(item => (
                            <tr
                                key={item.id}
                                className="border-b cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSelectedItem(item);
                                    setIsModalOpen(true);
                                    setIsEditing(false);
                                }}
                            >
                                <td className="p-2">
                                    {isItemValid(item)
                                        ? <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block" />
                                        : <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
                                    }
                                </td>

                                <td className="p-2 max-w-[250px] truncate">{item.originalQuestion}</td>

                                <td className="p-2 max-w-[180px] truncate text-gray-600">
                                    {(item.keywords || []).join(", ")}
                                </td>

                                <td className="p-2">{item.lang}</td>

                                <td className="p-2">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>

                                <td
                                    className="p-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(item.id);
                                    }}
                                >
                                    <FiTrash2 className="text-red-600 hover:text-red-800 text-lg" />
                                </td>
                            </tr>
                        ))}

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

            {!noMore && (
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
                    <div className="bg-white p-5 rounded-lg shadow-xl max-w-lg w-full text-sm">

                        <h2 className="text-lg font-bold mb-3 text-[#1D3F9A]">
                            {isEditing ? "Edit QnA" : "QnA Details"}
                        </h2>

                        {/* Question */}
                        <div className="mb-3">
                            <h3 className="font-semibold text-xs">Question:</h3>
                            {isEditing ? (
                                <textarea
                                    className="w-full p-2 border rounded text-sm"
                                    value={selectedItem.originalQuestion}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, originalQuestion: e.target.value })}
                                />
                            ) : (
                                <p className="text-gray-700 whitespace-pre-line">{selectedItem.originalQuestion}</p>
                            )}
                        </div>

                        {/* Answer */}
                        <div className="mb-3">
                            <h3 className="font-semibold text-xs">Answer:</h3>
                            {isEditing ? (
                                <textarea
                                    className="w-full p-2 border rounded h-28 text-sm"
                                    value={selectedItem.originalAnswer}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, originalAnswer: e.target.value })}
                                />
                            ) : (
                                <p className="text-gray-700 whitespace-pre-line">{selectedItem.originalAnswer}</p>
                            )}
                        </div>

                        {/* Keywords */}
                        <div className="mb-3">
                            <h3 className="font-semibold text-xs">Keywords:</h3>
                            {isEditing ? (
                                <input
                                    className="w-full p-2 border rounded text-sm"
                                    value={(selectedItem.keywords || []).join(", ")}
                                    onChange={(e) =>
                                        setSelectedItem({
                                            ...selectedItem,
                                            keywords: e.target.value
                                                .split(",")
                                                .map(k => k.trim())
                                                .filter(Boolean)
                                        })
                                    }
                                />
                            ) : (
                                <p className="text-gray-700">{(selectedItem.keywords || []).join(", ")}</p>
                            )}
                        </div>

                        {/* Language */}
                        <div className="mb-3">
                            <h3 className="font-semibold text-xs">Language:</h3>

                            {isEditing ? (
                                <select
                                    className="p-2 border rounded text-sm"
                                    value={selectedItem.lang}
                                    onChange={(e) =>
                                        setSelectedItem({ ...selectedItem, lang: e.target.value })
                                    }
                                >
                                    <option value="kn">Kannada</option>
                                    <option value="en">English</option>
                                </select>
                            ) : (
                                <p className="text-gray-700">{selectedItem.lang}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between mt-5">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditing(false);
                                }}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm"
                            >
                                Close
                            </button>

                            <div className="flex gap-3">
                                {isEditing ? (
                                    <button
                                        onClick={async () => {
                                            const res = await fetch("/api/qna/update", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify(selectedItem)
                                            });

                                            const data = await res.json();
                                            if (data.success) {
                                                alert("Updated!");
                                                setIsEditing(false);
                                                setItems(items.map(i =>
                                                    i.id === selectedItem.id ? selectedItem : i
                                                ));
                                            } else {
                                                alert("Update failed");
                                            }
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                    >
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                    >
                                        Edit
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(selectedItem.id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
