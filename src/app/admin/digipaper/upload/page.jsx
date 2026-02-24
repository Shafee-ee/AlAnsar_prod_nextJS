"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast"

export default function AdminDigiPaper() {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [publishDate, setPublishDate] = useState("");
    const [pdfFile, setPdfFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !slug || !publishDate || !pdfFile || !coverFile) {
            alert("Please fill all fields.");
            return;
        }

        try {
            setLoading(true);

            const issueRef = doc(db, "digipaper_issues", slug);
            const existing = await getDoc(issueRef);

            if (existing.exists()) {
                toast.error("Please fill all required fields.");
                setLoading(false);
                return;
            }

            // Upload PDF
            const pdfRef = ref(storage, `digipaper/${slug}/${pdfFile.name}`);
            await uploadBytes(pdfRef, pdfFile);
            const pdfUrl = await getDownloadURL(pdfRef);

            // Upload Cover
            const coverRef = ref(storage, `digipaper/${slug}/cover.webp`);
            await uploadBytes(coverRef, coverFile);
            const coverImageUrl = await getDownloadURL(coverRef);
            const dateObj = new Date(publishDate);

            console.log("Publish Date:", publishDate);
            console.log("Year being saved:", dateObj.getFullYear());

            if (isNaN(dateObj.getTime())) {
                toast.error("Invalid publish date.");
                setLoading(false);
                return;
            }

            await setDoc(issueRef, {
                title,
                slug,
                publishDate: dateObj,
                year: dateObj.getFullYear(),
                pdfUrl,
                coverImageUrl,
                status: "published",
                createdAt: serverTimestamp(),
            });

            toast.success("Issue published successfully.");

            setTitle("");
            setSlug("");
            setPublishDate("");
            setPdfFile(null);
            setCoverFile(null);

        } catch (err) {
            console.error(err);
            toast.error("Error uploading issue.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-xl mx-auto bg-white p-6 shadow rounded">
                <h1 className="text-2xl font-bold mb-6">Upload Digital Issue</h1>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text"
                        placeholder="Magazine Title"
                        className="w-full border p-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Slug (e.g. ramzan-2026)"
                        className="w-full border p-2"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                    />

                    <div>

                        <label className="block mb-1 text-sm">Publish Date</label>

                        <input
                            type="date"
                            className="w-full border p-2"
                            value={publishDate}
                            onChange={(e) => setPublishDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Upload PDF</label>
                        <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 cursor-pointer border border-gray-300 rounded">
                            <span className="text-sm text-gray-700">
                                {pdfFile ? pdfFile.name : "Choose PDF File"}
                            </span>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => setPdfFile(e.target.files[0])}
                            />
                        </label>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Upload Cover Image</label>
                        <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 cursor-pointer border border-gray-300 rounded">
                            <span className="text-sm text-gray-700">
                                {coverFile ? coverFile.name : "Choose Cover Image"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setCoverFile(e.target.files[0])}
                            />
                        </label>
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 hover:bg-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Uploading..." : "Publish Issue"}
                    </button>

                </form>
            </div>
        </div>
    );
}
