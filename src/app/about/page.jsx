// src/app/about/page.jsx

export default async function AboutPage(props) {
    const searchParams = await props.searchParams;

    const lang =
        searchParams?.lang === "en" || searchParams?.lang === "kn"
            ? searchParams.lang
            : "en";

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4">
            <div className="max-w-4xl mx-auto space-y-16">

                {lang === "en" ? <EnglishContent /> : <KannadaContent />}

            </div>
        </div>
    );
}


/* ============================
   ENGLISH
============================ */

function EnglishContent() {
    return (
        <>
            <AboutSection
                name="Tajul Ulama Shaykhuna Abduyyid Alu Rahmana Al Bukhari Ustad Tanjeef"
                meta="Hijri 1341–1435"
            >
                <p>
                    A distinguished scholar, Amir Nayib, leader of Ulama, mentor of scholars, and spiritual guide, Tajul Ulama Tanjeef Ustad was born on 25th Rabi'ul Awwal, Hijri 1341. He departed from this world on 30th Rabi'ul Awwal, Hijri 1435 at the age of 95.
                </p>

                <p>
                    Sayyid Muhammad Al Bukhari dedicated his entire life to the service of Islam and to addressing societal challenges. Numerous madrasas were established, structured educational systems were created, and training programs for Imams and scholars were conducted.
                </p>

                <p>
                    Discipline, honesty, humility, devotion, and sacrifice were clearly reflected throughout his life. His works continue to inspire many people even today.
                </p>
            </AboutSection>

            <AboutSection
                name="Tajul Muhammad Bekal Ustad"
                meta="Chief Editor of Al Ansar Newspaper (1949–2020)"
            >
                <p>
                    Born in 1949 near Adyar, Mangalore, he completed his religious education and was a disciple of Ibrahim Ustad.
                </p>

                <p>
                    In 1976, he joined Al Ansar newspaper and later became its Chief Editor. He served for 26 years.
                </p>

                <p>
                    “Tajul Muhammad Bekal Ustad” will always be remembered.
                </p>
            </AboutSection>

            <AboutSection
                name="Muhammad Umar Ibrahim Nada Bavu"
                meta="Chief Editor of Al Ansar Newspaper"
            >
                <p>
                    Born in 1949 in Kodlipade near Bantwal, Mangalore district, he served in religious and social fields.
                </p>

                <p>
                    Under his leadership, the newspaper progressed significantly.
                </p>

                <p>
                    His contributions to religious and social fields are immense.
                </p>
            </AboutSection>
        </>
    );
}


/* ============================
   KANNADA
============================ */

