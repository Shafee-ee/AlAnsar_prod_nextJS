"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

const MAX_RETRIES = 2;
const PER_ITEM_DELAY = 700;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------------- CSV PARSER ---------------- */
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = lines.shift().split(",").map(h => h.trim());

    return lines.map(line => {
        const values = line.split(",").map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => {
            if (h === "keywords") {
                obj[h] = values[i]
                    ? values[i].split(";").map(k => k.trim())
                    : [];
            } else {
                obj[h] = values[i];
            }
        });
        return obj;
    });
}

export default function BulkUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [failed, setFailed] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);

    /* ---------------- UPLOAD SINGLE ITEM ---------------- */
    async function uploadItem(item) {
        const question = item.question ?? item.question_en ?? item.question_kn ?? "";
        const answer = item.answer ?? item.answer_en ?? item.answer_kn ?? "";
        const keywords = Array.isArray(item.keywords) ? item.keywords : [];
        const lang = item.lang ?? "kn";

        if (!question || !answer) {
            return { ok: false, error: "Missing question or answer" };
        }

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const res = await fetch("/api/qna/single", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question, answer, lang, keywords }),
                });

                const json = await res.json();

                if (res.ok && json.success) return { ok: true };

                if (attempt < MAX_RETRIES) await delay(500 + attempt * 300);
                else return { ok: false, error: json.reason || "Upload failed" };

            } catch (err) {
                if (attempt < MAX_RETRIES) await delay(500 + attempt * 300);
                else return { ok: false, error: err.message };
            }
        }
    }

    /* ---------------- PROCESS FILE ---------------- */
    async function processItems(items) {
        setFailed([]);
        setTotal(items.length);
        setProgress(0);
        setLoading(true);

        const failedArr = [];

        for (let i = 0; i < items.length; i++) {
            setCurrentIndex(i);

            const r = await uploadItem(items[i]);

            if (r.ok) setProgress(p => p + 1);
            else failedArr.push({ index: i, item: items[i], reason: r.error });

            await delay(PER_ITEM_DELAY);
        }

        setFailed(failedArr);
        setLoading(false);
        setCurrentIndex(-1);

        toast.success(`Uploaded ${items.length - failedArr.length}/${items.length}`);
        if (failedArr.length) toast.error(`${failedArr.length} failed`);
    }

    /* ---------------- FILE HANDLER ---------------- */
    async function handleBulkUpload(e) {
        e.preventDefault();

        if (!file) return toast.error("Select a file");

        const text = await file.text();
        let items;

        try {
            if (file.name.endsWith(".csv")) items = parseCSV(text);
            else items = JSON.parse(text);
        } catch {
            return toast.error("Invalid file format");
        }

        if (!Array.isArray(items) || !items.length) {
            return toast.error("No valid items found");
        }

        await processItems(items);
    }

    const percent = total ? Math.round((progress / total) * 100) : 0;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1D3F9A]">Bulk Upload</h2>

            <input
                id="bulkFile"
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={(e) => {
                    setFile(e.target.files[0]);
                    setProgress(0);
                    setFailed([]);
                }}
            />

            <div className="flex justify-between items-center border p-3 rounded">
                <span className="font-semibold text-[#1D3F9A]">
                    {file ? `📄 ${file.name}` : "No file selected"}
                </span>
                <button
                    onClick={() => document.getElementById("bulkFile").click()}
                    className="bg-[#1D3F9A] text-white px-4 py-2 rounded"
                >
                    Choose File
                </button>
            </div>

            <button
                onClick={handleBulkUpload}
                disabled={!file || loading}
                className="bg-[#1D3F9A] text-white px-6 py-3 rounded disabled:opacity-50"
            >
                {loading ? "Uploading..." : "Upload File"}
            </button>

            {loading && (
                <div>
                    <div className="text-sm mb-1">
                        Uploading {progress}/{total}
                    </div>
                    <div className="w-full h-2 bg-gray-300 rounded">
                        <div
                            className="h-full bg-[#1D3F9A]"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <div className="text-xs mt-1">
                        Processing item {currentIndex + 1}
                    </div>
                </div>
            )}
        </div>
    );
}
