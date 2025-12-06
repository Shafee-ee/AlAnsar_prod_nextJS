'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Loader, Search, Send, Zap, MessageCircle, Share2 } from 'lucide-react';

const langs = [
    { code: 'en', label: 'EN' },
    { code: 'kn', label: 'KN' },
];

const greetings = [
    "hi", "hello", "hey",
    "salaam", "salams",
    "assalamualaikum", "as-salamu alaikum", "asalamualaikum"
];

const LoaderSmall = () => (
    <Loader className="w-4 h-4 mr-2 animate-spin text-indigo-500" />
);

/* ---------------------------------------------------------
 * BOT CARD (FIXED Q/A + FIXED SHARE BUTTON)
 * --------------------------------------------------------- */
const BotResponseCard = ({ result, query, onRelatedClick, onShare }) => {
    if (!result?.bestMatch) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl rounded-tl-none shadow-lg border border-red-200">
                <p className="font-semibold mb-1">🔍 No Direct Match Found</p>
                <p className="text-sm">I couldn’t find a confident answer for: <b>"{query}"</b>.</p>
                {result?.fallbackAnswer && (
                    <p className="text-xs mt-2 text-red-500">{result.fallbackAnswer}</p>
                )}
            </div>
        );
    }

    const { bestMatch, relatedQuestions } = result;

    return (
        <div className="bg-white p-4 rounded-xl rounded-tl-none shadow-2xl border border-blue-200">

            <div className="flex items-start text-blue-600 font-bold mb-3 border-b pb-2 border-blue-100">
                <Zap className="w-5 h-5 mr-2" />
                <span className="text-lg">{bestMatch.question}</span>
            </div>

            <div className="text-gray-700 leading-relaxed mb-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md text-sm">
                {bestMatch.answer}
            </div>

            {/* SMALL CENTERED SHARE BUTTON */}
            <div className="flex justify-center mb-3">
                <button
                    onClick={() => onShare(bestMatch.question, bestMatch.answer)}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow"
                >
                    <Share2 className="w-3 h-3" />
                    Share
                </button>
            </div>

            {relatedQuestions.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                        <Search className="w-4 h-4 mr-2" />
                        ಸಂಬಂಧಿತ ವಿಷಯಗಳು (Related)
                    </div>

                    <div className="space-y-2">
                        {relatedQuestions.map((r, i) => (
                            <button
                                key={i}
                                onClick={() => onRelatedClick(r.originalQuestion)}
                                className="w-full text-left text-blue-600 hover:text-white text-xs p-2 rounded-lg bg-gray-50 hover:bg-blue-500 border border-gray-200 truncate shadow-sm"
                            >
                                <MessageCircle className="w-3 h-3 inline mr-1" />
                                {r.question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------------------------------------------------------
 * MAIN CHATBOT
 * --------------------------------------------------------- */
const ChatbotSection = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLang, setSelectedLang] = useState('kn');

    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    /* ------------------------------- Translation ------------------------------- */
    async function translateText(text, targetLang) {
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang })
            });
            const j = await res.json();
            return j?.translated || text;
        } catch {
            return text;
        }
    }

    /* ------------------------------- Share ------------------------------- */
    async function shareQA(question, answer) {
        const payload = `${question}\n\n${answer}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: question, text: payload });
                return;
            } catch { }
        }
        await navigator.clipboard.writeText(payload);
        alert("Copied to clipboard!");
    }

    /* ------------------------------- SEND MESSAGE ------------------------------- */
    const handleSend = async (clickedText = null) => {
        let query = "";

        if (clickedText) {
            query = typeof clickedText === "string"
                ? clickedText.trim()
                : clickedText.question.trim();
        } else {
            query = userInput.trim();
        }
        if (!query || isLoading) return;

        setMessages(prev => [...prev, { type: 'user', text: query }]);
        if (!clickedText) setUserInput('');

        setIsLoading(true);

        /* Greeting handling */
        const isExactGreeting = (() => {
            const cleaned = query.toLowerCase().trim();
            return greetings.includes(cleaned)
        })();

        if (isExactGreeting) {
            const englishReply =
                "I am an Islamic Q&A bot. Ask me any Islamic question, and I will check the clouds for your answer.";

            const reply =
                selectedLang === "en"
                    ? englishReply
                    : await translateText(englishReply, selectedLang);

            setMessages(prev => [
                ...prev,
                {
                    type: "bot",
                    result: {
                        bestMatch: { question: query, answer: reply },
                        relatedQuestions: []
                    },
                    query
                }
            ]);
            setIsLoading(false);
            return;
        }

        try {
            /* Translate query to English before search */
            let englishQuery = query;
            if (selectedLang !== "en") {
                englishQuery = await translateText(query, "en");
            }

            const res = await fetch('/api/qa-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: englishQuery })
            });

            const data = await res.json();

            /* If fail */
            if (!data.success) {
                let fallback = data.answer;
                if (selectedLang !== "en") {
                    fallback = await translateText(fallback, selectedLang);
                }

                setMessages(prev => [
                    ...prev,
                    {
                        type: "bot",
                        result: { fallbackAnswer: fallback },
                        query
                    }
                ]);

                setIsLoading(false);
                return;
            }

            /* FIXED — Correct mapping from backend */
            let finalQ = data.bestMatch.question;
            let finalA = data.bestMatch.answer;

            /* Translate output back to selected language */
            if (selectedLang !== 'en') {
                const [tq, ta] = await Promise.all([
                    translateText(finalQ, selectedLang),
                    translateText(finalA, selectedLang)
                ]);
                finalQ = tq;
                finalA = ta;
            }

            /* Translate related questions + answers */
            let related = data.related || [];

            if (related.length > 0) {
                const translatedPairs = await Promise.all(
                    related.map(async (r) => {
                        const [tq, ta] = await Promise.all([
                            translateText(r.question, selectedLang),
                            translateText(r.answer, selectedLang)
                        ]);
                        return { question: tq, answer: ta };
                    })
                );
                related = translatedPairs;
            }


            /* Push bot message */
            setMessages(prev => [
                ...prev,
                {
                    type: 'bot',
                    result: {
                        bestMatch: { question: finalQ, answer: finalA },
                        relatedQuestions: related
                    },
                    query
                }
            ]);

        } catch (e) {
            let fallback = "Server error. Try again later.";
            if (selectedLang !== 'en') {
                fallback = await translateText(fallback, selectedLang);
            }

            setMessages(prev => [
                ...prev,
                { type: 'bot', result: { fallbackAnswer: fallback }, query }
            ]);
        }

        setIsLoading(false);
    };

    /* ------------------------------- Bubble Component ------------------------------- */
    const MessageBubble = ({ message }) => {
        if (message.type === "user") {
            return (
                <div className="flex justify-end mb-4">
                    <div className="bg-blue-600 text-white p-3 rounded-xl rounded-br-none shadow max-w-md">
                        {message.text}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex justify-start mb-6">
                <div className="max-w-xl w-full">
                    <BotResponseCard
                        result={message.result}
                        query={message.query}
                        onRelatedClick={handleSend}
                        onShare={shareQA}
                    />
                </div>
            </div>
        );
    };

    /* ------------------------------- UI ------------------------------- */
    return (
        <section className="min-h-[70vh] flex flex-col items-center justify-center mb-16 px-4">

            <header className="text-center mb-4">
                <h1 className="text-3xl font-extrabold text-gray-900">
                    ಕೇಳಿ ಕೇಳಿ ಪ್ರಶ್ನೋತ್ತರ ಬಾಟ್ (Keli Nodi Q&A Bot)
                </h1>
                <p className="text-gray-500 text-lg">ನಿಮ್ಮ ಮೂಲಭೂತ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.</p>
            </header>

            {/* Language Toggle */}
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

            <div className="bg-gray-100 shadow-2xl rounded-2xl w-full max-w-3xl flex flex-col h-[70vh] border">

                {/* CHAT WINDOW */}
                <div ref={chatRef} className="flex-grow p-4 overflow-y-auto">

                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Search className="w-10 h-10 mb-3 text-blue-400" />
                            <p className="text-lg">ಕೆಳಗೆ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ…</p>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <MessageBubble key={i} message={m} />
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white p-3 rounded-xl border shadow flex items-center">
                                <LoaderSmall />
                                Looking for best answer…
                            </div>
                        </div>
                    )}

                </div>

                {/* INPUT BOX */}
                <div className="p-4 border-t bg-white rounded-b-2xl">
                    <div className="flex">
                        <input
                            disabled={isLoading}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder={
                                selectedLang === "kn"
                                    ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                                    : "Type your question here..."
                            }
                            className="flex-grow p-3 border rounded-l-lg focus:ring-2"
                        />

                        <button
                            disabled={isLoading || userInput.trim() === ""}
                            onClick={() => handleSend()}
                            className="bg-indigo-600 text-white p-3 rounded-r-lg hover:bg-indigo-700"
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