function KannadaContent() {
    return (
        <>
            <AboutSection
                name="ತಾಜುಲ್ ಉಲಮಾ ಶೈಖುನಾ ಅಬ್ದುಯ್ಯಿದ್ ಅಲು ರಹ್ಮಾ ನಾ ಅಲ್ ಬುಖಾರಿ ಉಸ್ತಾದ್ ತಂಜೀಫ್"
                meta="ಹಿಜರಿ 1341–1435"
            >
                <p>
                    ಸಮುದಾಯದ ಮುನ್ನೋಟಿ ರಹೀಬ ಅಲಿಗದೇ ವಿದ್ವಾನ್, ಆಲಿಮ್ಸಜ್ಜದ ಅಮೀರ್ ನಾಯಬ್, ಉಲಮಾ ಲೀಡರ್, ಕಿರಿದ ಪಾಂಡಿತ ಅಗ್ಗಗಳ ನೇತಾರ, ಆಧ್ಯಾತ್ಮಿಕ ಸಂಯೋಜನದ ವಿದ್ವಾನ್ ತಾಜುಲ್ ಉಲಮಾ ತಂಜೀಫ್ ಉಸ್ತಾದ್ ತಂಜೀಫ್.
                </p>

                <p>
                    ಹಿಜರಿ 1341ರ ರಬೀಉಲ್ ಅವ್ವಲ್ 25ರಂದು ಭಾನುವಾರ ಹುಟ್ಟಿದ ಅವರು, 1435ರ ರಬೀಉಲ್ ಅವ್ವಲ್ 30ರಂದು 95ನೇ ಪ್ರಾಯದಲ್ಲಿ ತಮ್ಮ ಬದುಕಿನ ವಿದಾಯ ಹೇಳಿದರು.
                </p>

                <p>
                    ಇಸ್ಲಾಮಿನ ಜ್ಞಾನವನ್ನು ಉಳಿಸುವ ಮತ್ತು ಪ್ರಚಾರ ಮಾಡುವ ಉದ್ದೇಶದಿಂದ ಅನೇಕ ಮದ್ರಸಾಗಳ ಸ್ಥಾಪನೆ, ಶಿಕ್ಷಣ ವ್ಯವಸ್ಥೆಯ ನಿರ್ಮಾಣ, ಇಮಾಮ್ ಮತ್ತು ಮೌಲ್ವಿಗಳ ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ನಡೆಸಲಾಯಿತು.
                </p>

                <p>
                    ಶಿಸ್ತು, ಪ್ರಾಮಾಣಿಕತೆ, ವಿನಯ, ಧರ್ಮನಿಷ್ಠೆ ಮತ್ತು ತ್ಯಾಗಭಾವ ಅವರ ಜೀವನದಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣಿಸಿಕೊಂಡವು.
                </p>
            </AboutSection>

            <AboutSection
                name="ತಾಜುಲ್ ಮುಹಮ್ಮದ್ ಬೇಕಲ್ ಉಸ್ತಾದ್"
                meta="ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆಯ ಪ್ರಧಾನ ಸಂಪಾದಕರು (1949–2020)"
            >
                <p>
                    1949ರಲ್ಲಿ ಮಂಗಳೂರು ಬಳಿಯ ಅಡ್ಯಾರ್ ಸಮೀಪದ ಕೊಡ್ಲಿಪಾದೆಯಲ್ಲಿ ಹುಟ್ಟಿದ ಅವರು ಧಾರ್ಮಿಕ ಶಿಕ್ಷಣವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಮುಗಿಸಿದ್ದರು.
                </p>

                <p>
                    1976ರಲ್ಲಿ ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆಯ ಕಾರ್ಯದಲ್ಲಿ ತೊಡಗಿಸಿಕೊಂಡು ನಂತರ ಪ್ರಧಾನ ಸಂಪಾದಕರಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸಿದರು.
                </p>

                <p>
                    ಅವರ ಹೆಸರು ಸದಾಕಾಲವೂ ಸ್ಮರಣೀಯವಾಗಿರುತ್ತದೆ.
                </p>
            </AboutSection>

            <AboutSection
                name="ಮುಹಮ್ಮದ್ ಉಮರ್ ಇಬ್ರಾಹೀಂ ನಾದಾ ಬಾವು"
                meta="ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆಯ ಪ್ರಧಾನ ಸಂಪಾದಕರು"
            >
                <p>
                    1949ರಲ್ಲಿ ಮಂಗಳೂರು ಜಿಲ್ಲೆಯ ಬಂಟ್ವಾಳ ಸಮೀಪದ ಕೊಡ್ಲಿಪಾದೆಯಲ್ಲಿ ಜನಿಸಿದರು.
                </p>

                <p>
                    ಅವರ ನಾಯಕತ್ವದಲ್ಲಿ ಅಲ್ ಅನ್ಸಾರ್ ಪತ್ರಿಕೆ ದೃಢವಾಗಿ ನಿಂತಿತು.
                </p>

                <p>
                    ಅವರ ಸೇವೆ ಸದಾ ಸ್ಮರಣೀಯವಾಗಿರುತ್ತದೆ.
                </p>
            </AboutSection>
        </>
    );
}


/* ============================
   REUSABLE SECTION
============================ */

function AboutSection({ name, meta, children }) {
    return (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-10">

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#1D3F9A] leading-snug">
                    {name}
                </h2>
                <p className="text-gray-500 mt-2 text-sm tracking-wide">
                    {meta}
                </p>
            </div>

            <div className="border-l-4 border-[#1D3F9A]/70 pl-6 space-y-4 text-gray-700 leading-relaxed text-[15px]">
                {children}
            </div>

        </div>
    );
}
