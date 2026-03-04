"use client";
import { convertNudiToUnicode } from "@/lib/nudiConverter";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseClient";
import { use, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function SingleUpload() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [lang, setLang] = useState("kn");
    const [keywords, setKeywords] = useState("");
    const [loading, setLoading] = useState(false);
    const [editorNoteEn, setEditorNoteEn] = useState("");
    const [editorNoteKn, setEditorNoteKn] = useState("");
    const [imamName, setImamName] = useState("");
    const [sourceTitle, setSourceTitle] = useState("");
    const [samputa, setSamputa] = useState("");
    const [sanchike, setSanchike] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    //prefill QnA from submissions
    const searchParams = useSearchParams();
    const fromSubmission = searchParams.get("fromSubmission");
    const submissionId = searchParams.get("submissionId");
    const questionFromUrl = searchParams.get("question");


    // for image upload
    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG or WEBP images allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB");
            return;
        }

        setUploadingImage(true);

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = async () => {
            const targetWidth = 1200;
            const targetHeight = 675; // 16:9

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const originalRatio = img.width / img.height;
            const targetRatio = 16 / 9;

            let sx, sy, sWidth, sHeight;

            if (originalRatio > targetRatio) {
                // Image is wider → crop sides
                sHeight = img.height;
                sWidth = img.height * targetRatio;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else {
                // Image is taller → crop top/bottom
                sWidth = img.width;
                sHeight = img.width / targetRatio;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(
                img,
                sx,
                sy,
                sWidth,
                sHeight,
                0,
                0,
                targetWidth,
                targetHeight
            );

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error("Image processing failed");
                    setUploadingImage(false);
                    return;
                }

                try {
                    const storageRef = ref(
                        storage,
                        `qna-images/${Date.now()}.jpg`
                    );

                    await uploadBytes(storageRef, blob);
                    const url = await getDownloadURL(storageRef);

                    setImageUrl(url);
                } catch (err) {
                    toast.error("Upload failed");
                }

                setUploadingImage(false);
                URL.revokeObjectURL(objectUrl);
            }, "image/jpeg", 0.85); // compress to 85%
        };

        img.onerror = () => {
            toast.error("Invalid image file");
            setUploadingImage(false);
            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    }
    //prefill
    useEffect(() => {
        if (fromSubmission === "true" && questionFromUrl) {
            setQuestion(decodeURIComponent(questionFromUrl));
            setLang("en"); // since submissions standardized to English
        }
    }, [fromSubmission, questionFromUrl]);

    // handle submit function
    async function handleSubmit(e) {
        e.preventDefault();


        if (uploadingImage) {
            toast.error("Please wait for image upload to finish");
            return;
        }

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
                keywords: keywordArray,
                editor_note_en: editorNoteEn,
                editor_note_kn: editorNoteKn,
                imam_name: imamName,
                source_title: sourceTitle,
                samputa,
                sanchike,
                image_urls: imageUrl ? [imageUrl] : []
            })
        });

        if (!res.ok) {
            toast.error("Server error");
            setLoading(false);
            return;
        }

        const data = await res.json();
        setLoading(false);

        if (data.success) {

            if (fromSubmission === "true" && submissionId) {
                await fetch("/api/qna/link-submission", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        submissionId,
                        qnaId: data.id, // your single route must return new ID
                    }),
                });
            }
            toast.success("QnA uploaded successfully!");
            setQuestion("");
            setAnswer("");
            setKeywords("");
            setEditorNoteEn("");
            setEditorNoteKn("");
            setImamName("");
            setSourceTitle("");
            setSamputa("");
            setSanchike("");
            setImageUrl(null);
        } else {
            toast.error("Upload failed: " + (data.reason || "Unknown error"));
        }
    }

    //on hold for now 
    function handleFixEncoding() {
        setQuestion(prev => convertNudiToUnicode(prev));
        setAnswer(prev => convertNudiToUnicode(prev));
    }

    return (
        <div className="space-y-4 relative">

            <h2 className="text-xl font-bold text-[#1D3F9A]">Add Single QnA</h2>

            {/* Question */}
            <div className="space-y-2">
                <label className="font-medium">Question</label>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 h-24 focus:ring-[#1D3F9A]"
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

            {/* <button
                type="button"
                onClick={handleFixEncoding}
                className="bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-900 transition"
            >
                Fix Kannada Encoding
            </button> */}

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

            {/* Editor Note (English) */}
            <div className="space-y-2">
                <label className="font-medium">Editor Note (English)</label>
                <textarea
                    value={editorNoteEn}
                    onChange={(e) => setEditorNoteEn(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-[#1D3F9A]"
                    placeholder="Optional internal note (English)..."
                />
            </div>

            {/* Editor Note (Kannada) */}
            <div className="space-y-2">
                <label className="font-medium">Editor Note (Kannada)</label>
                <textarea
                    value={editorNoteKn}
                    onChange={(e) => setEditorNoteKn(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-[#1D3F9A]"
                    placeholder="Optional internal note (Kannada)..."
                />
            </div>


            {loading && (
                <div className="mt-3 h-[3px] w-full bg-blue-200 overflow-hidden rounded">
                    <div className="h-full bg-blue-600 animate-progress"></div>
                </div>
            )}

            <div className="space-y-2">
                <label className="font-medium">Imam Name (optional)</label>
                <input
                    type="text"
                    value={imamName}
                    onChange={(e) => setImamName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                    placeholder="Enter imam name"
                />
            </div>

            <div className="space-y-2">
                <label className="font-medium">Source Title (optional)</label>
                <input
                    type="text"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                    placeholder="Enter source title"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="font-medium">Samputa</label>
                    <input
                        type="number"
                        value={samputa}
                        onChange={(e) => setSamputa(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                        placeholder="Volume"
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-medium">Sanchike</label>
                    <input
                        type="number"
                        value={sanchike}
                        onChange={(e) => setSanchike(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
                        placeholder="Issue"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-medium">Image (16:9 will be auto-cropped)</label>

                <div className="flex items-center gap-4">

                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition">
                        {uploadingImage ? "Processing..." : "Select Image"}
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>

                    {uploadingImage && (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    )}

                    {!uploadingImage && imageUrl && (
                        <span className="text-sm text-green-600 font-medium">
                            Image ready
                        </span>
                    )}
                </div>
            </div>

            <button

                disabled={loading || uploadingImage}
                onClick={handleSubmit}
                className="bg-[#1D3F9A] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#132B6A] transition disabled:opacity-50"
            >
                {loading ? "Uploading..." : "Submit QnA"}
            </button>

        </div>
    );
}
