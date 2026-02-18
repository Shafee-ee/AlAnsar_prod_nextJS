"use client";
import { use } from "react";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import Image from "next/image";
import { db } from "@/lib/firebaseClient";
import Link from "next/link";



export default function EpaperViewer({ params }) {
    const { slug } = use(params);
    const [issue, setIssue] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchIssue = async () => {
            const snap = await getDoc(doc(db, "digipaper_issues", slug));
            if (snap.exists()) {
                setIssue(snap.data());
            }
        };

        fetchIssue();
    }, [slug]);

    if (!issue) return <div className="p-6">Loading...</div>;

    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        }/o/${encodeURIComponent(
            `${issue.basePath}/AlAnsarRamzan Special-${currentPage}.webp`
        )}?alt=media`;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">

            <div className="w-full max-w-4xl flex justify-between items-center px-4 py-4">
                <Link
                    href="/digipaper"
                    className="text-sm bg-gray-800 px-4 py-2 hover:bg-gray-700"
                >
                    ← Back to Editions
                </Link>

                <div className="text-sm opacity-70">
                    {currentPage} / {issue.totalPages}
                </div>
            </div>

            <div className="w-full max-w-4xl relative">
                <Image
                    src={imageUrl}
                    alt={`Page ${currentPage}`}
                    width={1600}
                    height={2200}
                    className="w-full h-auto"
                    priority
                />
            </div>

            <div className="flex items-center gap-6 py-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2 bg-gray-800 disabled:opacity-50"
                >
                    Prev
                </button>

                <button
                    disabled={currentPage === issue.totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 bg-gray-800 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );

}
