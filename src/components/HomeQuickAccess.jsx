"use client";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MessageCircleQuestion } from "lucide-react";
import { IconBubble } from "@/components/IconBubble";
import Link from "next/link";
export default function HomeQuickAccess() {
  const [total, setTotal] = useState(null);
  const scrollRef = useRef(null);
  const { lang } = useLanguage();

  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const container = scrollRef.current;
    if (!container) return;

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % 3;

      const cardWidth = container.children[0].offsetWidth + 16; // 16 = gap-4

      container.scrollTo({
        left: currentIndex * cardWidth,
        behavior: "smooth",
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/stats", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setTotal(data.total))
      .catch((error) => {
        console.error("Failed to load Q&A count:", error);
      });
  }, []);

  const t = {
    qnaTitle: lang === "en" ? "Questions Answered" : "ಪ್ರಶ್ನೋತ್ತರಗಳು",

    qnaDesc1:
      lang === "en"
        ? "› Ask a Question – Clear Your Doubts"
        : "› ಪ್ರಶ್ನೆ ಕೇಳಿ - ಸಂಶಯ ನಿವಾರಿಸಿ\n",

    qnaDesc2:
      lang === "en"
        ? "› Enhance your knowledge through the \n published Q&As."
        : "› ಪ್ಪ್ರಕಟಿತ ಪ್ರಶ್ನೋತ್ತರಗಳಿಂದ ನಿಮ್ಮ ಅರಿವನ್ನು ಹೆಚ್ಚಿಸಿಕೊಳ್ಳಿ",

    qnaBtn: lang === "en" ? "Keli Nodi →" : "ಕೇಳಿ ನೋಡಿ →",

    digiBadge: lang === "en" ? "Latest Edition" : "ಇತ್ತೀಚಿನ ಸಂಚಿಕೆಗಳು",

    digiTitle: lang === "en" ? "Latest DigiPaper" : "ಇತ್ತೀಚಿನ ಸಂಚಿಕೆಗಳು ",

    digiDesc:
      lang === "en" ? "Weekly Islamic Publication" : "ಪ್ರತಿವಾರದ ಪತ್ರಿಕೆ",

    digiDesc2: lang === "en" ? "DigiPaper" : "ಡಿಜಿ ಪೇಪರ್ ",

    digiDesc3: lang === "en" ? "Weekly Publications" : "ಪ್ರತಿವಾರದ ಪತ್ರಿಕೆ ",

    digiBtn: lang === "en" ? "Read Now →" : "ಈಗ ಓದಿ →",

    articleBadge: lang === "en" ? "Featured Content" : "ವಿಶೇಷ ವಿಷಯ",

    articleTitle: lang === "en" ? "Articles" : "ಬರಹಗಳು",

    articleContent1:
      lang === "en" ? "Quran Translations " : "ಖುರ್ ಆನ್ ವ್ಯಾಖ್ಯಾನ",
    articleContent2: lang === "en" ? "Hadith " : "ಹದೀಸ್ ದರ್ಪಣ",

    articleContent3: lang === "en" ? "Fiqh " : "ಕರ್ಮ ಶಾಸ್ತ್ರ",

    articleContent4: lang === "en" ? "Islamic History " : "ಇತಿಹಾಸ",

    articleContent5: lang === "en" ? "Eminent Personality " : "ಸ್ಮರಣೆ",

    articleContent6: lang === "en" ? "Analysis" : "ವಿಶ್ಲೇಷಣ",
    articleContent7: lang === "en" ? "Wonderful World " : "ವಿಸ್ಮಯ",

    articleBtn: lang === "en" ? "Explore →" : "ಅನ್ವೇಷಿಸಿ →",
  };
  return (
    <section className="px-6 -mt-8 relative z-30 max-w-7xl mx-auto">
      <div
        ref={scrollRef}
        className="flex lg:grid no-scrollbar lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-4 snap-x snap-mandatory"
      >
        <div
          onClick={() => {
            document.getElementById("chatbot-section")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });

            setTimeout(() => {
              window.dispatchEvent(new Event("expand-chatbot"));
            }, 200);
          }}
          className="snap-center lg:min-w-0 min-w-[85%] h-[240px] rounded-[28px] overflow-hidden relative shadow-xl cursor-pointer active:scale-[0.98] transition-transform"
        >
          {/* Background image */}
          {/* Q&A visual */}
          <img
            src="/qna-card.png"
            alt=""
            className="
    absolute
    -right-16
    -bottom-4
    h-[210px]
    w-auto
    object-contain
    opacity-30
    pointer-events-none
  "
          />

          {/* Blue tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5b82c7]/80 via-[#3d68b8]/80 to-[#284f9e]/95" />
          {/* Top gloss */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent" />
          {/* Bottom depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
          {/*Message bubble*/}
          <div className="absolute right-6 top-6 z-20">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <MessageCircleQuestion className="w-7 h-7 text-white" />
            </div>
          </div>
          {/* Content */}
          <div className="relative h-full p-6 text-white">
            <div>
              <div className="text-4xl font-semibold text-white/95">
                {total !== null ? `${total}+` : "..."}
              </div>
              <div className="text-lg font-semibold mt-1">{t.qnaTitle}</div>
              <p className="mt-1 max-w-[210px] text-[16px] font-medium text-white/80">
                {t.qnaDesc1}
              </p>

              <p className="mt-1 whitespace-pre-line max-w-[210px] text-[16px] font-medium text-white/80">
                {t.qnaDesc2}
              </p>
            </div>
            <span className="absolute right-6 bottom-6 w-fit px-5 py-2 bg-white text-[#1d3f9a] rounded-full font-medium">
              {t.qnaBtn}
            </span>
          </div>
        </div>
        {/* DigiPaper */}
        <Link
          href="/digipaper"
          className="snap-center lg:min-w-0 min-w-[85%] h-[240px] rounded-[28px] overflow-hidden relative shadow-xl cursor-pointer block active:scale-[0.98] transition-transform"
        >
          <img
            src="/digipaper-main.png"
            alt="Latest DigiPaper"
            className="absolute inset-12 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f4c97]/90 to-[#1d3f9a]/85" />
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />
          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-1xl">
                {t.digiBadge}
              </span>

              <h2 className="mt-4 text-3xl font-bold leading-tight">
                {t.digiTitle}
              </h2>

              <p className="mt-2  text-1xl text-white/80">•{t.digiDesc2}</p>
              <p className=" ml-6 text-1xl text-white/80">› {t.digiDesc3}</p>
            </div>

            <span className="absolute right-6 bottom-4 w-fit px-5 py-2 bg-white text-[#1d3f9a] rounded-full font-medium">
              {t.digiBtn}
            </span>
          </div>
        </Link>
        {/* Articles */}
        <Link
          href={`/soon-to-be-published?lang=${lang}`}
          className="snap-center lg:min-w-0 min-w-[85%] h-[240px] rounded-[28px] overflow-hidden relative shadow-xl cursor-pointer active:scale-[0.98] transition-transform block"
        >
          {/* Background image */}
          <img
            src="/articles-image.png"
            alt="Featured articles"
            className="absolute -right-6 -bottom-4 h-[280px] w-auto object-contain pointer-events-none"
          />

          {/* Blue tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5b82c7]/70 via-[#3d68b8]/70 to-[#284f9e]/95" />

          {/* Top gloss */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />

          {/* Bottom depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />

          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div>
              <span className="inline-block  px-2 py-1 rounded-full bg-white/20 text-1xl">
                {t.articleBadge}
              </span>
              <h2 className="mt-1 text-3xl font-bold leading-tight">
                {t.articleTitle}
              </h2>
              <div className="grid grid-cols-2 gap-y-1 mt-1 text-sm leading-6 text-white/90">
                <span className="whitespace-nowrap">• {t.articleContent1}</span>
                <span className="whitespace-nowrap">• {t.articleContent5}</span>

                <span className="whitespace-nowrap">• {t.articleContent2}</span>
                <span className="whitespace-nowrap">• {t.articleContent6}</span>

                <span className="whitespace-nowrap">• {t.articleContent3}</span>
                <span className="whitespace-nowrap">• {t.articleContent7}</span>

                <span className="whitespace-nowrap">• {t.articleContent4}</span>
              </div>
            </div>

            <span className="absolute right-6 bottom-4 w-fit px-5 py-2 bg-white text-[#1d3f9a] rounded-full font-medium">
              {t.articleBtn}
            </span>
          </div>
        </Link>
        {/* Keli Nodi */}
      </div>
    </section>
  );
}
