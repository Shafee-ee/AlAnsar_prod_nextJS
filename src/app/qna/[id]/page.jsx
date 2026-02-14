import { adminDB } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";

/* ---------- METADATA FUNCTION ---------- */
export async function generateMetadata({ params }) {
    const { id } = await params;

    const docRef = adminDB.collection("qna_items").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
        return {};
    }

    const data = snap.data();

    return {
        title: data.question_en,
        description: data.answer_en.slice(0, 200),
        openGraph: {
            title: data.question_en,
            description: data.answer_en.slice(0, 200),
            url: `https://alansarweekly.com/qna/${id}`,
            siteName: "Al Ansar Weekly",
            images: [
                {
                    url: "https://alansarweekly.com/og-image.png",
                    width: 1200,
                    height: 630,
                },
            ],
            type: "article",
        },
    };
}

/* ---------- PAGE COMPONENT ---------- */
export default async function QnAPage({ params }) {
    const { id } = await params;

    if (!id) notFound();

    const docRef = adminDB.collection("qna_items").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) notFound();

    const data = snap.data();

    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-2xl font-semibold mb-6 leading-snug">
                {data.question_en}
            </h1>

            <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                {data.answer_en}
            </div>

            <div className="mt-12 border-t pt-6 text-sm text-gray-500">
                <p>Shared from Al Ansar Weekly</p>
                <a
                    href="/"
                    className="text-blue-600 hover:underline"
                >
                    Visit Website
                </a>
            </div>
        </div>
    );
}
