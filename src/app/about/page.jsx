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
                name="Tajul Ulama: Sheikhuna Assayyid Abdurrahman Al Bukhari"
                meta="1341–1435 AH"
                image="/legacy/tajul-ulama.jpeg"
            >
                <p>
                    Sheikhuna Tajul Ulama was a preeminent scholar of the contemporary Muslim world and a legendary leader of the Ahlus Sunnah. He was a member of the Prophet's family who lived a blessed life, passing away at the age of 95. Throughout his life, he was popularly known as "Ullal Thangal".
                </p>

                <p>
                    <strong>Heritage:</strong> He belonged to the prestigious Bukhari family, which traces its lineage to Sayyid Ahmad Jalaluddin Thangal, who brought the Prophetic family tradition to South India from Russia six centuries ago.
                </p>

                <p>
                    <strong>Education:</strong> After studying under giants like Kanniyat Ahmed Musliyar, he graduated with the first rank as a 'Baqavi' (MFB) from the renowned Bakiyat institution in Vellore.
                </p>

                <p>
                    <strong>Service:</strong> He arrived in Ullal in 1951. He served as a teacher (Mudarris) for 20 years and became the Principal of the Arabic College in 1972.
                </p>

                <p>
                    <strong>Leadership:</strong> In 1978, he accepted the position of Qazi. He eventually served as the President of Samastha (the official Ulema organization) from 1989. He was globally recognized, visiting countries like Saudi Arabia, Egypt, and Iraq.
                </p>
            </AboutSection>


            <AboutSection
                name="Tajul Fuqaha: Bekal Ustad"
                meta="1949–2020"
                image="/legacy/bekal-ustad.jpeg"
            >
                <p>
                    Born in 1949 as P.M. Ibrahim in the village of Poodal, Bekal Ustad was a scholar of immense depth who served the community for decades.
                </p>

                <p>
                    <strong>Career:</strong> He served as a teacher at the Bekal Juma Masjid for 40 years, which is how he became known as "Bekal Ustad". He later became the Principal of the Jamia Sa-adiya Sharia College.
                </p>

                <p>
                    <strong>Editor of Al Ansar:</strong> He served as the Chief Editor of the Al Ansar magazine for 26 years.
                </p>

                <p>
                    <strong>Guidance:</strong> He personally managed the "Keli Nodi" (Ask and See) Q&A column, providing highly valued and accurate religious answers to the community.
                </p>

                <p>
                    <strong>Qazi Position:</strong> He was the first Beary-speaking Shafi'i scholar to hold the high position of Qazi, overseeing over 150 localities.
                </p>
            </AboutSection>


            <AboutSection
                name="Tajul Umara: Ibrahim Bava Haji"
                meta="Founder of Al Ansar (1991)"
                image="/legacy/bava-haji.jpeg"
            >
                <p>
                    Ibrahim Bava Haji was a BSc graduate and a dedicated social worker who served as the President of several institutions, including the Zeenat Baksh Yatimkhana.
                </p>

                <p>
                    <strong>Founding Al Ansar:</strong> In 1991, he founded the Al Ansar magazine.
                </p>

                <p>
                    <strong>Doctrinal Integrity:</strong> At a time when non-Sunni publications were circulating, people were often told not to read them, but there was no alternative providing correct information. Ibrahim Bava Haji filled this gap by providing Al Ansar as a source of accurate information aligned with the Sunni creed.
                </p>

                <p>
                    <strong>Vigilance:</strong> He personally reviewed every article and letter before publication. If he found any content that could lead to social unrest or deviate from the right path, he would cancel it immediately. This care ensured that the magazine never caused conflict within the community.
                </p>
            </AboutSection>


            <AboutSection
                name="Unni Haji: The Backbone of Al Ansar"
                meta=""
                image="/legacy/unni-haji.jpeg"
            >
                <p>
                    The success of Al Ansar was made possible by the selfless support of Unni Haji, the brother-in-law of Ibrahim Bava Haji. The two were best friends who had married each other’s sisters, creating a bond of immense trust.
                </p>

                <p>
                    <strong>Sacrifice:</strong> When Bava Haji faced financial constraints and struggles in maintaining the magazine, Unni Haji stood by him.
                </p>

                <p>
                    <strong>Silent Partner:</strong> Although his name was never officially listed as an editor or manager, he took the responsibility of raising funds and solving the daily operational problems of the office.
                </p>

                <p>
                    <strong>Legacy of Friendship:</strong> He prioritized his friend’s dream over his own fame, believing that as long as the magazine survived, his mission was a success. Both friends remained united in this mission until the end of their lives.
                </p>
            </AboutSection>
        </>
    );
}


