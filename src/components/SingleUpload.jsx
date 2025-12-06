"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function SingleUpload() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [lang, setLang] = useState("kn");
    const [keywords, setKeywords] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!question || !answer) {
            toast.error("Please enter both question and answer.");
            return;
        }

        setLoading(true);

        const keywordArray = keywords
            .split(",")
            .map(k => k.trim())
            .filter(k => k.length > 0);

        const res = await fetch("/api/qna/single", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question,
                answer,
                lang,
                keywords: keywordArray
            })
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            toast.success("QnA uploaded successfully!");
            setQuestion("");
            setAnswer("");
            setKeywords("");
        } else {
            toast.error("Upload failed: " + data.message);
        }
    }

    return (
        <div className="space-y-4 relative">

            <h2 className="text-xl font-bold text-[#1D3F9A]">Add Single QnA</h2>

            {/* Question */}
            <div className="space-y-2">
                <label className="font-medium">Question</label>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                    placeholder="Enter question..."
                />
            </div>

            {/* Answer */}
            <div className="space-y-2">
                <label className="font-medium">Answer</label>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-[#1D3F9A]"
                    placeholder="Enter answer..."
                ></textarea>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
                <label className="font-medium">Keywords (comma separated)</label>
                <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                    placeholder="e.g. prayer, wudu, fasting"
                />
            </div>

            {/* Language */}
            <div className="space-y-2">
                <label className="font-medium">Language</label>
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                >
                    <option value="kn">Kannada</option>
                    <option value="en">English</option>
                </select>
            </div>

            {loading && (
                <div className="mt-3 h-[3px] w-full bg-blue-200 overflow-hidden rounded">
                    <div className="h-full bg-blue-600 animate-progress"></div>
                </div>
            )}
            <button
                disabled={loading}
                onClick={handleSubmit}
                className="bg-[#1D3F9A] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#132B6A] transition disabled:opacity-50"
            >
                {loading ? "Uploading..." : "Submit QnA"}
            </button>

        </div>
    );
}
