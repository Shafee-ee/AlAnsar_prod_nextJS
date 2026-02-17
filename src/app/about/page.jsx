// src/app/about/page.jsx
import Image from "next/image";

export default async function AboutPage({ searchParams }) {

    const params = await searchParams;
    const lang =
        params?.lang === "en" || params?.lang === "kn"
            ? params.lang
            : "en";

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
            <div className="max-w-5xl mx-auto space-y-20">

                <LegacyHeader lang={lang} />

                {lang === "en" ? <EnglishContent /> : <KannadaContent />}

            </div>
        </div>
    );
}


/* ============================
   LEGACY HEADER
============================ */

function LegacyHeader({ lang }) {

    const isKannada = lang === "kn";

    return (
        <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1D3F9A]">
                {isKannada ? "ನಮ್ಮ ಪರಂಪರೆ" : "Our Legacy"}
            </h1>

            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed text-lg">
                {isKannada
                    ? "ಅಲ್ ಅನ್ಸಾರ್ ಮಹಾನ್ ಪಂಡಿತರು, ದೂರದೃಷ್ಟಿಯ ನಾಯಕರು ಮತ್ತು ಮೌನ ಸೇವಕರಿಂದ ನಿರ್ಮಿತವಾದ ದೃಢವಾದ ಅಡಿಪಾಯದ ಮೇಲೆ ನಿಂತಿದೆ. ಅವರು ಅಹ್ಲುಸ್ಸುನ್ನತ್‌ನ ಏಕತೆಯನ್ನು ಕಾಪಾಡಿ, ನಿಖರವಾದ ಜ್ಞಾನವನ್ನು ಹರಡುವ ಕಾರ್ಯದಲ್ಲಿ ತಮ್ಮ ಜೀವನವನ್ನು ಸಮರ್ಪಿಸಿದರು. ಅವರ ಸೇವಾ ಪರಂಪರೆ ಇಂದಿಗೂ ನಮ್ಮ ದಾರಿಯನ್ನು ಬೆಳಗಿಸುತ್ತದೆ."
                    : "Al Ansar stands upon a foundation built by great scholars, visionary leaders, and silent contributors who safeguarded authentic knowledge and upheld the unity of Ahlus Sunnah. Their dedication continues to guide our mission today."
                }
            </p>

            <div className="w-24 h-1 bg-[#1D3F9A] mx-auto rounded-full"></div>
        </div>
    );
}

/* ============================
   ENGLISH CONTENT
============================ */

