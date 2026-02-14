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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">

                    <h1 className="text-2xl font-semibold mb-6 leading-snug text-gray-900">
                        {data.question_en}
                    </h1>

                    <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                        {data.answer_en}
                    </div>

                    <div className="mt-10 pt-6 border-t">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
                            <p className="font-semibold text-indigo-900 mb-2">
                                Have any Islamic question?
                            </p>
                            <p className="text-sm text-indigo-700 mb-4">
                                Ask instantly through Keli Nodi.
                            </p>
                            <a
                                href="/"
                                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
                            >
                                Ask Now
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>

    );
}
