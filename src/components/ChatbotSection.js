'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Zap, MessageCircle, Share2 } from 'lucide-react';

/* ----------------------------------
   CONFIG
---------------------------------- */
const langs = [
    { code: 'en', label: 'EN' },
    { code: 'kn', label: 'KN' },
];

const headings = {
    en: {
        title: "Ask & See Bot",
        subtitle: "Ask your Islamic questions here",
    },
    kn: {
        title: "ಕೇಳಿ ನೋಡಿ ಬಾಟ್",
        subtitle: "ನಿಮ್ಮ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಇಲ್ಲಿ ಕೇಳಿ",
    },
};

// Confidence thresholds (frontend only)
const CONFIDENCE = {
    HIGH: 0.85,
    LOW: 0.45,
};

/* ---------------------------------------------------------
   BOT RESPONSE CARD (CONFIDENCE AWARE)
--------------------------------------------------------- */
const BotResponseCard = ({ result, query, onRelatedClick, onShare }) => {
    const best = result?.bestMatch;

    if (!best) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                <p className="font-semibold mb-1">No Direct Match Found</p>
                <p className="text-sm">
                    I couldn’t find a confident answer for: <b>"{query}"</b>.
                </p>
            </div>
        );
    }

    const score = best.score ?? 0;
    const isHighConfidence = score >= CONFIDENCE.HIGH;
    const isClosestMatch = score >= CONFIDENCE.LOW && score < CONFIDENCE.HIGH;

    return (
        <div className="bg-white p-4 rounded-[16px_16px_16px_4px] border border-blue-100 shadow-sm text-sm">

            {/* Confidence badge */}
            {isHighConfidence && (
                <div className="mb-2 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full inline-block">
                    Verified answer
                </div>
            )}

            {isClosestMatch && (
                <div className="mb-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block">
                    Closest matching answer
                </div>
            )}

            <div className="flex items-start text-blue-700 font-semibold mb-3">
                <Zap className="w-4 h-4 mr-2 mt-0.5" />
                {best.question}
            </div>

            <div className="text-gray-700 leading-relaxed mb-4 p-3 bg-blue-50 rounded-lg">
                {best.answer}
            </div>

            <div className="flex justify-center mb-3">
                <button
                    onClick={() => onShare(best.question, best.answer)}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Share2 className="w-3 h-3" /> Share
                </button>
            </div>

            {result.relatedQuestions?.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs font-semibold text-gray-500 mb-2">
                        <Search className="w-4 h-4 mr-2" />
                        People also asked
                    </div>

                    <div className="space-y-2">
                        {result.relatedQuestions.map((r, i) => (
                            <button
                                key={r.id || i}
                                onClick={() => onRelatedClick(r)}
                                className="w-full text-left text-blue-600 hover:text-white text-xs p-2 rounded-lg bg-gray-50 hover:bg-blue-500 border border-gray-200"
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
const MessageBubble = ({ message, onRelatedClick, onShare }) => {
    if (message.type === "user") {
        return (
            <div className="flex justify-end mb-3">
                <div className="bg-[#0B4C8C] text-white px-4 py-2.5 
                                rounded-[16px_16px_4px_16px]
                                max-w-[70%] text-sm leading-relaxed shadow">
                    {message.text}
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start mb-4">
            <div className="max-w-[75%]">
                <BotResponseCard
                    result={message.result}
                    query={message.query}
                    onRelatedClick={onRelatedClick}
                    onShare={onShare}
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
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLang, setSelectedLang] = useState('kn');

    const chatRef = useRef(null);

    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, isLoading]);

    async function shareQA(q, a) {
        const payload = `${q}\n\n${a}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: q, text: payload });
                return;
            } catch { }
        }
        await navigator.clipboard.writeText(payload);
        alert("Copied!");
    }

    const handleSend = async (clicked = null) => {
        if (isLoading) return;

        let queryText;

        if (clicked) {
            queryText = clicked.displayText;
        } else {
            const raw = userInput.trim();
            if (!raw) return;
            queryText = raw;
            setUserInput('');
        }

        setMessages(prev => [...prev, { type: 'user', text: queryText }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/qa-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: queryText,
                    lang: selectedLang,
                }),
            });

            const data = await res.json();

            const bestMatch = data.bestMatch
                ? {
                    question: data.bestMatch.question,
                    answer: data.bestMatch.answer,
                    score: data.bestMatch.score ?? 0,
                }
                : null;

            const relatedQuestions = (data.related || []).map(r => ({
                id: r.id,
                displayText: r.question,
            }));

            setMessages(prev => [...prev, {
                type: "bot",
                result: { bestMatch, relatedQuestions },
                query: queryText,
            }]);
        } catch {
            setMessages(prev => [...prev, {
                type: "bot",
                result: { bestMatch: null },
                query: queryText,
            }]);
        }

        setIsLoading(false);
    };

    return (
        <section className="min-h-[70vh] flex flex-col items-center px-2">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-extrabold">
                    {headings[selectedLang].title}
                </h1>
                <p className="text-gray-500">
                    {headings[selectedLang].subtitle}
                </p>
            </header>

            <div className="flex gap-2 mb-4">
                {langs.map(l => (
                    <button
                        key={l.code}
                        onClick={() => setSelectedLang(l.code)}
                        className={`px-3 py-1 rounded-md font-semibold ${selectedLang === l.code
                            ? "bg-indigo-600 text-white"
                            : "bg-white border"
                            }`}
                    >
                        {l.label}
                    </button>
                ))}
            </div>

            <div className="bg-gray-100 rounded-xl w-full max-w-3xl flex flex-col h-[70vh] border">
                <div ref={chatRef} className="flex-grow px-4 py-6 overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Search className="w-10 h-10 mb-3" />
                            <p>
                                {selectedLang === "kn"
                                    ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                                    : "Type your question…"}
                            </p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <MessageBubble
                            key={i}
                            message={m}
                            onRelatedClick={handleSend}
                            onShare={shareQA}
                        />
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-200 px-4 py-3 rounded-[16px_16px_16px_4px] flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 border-t bg-white rounded-b-xl">
                    <div className="flex items-center gap-2">
                        <input
                            disabled={isLoading}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                            placeholder={
                                selectedLang === "kn"
                                    ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                                    : "Type your question..."
                            }
                            className="flex-grow px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            disabled={isLoading || !userInput.trim()}
                            onClick={() => handleSend()}
                            className="bg-indigo-600 text-white p-3 rounded-full disabled:opacity-40"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatbotSection;
