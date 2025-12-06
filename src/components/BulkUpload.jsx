'use client';

import { useState } from "react";
import { toast } from "react-hot-toast";

const MAX_RETRIES = 2;
const PER_ITEM_DELAY = 700;

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

export default function BulkUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [failed, setFailed] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    async function uploadItem(item, index) {
        const question = item.question ?? item.question_kn ?? item.originalQuestion ?? "";
        const answer = item.answer ?? item.answer_kn ?? item.originalAnswer ?? "";
        const lang = item.lang ?? item.lang_kn ?? (item.id ? "kn" : "kn");
        const keywords = Array.isArray(item.keywords) ? item.keywords : [];

        if (!question || !answer) return { ok: false, error: "Missing question or answer" };

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const res = await fetch("/api/qna/single", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question, answer, lang, keywords }),
                });

                const json = await res.json();

                if (res.ok && json.success) {
                    return { ok: true };
                } else {
                    if (attempt < MAX_RETRIES) {
                        await delay(500 + attempt * 300);
                        continue;
                    }
                    return { ok: false, error: json?.message || json?.error || "Server error" };
                }
            } catch (err) {
                if (attempt < MAX_RETRIES) {
                    await delay(500 + attempt * 300);
                    continue;
                }
                return { ok: false, error: err.message };
            }
        }
    }

    async function processItems(items) {
        setFailed([]);
        setTotal(items.length);
        setProgress(0);
        setLoading(true);

        const failedArr = [];

        for (let i = 0; i < items.length; i++) {
            setCurrentIndex(i);

            const r = await uploadItem(items[i], i);
            if (r.ok) setProgress(prev => prev + 1);
            else failedArr.push({ index: i, item: items[i], reason: r.error });

            await delay(PER_ITEM_DELAY);
        }

        setFailed(failedArr);
        setLoading(false);
        setCurrentIndex(-1);

        if (failedArr.length === 0) {
            toast.success(`Uploaded ${items.length}/${items.length}`);
        } else {
            toast.success(`Uploaded ${items.length - failedArr.length}/${items.length}`);
            toast.error(`${failedArr.length} failed`);
        }
    }

    // 🔥 FIXED RETRY: clean, no undefined index, no crash
    async function retryFailed() {
        if (failed.length === 0) return;

        const failedItems = failed.map(f => f.item);

        setLoading(true);
        setProgress(0);
        setTotal(failedItems.length);

        const newFailed = [];

        for (let i = 0; i < failedItems.length; i++) {
            setCurrentIndex(i);

            const r = await uploadItem(failedItems[i], i);

            if (r.ok) {
                setProgress(prev => prev + 1);
            } else {
                newFailed.push({
                    item: failedItems[i],
                    reason: r.error
                });
            }

            await delay(PER_ITEM_DELAY);
        }

        setFailed(newFailed);
        setLoading(false);
        setCurrentIndex(-1);

        if (newFailed.length === 0) {
            toast.success("All failed items uploaded successfully");
        } else {
            toast.error(`${newFailed.length} still failed`);
        }
    }


    async function handleBulkUpload(e) {
        e.preventDefault();

        if (!file) {
            toast.error("Please select a JSON file");
            return;
        }

        let text = await file.text();

        let items;
        try {
            items = JSON.parse(text);
            if (!Array.isArray(items)) {
                toast.error("JSON must be an array");
                return;
            }
        } catch {
            toast.error("Invalid JSON");
            return;
        }

        await processItems(items);
    }

    const percent = total === 0 ? 0 : Math.round((progress / total) * 100);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1D3F9A]">Bulk Upload</h2>

            <input
                type="file"
                accept=".json"
                onChange={(e) => {
                    setFile(e.target.files[0]);
                    setProgress(0);
                    setTotal(0);
                    setFailed([]);
                }}
                className="w-full p-3 border rounded-lg bg-gray-50"
            />

            <div className="flex items-center gap-3">
                <button
                    onClick={handleBulkUpload}
                    disabled={loading || !file}
                    className="bg-[#1D3F9A] text-white px-6 py-3 rounded-lg shadow disabled:opacity-50"
                >
                    {loading ? "Uploading..." : "Upload File"}
                </button>

                {failed.length > 0 && (
                    <button
                        onClick={retryFailed}
                        disabled={loading}
                        className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        Retry {failed.length} failed
                    </button>
                )}
            </div>

            {loading && (
                <div className="mt-4">
                    <div className="text-sm font-medium mb-1 text-gray-700">
                        Uploading… {progress} / {total}
                    </div>

                    <div className="w-full h-2 bg-gray-300 rounded overflow-hidden">
                        <div
                            className="h-full bg-[#1D3F9A] transition-all duration-300"
                            style={{ width: `${percent}%` }}
                        />
                    </div>

                    <div className="text-xs mt-2 text-gray-500">
                        Processing item {currentIndex + 1} of {total}
                    </div>
                </div>
            )}

            {failed.length > 0 && !loading && (
                <div className="mt-4 p-3 border rounded bg-red-50 text-sm">
                    <div className="font-semibold text-red-700 mb-2">
                        Failed items ({failed.length})
                    </div>

                    <ul className="list-disc pl-5 max-h-40 overflow-auto">
                        {failed.slice(0, 20).map((f, i) => (
                            <li key={i}>
                                {f.item.question?.slice(0, 60)} — {f.reason}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-2 text-xs text-gray-600">
                        Fix JSON or retry failed items.
                    </div>
                </div>
            )}
        </div>
    );
}
