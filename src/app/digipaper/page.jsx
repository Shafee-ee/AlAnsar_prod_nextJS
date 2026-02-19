import { adminDB } from "@/lib/firebaseAdmin"; // adjust path if needed

import Link from "next/link";

export default async function DigiPaperListing() {
    const snapshot = await adminDB
        .collection("digipaper_issues")
        .where("status", "==", "published")
        .orderBy("publishDate", "desc")
        .get();

    const issues = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
                {issues.map((issue) => (
                    <Link
                        key={issue.id}
                        href={`/digipaper/${issue.slug}`}
                        className="bg-white shadow hover:shadow-lg transition"
                    >
                        <div className="p-4">
                            <img
                                src={issue.coverImageUrl}
                                alt={issue.title}
                                className="w-full h-auto"
                            />
                            <h3 className="mt-3 font-semibold text-gray-800 text-center">
                                {issue.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
