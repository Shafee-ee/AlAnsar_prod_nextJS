"use client";

import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "next/link";

export default function EpaperViewer({ params }) {
    const { slug } = params;
    const [issue, setIssue] = useState(null);

    useEffect(() => {
        const fetchIssue = async () => {
            console.log("Slug param:", slug);
            const snap = await getDoc(doc(db, "digipaper_issues", slug));

            console.log("Document exists:", snap.exists());
            if (snap.exists()) {


                console.log("Document ID:", snap.id);
                console.log("Document data:", snap.data());
                const data = snap.data();

                if (data.status !== "published") {
                    return;
                }

                setIssue(data);
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

            <div className="w-full max-w-5xl px-4 py-10 space-y-4">

                <a
                    href={issue.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-blue-600 text-white py-4 rounded text-lg"
                >
                    Open PDF
                </a>



            </div>

        </div>
    );
}
