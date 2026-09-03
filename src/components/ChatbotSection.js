"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Zap,
  MessageCircle,
  Share2,
  ExternalLink,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

import { BookOpen } from "lucide-react";
import { IconBubble } from "@/components/IconBubble";
/* ----------------------------------
   CONFIG
---------------------------------- */

const headings = {
  en: {
    title: "Seek & Discover",
    subtitle: "Ask your Islamic questions here",
    disclaimer:
      "These answers are sourced from AlAnsar Weekly’s archive. Some English responses are translations of questions previously asked in the Keli Nodi section.",
  },
  kn: {
    title: "ಕೇಳಿ ನೋಡಿ",
    subtitle: "ನಿಮ್ಮ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಇಲ್ಲಿ ಕೇಳಿ",
    disclaimer:
      "ಈ ಉತ್ತರಗಳು AlAnsar Weeklyಯ ಆರ್ಕೈವ್‌ನಿಂದ ಪಡೆಯಲ್ಪಟ್ಟವು. ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿರುವ ಕೆಲವು ಉತ್ತರಗಳು ‘ಕೇಳಿ ನೋಡಿ’ ವಿಭಾಗದಲ್ಲಿ ಹಿಂದೆಯೇ ಕೇಳಲಾದ ಪ್ರಶ್ನೆಗಳ ಅನುವಾದವಾಗಿರುತ್ತವೆ.",
  },
};

const CONFIDENCE = {
  HIGH: 0.85,
  LOW: 0.35,
};

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-2 bg-white border rounded-xl shadow-sm">
    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
  </div>
);

