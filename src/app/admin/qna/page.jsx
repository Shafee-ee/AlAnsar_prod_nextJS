'use client';
import { useState } from 'react';

export default function QnAUploadPanel() {
    const [activeTab, setActiveTab] = useState("single");
    const [singleQuestion, setSingleQuestion] = useState("");
    const [singleAnswer, setSingleAnswer] = useState("");
    const [singleLang, setSingleLang] = useState("kn");

    //buld upload state
    const [bulkFile, setBulkFile] = useState(null);
    // --- Submit Single QnA ---
    async function handleSingleSubmit(e) {
        e.preventDefault();

        if (!singleQuestion || !singleAnswer) {
            alert("Please enter both question and answer");
            return;
        }

        const res = await fetch("/api/qna/single", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: singleQuestion,
                answer: singleAnswer,
                lang: singleLang
            })
        });

        const data = await res.json();

        if (data.success) {
            alert("QnA uploaded successfully!");
            setSingleQuestion("");
            setSingleAnswer("");
        } else {
            alert("Upload failed: " + data.message);
        }
    }


    // --- Bulk Upload ---
    async function handleBulkUpload(e) {
        e.preventDefault();

        if (!bulkFile) {
            alert("Please choose a JSON file");
            return;
        }

        const formData = new FormData();
        formData.append("file", bulkFile);

        const res = await fetch("/api/qna/bulk", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            setBulkFile(null);
        } else {
            alert("Bulk upload failed: " + data.message);
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-10">

            {/* --- TAB BUTTONS --- */}
            <div className="flex border-b border-gray-300">
                <button
                    onClick={() => setActiveTab("single")}
                    className={`px-6 py-3 font-semibold border-b-4 transition-all 
                    ${activeTab === "single"
                            ? "border-[#1D3F9A] text-[#1D3F9A]"
                            : "border-transparent text-gray-500 hover:text-[#1D3F9A]"}`}
                >
                    Add Single QnA
                </button>

                <button
                    onClick={() => setActiveTab("bulk")}
                    className={`px-6 py-3 font-semibold border-b-4 transition-all 
                    ${activeTab === "bulk"
                            ? "border-[#1D3F9A] text-[#1D3F9A]"
                            : "border-transparent text-gray-500 hover:text-[#1D3F9A]"}`}
                >
                    Bulk Upload
                </button>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="bg-white shadow-md p-6 rounded-b-lg border border-gray-200">

                {/* --- SINGLE UPLOAD TAB --- */}
                {activeTab === "single" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[#1D3F9A]">Add Single QnA</h2>

                        <div className="space-y-2">
                            <label className="font-medium">Question</label>
                            <input
                                type="text"
                                value={singleQuestion}
                                onChange={(e) => setSingleQuestion(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                                placeholder="Enter question..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Answer</label>
                            <textarea
                                value={singleAnswer}
                                onChange={(e) => setSingleAnswer(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A] h-32"
                                placeholder="Enter answer..."
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="font-medium">Language</label>
                            <select
                                value={singleLang}
                                onChange={(e) => setSingleLang(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]">
                                <option value="kn">Kannada</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSingleSubmit}
                            className="bg-[#1D3F9A] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#132B6A] transition">
                            Submit QnA
                        </button>
                    </div>
                )}

                {/* --- BULK UPLOAD TAB --- */}
                {activeTab === "bulk" && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-[#1D3F9A]">Bulk Upload</h2>

                        <p className="text-gray-600 text-sm">
                            Upload a JSON file containing multiple QnA items.
                        </p>

                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => setBulkFile(e.target.files[0])}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                        />

                        <button
                            onClick={handleBulkUpload}
                            className="bg-[#1D3F9A] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#132B6A] transition">
                            Upload File
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
