import { adminDB } from "@/lib/firebaseAdmin";
import { notFound } from "next/navigation";
import QnaShareButton from "@/components/QnaShareButton";

/* ---------- PAGE COMPONENT ---------- */
function cosine(a = [], b = []) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}






/* ---------- METADATA FUNCTION ---------- */
export async function generateMetadata({ params }) {
    const { id } = params;

    const doc = await adminDB.collection("qna_items").doc(id).get();
    const data = doc.data();

    if (!data) return {};

    const title = `${data.question_en} | Al Ansar Weekly`;
    const description = data.answer_en.slice(0, 155);

    const url = `https://www.alansarweekly.com/qna/${id}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: "Al Ansar Weekly",
            images: [
                {
                    url: `${url}/opengraph-image`,
                    width: 1200,
                    height: 630,
                },
            ],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${url}/opengraph-image`],
        },
    };
}


export default async function QnAPage({ params, searchParams }) {

    const { id } = await params;
    const sp = await searchParams;

    if (!id) notFound();

    const docRef = adminDB.collection("qna_items").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) notFound();

    const data = snap.data();

    const currentEmbedding = data.embedding || [];
    let relatedQuestions = [];

    if (currentEmbedding.length) {
        const allSnap = await adminDB.collection("qna_items").get();

        const scored = allSnap.docs
            .map(doc => {
                if (doc.id === id) return null;

                const item = doc.data();
                if (!item.embedding) return null;

                return {
                    id: doc.id,
                    question_en: item.question_en,
                    question_kn: item.question_kn,
                    score: cosine(currentEmbedding, item.embedding),
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        relatedQuestions = scored;
    }

    const fallbackImage = "/default-image/default-image-qna.jpg";
    const imageUrl = data.imageUrl || fallbackImage;

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
                            {!data.imageUrl ? (
                                <div className="w-full mb-8">
                                    <div className="relative w-full h-[280px] md:h-[380px] rounded-xl overflow-hidden shadow">

                                        {/* Background Image */}
                                        <img
                                            src={imageUrl}
                                            alt="Seek and Discover"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />

                                        {/* Dark overlay for readability */}
                                        <div className="absolute inset-0 " />

                                        {/* Text Content */}



                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                                            <h2 className="text-lg md:text-3xl font-semibold max-w-3xl leading-snug">
                                                Question
                                            </h2>
                                            <p className="text-lg md:text-2xl font-semibold max-w-3xl leading-snug">
                                                {question}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            ) : (
                                <div className="w-full mb-8">
                                    <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow">
                                        <img
                                            src={data.imageUrl}
                                            alt={question}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="mb-6 text-sm text-gray-600 border-l-4 border-blue-200 pl-4">
                        <p className="font-medium text-gray-800 mb-1">
                            Answer Source
                        </p>
                        <p>
                            These answers are sourced from Al Ansar Weekly’s archive. Some English
                            responses are translations of questions previously asked in the Keli
                            Nodi section.
                        </p>
                    </div>
                    <div className="text-base leading-relaxed text--800 text-lg whitespace-pre-line">
                        Answer:
                    </div>
                    <div className="text-base leading-relaxed text-blue-800 text-lg whitespace-pre-line">
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

                    {relatedQuestions.length > 0 && (
                        <div className="mt-16">
                            <h3 className="text-xl font-semibold mb-6">
                                {lang === "en" ? "Related Questions" : "ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳು"}
                            </h3>

                            <div className="overflow-x-auto">
                                <div className="flex gap-6 min-w-full pb-4">
                                    {relatedQuestions.map(item => {
                                        const qText =
                                            lang === "kn"
                                                ? item.question_kn
                                                : item.question_en;
                                        const fallbackImage = "/default-image/default-image-qna.jpg";
                                        const cardImage = item.imageUrl || fallbackImage;

                                        return (
                                            <a
                                                key={item.id}
                                                href={`/qna/${item.id}?lang=${lang}`}
                                                className="min-w-[300px] max-w-[300px] aspect-[1200/680] relative rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                                            >
                                                {/* Background Image */}
                                                <img
                                                    src={cardImage}
                                                    alt={qText}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />

                                                {/* Dark overlay */}
                                                <div className="absolute inset-0" />

                                                {/* Text */}
                                                <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                                                    <p className="text-white font-medium text-sm line-clamp-4">
                                                        {qText}
                                                    </p>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}




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
