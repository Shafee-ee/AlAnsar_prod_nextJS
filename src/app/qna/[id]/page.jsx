import { adminDB } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import QnaShareButton from "@/components/QnaShareButton";


/* ---------- METADATA FUNCTION ---------- */
export async function generateMetadata(props) {

    const params = await props.params;
    const { id } = params;

    const docRef = adminDB.collection("qna_items").doc(id);
    const snap = await docRef.get();
    const data = snap.data();


    if (!snap.exists) {
        return {};
    }


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
export default async function QnAPage({ params, searchParams }) {

    const { id } = await params;
    const sp = await searchParams;

    if (!id) notFound();

    const docRef = adminDB.collection("qna_items").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) notFound();

    const data = snap.data();


    const defaultImages = [
        "/default-image/default-qna1.jpg",
        "/default-image/default-qna2.jpg",
        "/default-image/default-qna3.jpg",
    ];

    const randomDefault =
        defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const imageUrl = data.imageUrl || randomDefault;

    const lang =
        sp?.lang === "en" || sp?.lang === "kn"
            ? sp.lang
            : data.lang_original || "kn";

    const question = lang === "en" ? data.question_en : data.question_kn;
    const answer = lang === "en" ? data.answer_en : data.answer_kn;
    const editorNote =
        lang === "en" ? data.editor_note_en : data.editor_note_kn;


    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
                    <div className="w-full mb-8">
                        <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow">
                            <img
                                src={imageUrl}
                                alt={question}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="mb-6 text-sm text-gray-600 border-l-4 border-blue-200 pl-4">
                        <p className="font-medium text-gray-800 mb-1">
                            Archive Source
                        </p>
                        <p>
                            These answers are sourced from Al Ansar Weekly’s archive. Some English
                            responses are translations of questions previously asked in the Keli
                            Nodi section.
                        </p>
                    </div>
                    <h1 className="text-2xl font-semibold mb-6 leading-snug text-gray-900">
                        {question}
                    </h1>

                    <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                        {answer}
                    </div>

                    {editorNote && (
                        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-gray-700 whitespace-pre-line">
                            <div className="font-semibold text-yellow-800 mb-1">
                                Editor’s Note
                            </div>
                            {editorNote}
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <QnaShareButton id={id} lang={lang} />
                    </div>


                    <div className="mt-10 pt-6 border-t">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
                            <p className="font-semibold text-indigo-900 mb-2">
                                {lang === "en"
                                    ? "Have any Islamic question?"
                                    : "ನಿಮಗೆ ಯಾವುದೇ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಯಿದೆಯೇ?"
                                }
                            </p>

                            <p className="text-sm text-indigo-700 mb-4">
                                {lang === "en"
                                    ? "Ask instantly through KELI NODI."
                                    : "ಕೆಳಿ ನೋಡಿ ಮೂಲಕ ತಕ್ಷಣ ಕೇಳಿ."
                                }
                            </p>

                            <a
                                href={`/?lang=${lang}`}
                                className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
                            >
                                {lang === "en" ? "Ask Now" : "ಈಗ ಕೇಳಿ"}
                            </a>
                        </div>

                    </div>

                </div>
            </div>
        </div>

    );
}
