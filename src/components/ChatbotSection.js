'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Zap, MessageCircle, Share2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

/* ----------------------------------
   CONFIG
---------------------------------- */


const headings = {
    en: {
        title: "Seek & Discover",
        subtitle: "Ask your Islamic questions here",
        disclaimer: "These answers are sourced from AlAnsar Weekly’s archive. Some English responses are translations of questions previously asked in the Keli Nodi section.",
    },
    kn: {
        title: "ಕೇಳಿ ನೋಡಿ",
        subtitle: "ನಿಮ್ಮ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಇಲ್ಲಿ ಕೇಳಿ",
        disclaimer: "ಈ ಉತ್ತರಗಳು AlAnsar Weeklyಯ ಆರ್ಕೈವ್‌ನಿಂದ ಪಡೆಯಲ್ಪಟ್ಟವು. ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿರುವ ಕೆಲವು ಉತ್ತರಗಳು ‘ಕೇಳಿ ನೋಡಿ’ ವಿಭಾಗದಲ್ಲಿ ಹಿಂದೆಯೇ ಕೇಳಲಾದ ಪ್ರಶ್ನೆಗಳ ಅನುವಾದವಾಗಿರುತ್ತವೆ.",
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
const BotResponseCard = ({ result, query, onRelatedClick, onShare, onRephrase }) => {
    const best = result?.bestMatch;
    const isSystem = result?.isSystem;

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
                            onClick={() => onRelatedClick(r.question)}
                            className="w-full text-left text-blue-600 hover:text-white text-xs p-2 rounded-lg bg-gray-50 hover:bg-blue-500 border border-gray-200"
                        >
                            <MessageCircle className="w-3 h-3 inline mr-1" />
                            {r.question}
                        </button>
                    ))}
                </div>
            </div>
        );
    }


    const editorNote =
        best?.editorNote ||
        best?.editorNote_en ||
        best?.editorNote_kn ||
        "";


    if (result?.noMatch) {
        return (
            <div className="bg-gray-50 text-gray-700 p-4 rounded-xl border">
                <p className="font-semibold mb-2">
                    No confident answer found
                </p>

                <p className="text-sm mb-4">
                    We couldn’t find a reliable answer for <b>"{query}"</b>.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => onRephrase(query)}
                        className="px-3 py-1 rounded-md bg-green-400 hover:bg-green-500 text-sm"
                    >
                        Rephrase query
                    </button>

                    <button
                        onClick={() =>
                            window.dispatchEvent(
                                new CustomEvent("trigger-ask-question", {
                                    detail: { question: query }
                                })
                            )
                        }
                        className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                        Submit Question
                    </button>
                </div>
            </div>
        );
    }


    const score = best.score ?? 0;
    const isHigh = score >= CONFIDENCE.HIGH;
    const isClose = score >= CONFIDENCE.LOW && score < CONFIDENCE.HIGH;

    return (
        <div className="bg-white p-4 rounded-[16px_16px_16px_4px] border border-blue-100 shadow-sm text-sm">

            {!isSystem && isHigh && (
                <div className="mb-2 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full inline-block">
                    Strong match
                </div>
            )}



            {!isSystem && isClose && (
                <div className="mb-2 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block">
                    Close match
                </div>
            )}

            <div className="flex items-start text-blue-700 font-semibold mb-3">
                <Zap className="w-4 h-4 mr-2 mt-0.5" />
                {best.question}
            </div>

            <div className="text-gray-700 leading-relaxed mb-4 p-3 bg-blue-50 rounded-lg whitespace-pre-line">
                {best.answer}
            </div>

            {editorNote && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded text-xs text-gray-700">
                    <div className="font-semibold text-yellow-800 mb-1">
                        Editor’s Note
                    </div>
                    <div className="whitespace-pre-line">
                        {editorNote}
                    </div>
                </div>
            )}


            <div className='flex justify-center mb-3 text-xs'>
                <button
                    onClick={() => onShare(best.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    <Share2 className="w-3 h-3" /> Share
                </button>


            </div>

            <div className="flex flex-col items-center gap-2 mb-3 text-xs">

                {!isSystem && isHigh && (
                    <div className="text-green-500">
                        Not what you were looking for?
                    </div>
                )}

                {!isSystem && isClose && (
                    <div className="text-amber-600">
                        This may not fully answer your question.
                    </div>
                )}

                <div className="flex gap-3">
                    {!isSystem && (
                        <button
                            onClick={onRephrase}
                            className="px-3 py-1 rounded-md bg-green-300 text-gray-700 hover:bg-gray-200"
                        >
                            Rephrase query
                        </button>
                    )}

                    {!isSystem && (
                        <button
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent("trigger-ask-question", {
                                        detail: { question: query }
                                    })
                                )
                            }
                            className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Submit Question
                        </button>
                    )}
                </div>
            </div>


            {
                result.relatedQuestions?.length > 0 && (
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
                                    className="w-full text-left text-blue-600 hover:text-white text-xs p-2 rounded-lg bg-gray-50 hover:bg-blue-500 border border-gray-200"
                                >
                                    <MessageCircle className="w-3 h-3 inline mr-1" />
                                    {r.displayText}
                                </button>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

/* ---------------------------------------------------------
   MESSAGE BUBBLE
--------------------------------------------------------- */
const MessageBubble = ({ message, onRelatedClick, onShare, onRephrase }) => {
    if (message.type === "user") {
        return (
            <div className="flex justify-end mb-3">
                <div className="bg-[#0B4C8C] text-white px-4 py-2.5 
                                rounded-[16px_16px_4px_16px]
                                max-w-[70%] text-sm shadow">
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
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [seenQuestions, setSeenQuestions] = useState(new Set());
    const chatRef = useRef(null);
    const inputRef = useRef(null);

    //toaster notification
    const [toast, setToast] = useState(null);

    //language selection
    const searchParams = useSearchParams();
    const selectedLang =
        searchParams.get("lang") === "en" ? "en" : "kn";


    /*handle rephrase*/
    function handleRephrase(text) {
        setUserInput(text);
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }



    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, isLoading]);

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


    const handleSend = async (textOverride = null) => {
        if (isLoading) return;

        const queryText = (textOverride ?? userInput).trim();
        if (!queryText) return;

        if (!textOverride) setUserInput('');

        const normalized = queryText.toLowerCase();

        const greetings = [
            "hello", "hi", "hey",
            "salam", "salaam",
            "assalamu alaikum",
            "assalamualaikum"
        ];

        if (greetings.some(g => normalized.startsWith(g))) {
            setMessages(prev => [
                ...prev,
                { type: 'user', text: queryText },
                {
                    type: 'bot',
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


        setMessages(prev => [...prev, { type: 'user', text: queryText }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/qa-search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryText, lang: selectedLang }),
            });

            //console remove
            const data = await res.json();

            if (data.noMatch) {
                setMessages(prev => [
                    ...prev,
                    {
                        type: "bot",
                        result: {
                            noMatch: true
                        },
                        query: queryText,
                    }
                ]);

                setIsLoading(false);
                return;
            }

            console.log("Best match ID:", data.bestMatch?.id);


            // mark best match as seen

            const nextSeen = new Set(seenQuestions);

            if (data.bestMatch?.question) {
                nextSeen.add(data.bestMatch.question);
                setSeenQuestions(nextSeen);
            }


            const relatedFiltered = (data.related || [])
                .filter(r => {
                    if (!r.question) return false;
                    if (r.score != null && r.score < CONFIDENCE.LOW) return false;
                    if (nextSeen.has(r.question)) return false;
                    return true;
                })
                .slice(0, 3)
                .map(r => ({ displayText: r.question }));

            setMessages(prev => [...prev, {
                type: "bot",
                result: data.mode === "explore"
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
                            }
                            : null,
                        relatedQuestions: relatedFiltered,
                    },

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
        <section className="min-h-[70vh] flex flex-col items-center bg-blue-50 rounded-lg p-4">

            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 
                    bg-blue-500 text-white text-sm px-4 py-2 
                    rounded-full shadow-lg z-50">
                    {toast}
                </div>
            )}
            <header className="text-center mb-4">
                <h1 className="text-3xl text-blue-900 font-extrabold">
                    {headings[selectedLang].title}
                </h1>
                <p className="text-blue-500">
                    {headings[selectedLang].subtitle}
                </p>
            </header>



            <div className="bg-gray-100 rounded-xl w-full max-w-3xl flex flex-col h-[70vh] border">
                <div
                    ref={chatRef}
                    className="flex-grow px-4 py-6 overflow-y-auto flex flex-col"
                >
                    {messages.length === 0 && !isLoading ? (
                        /* CENTERED EMPTY STATE */
                        <div className="flex flex-1 items-center justify-center text-center">
                            <div className="max-w-md text-[17px] text-gray-500 italic leading-relaxed">
                                {headings[selectedLang].disclaimer}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((m, i) => (
                                <MessageBubble
                                    key={i}
                                    message={m}
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


                <div className="p-3 border-t bg-white rounded-b-xl">
                    <div className="flex items-center gap-2">
                        <input

                            ref={inputRef}
                            disabled={isLoading}
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder={
                                selectedLang === "kn"
                                    ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                                    : "Type your question..."
                            }
                            className="flex-grow px-4 py-3 rounded-full text-gray-700 border focus:ring-2 focus:ring-indigo-500"
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
