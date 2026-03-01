"use client";

import QnaShareButton from "@/components/QnaShareButton";

export default function QnaContent({ id, data, relatedQuestions, lang }) {


    const question = lang === "en" ? data.question_en : data.question_kn;
    const answer = lang === "en" ? data.answer_en : data.answer_kn;
    const editorNote =
        lang === "en" ? data.editor_note_en : data.editor_note_kn;

    const fallbackImage = "/default-image/default-image-qna.jpg";
    const hasImage = data.image_urls?.length > 0;
    const imageUrl = hasImage ? data.image_urls[0] : fallbackImage;
    const hasAttribution =
        Boolean(data.imam_name) ||
        Boolean(data.source_title) ||
        data.samputa !== null ||
        data.sanchike !== null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">

                    {/* IMAGE SECTION */}
                    <div className="w-full mb-8">
                        <div className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow">

                            <img
                                src={imageUrl}
                                alt={question}
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Dark overlay */}
                            <div className="absolute inset-0 bg-black/40" />

                            {/* Question overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                                <h2 className="text-lg md:text-3xl font-semibold max-w-3xl leading-snug">
                                    {lang === "en" ? "Question:" : "ಪ್ರಶ್ನೆ:"}
                                </h2>
                                <p className="text-lg md:text-2xl font-semibold max-w-3xl leading-snug">
                                    {question}
                                </p>
                            </div>

                        </div>
                    </div>



                    {/* FIqh Badge */}
                    <div className="mb-3">
                        <span className="inline-block border border-[#0B4C8C] text-[#0B4C8C] text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
                            Shafi‘i Fiqh
                        </span>
                    </div>

                    {/* ANSWER LABEL */}
                    <div className="text-base leading-relaxed text-gray-800 text-lg whitespace-pre-line">
                        Answer:
                    </div>

                    <div className="text-base leading-relaxed text-blue-800 text-lg whitespace-pre-line">
                        {answer}
                    </div>

                    {/* EDITOR NOTE */}
                    {editorNote && (
                        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-gray-700 whitespace-pre-line">
                            <div className="font-semibold text-yellow-800 mb-1">
                                Editor’s Note
                            </div>
                            {editorNote}
                        </div>
                    )}

                    {/* ANSWER SOURCE */}
                    <div className="mt-8 text-sm text-gray-600 border-l-4 border-green-200 pl-4">

                        <p className="font-medium text-gray-800 mb-2">
                            <span className="text-green-600">
                                {lang === "en" ? "Answer Source" : "ಉತ್ತರದ ಮೂಲ"}
                            </span>
                        </p>

                        {hasAttribution ? (
                            <>
                                {data.imam_name && (
                                    <p>
                                        {lang === "en" ? "Answered by: " : "ಉತ್ತರಿಸಿದವರು: "}
                                        <strong>{data.imam_name}</strong>
                                    </p>
                                )}

                                {data.source_title && (
                                    <p>
                                        {lang === "en" ? "Source: " : "ಮೂಲ: "}
                                        <strong>{data.source_title}</strong>
                                    </p>
                                )}

                                {(data.samputa !== null || data.sanchike !== null) && (
                                    <p>
                                        {data.samputa !== null && (
                                            <span>
                                                {lang === "en" ? "Samputa " : "ಸಂಪುಟ "}
                                                {data.samputa}
                                            </span>
                                        )}
                                        {data.samputa !== null && data.sanchike !== null && " · "}
                                        {data.sanchike !== null && (
                                            <span>
                                                {lang === "en" ? "Sanchike " : "ಸಂಚಿಕೆ "}
                                                {data.sanchike}
                                            </span>
                                        )}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                {lang === "en" ? (
                                    <>
                                        <p>
                                            The answers published on this platform are sourced from the official archives of Al Ansar Weekly, an Islamic weekly in continuous publication since 1991.
                                        </p>
                                        <p>
                                            These responses were originally issued in print under the editorial supervision of Tajul Fuqah Bekal Ibrahim Musliyar and S.P. Hamza Saqafi, and are now being presented in digital format to ensure wider accessibility while preserving their scholarly authenticity.
                                        </p>
                                        <p>
                                            Some English answers are translated from Keli Nodi section of Alansar Weekly.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            ಈ ವೆಬ್‌ಸೈಟ್‌ನಲ್ಲಿ ಪ್ರಕಟವಾಗುವ ಉತ್ತರಗಳು Al Ansar Weekly ಪತ್ರಿಕೆಯ ಅಧಿಕೃತ ಆರ್ಕೈವ್‌ಗಳಿಂದ ಸಂಗ್ರಹಿಸಲ್ಪಟ್ಟಿವೆ.
                                        </p>
                                        <p>
                                            ಮೂಲತಃ ಮುದ್ರಿತ ಆವೃತ್ತಿಯಲ್ಲಿ Tajul Fuqah Bekal Ibrahim Musliyar ಹಾಗೂ S.P. Hamza Saqafi ಅವರ ಸಂಪಾದಕೀಯ ಮೇಲ್ವಿಚಾರಣೆಯಡಿ ಪ್ರಕಟಗೊಂಡವು.
                                        </p>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* SHARE */}
                    <div className="mt-8 flex justify-center">
                        <QnaShareButton id={id} lang={lang} />
                    </div>

                    {/* RELATED */}
                    {relatedQuestions.length > 0 && (
                        <div className="mt-16">
                            <h3 className="text-xl text-gray-800 font-semibold mb-6">
                                {lang === "en" ? "Related Questions" : "ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳು"}
                            </h3>

                            <div className="overflow-x-auto">
                                <div className="flex gap-6 min-w-full pb-4">
                                    {relatedQuestions.map(item => {
                                        const qText =
                                            lang === "kn"
                                                ? item.question_kn
                                                : item.question_en;

                                        const cardImage =
                                            item.image_urls?.length > 0
                                                ? item.image_urls[0]
                                                : fallbackImage;

                                        return (
                                            <a
                                                key={item.id}
                                                href={`/qna/${item.id}?lang=${lang}`}
                                                className="min-w-[300px] max-w-[300px] aspect-[1200/680] relative rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                                            >
                                                <img
                                                    src={cardImage}
                                                    alt={qText}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />

                                                <div className="absolute inset-0 bg-black/40" />

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

                    {/* KELI NODI CTA */}

                    {/* KELI NODI CTA */}
                    <div className="mt-10 pt-6 border-t">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center">
                            <p className="font-semibold text-indigo-900 mb-2">
                                {lang === "en"
                                    ? "Have any Islamic question?"
                                    : "ನಿಮಗೆ ಯಾವುದೇ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಯಿದೆಯೇ?"}
                            </p>

                            <p className="text-sm text-indigo-700 mb-4">
                                {lang === "en"
                                    ? "Ask instantly through KELI NODI."
                                    : "ಕೆಳಿ ನೋಡಿ ಮೂಲಕ ತಕ್ಷಣ ಕೇಳಿ."}
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