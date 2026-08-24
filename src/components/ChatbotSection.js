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

            return (
              <div
                key={r.id}
                className="
                w-full
                rounded-xl
                border border-gray-100
                bg-white
                overflow-hidden
                transition
              "
              >
                {/* Question */}
                <button
                  type="button"
                  onClick={() => {
                    if (!canExpand) return;

                    setExpandedSuggestionId(isExpanded ? null : r.id);
                  }}
                  className="
  w-full
  text-left
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
                          ? "bg-blue-50 text-blue-600"
                          : r.score >= 0.65
                            ? "bg-indigo-50 text-indigo-600"
                            : "bg-gray-100 text-gray-600"
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
                  {!isExpanded && (
                    <div
                      ref={(el) => {
                        answerRefs.current[r.id] = el;
                      }}
                      className="mt-2 text-sm leading-relaxed text-blue-600 line-clamp-2"
                    >
                      {r.answer}
                    </div>
                  )}

                  {/* Arrow */}
                  {canExpand && (
                    <div className="flex justify-end mt-2">
                      <span
                        className={`
        flex items-center justify-center
        w-8 h-8
        rounded-full
        bg-gray-50
        text-gray-400
        transition-transform
        ${isExpanded ? "rotate-90" : ""}
      `}
                      >
                        →
                      </span>
                    </div>
                  )}
                </button>

                {/* Expanded answer */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="pt-3 border-t border-gray-100">
                      <div
                        className="text-sm leading-relaxed text-blue-200 bg-gray-50 rounded-lg p-3 whitespace-pre-line"
                        style={{ color: "#2563eb" }}
                      >
                        {r.answer}
                      </div>

                      <div className="mt-3 flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onShare(r.id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs"
                        >
                          Share
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (!canExpand) return;

                            setExpandedSuggestionId(isExpanded ? null : r.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

  const imamName = best?.imamName;
  const samputa = best?.samputa;
  const sanchike = best?.sanchike;
  const sourceTitle = best?.sourceTitle;

  const sourceLabel = selectedLang === "kn" ? "ಉತ್ತರದ ಮೂಲ" : "Answer source";

  let answerSource =
    selectedLang === "kn"
      ? "ಅಲ್ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆಯಿಂದ ಸಂಗ್ರಹವಾದ ಮಾಹಿತಿ (1991–2016)"
      : "From the Archives of AlAnsar Weekly  (1991–2016)";

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
        </span>{" "}
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

        <div className="flex gap-3">
          {!isSystem && (
            <button
              onClick={onRephrase}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Rephrase query
            </button>
          )}

          {!isSystem && (
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("trigger-ask-question", {
                    detail: { question: query },
                  }),
                )
              }
              className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit Question
            </button>
          )}
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
const MessageBubble = ({
  message,
  onRelatedClick,
  onShare,
  selectedLang,
  onRephrase,
}) => {
  if (message.type === "user") {
    return (
      <div className="flex justify-end mb-5">
        <div
          className="bg-blue-600 text-white px-4 py-2.5 
                                rounded-[16px_16px_4px_16px]
                                max-w-[70%] text-sm "
        >
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 w-full">
      <div className="w-full">
        <BotResponseCard
          result={message.result}
          selectedLang={selectedLang}
          query={message.query}
          onRelatedClick={onRelatedClick}
          onShare={onShare}
          onRephrase={() => onRephrase(message.query)}
        />
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   MAIN CHATBOT
--------------------------------------------------------- */
const ChatbotSection = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [seenQuestions, setSeenQuestions] = useState(new Set());
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

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

  //chatbox expand useEffect
  useEffect(() => {
    const expandChat = () => {
      setExpanded(true);
    };

    window.addEventListener("expand-chatbot", expandChat);

    return () => {
      window.removeEventListener("expand-chatbot", expandChat);
    };
  }, []);

  //chat history
  useEffect(() => {
    const saved = localStorage.getItem("chat_history");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      const TWO_HOURS = 2 * 60 * 60 * 1000;

      // ✅ NEW FORMAT (object with timestamp)
      if (parsed?.messages && parsed?.timestamp) {
        if (Date.now() - parsed.timestamp > TWO_HOURS) {
          localStorage.removeItem("chat_history");
          return;
        }

        setMessages(parsed.messages);
        return;
      }

      // ✅ OLD FORMAT (array) — fallback support
      if (Array.isArray(parsed)) {
        setMessages(parsed.slice(-20)); // also cap it
      }
    } catch {
      localStorage.removeItem("chat_history");
    }
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!expanded) return;

    setTimeout(() => {
      chatRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);
  }, [expanded]);

  //chat history
  useEffect(() => {
    if (messages.length === 0) {
      localStorage.removeItem("chat_history");
    } else {
      const MAX_MESSAGES = 30;
      const trimmedMessages = messages.slice(-MAX_MESSAGES);

      localStorage.setItem(
        "chat_history",
        JSON.stringify({
          messages: trimmedMessages,
          timestamp: Date.now(),
        }),
      );
    }
  }, [messages]);

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

    if (!textOverride) setUserInput("");

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
      setMessages((prev) => [
        ...prev,
        { type: "user", text: queryText },
        {
          type: "bot",
          query: queryText,
          result: {
            isSystem: true,
            bestMatch: {
              question:
                selectedLang === "kn"
                  ? "ಈ ಚಾಟ್‌ಬಾಟ್ ಬಗ್ಗೆ"
                  : "About this chatbot",
              answer:
                selectedLang === "kn"
                  ? "ನಾನು AlAnsarWeekly ಪ್ರಕಟಿಸಿದ ದೃಢೀಕೃತ ಪ್ರಶ್ನೋತ್ತರಗಳ ಆಧಾರದ ಮೇಲೆ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರ ನೀಡುತ್ತೇನೆ.\n\nಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿರುವ ಕೆಲವು ಉತ್ತರಗಳು AlAnsar Weeklyಯ ಕೇಳಿ ನೋಡಿ ವಿಭಾಗದಲ್ಲಿ ಹಿಂದೆಯೇ ಕೇಳಲಾದ ಪ್ರಶ್ನೆಗಳ ಅನುವಾದವಾಗಿರುತ್ತವೆ."
                  : "I provide answers to Islamic questions based on AlAnsarWeekly’s verified Q&A archive.\n\nSome answers in English are translations of questions previously asked in the Keli Nodi section of AlAnsar Weekly.",
              score: 1,
            },
            relatedQuestions: [],
          },
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { type: "user", text: queryText }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/qa-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          lang: selectedLang,
          selectedId,
        }),
      });

      //console remove
      const data = await res.json();

      if (data.noMatch) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            result: {
              noMatch: true,
            },
            query: queryText,
          },
        ]);

        setIsLoading(false);
        return;
      }

      console.log("QA SEARCH RESPONSE:", data);
      // mark best match as seen

      const nextSeen = new Set(seenQuestions);

      if (data.bestMatch?.question) {
        nextSeen.add(data.bestMatch.question);
        setSeenQuestions(nextSeen);
      }

      const relatedFiltered = (data.related || [])
        .filter((r) => {
          if (!r.question) return false;
          if (r.score != null && r.score < CONFIDENCE.LOW) return false;
          if (nextSeen.has(r.question)) return false;
          return true;
        })
        .slice(0, 3)
        .map((r) => ({ displayText: r.question }));

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          result:
            data.mode === "suggestions"
              ? {
                  mode: "suggestions",
                  suggestions: data.suggestions || [],
                }
              : data.mode === "explore"
                ? {
                    mode: "explore",
                    results: data.results || [],
                  }
                : {
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
                            data.bestMatch.source_title ||
                            "Al Ansar Knowledge Base",
                        }
                      : null,
                    relatedQuestions: relatedFiltered,
                  },

          query: queryText,
        },
      ]);
    } catch (err) {
      console.error("QA SEARCH ERROR:", err);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          result: { noMatch: true },
          query: queryText,
        },
      ]);
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
      <div
        className={`
    w-full max-w-3xl mx-auto
    bg-white border border-gray-200
    overflow-hidden border-2 border-gray-400
    transition-all duration-500
    ${expanded ? "rounded-lg" : "rounded-2xl"}
  `}
      >
        {/* Search bar */}
        {!expanded && (
          <button
            onClick={() => {
              setExpanded(true);

              setTimeout(() => {
                document.getElementById("chatbot-section")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }, 300);
            }}
            className="
      w-full
      px-6
      py-5
      flex
      items-center
      justify-between
      text-left
      bg-white
      border-gray-400
    "
          >
            <span className="text-gray-500">
              {selectedLang === "kn"
                ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ..."
                : "Ask your Islamic question..."}
            </span>

            <Search className="w-5 h-5 text-gray-400" />
          </button>
        )}
        {/* Chat UI */}
        <div
          className={`
    overflow-hidden
    transition-all duration-700 ease-in-out
    ${expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
  `}
        >
          <div
            ref={chatRef}
            className={`
    px-4 py-6 overflow-y-auto flex flex-col border-t border-gray-100
    transition-all duration-700 ease-in-out
    ${expanded ? "h-[60vh]" : "h-0"}
  `}
          >
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-1 items-center justify-center text-center">
                <div className="max-w-sm px-6">
                  <div className="text-lg font-medium text-gray-700">
                    {selectedLang === "kn"
                      ? "ನಿಮ್ಮ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ"
                      : "Ask your Islamic question"}
                  </div>

                  <div className="mt-2 text-sm text-gray-400">
                    {selectedLang === "kn"
                      ? "ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ."
                      : "Type your question in the box below."}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <MessageBubble
                    key={i}
                    message={m}
                    selectedLang={selectedLang}
                    onRelatedClick={handleSend}
                    onShare={shareQA}
                    onRephrase={handleRephrase}
                  />
                ))}

                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <TypingDots />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="px-4 pt-3 pb-4 border-t border-gray-200 bg-white">
            {/* Question input */}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                disabled={isLoading}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  selectedLang === "kn"
                    ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                    : "Type your question..."
                }
                className="
        flex-grow
        px-5 py-4
        rounded-full
        text-gray-700
        border-2 border-gray-400
        focus:outline-none
        focus:ring-2
        focus:ring-gray-300
        text-base
      "
              />

              <button
                disabled={isLoading || !userInput.trim()}
                onClick={() => handleSend()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full disabled:opacity-40"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom bezel / disclaimer */}
            <div className="mt-2 pt-2 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <BookOpen className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-medium text-gray-500">
                  {selectedLang === "kn"
                    ? "ಉತ್ತರಗಳ ಮೂಲ"
                    : "About these answers"}
                </span>
              </div>

              <p className="text-[10px] leading-relaxed text-gray-600 font-semibold max-w-md mx-auto">
                {headings[selectedLang].disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatbotSection;