function EnglishContent() {
    return (
        <>
            <AboutSection
                name="Tajul Ulama Sheikhuna Assayyid Abdurrahman Al Bukhari"
                meta="1341–1435 AH | Widely known as ‘Ullal Thangal’"
                image="/legacy/tajul-ulama.jpeg"
            >
                <p>
                    A preeminent scholar of the contemporary Muslim world
                    and legendary leader of Ahlus Sunnah, Sheikhuna lived
                    a blessed life of 95 years dedicated entirely to Islam.
                </p>

                <p>
                    He belonged to the prestigious Bukhari family,
                    tracing lineage to Sayyid Ahmad Jalaluddin Thangal,
                    who brought the Prophetic family tradition to South India.
                </p>

                <p>
                    After studying under renowned scholars including
                    Kanniyat Ahmed Musliyar, he graduated first rank as
                    ‘Baqavi’ (MFB) from Bakiyat, Vellore.
                </p>

                <p>
                    Arriving in Ullal in 1951, he served as Mudarris
                    for 20 years, became Principal in 1972, accepted
                    the role of Qazi in 1978, and later served as
                    President of Samastha from 1989 onward.
                </p>
            </AboutSection>


            <AboutSection
                name="Tajul Fuqaha Bekal Ustad"
                meta="1949–2020 | Chief Editor of Al Ansar (26 Years)"
                image="/legacy/bekal-ustad.jpeg"
            >
                <p>
                    Born as P.M. Ibrahim in 1949, Bekal Ustad
                    served as a teacher at Bekal Juma Masjid for
                    40 years and later became Principal of
                    Jamia Sa-adiya Sharia College.
                </p>

                <p>
                    He led Al Ansar as Chief Editor for 26 years,
                    personally handling the respected “Keli Nodi”
                    Q&A column.
                </p>

                <p>
                    He was the first Beary-speaking Shafi’i scholar
                    to hold the high office of Qazi,
                    overseeing more than 150 localities.
                </p>
            </AboutSection>


            <AboutSection
                name="Tajul Umara Ibrahim Bava Haji"
                meta="Founder of Al Ansar (1991)"
                image="/legacy/bava-haji.jpeg"
            >
                <p>
                    A BSc graduate and committed social worker,
                    Ibrahim Bava Haji founded Al Ansar in 1991
                    during a time when authentic Sunni publications
                    were scarce.
                </p>

                <p>
                    He personally reviewed every article before
                    publication, ensuring doctrinal integrity
                    and preventing social discord.
                </p>

                <p>
                    His vigilance preserved unity and ensured
                    that Al Ansar remained a trusted source
                    of correct guidance.
                </p>
            </AboutSection>


            <AboutSection
                name="Unni Haji"
                meta="The Silent Backbone of Al Ansar"
            >
                <p>
                    The continued survival of Al Ansar was made
                    possible by the unwavering support of Unni Haji,
                    the brother-in-law and closest companion of
                    Ibrahim Bava Haji.
                </p>

                <p>
                    Though never officially listed, he handled
                    fundraising and resolved operational challenges
                    during times of financial hardship.
                </p>

                <p>
                    He believed that as long as the magazine survived,
                    the mission was fulfilled — placing purpose above recognition.
                </p>
            </AboutSection>
        </>
    );
}

