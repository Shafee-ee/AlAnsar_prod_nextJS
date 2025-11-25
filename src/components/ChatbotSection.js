'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader, Search, Send, Zap, MessageCircle } from 'lucide-react';

// 1. HELPER COMPONENT: The Structured Bot Response Card
const BotResponseCard = ({ result, query, onRelatedClick }) => {
    // result is the structured object { bestMatch: { question, answer }, relatedQuestions: [...] }
    if (!result || !result.bestMatch) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl rounded-tl-none shadow-lg max-w-full w-full border border-red-200">
                <p className="font-semibold mb-1">🔍 No Direct Match Found</p>
                <p className="text-sm">
                    I couldn't find a high-confidence answer for: **"{query}"**. Please try a different phrasing.
                </p>
                {/* Fallback display for the Kannada message from API if available */}
                {result && result.fallbackAnswer && (
                    <p className="text-xs mt-2 text-red-500">
                        {result.fallbackAnswer}
                    </p>
                )}
            </div>
        );
    }

    const { bestMatch, relatedQuestions } = result;

    return (
        <div className="bg-white p-4 rounded-xl rounded-tl-none shadow-2xl border border-blue-200 max-w-full w-full">
            <div className="flex items-start text-blue-600 font-bold mb-3 border-b pb-2 border-blue-100">
                <Zap className="w-5 h-5 mr-2 flex-shrink-0" />
                {/* Displays the Kannada question found by the API */}
                <span className="text-lg">ಉತ್ತಮ ಉತ್ತರ (Question): {bestMatch.question}</span>
            </div>

            <div className="text-gray-700 leading-relaxed mb-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-md text-sm">
                {/* Displays the English answer returned by the API */}
                {bestMatch.answer}
            </div>

            {/* Note: relatedQuestions array is empty as the new API only returns the best match. */}
            {relatedQuestions && relatedQuestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                        <Search className="w-4 h-4 mr-2" />
                        ಸಂಬಂಧಿತ ವಿಷಯಗಳು (Related Topics)
                    </div>
                    <div className="space-y-2">
                        {relatedQuestions.map((related, index) => (
                            <button
                                // Use index for key as we don't have an ID easily
                                key={index}
                                onClick={() => onRelatedClick(related.question)}
                                className="w-full text-left text-blue-600 hover:text-white transition-colors text-xs p-2 rounded-lg bg-gray-50 hover:bg-blue-500 border border-gray-200 block truncate font-medium shadow-sm"
                                title={related.question}
                            >
                                <MessageCircle className="w-3 h-3 inline mr-2 align-text-bottom" />
                                {related.question}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
BotResponseCard.displayName = 'BotResponseCard';


// 2. MAIN CHATBOT COMPONENT
const ChatbotSection = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Removed: faqData state and isDataLoading state.
    // Removed: useEffect hook for fetching /api/qna.
    // Removed: simulateBackendSearch utility.

    const chatWindowRef = useRef(null);

    // Auto-scroll to the bottom when new messages arrive
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTo({
                top: chatWindowRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // PRIMARY INTERACTION HANDLER
    const handleSend = async (query = userInput) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || isLoading) return;

        // 1. Add user message and clear input
        setMessages(prev => [...prev, { type: 'user', text: trimmedQuery }]);
        if (query === userInput) {
            setUserInput('');
        }
        setIsLoading(true);

        try {
            // 2. Call the Server-Side API for Search
            const response = await fetch('/api/qa-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: trimmedQuery }),
            });

            if (!response.ok) {
                throw new Error('API search failed with status: ' + response.status);
            }

            const data = await response.json();

            let searchResult = null;

            // 3. Translate API Response to Front-end Structure
            if (data.success) {
                searchResult = {
                    bestMatch: {
                        // Use the Kannada question (from sourceQuestion_kn) and English answer (from answer)
                        question: data.sourceQuestion_kn || trimmedQuery,
                        answer: data.answer || "Answer not provided."
                    },
                    // The new API doesn't return related questions, so this is empty.
                    relatedQuestions: []
                };
            } else {
                // If API returns success: false (No result found)
                searchResult = {
                    fallbackAnswer: data.answer // Contains the Kannada error message
                };
            }

            // 4. Process and add structured bot response
            const botResponse = {
                type: 'bot',
                result: searchResult,
                query: trimmedQuery
            };

            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error('Chatbot search failed:', error);
            // Fallback for network/server error
            setMessages(prev => [...prev, {
                type: 'bot',
                result: { fallbackAnswer: "ಸರ್ವರ್ ದೋಷದಿಂದಾಗಿ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಪ್ರಯತ್ನಿಸಿ." },
                query: trimmedQuery
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRelatedClick = (question) => {
        handleSend(question);
    }

    const MessageBubble = ({ message }) => {
        if (message.type === 'user') {
            return (
                <div className="flex justify-end mb-4">
                    <div className="bg-blue-600 text-white p-3 rounded-xl rounded-br-none shadow-lg max-w-xs md:max-w-md">
                        {message.text}
                    </div>
                </div>
            );
        }

        if (message.type === 'bot') {
            return (
                <div className="flex justify-start mb-6">
                    <div className="w-full max-w-full md:max-w-2xl">
                        <BotResponseCard
                            result={message.result}
                            query={message.query}
                            onRelatedClick={handleRelatedClick}
                        />
                    </div>
                </div>
            );
        }
        return null;
    };
    MessageBubble.displayName = 'MessageBubble';

    // 2.3 RENDER LOGIC
    // Removed isDataLoading check, as we are now only checking the chatbot's message-sending status.

    // After loading, render the chatbot interface
    return (
        <section className="min-h-[70vh] flex flex-col items-center justify-center mb-16 px-4">
            <header className="text-center mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">ಕೇಳಿ ನೋಡಿ ಪ್ರಶ್ನೋತ್ತರ ಬಾಟ್ (Keli Nodi Q&A Bot)</h1>
                <p className="text-gray-500 text-lg">ನಿಮ್ಮ ಮೂಲಭೂತ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ (Ask your foundational Islamic questions).</p>
            </header>

            <div className="bg-gray-100 shadow-2xl rounded-2xl w-full max-w-3xl flex flex-col h-[70vh] border border-gray-200">

                <div
                    ref={chatWindowRef}
                    className="flex-grow p-4 md:p-6 overflow-y-auto"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Search className="w-10 h-10 mb-3 text-blue-400" />
                            <p className="text-lg font-medium">ಕೆಳಗೆ ಒಂದು ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡುವ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಿ...</p>
                            <p className="text-sm">ಉದಾಹರಣೆಗೆ: 'What is Hadith?' ಅಥವಾ 'ಏನು ಅಪ್ಡೇಟ್' ಎಂದು ಕೇಳಿ.</p>
                            {/* Removed the hardcoded/faqData-dependent suggestion buttons */}
                            <div className='mt-6 space-y-2 w-full max-w-sm'>
                                <button
                                    onClick={() => handleSend('What is the role of the Prophet?')}
                                    className="w-full text-left text-blue-600 hover:text-white transition-colors text-xs p-3 rounded-lg bg-white hover:bg-blue-500 border border-gray-200 block truncate font-medium shadow-sm"
                                    title="What is the role of the Prophet?"
                                >
                                    <Zap className="w-3 h-3 inline mr-2 align-text-bottom" />
                                    What is the role of the Prophet?
                                </button>
                                <button
                                    onClick={() => handleSend('What is the importance of Quran?')}
                                    className="w-full text-left text-blue-600 hover:text-white transition-colors text-xs p-3 rounded-lg bg-white hover:bg-blue-500 border border-gray-200 block truncate font-medium shadow-sm"
                                    title="What is the importance of Quran?"
                                >
                                    <Zap className="w-3 h-3 inline mr-2 align-text-bottom" />
                                    What is the importance of Quran?
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-white text-indigo-700 p-3 rounded-xl rounded-tl-none shadow-md flex items-center border border-indigo-200">
                                <Loader className="w-4 h-4 mr-2 animate-spin text-indigo-500" />
                                ಉತ್ತಮ ಹೊಂದಾಣಿಕೆಗಾಗಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <div className="flex">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 transition-shadow disabled:bg-gray-200"
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => handleSend()}
                            className="bg-indigo-600 text-white p-3 rounded-r-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 flex items-center justify-center shadow-lg transform active:scale-95"
                            disabled={isLoading || userInput.trim() === ''}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
ChatbotSection.displayName = 'ChatbotSection';

export default ChatbotSection;