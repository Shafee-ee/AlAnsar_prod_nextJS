"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "next/link";

export default function EpaperViewer({ params }) {
    const { slug } = use(params);
    const [issue, setIssue] = useState(null);

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

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">

            <div className="w-full max-w-5xl flex justify-between items-center px-4 py-4">
                <Link
                    href="/digipaper"
                    className="text-sm bg-blue-800 px-4 py-2 hover:bg-gray-700"
                >
                    ← Back
                </Link>
            </div>

            <div className="w-full max-w-5xl h-[90vh]">
                <iframe
                    src={issue.pdfUrl}
                    className="w-full h-full"
                />
            </div>

        </div>
    );
}