function KannadaContent() {
    return (
        <>
            <AboutSection
                name="ತಾಜುಲ್ ಉಲಮಾ ಶೈಖುನಾ ಅಸ್ಸಯ್ಯಿದ್ ಅಬ್ದುರ್ರಹ್ಮಾನ್ ಅಲ್ ಬುಖಾರಿ"
                meta="ಹಿಜ್ರಿ 1341–1435 | ‘ಉಳ್ಳಾಲ್ ತಂಗಳ್’ ಎಂದು ಪ್ರಸಿದ್ಧ"
                image="/legacy/tajul-ulama.jpeg"
            >
                <p>
                    ಸಮಕಾಲೀನ ಮುಸ್ಲಿಂ ಲೋಕದ ಪ್ರಖ್ಯಾತ ಪಂಡಿತರಾಗಿದ್ದು,
                    ಅಹ್ಲುಸ್ಸುನ್ನತ್‌ನ ಮಹಾನ್ ನಾಯಕರಾಗಿ 95 ವರ್ಷಗಳ ಕಾಲ
                    ಇಸ್ಲಾಮಿನ ಸೇವೆಗೆ ತಮ್ಮ ಜೀವನವನ್ನು ಅರ್ಪಿಸಿದರು.
                </p>

                <p>
                    ಅವರು ಪ್ರಸಿದ್ಧ ಬುಖಾರಿ ವಂಶಕ್ಕೆ ಸೇರಿದವರು.
                    ಸಯ್ಯಿದ್ ಅಹ್ಮದ್ ಜಲಾಲುದ್ದೀನ್ ತಂಗಳ್ ಅವರ ಮೂಲಕ
                    ದಕ್ಷಿಣ ಭಾರತಕ್ಕೆ ಪ್ರವಾದಿ ವಂಶ ಪರಂಪರೆ ಬಂದಿತು.
                </p>

                <p>
                    ಕನ್ನಡಿಯತ್ ಅಹ್ಮದ್ ಮುಸ್ಲಿಯಾರ್ ಸೇರಿದಂತೆ ಮಹಾನ್ ಪಂಡಿತರ
                    ಅಧೀನದಲ್ಲಿ ವಿದ್ಯಾಭ್ಯಾಸ ಮಾಡಿ, ವೆಲ್ಲೂರಿನ ಬಾಕಿಯಾತ್
                    ಸಂಸ್ಥೆಯಿಂದ ‘ಬಾಖವಿ’ (MFB) ಪದವಿಯಲ್ಲಿ ಪ್ರಥಮ ರ್ಯಾಂಕ್ ಪಡೆದರು.
                </p>

                <p>
                    1951ರಲ್ಲಿ ಉಳ್ಳಾಲಿಗೆ ಆಗಮಿಸಿ 20 ವರ್ಷಗಳ ಕಾಲ ಮುದರ್ರಿಸ್ ಆಗಿ
                    ಸೇವೆ ಸಲ್ಲಿಸಿದರು. 1972ರಲ್ಲಿ ಪ್ರಾಂಶುಪಾಲರಾದರು,
                    1978ರಲ್ಲಿ ಖಾಜಿ ಸ್ಥಾನವನ್ನು ಸ್ವೀಕರಿಸಿದರು.
                    1989ರಿಂದ ಸಮಸ್ತದ ಅಧ್ಯಕ್ಷರಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಿದರು.
                </p>
            </AboutSection>


            <AboutSection
                name="ತಾಜುಲ್ ಫುಖಹಾ ಬೆಕಲ್ ಉಸ್ತಾದ್"
                meta="1949–2020 | ಅಲ್ ಅನ್ಸಾರ್ ಮುಖ್ಯ ಸಂಪಾದಕರು (26 ವರ್ಷ)"
                image="/legacy/bekal-ustad.jpeg"
            >
                <p>
                    1949ರಲ್ಲಿ ಪಿ.ಎಂ. ಇಬ್ರಾಹಿಂ ಎಂಬ ಹೆಸರಿನಲ್ಲಿ ಜನಿಸಿದ ಅವರು,
                    ಬೆಕಲ್ ಜುಮಾ ಮಸೀದಿಯಲ್ಲಿ 40 ವರ್ಷಗಳ ಕಾಲ ಗುರುಗಳಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಿದರು.
                    ನಂತರ ಜಾಮಿಯಾ ಸಾದಿಯಾ ಶರಿಯಾ ಕಾಲೇಜಿನ ಪ್ರಾಂಶುಪಾಲರಾದರು.
                </p>

                <p>
                    26 ವರ್ಷಗಳ ಕಾಲ ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆಯ ಮುಖ್ಯ ಸಂಪಾದಕರಾಗಿ
                    ಕಾರ್ಯನಿರ್ವಹಿಸಿ “ಕೆಳಿ ನೋಡಿ” ಪ್ರಶ್ನೋತ್ತರ ವಿಭಾಗವನ್ನು
                    ಸ್ವತಃ ನಿರ್ವಹಿಸಿದರು.
                </p>

                <p>
                    150ಕ್ಕೂ ಹೆಚ್ಚು ಪ್ರದೇಶಗಳ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತಿದ್ದ
                    ಮೊದಲ ಬೀಯರಿ ಭಾಷಿಕ ಶಾಫಿಈ ಖಾಜಿಯಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಿದರು.
                </p>
            </AboutSection>


            <AboutSection
                name="ತಾಜುಲ್ ಉಮರಾ ಇಬ್ರಾಹಿಂ ಬಾವಾ ಹಾಜಿ"
                meta="ಅಲ್ ಅನ್ಸಾರ್ ಸ್ಥಾಪಕರು (1991)"
                image="/legacy/bava-haji.jpeg"
            >
                <p>
                    ಬಿಎಸ್ಸಿ ಪದವೀಧರ ಮತ್ತು ಸಮರ್ಪಿತ ಸಮಾಜಸೇವಕರಾದ ಇಬ್ರಾಹಿಂ ಬಾವಾ ಹಾಜಿ,
                    1991ರಲ್ಲಿ ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆಯನ್ನು ಸ್ಥಾಪಿಸಿದರು.
                </p>

                <p>
                    ಸುನ್ನಿ ಸಿದ್ಧಾಂತಕ್ಕೆ ವಿರುದ್ಧವಾದ ಪ್ರಕಟಣೆಗಳು ಹರಡುತ್ತಿದ್ದ ಸಮಯದಲ್ಲಿ,
                    ಸರಿಯಾದ ಮಾಹಿತಿಯನ್ನು ನೀಡುವ ಪರ್ಯಾಯವಾಗಿ ಈ ಪತ್ರಿಕೆಯನ್ನು ಆರಂಭಿಸಿದರು.
                </p>

                <p>
                    ಪ್ರತಿಯೊಂದು ಲೇಖನವನ್ನು ಸ್ವತಃ ಪರಿಶೀಲಿಸಿ,
                    ಸಮಾಜದಲ್ಲಿ ಭಿನ್ನಾಭಿಪ್ರಾಯ ಉಂಟುಮಾಡುವ ವಿಷಯಗಳನ್ನು ತಕ್ಷಣವೇ ರದ್ದುಪಡಿಸುತ್ತಿದ್ದರು.
                </p>
            </AboutSection>


            <AboutSection
                name="ಉನ್ನಿ ಹಾಜಿ"
                meta="ಅಲ್ ಅನ್ಸಾರ್‌ನ ನಿಶ್ಶಬ್ದ ಬೆನ್ನೆಲುಬು"
            >
                <p>
                    ಇಬ್ರಾಹಿಂ ಬಾವಾ ಹಾಜಿಯವರ ಆಪ್ತ ಸ್ನೇಹಿತ ಹಾಗೂ ಮಾವನಾಗಿ,
                    ಅಲ್ ಅನ್ಸಾರ್ ಮುಂದುವರಿಯಲು ಪ್ರಮುಖ ಬೆಂಬಲ ನೀಡಿದವರು ಉನ್ನಿ ಹಾಜಿ.
                </p>

                <p>
                    ಆರ್ಥಿಕ ಸಂಕಷ್ಟಗಳ ಸಂದರ್ಭದಲ್ಲಿ ನಿಧಿ ಸಂಗ್ರಹಿಸಿ,
                    ಕಚೇರಿಯ ದೈನಂದಿನ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುತ್ತಿದ್ದರು.
                </p>

                <p>
                    ತಮ್ಮ ಹೆಸರಿಗಿಂತ ಪತ್ರಿಕೆಯ ಉಳಿವು ಮುಖ್ಯವೆಂದು ನಂಬಿ,
                    ಮಿಷನ್‌ಗಾಗಿ ಮೌನವಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಿದರು.
                </p>
            </AboutSection>
        </>
    );
}


/* ============================
   REUSABLE SECTION
============================ */

function AboutSection({ name, meta, image, children }) {
    return (
        <div className="bg-white hover:shadow-xl shadow-sm rounded-2xl border border-gray-100 p-10">

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

                <div className="relative w-48 h-56 flex-shrink-0">

                    {image && (
                        <div className="relative w-48 h-56 flex-shrink-0">
                            <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-cover rounded-xl shadow-md"
                            />
                        </div>)}
                </div>

                <div className="flex-1">

                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#1D3F9A] leading-snug">
                            {name}
                        </h2>
                        <p className="text-blue-500 mt-2 text-sm tracking-wide">
                            {meta}
                        </p>
                    </div>

                    <div className="border-l-4 border-[#1D3F9A]/70 pl-6 space-y-4 text-gray-700 leading-relaxed text-[15px]">
                        {children}
                    </div>

                </div>

            </div>

        </div>
    );
}
