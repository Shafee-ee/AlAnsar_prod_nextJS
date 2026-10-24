"use client";

import { useEffect, useState } from "react";

const TOPICS = [
  { en: "Namaz", kn: "ನಮಾಝ್" },
  { en: "Wudu", kn: "ವುಝೂ" },
  { en: "Zakat", kn: "ಝಕಾತ್" },
  { en: "Dua", kn: "ದುಆ" },
  { en: "Fasting", kn: "ಉಪವಾಸ" },
  { en: "Hajj and Umrah", kn: "ಹಜ್ ಮತ್ತು ಉಮ್ರಾ" },
  { en: "Qiyamah", kn: "ಕಿಯಾಮತ್" },
  { en: "Festivals", kn: "ಹಬ್ಬಗಳು" },
  { en: "Marriage", kn: "ವಿವಾಹ" },
  { en: "Birth", kn: "ಜನನ" },
  { en: "Inheritance", kn: "ವಾರಸುದಾರಿಕೆ" },
  { en: "Transactions", kn: "ವ್ಯವಹಾರಗಳು" },
  { en: "Death", kn: "ಮರಣ" },
  { en: "Vows", kn: "ಹರಕೆಗಳು" },
  { en: "Dress and Adornment", kn: "ಉಡುಗೆ ಮತ್ತು ಅಲಂಕಾರ" },
  { en: "Children", kn: "ಮಕ್ಕಳು" },
];

const TEXT = {
  en: {
    explore: "Explore Topics",
    instruction: "Choose a topic to discover related answers.",
    close: "Close",
    loading: "Loading questions...",
    empty: "No questions found for this topic yet.",
    error: "Could not load questions. Please try again.",
    retry: "Try again",
    answersAbout: (topic) => `Questions about ${topic}`,
  },
  kn: {
    explore: "ವಿಷಯಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    instruction: "ಸಂಬಂಧಿತ ಉತ್ತರಗಳನ್ನು ನೋಡಲು ಒಂದು ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    close: "ಮುಚ್ಚಿ",
    loading: "ಪ್ರಶ್ನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    empty: "ಈ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳು ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.",
    error: "ಪ್ರಶ್ನೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    answersAbout: (topic) => `${topic} ಕುರಿತ ಪ್ರಶ್ನೆಗಳು`,
  },
};

export default function ExploreTopics({ lang = "kn" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const language = lang === "en" ? "en" : "kn";
  const t = TEXT[language];
  const selectedLabel = TOPICS.find((topic) => topic.en === selectedTopic);

  useEffect(() => {
    if (!isOpen || !selectedTopic) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }

    const controller = new AbortController();

    async function fetchQuestions() {
      setLoading(true);
      setError(false);
      setResults([]);

      try {
        const response = await fetch("/api/explore-topics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: selectedTopic,
            lang: language,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Failed to fetch topic questions");
        }

        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Explore topics fetch error:", err);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchQuestions();

    return () => controller.abort();
  }, [isOpen, selectedTopic, language, retryCount]);

  function closeExplore() {
    setIsOpen(false);
    setSelectedTopic(null);
    setResults([]);
    setError(false);
  }

  return (
    <section className="mx-auto mt-2 w-full max-w-2xl px-1">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="explore-glow group relative mx-auto flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-5 py-3 text-sm font-semibold text-[#1D3F9A] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
        >
          <span>{t.explore}</span>
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {t.explore}
              </h2>
              <p className="mt-1 text-xs text-slate-500">{t.instruction}</p>
            </div>

            <button
              type="button"
              onClick={closeExplore}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              {t.close} ×
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => {
              const selected = selectedTopic === topic.en;

              return (
                <button
                  key={topic.en}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(selected ? null : topic.en);
                    setRetryCount(0);
                  }}
                  aria-pressed={selected}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                    selected
                      ? "border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-900/15"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  }`}
                >
                  {topic[language]}
                </button>
              );
            })}
          </div>

          {selectedTopic && selectedLabel && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {t.answersAbout(selectedLabel[language])}
              </p>

              {loading && (
                <p className="mt-3 text-sm text-slate-500" role="status">
                  {t.loading}
                </p>
              )}

              {error && !loading && (
                <div className="mt-3">
                  <p className="text-sm text-red-600" role="alert">
                    {t.error}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="mt-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                  >
                    {t.retry}
                  </button>
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <p className="mt-3 text-sm text-slate-500">{t.empty}</p>
              )}

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                {results.map((r, index) => {
                  const answer = r.answer || "";
                  const truncatedAnswer =
                    answer.length > 180
                      ? `${answer.slice(0, 180).trim()}...`
                      : answer;

                  let attribution =
                    language === "kn"
                      ? "ಅಲ್ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆಯಿಂದ ಸಂಗ್ರಹವಾದ ಮಾಹಿತಿ (1991–2016)"
                      : "From the Archives of AlAnsar Weekly (1991–2016)";

                  if (r.imam_name) {
                    attribution = r.imam_name;
                  } else if (r.samputa || r.sanchike) {
                    attribution =
                      language === "kn"
                        ? `${r.samputa ? `ಸಂಪುಟ ${r.samputa}` : ""}${
                            r.samputa && r.sanchike ? " " : ""
                          }${r.sanchike ? `ಸಂಚಿಕೆ ${r.sanchike}` : ""}`
                        : `${r.samputa ? `Samputa ${r.samputa}` : ""}${
                            r.samputa && r.sanchike ? " " : ""
                          }${r.sanchike ? `Sanchike ${r.sanchike}` : ""}`;
                  } else if (r.source_title) {
                    attribution = r.source_title;
                  }

                  return (
                    <article
                      key={r.id}
                      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
                    >
                      <span className="self-start rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                        {language === "kn"
                          ? `ಪ್ರಶ್ನೆ ${index + 1}`
                          : `Question ${index + 1}`}
                      </span>

                      <h3 className="mt-3 line-clamp-4 select-none text-sm font-semibold leading-snug text-gray-900">
                        {r.question}
                      </h3>

                      {truncatedAnswer && (
                        <p className="mt-2 select-none text-xs leading-relaxed text-gray-600">
                          {truncatedAnswer}
                        </p>
                      )}

                      <div className="mt-3 text-[10px] text-gray-400">
                        {attribution}
                      </div>

                      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
                        <a
                          href={`/qna/${r.id}?lang=${language}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <icon name="external-link" size="xs" />
                          {language === "kn" ? "ತೆರೆಯಿರಿ" : "Open"}
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/qna/${r.id}?lang=${language}`;

                            if (navigator.share) {
                              navigator
                                .share({
                                  title: "Al Ansar Weekly",
                                  url,
                                })
                                .catch(() => {});
                            } else {
                              navigator.clipboard.writeText(url);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600"
                        >
                          <icon name="share-2" size="xs" />
                          {language === "kn" ? "ಹಂಚಿಕೊಳ್ಳಿ" : "Share"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .explore-glow {
          isolation: isolate;
          overflow: hidden;
        }

        .explore-glow::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            110deg,
            transparent 20%,
            rgba(255, 255, 255, 0.9) 45%,
            transparent 70%
          );
          transform: translateX(-120%);
          animation: explore-shimmer 3.5s ease-in-out infinite;
          pointer-events: none;
          z-index: -1;
        }

        @keyframes explore-shimmer {
          0%,
          65% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .explore-glow::before {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