/* ---------------------------------------------------------
   BOT RESPONSE CARD
--------------------------------------------------------- */
const BotResponseCard = ({
  result,
  query,
  onRelatedClick,
  onShare,
  onRephrase,
  selectedLang,
}) => {
  const best = result?.bestMatch;
  const isSystem = result?.isSystem;
  const [expandedSuggestionId, setExpandedSuggestionId] = useState(null);

  const answerRefs = useRef({});
  const [expandableSuggestions, setExpandableSuggestions] = useState({});

  useEffect(() => {
    if (!result?.suggestions) return;

    const expandable = {};

    requestAnimationFrame(() => {
      result.suggestions.forEach((r) => {
        const el = answerRefs.current[r.id];

        if (!el) {
          expandable[r.id] = false;
          return;
        }

        expandable[r.id] = el.scrollHeight > el.clientHeight;
      });

      setExpandableSuggestions(expandable);
    });
  }, [result?.suggestions, selectedLang]);

  console.log("BOT RESULT:", result);

  // 🔧 HANDLE EXPLORE MODE (keyword search)
  if (result?.mode === "explore" && Array.isArray(result.results)) {
    return (
      <div className="bg-white p-4 rounded-xl border">
        <div className="flex items-center text-xs font-semibold text-gray-500 mb-2">
          <Search className="w-4 h-4 mr-2" />
          Related questions
        </div>

        <div className="space-y-2">
          {result.results.map((r, i) => (
            <button
              key={i}
              onClick={() => onRelatedClick(r.question, r.id)}
              className="w-full text-left text-gray-700 text-xs p-2 rounded-md hover:bg-gray-100"
            >
              <MessageCircle className="w-3 h-3 inline mr-1" />
              {r.question}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // INITIAL SEARCH — show suggested questions
  if (result?.mode === "suggestions") {
    return (
      <div className="w-full bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600">
            <Search className="w-5 h-5" />
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-800">
              {selectedLang === "kn"
                ? "ಸಂಭಾವ್ಯ ಪ್ರಶ್ನೆಗಳು"
                : "Possible matches"}
            </div>

            <div className="text-xs text-gray-500 font-bold mt-0.5">
              {selectedLang === "kn"
                ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಹೊಂದಿಕೆಯಾಗಬಹುದಾದ ಪ್ರಶ್ನೆಗಳು"
                : "We found questions that may match what you mean."}
            </div>
          </div>
        </div>

        {/* Suggested questions */}
        <div className="space-y-2">
          {result.suggestions.map((r) => {
            const badge =
              r.score >= 0.85
                ? "Strong match"
                : r.score >= 0.65
                  ? "Very close"
                  : "Close match";

            const isExpanded = expandedSuggestionId === r.id;
            const canExpand = expandableSuggestions[r.id];

            const imamName = r.imam_name || r.imamName;
            const samputa = r.samputa;
            const sanchike = r.sanchike;
            const sourceTitle = r.source_title || r.sourceTitle;

            let answerSource =
              selectedLang === "kn"
                ? "ಅಲ್ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆಯಿಂದ ಸಂಗ್ರಹವಾದ ಮಾಹಿತಿ (1991–2016)"
                : "From the Archives of AlAnsar Weekly (1991–2016)";

            if (imamName) {
              answerSource = imamName;
            } else if (samputa || sanchike) {
              answerSource =
                selectedLang === "kn"
                  ? `${samputa ? `ಸಂಪುಟ ${samputa}` : ""}${
                      samputa && sanchike ? " " : ""
                    }${sanchike ? `ಸಂಚಿಕೆ ${sanchike}` : ""}`
                  : `${samputa ? `Samputa ${samputa}` : ""}${
                      samputa && sanchike ? " " : ""
                    }${sanchike ? `Sanchike ${sanchike}` : ""}`;
            } else if (sourceTitle) {
              answerSource = sourceTitle;
            }

            return (
              <div
                key={r.id}
                className="
    w-full
    h-full
    flex flex-col
    rounded-xl
    border border-gray-100
    bg-white
    p-4
    transition
  "
              >
                {/* Result card */}
                <div
                  className="
    w-full
    p-3
    rounded-xl
    border border-gray-100
    bg-white
    hover:border-blue-200
    hover:bg-blue-50/30
    transition
  "
                >
                  {/* Badge */}
                  <div className="mb-2">
                    <span
                      className={`
        inline-flex
        items-center
        px-2.5
        py-1
        rounded-full
        text-[10px]
        font-semibold
        ${
          r.score >= 0.85
            ? "bg-green-50 text-green-600"
            : r.score >= 0.65
              ? "bg-blue-50 text-blue-600"
              : "bg-yellow-50 text-yellow-700"
        }
      `}
                    >
                      {selectedLang === "kn"
                        ? r.score >= 0.85
                          ? "ಬಲವಾದ ಹೊಂದಾಣಿಕೆ"
                          : r.score >= 0.65
                            ? "ತುಂಬಾ ಹತ್ತಿರ"
                            : "ಹತ್ತಿರದ ಹೊಂದಾಣಿಕೆ"
                        : badge}
                    </span>
                  </div>

                  {/* Question */}
                  <div className="text-sm leading-relaxed text-gray-700">
                    {r.question}
                  </div>

                  {/* Answer preview */}
                  <div
                    ref={(el) => {
                      answerRefs.current[r.id] = el;
                    }}
                    className="mt-2 text-sm leading-relaxed text-blue-600 line-clamp-2"
                  >
                    {r.answer}
                  </div>

                  {/* Source */}
                  <div className="mt-3 text-xs text-gray-400">
                    {answerSource}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
                    <a
                      href={`/qna/${r.id}?lang=${selectedLang}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </a>

                    <button
                      type="button"
                      onClick={() => onShare(r.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fallback */}
        <div className="mt-5 pt-4 border-t border-gray-100 text-center">
          <div className="text-xs text-gray-500 font-bold mb-3">
            {selectedLang === "kn"
              ? "ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪ್ರಶ್ನೆ ಇಲ್ಲವೇ?"
              : "Didn't find the question you were looking for?"}
          </div>

          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={onRephrase}
              className="
              px-5
              py-2.5
              rounded-lg
              bg-gray-100
              hover:bg-gray-200
              text-gray-700
              text-xs
              font-semibold
            "
            >
              {selectedLang === "kn" ? "ಮರುಹೊಂದಿಸಿ" : "Rephrase"}
            </button>

            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("trigger-ask-question", {
                    detail: { question: query },
                  }),
                )
              }
              className="
              px-5
              py-2.5
              rounded-lg
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-xs
              font-semibold
            "
            >
              {selectedLang === "kn" ? "ಪ್ರಶ್ನೆ ಸಲ್ಲಿಸಿ" : "Submit Question"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const editorNote =
    best?.editorNote || best?.editorNote_en || best?.editorNote_kn || "";

  const imamName = r.imam_name || r.imamName;
  const samputa = r.samputa;
  const sanchike = r.sanchike;
  const sourceTitle = r.source_title || r.sourceTitle;

  let answerSource =
    selectedLang === "kn"
      ? "ಅಲ್ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆಯಿಂದ ಸಂಗ್ರಹವಾದ ಮಾಹಿತಿ (1991–2016)"
      : "From the Archives of AlAnsar Weekly (1991–2016)";

  if (imamName) {
    answerSource = imamName;
  } else if (samputa || sanchike) {
    answerSource =
      selectedLang === "kn"
        ? `${samputa ? `ಸಂಪುಟ ${samputa}` : ""}${
            samputa && sanchike ? " " : ""
          }${sanchike ? `ಸಂಚಿಕೆ ${sanchike}` : ""}`
        : `${samputa ? `Samputa ${samputa}` : ""}${
            samputa && sanchike ? " " : ""
          }${sanchike ? `Sanchike ${sanchike}` : ""}`;
  } else if (sourceTitle) {
    answerSource = sourceTitle;
  }

  if (result?.noMatch) {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600">
            <Search className="w-5 h-5" />
          </div>

          <div>
            <p className="font-semibold text-gray-800">
              {selectedLang === "kn"
                ? "ವಿಶ್ವಾಸಾರ್ಹ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ"
                : "No confident match found"}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {selectedLang === "kn"
                ? "ನಮ್ಮ ಪ್ರಶ್ನೋತ್ತರ ಸಂಗ್ರಹದಲ್ಲಿ ಸಾಕಷ್ಟು ಹತ್ತಿರವಾದ ಉತ್ತರ ಸಿಗಲಿಲ್ಲ."
                : "We couldn’t find a sufficiently close answer in our Q&A archive."}
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="py-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
            <Search className="w-4 h-4 text-blue-600" />
            {selectedLang === "kn" ? "ಪ್ರಶ್ನೆ ಕೇಳುವ ಸಲಹೆಗಳು" : "Tips to try"}
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                ✎
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {selectedLang === "kn"
                    ? "ಪ್ರಶ್ನೆಯನ್ನು ಮರುಹೊಂದಿಸಿ"
                    : "Rephrase your question"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {selectedLang === "kn"
                    ? "ಬೇರೆ ಪದಗಳನ್ನು ಅಥವಾ ಸರಳವಾದ ರೀತಿಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ."
                    : "Try using different words or a simpler phrasing."}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                ⊙
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {selectedLang === "kn"
                    ? "ಹೆಚ್ಚು ನಿರ್ದಿಷ್ಟವಾಗಿರಿ"
                    : "Be more specific"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {selectedLang === "kn"
                    ? "ಉತ್ತಮ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಹೆಚ್ಚಿನ ಸಂದರ್ಭ ಅಥವಾ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ."
                    : "Add more context or details to get better results."}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                💬
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {selectedLang === "kn"
                    ? "ಕಾಗುಣಿತ ಮತ್ತು ಭಾಷೆಯನ್ನು ಪರಿಶೀಲಿಸಿ"
                    : "Check spelling & language"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {selectedLang === "kn"
                    ? "ಕಾಗುಣಿತವನ್ನು ಸರಿಪಡಿಸಿ ಅಥವಾ ಇನ್ನೊಂದು ಭಾಷೆಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ."
                    : "Correct spelling or try asking in another language."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit information */}
        <div className="border border-dashed border-blue-200 bg-blue-50/30 rounded-lg px-3 py-2.5 text-xs text-gray-600">
          {selectedLang === "kn" ? (
            <>
              ನೀವು ಬಯಸಿದರೆ{" "}
              <span className="font-medium text-blue-600">
                ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮ್ಮ ತಂಡಕ್ಕೆ ಸಲ್ಲಿಸಬಹುದು.
              </span>
            </>
          ) : (
            <>
              You can also{" "}
              <span className="font-medium text-blue-600">
                submit your question
              </span>{" "}
              to our team.
            </>
          )}
        </div>

        {/* Actions */}
        <div className="pt-5 text-center">
          <p className="text-xs text-gray-500 mb-3">
            {selectedLang === "kn"
              ? "ಇನ್ನೂ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರ ಸಿಗಲಿಲ್ಲವೇ?"
              : "Still can’t find what you’re looking for?"}
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => onRephrase(query)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {selectedLang === "kn" ? "ಮರುಹೊಂದಿಸಿ" : "Rephrase"}
            </button>

            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("trigger-ask-question", {
                    detail: { question: query },
                  }),
                )
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition"
            >
              <Send className="w-3.5 h-3.5" />
              {selectedLang === "kn" ? "ಪ್ರಶ್ನೆ ಸಲ್ಲಿಸಿ" : "Submit Question"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const score = best?.score ?? 0;
  const isHigh = score >= CONFIDENCE.HIGH;
  const isClose = score >= CONFIDENCE.LOW && score < CONFIDENCE.HIGH;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm">
      {!isSystem && isHigh && (
        <div className="mb-2 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-sm inline-block">
          Strong match
        </div>
      )}
      {!isSystem && isClose && (
        <div className="mb-2 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-sm inline-block">
          Close match
        </div>
      )}
      <div className="flex items-start text-blue-700 font-semibold mb-3">
        <Zap className="w-4 h-4 mr-2 mt-0.5" />
        {best.question}
      </div>
      <div className="text-blue-700 leading-relaxed mb-4 p-3 bg-gray-50 rounded-lg whitespace-pre-line">
        {best.answer}
      </div>
      <div className="border-t border-gray-100 pt-2 mb-3 text-xs text-gray-500">
        <span className="font-medium text-gray-600">
          {selectedLang === "kn" ? "ಉತ್ತರದ ಮೂಲ" : "Answer source"}:
        </span>
        {answerSource}
      </div>
      {editorNote && (
        <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded text-xs text-gray-700">
          <div className="font-semibold text-yellow-800 mb-1">
            Editor’s Note
          </div>
          <div className="whitespace-pre-line">{editorNote}</div>
        </div>
      )}

      <div className="flex justify-center mb-3 text-xs">
        <div className="flex justify-center gap-3 mb-3 text-xs">
          <button
            onClick={() => onShare(best.id)}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-800 text-white"
          >
            <Share2 className="w-3 h-3" /> Share
          </button>

          <a
            href={`/qna/${best.id}?lang=${selectedLang}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-800"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mb-3 text-xs">
        {!isSystem && isHigh && (
          <div className="text-gray-500">
            {selectedLang === "kn"
              ? "ನೀವು ಹುಡುಕುತ್ತಿದ್ದ ಉತ್ತರ ಸಿಗಲಿಲ್ಲವೇ?"
              : "Not what you were looking for?"}
          </div>
        )}

        {!isSystem && isClose && (
          <div className="text-gray-600">
            Not the question you wanted to ask ?
          </div>
        )}
        <div className="flex items-center gap-3 pt-3 mt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => onShare(r.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>

          <a
            href={`/qna/${r.id}?lang=${selectedLang}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Q&A
          </a>
        </div>
      </div>
      {result.relatedQuestions?.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs font-semibold text-gray-500 mb-2">
            <Search className="w-4 h-4 mr-2" />
            Related questions
          </div>

          <div className="space-y-2">
            {result.relatedQuestions.map((r, i) => (
              <button
                key={i}
                onClick={() => onRelatedClick(r.displayText)}
                className="w-full text-left text-gray-700 text-xs p-2 rounded-md hover:bg-gray-100"
              >
                <MessageCircle className="w-3 h-3 inline mr-1" />
                {r.displayText}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------
   MESSAGE BUBBLE
--------------------------------------------------------- */

/* ---------------------------------------------------------
   MAIN CHATBOT
--------------------------------------------------------- */
const ChatbotSection = () => {
  const [searchResult, setSearchResult] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  //chat box height
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [userInput]);

  //toaster notification
  const [toast, setToast] = useState(null);

  //language selection
  const searchParams = useSearchParams();

  const [selectedLang, setSelectedLang] = useState(() => {
    const urlLang = searchParams.get("lang");

    if (urlLang === "en" || urlLang === "kn") {
      return urlLang;
    }

    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "kn") {
      return savedLang;
    }

    return "kn";
  });

  useEffect(() => {
    const urlLang = searchParams.get("lang");

    if (urlLang === "en" || urlLang === "kn") {
      localStorage.setItem("lang", urlLang);
      setSelectedLang(urlLang);
    }
  }, [searchParams]);

  /*handle rephrase*/
  function handleRephrase(text) {
    setUserInput(text);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  //qna Share
  async function shareQA(id) {
    const shareUrl = `${window.location.origin}/qna/${id}?lang=${selectedLang}`;

    // Mobile native share
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: "Al Ansar Weekly",
          url: shareUrl,
        });
        return;
      } catch (err) {
        console.error("Share cancelled:", err);
      }
    }

    // Desktop → copy only
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast("Link copied to clipboard");
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast("Unable to copy link");
      setTimeout(() => setToast(null), 2000);
    }
  }

  const handleSend = async (textOverride = null, selectedId = null) => {
    if (isLoading) return;

    const queryText = (textOverride ?? userInput).trim();
    if (!queryText) return;

    setSearchResult(null);

    if (!textOverride) {
      setUserInput("");
    }

    const normalized = queryText.toLowerCase();

    const greetings = [
      "hello",
      "hi",
      "hey",
      "salam",
      "salaam",
      "assalamu alaikum",
      "assalamualaikum",
    ];

    if (greetings.some((g) => normalized.startsWith(g))) {
      setSearchResult({
        mode: "system",
        query: queryText,
        bestMatch: {
          question:
            selectedLang === "kn" ? "ಈ ಚಾಟ್‌ಬಾಟ್ ಬಗ್ಗೆ" : "About this chatbot",
          answer:
            selectedLang === "kn"
              ? "ನಾನು AlAnsarWeekly ಪ್ರಕಟಿಸಿದ ದೃಢೀಕೃತ ಪ್ರಶ್ನೋತ್ತರಗಳ ಆಧಾರದ ಮೇಲೆ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡುತ್ತೇನೆ.\n\nಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿರುವ ಕೆಲವು ಉತ್ತರಗಳು AlAnsar Weeklyಯ ಕೇಳಿ ನೋಡಿ ವಿಭಾಗದಲ್ಲಿ ಹಿಂದೆಯೇ ಕೇಳಲಾದ ಪ್ರಶ್ನೆಗಳ ಅನುವಾದವಾಗಿರುತ್ತವೆ."
              : "I provide answers to Islamic questions based on AlAnsarWeekly’s verified Q&A archive.\n\nSome answers in English are translations of questions previously asked in the Keli Nodi section of AlAnsar Weekly.",
        },
      });

      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/qa-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: queryText,
          lang: selectedLang,
          selectedId,
        }),
      });

      const data = await res.json();

      if (data.noMatch) {
        setSearchResult({
          mode: "noMatch",
          query: queryText,
          suggestions: [],
        });

        setIsLoading(false);
        return;
      }

      console.log("QA SEARCH RESPONSE:", data);

      if (data.mode === "suggestions") {
        setSearchResult({
          mode: "suggestions",
          query: queryText,
          suggestions: (data.suggestions || []).slice(0, 5),
        });

        setIsLoading(false);
        return;
      }

      if (data.mode === "explore") {
        setSearchResult({
          mode: "explore",
          query: queryText,
          results: data.results || [],
        });

        setIsLoading(false);
        return;
      }

      setSearchResult({
        mode: "answer",
        query: queryText,
        bestMatch: data.bestMatch
          ? {
              id: data.bestMatch.id,
              question: data.bestMatch.question,
              answer: data.bestMatch.answer,
              score: data.bestMatch.score ?? 0,

              editorNote:
                selectedLang === "kn"
                  ? data.bestMatch.editorNote_kn
                  : data.bestMatch.editorNote_en,

              imamName: data.bestMatch.imam_name,
              samputa: data.bestMatch.samputa,
              sanchike: data.bestMatch.sanchike,

              sourceTitle:
                data.bestMatch.source_title || "Al Ansar Knowledge Base",
            }
          : null,
      });
    } catch (err) {
      console.error("QA SEARCH ERROR:", err);

      setSearchResult({
        mode: "noMatch",
        query: queryText,
        suggestions: [],
      });
    }

    setIsLoading(false);
  };

  return (
    <section
      id="chatbot-section"
      className="w-full flex flex-col items-center py-12"
    >
      {toast && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 
                    bg-blue-500 text-white text-sm px-4 py-2 
                    rounded-full shadow-lg z-50"
        >
          {toast}
        </div>
      )}
      <header className="text-center mb-6 flex flex-col items-center gap-4">
        <IconBubble variant="primary">
          <BookOpen className="w-6 h-6 text-white" />
        </IconBubble>

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            {headings[selectedLang].title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {headings[selectedLang].subtitle}
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-end  gap-2">
          <textarea
            ref={inputRef}
            disabled={isLoading}
            value={userInput}
            rows={1}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              selectedLang === "kn"
                ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                : "Ask your Islamic question..."
            }
            className="
    flex-grow
    min-h-[56px]
    max-h-[160px]
    overflow-y-auto
    resize-none
    px-5 py-4
    rounded-2xl
    text-gray-700
    bg-white
    border border-gray-300
    focus:outline-none
    focus:ring-2
    focus:ring-blue-100
    focus:border-blue-400
    text-base
    leading-relaxed
  "
          />

          <button
            disabled={isLoading || !userInput.trim()}
            onClick={() => handleSend()}
            className="
        bg-blue-600
        hover:bg-blue-700
        text-white
        p-4
        rounded-full
        disabled:opacity-40
        transition
      "
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Source bezel */}
        <div className="mt-3 pt-3 pb-2 border-b border-gray-200 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <BookOpen className="w-3 h-3 text-gray-400" />

            <span className="text-[10px] font-medium text-gray-500">
              {selectedLang === "kn" ? "ಉತ್ತರಗಳ ಮೂಲ" : "About these answers"}
            </span>
          </div>

          <p className="text-[10px] leading-relaxed text-gray-500 max-w-xl mx-auto">
            {headings[selectedLang].disclaimer}
          </p>
        </div>

        {/* Search results */}

        {isLoading ? (
          <div className="py-10 flex justify-center">
            <TypingDots />
          </div>
        ) : searchResult ? (
          <div className="w-full max-w-5xl mx-auto">
            {/* Results */}
            {searchResult.mode !== "noMatch" && (
              <>
                <div className="mb-4 mt-2 ">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {selectedLang === "kn"
                      ? "ನಿಮ್ಮ ಹುಡುಕಾಟದ ಆಧಾರದ ಮೇಲಿನ ಪ್ರಶ್ನೆಗಳು"
                      : "Questions based on your search"}
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLang === "kn"
                      ? "ಉತ್ತರವನ್ನು ಓದಲು ಒಂದು ಪ್ರಶ್ನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ."
                      : "Select a question to read the full answer."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(searchResult.mode === "suggestions"
                    ? searchResult.suggestions
                    : searchResult.mode === "answer" && searchResult.bestMatch
                      ? [searchResult.bestMatch]
                      : searchResult.mode === "explore"
                        ? searchResult.results
                        : []
                  )
                    .slice(0, 5)
                    .map((r) => {
                      const badge =
                        r.score >= CONFIDENCE.HIGH
                          ? {
                              label:
                                selectedLang === "kn"
                                  ? "ಬಲವಾದ ಹೊಂದಾಣಿಕೆ"
                                  : "Strong match",
                              className:
                                "bg-green-50 text-green-700 border-green-100",
                            }
                          : r.score >= 0.65
                            ? {
                                label:
                                  selectedLang === "kn"
                                    ? "ತುಂಬಾ ಹತ್ತಿರ"
                                    : "Very close",
                                className:
                                  "bg-blue-50 text-blue-700 border-blue-100",
                              }
                            : {
                                label:
                                  selectedLang === "kn"
                                    ? "ಹತ್ತಿರದ ಹೊಂದಾಣಿಕೆ"
                                    : "Close match",
                                className:
                                  "bg-yellow-50 text-yellow-700 border-yellow-100",
                              };

                      const answer = r.answer || "";
                      const truncatedAnswer =
                        answer.length > 180
                          ? `${answer.slice(0, 180).trim()}...`
                          : answer;

                      const imamName = r.imamName || r.imam_name;
                      const samputa = r.samputa;
                      const sanchike = r.sanchike;
                      const sourceTitle = r.sourceTitle || r.source_title;

                      let attribution =
                        selectedLang === "kn"
                          ? "ಅಲ್ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆಯಿಂದ ಸಂಗ್ರಹವಾದ ಮಾಹಿತಿ (1991–2016)"
                          : "From the Archives of AlAnsar Weekly (1991–2016)";

                      if (imamName) {
                        attribution = imamName;
                      } else if (samputa || sanchike) {
                        attribution =
                          selectedLang === "kn"
                            ? `${samputa ? `ಸಂಪುಟ ${samputa}` : ""}${
                                samputa && sanchike ? " " : ""
                              }${sanchike ? `ಸಂಚಿಕೆ ${sanchike}` : ""}`
                            : `${samputa ? `Samputa ${samputa}` : ""}${
                                samputa && sanchike ? " " : ""
                              }${sanchike ? `Sanchike ${sanchike}` : ""}`;
                      } else if (sourceTitle) {
                        attribution = sourceTitle;
                      }

                      return (
                        <article
                          key={r.id}
                          className="
                    group
                    bg-white
                    border border-gray-200
                    rounded-xl
                    p-4
                    hover:border-blue-200
                    hover:shadow-sm
                    transition
                    flex
                    flex-col
                  "
                        >
                          <span
                            className={`
                      self-start
                      px-2.5 py-1
                      rounded-full
                      border
                      text-[10px]
                      font-semibold
                      ${badge.className}
                    `}
                          >
                            {badge.label}
                          </span>

                          <h3 className="mt-3 text-sm font-semibold text-gray-900 leading-snug">
                            {r.question}
                          </h3>

                          {truncatedAnswer && (
                            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                              {truncatedAnswer}
                            </p>
                          )}

                          {attribution && (
                            <div className="mt-3 text-[10px] text-gray-400">
                              {attribution}
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4">
                            <a
                              href={`/qna/${r.id}?lang=${selectedLang}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open
                            </a>

                            <button
                              type="button"
                              onClick={() => shareQA(r.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              Share
                            </button>
                          </div>
                        </article>
                      );
                    })}
                </div>
              </>
            )}

            {/* Always show fallback after a search */}
            <div className="mt-5 border border-gray-200 rounded-xl px-4 py-4 text-center">
              <p className="text-xs font-medium text-gray-600 mb-3">
                {searchResult.mode === "noMatch"
                  ? selectedLang === "kn"
                    ? "ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ"
                    : "No questions found"
                  : selectedLang === "kn"
                    ? "ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪ್ರಶ್ನೆ ಸಿಗಲಿಲ್ಲವೇ?"
                    : "Didn't find the question you're looking for?"}
              </p>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRephrase(searchResult.query)}
                  className="
            px-4 py-2
            rounded-lg
            bg-gray-100
            hover:bg-gray-200
            text-gray-700
            text-xs
            font-semibold
          "
                >
                  {selectedLang === "kn" ? "ಮರುಹೊಂದಿಸಿ" : "Rephrase"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("trigger-ask-question", {
                        detail: { question: searchResult.query },
                      }),
                    )
                  }
                  className="
            px-4 py-2
            rounded-lg
            bg-blue-600
            hover:bg-blue-700
            text-white
            text-xs
            font-semibold
          "
                >
                  {selectedLang === "kn"
                    ? "ಪ್ರಶ್ನೆ ಸಲ್ಲಿಸಿ"
                    : "Submit Question"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ChatbotSection;