function KannadaContent() {
    return (
        <>
            <AboutSection
                name="ತಾಜುಲ್ ಉಲಮಾ: ಶೈಖುನಾ ಅಸ್ಸಯ್ಯಿದ್ ಅಬ್ದುರ್ರಹ್ಮಾನ್ ಅಲ್ ಬುಖಾರಿ"
                meta="1341–1435 ಹಿಜ್ರಿ"
                image="/legacy/tajul-ulama.jpeg"
            >
                <p>
                    ಶೈಖುನಾ ತಾಜುಲ್ ಉಲಮಾ ಸಮಕಾಲೀನ ಮುಸ್ಲಿಂ ಲೋಕದ ಪ್ರಮುಖ ಪಂಡಿತರಾಗಿದ್ದು, ಅಹ್ಲುಸ್ಸುನ್ನತ್‌ನ ದಂತಕಥೆಯಂತಹ ನಾಯಕರಾಗಿದ್ದರು. ಅವರು ಪ್ರವಾದಿ ಕುಟುಂಬದ ಸದಸ್ಯರಾಗಿದ್ದು, 95 ವರ್ಷದ ಆಶೀರ್ವಾದಿತ ಜೀವನವನ್ನು ನಡೆಸಿ ಇಹಲೋಕ ತ್ಯಜಿಸಿದರು. ತಮ್ಮ ಜೀವನಕಾಲದಲ್ಲಿ ಅವರು “ಉಳ್ಳಾಲ್ ತಂಗಳ್” ಎಂದು ಪ್ರಸಿದ್ಧರಾಗಿದ್ದರು.
                </p>

                <p>
                    <strong>ವಂಶಪಾರಂಪರ್ಯ:</strong> ಅವರು ಪ್ರಸಿದ್ಧ ಬುಖಾರಿ ಕುಟುಂಬಕ್ಕೆ ಸೇರಿದವರು. ಈ ವಂಶವು ಸಯ್ಯಿದ್ ಅಹ್ಮದ್ ಜಲಾಲುದ್ದೀನ್ ತಂಗಳ್ ಅವರ ಮೂಲಕ ಆರು ಶತಮಾನಗಳ ಹಿಂದೆ ರಷ್ಯಾದಿಂದ ದಕ್ಷಿಣ ಭಾರತಕ್ಕೆ ಪ್ರವಾದಿ ವಂಶ ಪರಂಪರೆಯನ್ನು ತಂದಿತು.
                </p>

                <p>
                    <strong>ಶಿಕ್ಷಣ:</strong> ಕನ್ನಡಿಯತ್ ಅಹ್ಮದ್ ಮುಸ್ಲಿಯಾರ್ ಮೊದಲಾದ ಮಹಾನ್ ಪಂಡಿತರ ಅಧೀನದಲ್ಲಿ ವಿದ್ಯಾಭ್ಯಾಸ ಮಾಡಿ, ವೆಲ್ಲೂರಿನ ಪ್ರಸಿದ್ಧ ಬಾಕಿಯಾತ್ ಸಂಸ್ಥೆಯಿಂದ ‘ಬಾಖವಿ’ (MFB) ಪದವಿಯಲ್ಲಿ ಪ್ರಥಮ ಸ್ಥಾನದಲ್ಲಿ ಪದವಿ ಪಡೆದರು.
                </p>

                <p>
                    <strong>ಸೇವೆ:</strong> 1951ರಲ್ಲಿ ಉಳ್ಳಾಲಿಗೆ ಆಗಮಿಸಿ, 20 ವರ್ಷಗಳ ಕಾಲ ಮುದರ್ರಿಸ್ ಆಗಿ ಸೇವೆ ಸಲ್ಲಿಸಿದರು. 1972ರಲ್ಲಿ ಅರಬಿಕ್ ಕಾಲೇಜಿನ ಪ್ರಾಂಶುಪಾಲರಾದರು.
                </p>

                <p>
                    <strong>ನಾಯಕತ್ವ:</strong> 1978ರಲ್ಲಿ ಖಾಜಿ ಸ್ಥಾನವನ್ನು ಸ್ವೀಕರಿಸಿದರು. 1989ರಿಂದ ಸಮಸ್ತ (ಅಧಿಕೃತ ಉಲಮಾ ಸಂಘಟನೆ) ಅಧ್ಯಕ್ಷರಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಿದರು. ಸೌದಿ ಅರೇಬಿಯಾ, ಈಜಿಪ್ಟ್ ಮತ್ತು ಇರಾಕ್ ಮುಂತಾದ ದೇಶಗಳಿಗೆ ಭೇಟಿ ನೀಡಿ ಜಾಗತಿಕವಾಗಿ ಗುರುತಿಸಿಕೊಂಡಿದ್ದರು.
                </p>
            </AboutSection>


            <AboutSection
                name="ತಾಜುಲ್ ಫುಖಹಾ: ಬೆಕಲ್ ಉಸ್ತಾದ್"
                meta="1949–2020"
                image="/legacy/bekal-ustad.jpeg"
            >
                <p>
                    1949ರಲ್ಲಿ ಪೂಡಲ್ ಗ್ರಾಮದಲ್ಲಿ ಪಿ.ಎಂ. ಇಬ್ರಾಹಿಂ ಎಂಬ ಹೆಸರಿನಲ್ಲಿ ಜನಿಸಿದ ಬೆಕಲ್ ಉಸ್ತಾದ್, ದಶಕಗಳ ಕಾಲ ಸಮುದಾಯಕ್ಕೆ ಸೇವೆ ಸಲ್ಲಿಸಿದ ಆಳವಾದ ಜ್ಞಾನ ಹೊಂದಿದ ಪಂಡಿತರಾಗಿದ್ದರು.
                </p>

                <p>
                    <strong>ವೃತ್ತಿ:</strong> 40 ವರ್ಷಗಳ ಕಾಲ ಬೆಕಲ್ ಜುಮಾ ಮಸೀದಿಯಲ್ಲಿ ಗುರುಗಳಾಗಿ ಸೇವೆ ಸಲ್ಲಿಸಿದರು. ಇದೇ ಕಾರಣದಿಂದ ಅವರು “ಬೆಕಲ್ ಉಸ್ತಾದ್” ಎಂದು ಪ್ರಸಿದ್ಧರಾದರು. ನಂತರ ಜಾಮಿಯಾ ಸಾದಿಯಾ ಶರಿಯಾ ಕಾಲೇಜಿನ ಪ್ರಾಂಶುಪಾಲರಾದರು.
                </p>

                <p>
                    <strong>ಅಲ್ ಅನ್ಸಾರ್ ಸಂಪಾದಕ:</strong> 26 ವರ್ಷಗಳ ಕಾಲ ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆಯ ಮುಖ್ಯ ಸಂಪಾದಕರಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿದರು.
                </p>

                <p>
                    <strong>ಮಾರ್ಗದರ್ಶನ:</strong> “ಕೆಳಿ ನೋಡಿ” ಪ್ರಶ್ನೋತ್ತರ ವಿಭಾಗವನ್ನು ಸ್ವತಃ ನಿರ್ವಹಿಸಿ, ಸಮುದಾಯಕ್ಕೆ ಅತ್ಯಂತ ಮೌಲ್ಯಯುತ ಮತ್ತು ನಿಖರ ಧಾರ್ಮಿಕ ಉತ್ತರಗಳನ್ನು ನೀಡಿದರು.
                </p>

                <p>
                    <strong>ಖಾಜಿ ಸ್ಥಾನ:</strong> 150ಕ್ಕೂ ಹೆಚ್ಚು ಪ್ರದೇಶಗಳ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡುತ್ತಿದ್ದ, ಉನ್ನತ ಖಾಜಿ ಸ್ಥಾನವನ್ನು ಅಲಂಕರಿಸಿದ ಮೊದಲ ಬೀಯರಿ ಭಾಷಿಕ ಶಾಫಿಈ ಪಂಡಿತರಾಗಿದ್ದರು.
                </p>
            </AboutSection>


            <AboutSection
                name="ತಾಜುಲ್ ಉಮರಾ: ಇಬ್ರಾಹಿಂ ಬಾವಾ ಹಾಜಿ"
                meta="ಅಲ್ ಅನ್ಸಾರ್ ಸ್ಥಾಪಕರು (1991)"
                image="/legacy/bava-haji.jpeg"
            >
                <p>
                    ಇಬ್ರಾಹಿಂ ಬಾವಾ ಹಾಜಿ ಬಿಎಸ್ಸಿ ಪದವೀಧರರಾಗಿದ್ದು, ಸಮರ್ಪಿತ ಸಮಾಜಸೇವಕರಾಗಿದ್ದರು. ಅವರು ಜೀನತ್ ಬಕ್ಶ್ ಯತೀಂಖಾನಾ ಸೇರಿದಂತೆ ಹಲವಾರು ಸಂಸ್ಥೆಗಳ ಅಧ್ಯಕ್ಷರಾಗಿದ್ದರು.
                </p>

                <p>
                    <strong>ಅಲ್ ಅನ್ಸಾರ್ ಸ್ಥಾಪನೆ:</strong> 1991ರಲ್ಲಿ ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆಯನ್ನು ಸ್ಥಾಪಿಸಿದರು.
                </p>

                <p>
                    <strong>ಸಿದ್ಧಾಂತ ಶುದ್ಧತೆ:</strong> ಸುನ್ನಿ ಸಿದ್ಧಾಂತಕ್ಕೆ ವಿರುದ್ಧವಾದ ಪ್ರಕಟಣೆಗಳು ಹರಡುತ್ತಿದ್ದ ಸಮಯದಲ್ಲಿ ಜನರಿಗೆ ಅವನ್ನು ಓದಬಾರದೆಂದು ಹೇಳಲಾಗುತ್ತಿತ್ತು. ಆದರೆ ಸರಿಯಾದ ಮಾಹಿತಿಯನ್ನು ನೀಡುವ ಪರ್ಯಾಯವಿರಲಿಲ್ಲ. ಇಬ್ರಾಹಿಂ ಬಾವಾ ಹಾಜಿ ಈ ಕೊರತೆಯನ್ನು ನೀಗಿಸಿ, ಸುನ್ನಿ ಅಖೀದಕ್ಕೆ ಹೊಂದಿಕೊಂಡ ನಿಖರ ಮಾಹಿತಿಯನ್ನು ನೀಡುವ ಮೂಲವಾಗಿ ಅಲ್ ಅನ್ಸಾರ್ ಅನ್ನು ಸ್ಥಾಪಿಸಿದರು.
                </p>

                <p>
                    <strong>ಎಚ್ಚರಿಕೆ:</strong> ಪ್ರತಿಯೊಂದು ಲೇಖನ ಮತ್ತು ಪತ್ರವನ್ನು ಪ್ರಕಟಣೆಗೆ ಮೊದಲು ಸ್ವತಃ ಪರಿಶೀಲಿಸುತ್ತಿದ್ದರು. ಸಮಾಜದಲ್ಲಿ ಅಶಾಂತಿ ಉಂಟುಮಾಡುವ ಅಥವಾ ಸರಿಯಾದ ಮಾರ್ಗದಿಂದ ವಿಚಲಿತಗೊಳಿಸುವ ಯಾವುದೇ ವಿಷಯ ಕಂಡುಬಂದರೆ ಅದನ್ನು ತಕ್ಷಣವೇ ರದ್ದುಪಡಿಸುತ್ತಿದ್ದರು. ಈ ಕಾಳಜಿಯಿಂದ ಪತ್ರಿಕೆ ಸಮುದಾಯದಲ್ಲಿ ಯಾವತ್ತೂ ಕಲಹ ಉಂಟುಮಾಡಲಿಲ್ಲ.
                </p>
            </AboutSection>


            <AboutSection
                name="ಉನ್ನಿ ಹಾಜಿ: ಅಲ್ ಅನ್ಸಾರ್‌ನ ಬೆನ್ನೆಲುಬು"
                meta=""
                image="/legacy/unni-haji.jpeg"
            >
                <p>
                    ಅಲ್ ಅನ್ಸಾರ್ ಯಶಸ್ಸು ಇಬ್ರಾಹಿಂ ಬಾವಾ ಹಾಜಿಯವರ ಮಾವನಾದ ಉನ್ನಿ ಹಾಜಿಯವರ ನಿಸ್ವಾರ್ಥ ಬೆಂಬಲದಿಂದ ಸಾಧ್ಯವಾಯಿತು. ಇಬ್ಬರೂ ಪರಸ್ಪರರ ಸಹೋದರಿಯರನ್ನು ವಿವಾಹವಾದ ಅತ್ಯಂತ ಆಪ್ತ ಸ್ನೇಹಿತರಾಗಿದ್ದರು.
                </p>

                <p>
                    <strong>ತ್ಯಾಗ:</strong> ಬಾವಾ ಹಾಜಿ ಆರ್ಥಿಕ ಸಂಕಷ್ಟಗಳನ್ನು ಎದುರಿಸಿದಾಗ, ಉನ್ನಿ ಹಾಜಿ ಸದಾ ಅವರ ಜೊತೆ ನಿಂತರು.
                </p>

                <p>
                    <strong>ಮೌನ ಸಹಭಾಗಿ:</strong> ಅವರ ಹೆಸರು ಸಂಪಾದಕ ಅಥವಾ ನಿರ್ವಾಹಕರಾಗಿ ಅಧಿಕೃತವಾಗಿ ಪ್ರಕಟವಾಗದಿದ್ದರೂ, ನಿಧಿ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಕಚೇರಿಯ ದೈನಂದಿನ ಕಾರ್ಯಾಚರಣೆಯ ಸಮಸ್ಯೆಗಳನ್ನು ಪರಿಹರಿಸುವ ಹೊಣೆಗಾರಿಕೆಯನ್ನು ಹೊತ್ತಿದ್ದರು.
                </p>

                <p>
                    <strong>ಸ್ನೇಹದ ಪರಂಪರೆ:</strong> ತಮ್ಮ ಖ್ಯಾತಿಗಿಂತ ಸ್ನೇಹಿತನ ಕನಸಿಗೆ ಆದ್ಯತೆ ನೀಡಿದರು. ಪತ್ರಿಕೆ ಉಳಿದರೆ ತಮ್ಮ ಮಿಷನ್ ಯಶಸ್ವಿ ಎಂದು ನಂಬಿದರು. ಇಬ್ಬರೂ ತಮ್ಮ ಜೀವನದ ಅಂತ್ಯವರೆಗೂ ಈ ಮಿಷನ್‌ನಲ್ಲಿ ಏಕಮನಸ್ಕರಾಗಿದ್ದರು.
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
