"use client";

import { useState } from "react";

const TOPICS = [
  "Namaz",
  "Wudu",
  "Zakat",
  "Dua",
  "Fasting",
  "Hajj and Umrah",
  "Qiyamah",
  "Festivals",
  "Marriage",
  "Birth",
  "Inheritance",
  "Transactions",
  "Death",
  "Vows",
  "Dress and Adornment",
  "Children",
];

export default function ExploreTopics() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <section className="w-full max-w-2xl mx-auto mt-5 px-1">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="explore-glow group relative mx-auto flex items-center gap-2 rounded-full
            border border-amber-300/60 bg-gradient-to-r from-amber-50 via-white to-blue-50
            px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition
            hover:-translate-y-0.5 hover:shadow-md"
        >
          <span>Explore Topics</span>
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Explore Topics
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose a topic to discover related answers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSelectedTopic(null);
              }}
              className="rounded-full px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Close ×
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => {
              const selected = selectedTopic === topic;

              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(selected ? null : topic)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                    selected
                      ? "border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-900/15"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>

          {selectedTopic && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-sm font-semibold text-slate-800">
                {selectedTopic}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Answers about {selectedTopic} will appear here.
              </p>
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
