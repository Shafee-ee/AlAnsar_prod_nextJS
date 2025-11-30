import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, setLogLevel } from 'firebase/firestore';
import { Loader, Search, Send, Zap, LogOut, User } from 'lucide-react';

// --- 1. FIREBASE & AUTH SETUP ---

// Global variables provided by the Canvas environment (Mandatory)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let dbInstance = null;
let authInstance = null;

/**
 * Initializes Firebase, authenticates, and sets up global instances.
 * @param {function} onUserChange - Callback to update React state on auth changes.
 */
const initializeFirebase = (onUserChange) => {
    if (!firebaseConfig) {
        console.error("Firebase config is missing.");
        onUserChange(null); // Mark as ready but unauthenticated/failed
        return;
    }
    if (dbInstance) return;

    try {
        const app = initializeApp(firebaseConfig);
        dbInstance = getFirestore(app);
        authInstance = getAuth(app);
        setLogLevel('error');

        // 1. Initial Authentication Attempt
        const handleAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(authInstance, initialAuthToken);
                } else {
                    await signInAnonymously(authInstance);
                }
            } catch (e) {
                console.error("Firebase initial sign-in failed:", e);
                // Fallback to anonymous sign-in if custom token fails
                if (!authInstance.currentUser) {
                    signInAnonymously(authInstance).catch(e => console.error("Anonymous sign-in failed:", e));
                }
            }
        };

        // 2. Set up Auth State Listener (Crucial for setting isAuthReady)
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            onUserChange(user);
        });

        // Handle the initial sign-in process
        handleAuth();

        // Cleanup listener on component unmount is not strictly necessary here 
        // as this is a single Canvas file, but good practice.
        return unsubscribe;

    } catch (e) {
        console.error("Firebase initialization error:", e);
        onUserChange(null); // Mark as ready but failed
    }
};

// --- 2. SEMANTIC SEARCH LOGIC (Gemini + Firestore) ---

/**
 * 1. Fetches all Q&A data from the public collection.
 */
const fetchAllQnA = async () => {
    if (!dbInstance) return [];
    try {
        // Path matches the seeding script: /artifacts/{appId}/public/data/qna
        const qnaPath = `/artifacts/${appId}/public/data/qna`;
        const qnaCollection = collection(dbInstance, qnaPath);
        const querySnapshot = await getDocs(qnaCollection);

        const qnaData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filter out documents that lack necessary fields for the Q&A bot
        return qnaData.filter(doc => doc.question_en && doc.answer_en);
    } catch (e) {
        console.error("Error fetching QnA data from Firestore:", e);
        return [];
    }
};

/**
 * 2. Uses the Gemini API to perform a semantic search against the fetched Q&A data.
 * @param {string} userQuery - The question typed by the user.
 * @returns {Object | null} The best matching Q&A document or 'EMPTY_DB' flag.
 */
const searchQna = async (userQuery) => {
    if (!dbInstance || !authInstance?.currentUser) {
        console.warn("Database or authentication not ready.");
        return null;
    }

    const qnaDocuments = await fetchAllQnA();

    if (qnaDocuments.length === 0) {
        // This is a crucial check. If the database is empty, the model cannot answer.
        console.log("No Q&A documents found in Firestore. Please run the seeding script.");
        return 'EMPTY_DB'; // Return a special flag
    }

    // Format the Q&A data into a clean JSON string for the LLM prompt
    const knowledgeBase = JSON.stringify(qnaDocuments, null, 2);

    // Prompt instructing the LLM to return only a JSON object
    const systemPrompt = `You are a highly accurate Islamic Q&A matching bot. Your task is to analyze the user's question and find the single BEST matching Q&A entry from the provided JSON database based on semantic similarity. You MUST only respond with the JSON object of the best match. DO NOT add any extra text, explanation, or markdown wrappers (like \`\`\`json). If no match is found, respond with an empty JSON object {}.

    Required Output Format (JSON): { id: string, question_en: string, question_kn: string, answer_en: string }`;

    const userQueryWithContext = `User Question: "${userQuery}"\n\nQ&A Database (JSON): ${knowledgeBase}`;

    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    // Simple Exponential Backoff for retries
    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userQueryWithContext }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                })
            });

            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (text) {
                try {
                    const parsedJson = JSON.parse(text);
                    if (Object.keys(parsedJson).length > 0 && parsedJson.id) {
                        return parsedJson; // Success: Return the best matching document
                    } else {
                        return null; // No match found (LLM returned {})
                    }
                } catch (jsonError) {
                    console.error("Failed to parse JSON response from LLM:", text, jsonError);
                }
            }
        } catch (error) {
            if (attempt < MAX_RETRIES - 1) {
                const delay = INITIAL_DELAY * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("All API attempts failed.", error);
            }
        }
    }

    return null; // Return null if all attempts fail
};

// --- 3. UI COMPONENTS ---

const Navbar = ({ user, handleSignOut }) => {
    const userId = user?.uid;
    const displayUserId = userId || 'Signing In...';

    return (
        <nav className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Zap className="w-6 h-6 text-red-600 mr-2" />
                        <span className="text-xl font-bold text-gray-900">Keli Nodi Q&A</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-600 bg-gray-100 p-2 rounded-lg font-mono tracking-tighter max-w-xs truncate">
                            <User className="w-4 h-4 mr-1 text-red-500" />
                            {displayUserId}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
Navbar.displayName = 'Navbar';


const BotResponseCard = ({ result, query }) => {
    // result is the structured Q&A object from Firestore/Gemini, or null

    // Check if the database was just empty (which means the search failed before calling Gemini)
    if (result === 'EMPTY_DB') {
        return (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl rounded-tl-none shadow-lg max-w-full w-full border border-yellow-200">
                <p className="font-semibold mb-1">⚠️ Database Empty</p>
                <p className="text-sm">
                    The Q&A database is empty. Please **run the `scripts/seed_database.js` file** to populate it.
                </p>
            </div>
        );
    }

    if (!result) {
        const fallbackAnswer = "ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿಯನ್ನು ನನ್ನ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಕಂಡುಹಿಡಿಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ರೀತಿಯಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ.";
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl rounded-tl-none shadow-lg max-w-full w-full border border-red-200">
                <p className="font-semibold mb-1">🔍 No Direct Match Found</p>
                <p className="text-sm">
                    I couldn't find a high-confidence answer for: **"{query}"**.
                </p>
                <p className="text-xs mt-2 text-red-500">{fallbackAnswer}</p>
            </div>
        );
    }

    const { question_kn, answer_en, question_en } = result;

    return (
        <div className="bg-white p-4 rounded-xl rounded-tl-none shadow-2xl border border-red-200 max-w-full w-full">
            <div className="flex items-start text-red-600 font-bold mb-3 border-b pb-2 border-red-100">
                <Zap className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-lg">ಉತ್ತಮ ಉತ್ತರ (Best Match Question): {question_kn || question_en || "Question"}</span>
            </div>

            <div className="text-gray-700 leading-relaxed mb-4 p-3 border-l-4 border-red-500 bg-red-50 rounded-r-md text-sm">
                {answer_en || "Answer not available."}
            </div>
        </div>
    );
};
BotResponseCard.displayName = 'BotResponseCard';


const ChatbotSection = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
            // 2. Call the Semantic Search function
            const matchedDocument = await searchQna(trimmedQuery);

            // Special check: If matchedDocument is undefined because the DB was empty (check inside searchQna)
            if (matchedDocument === 'EMPTY_DB') {
                setMessages(prev => [...prev, { type: 'bot', result: 'EMPTY_DB', query: trimmedQuery }]);
                return;
            }

            // 3. Process and add structured bot response
            const botResponse = {
                type: 'bot',
                result: matchedDocument, // matchedDocument is the full Q&A object or null
                query: trimmedQuery
            };

            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error('Chatbot search failed:', error);
            // Fallback for network/server error
            setMessages(prev => [...prev, {
                type: 'bot',
                result: null, // Forces the 'No Direct Match Found' UI state
                query: trimmedQuery
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const MessageBubble = ({ message }) => {
        if (message.type === 'user') {
            return (
                <div className="flex justify-end mb-4">
                    <div className="bg-red-600 text-white p-3 rounded-xl rounded-br-none shadow-lg max-w-xs md:max-w-md">
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
                        />
                    </div>
                </div>
            );
        }
        return null;
    };
    MessageBubble.displayName = 'MessageBubble';

    // 2.3 RENDER LOGIC
    return (
        <section className="flex flex-col items-center justify-center px-4">
            <header className="text-center mb-6 pt-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ಕೇಳಿ ನೋಡಿ ಪ್ರಶ್ನೋತ್ತರ ಬಾಟ್</h1>
                <p className="text-gray-500 text-lg mt-1">ನಿಮ್ಮ ಮೂಲಭೂತ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ (Ask your foundational Islamic questions).</p>
            </header>

            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-3xl flex flex-col h-[70vh] border border-gray-200">

                <div
                    ref={chatWindowRef}
                    className="flex-grow p-4 md:p-6 overflow-y-auto"
                >
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
                            <Search className="w-10 h-10 mb-3 text-red-400" />
                            <p className="text-lg font-medium">ಕೆಳಗೆ ಒಂದು ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡುವ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಿ...</p>
                            <p className="text-sm">ಉದಾಹರಣೆಗೆ: 'What is Hadith?' ಅಥವಾ 'ಇಸ್ಲಾಂ ಎಂದರೇನು?' ಎಂದು ಕೇಳಿ.</p>

                            <div className='mt-6 space-y-2 w-full max-w-sm'>
                                <button
                                    onClick={() => handleSend('What is the Quran?')}
                                    className="w-full text-left text-red-600 hover:text-white transition-colors text-xs p-3 rounded-lg bg-gray-100 hover:bg-red-500 border border-gray-200 block truncate font-medium shadow-sm transform hover:scale-[1.01] active:scale-[0.99]"
                                    title="What is the Quran?"
                                >
                                    <Zap className="w-3 h-3 inline mr-2 align-text-bottom" />
                                    What is the Quran?
                                </button>
                                <button
                                    onClick={() => handleSend('Who is Prophet Muhammad?')}
                                    className="w-full text-left text-red-600 hover:text-white transition-colors text-xs p-3 rounded-lg bg-gray-100 hover:bg-red-500 border border-gray-200 block truncate font-medium shadow-sm transform hover:scale-[1.01] active:scale-[0.99]"
                                    title="Who is Prophet Muhammad?"
                                >
                                    <Zap className="w-3 h-3 inline mr-2 align-text-bottom" />
                                    Who is Prophet Muhammad?
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <MessageBubble key={index} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-100 text-red-700 p-3 rounded-xl rounded-tl-none shadow-md flex items-center border border-red-200">
                                <Loader className="w-4 h-4 mr-2 animate-spin text-red-500" />
                                ಉತ್ತಮ ಹೊಂದಾಣಿಕೆಗಾಗಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ...
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="flex">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                            className="flex-grow p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 transition-shadow disabled:bg-gray-200"
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => handleSend()}
                            className="bg-red-600 text-white p-3 rounded-r-xl hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center justify-center shadow-lg transform active:scale-95"
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

// --- 4. MAIN APP COMPONENT ---

const App = () => {
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        // Initialize Firebase and set up the auth state listener
        const unsubscribe = initializeFirebase(user => {
            setUser(user);
            // This is the signal that authentication has done its initial check
            setIsAuthReady(true);
        });

        // Cleanup listener (good practice)
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        }
    }, []);

    const handleSignOut = () => {
        if (authInstance) {
            signOut(authInstance).then(() => {
                console.log("Signed out successfully. Signing in anonymously...");
                // Immediately sign in anonymously after signing out
                signInAnonymously(authInstance).catch(e => console.error("Anonymous sign-in failed:", e));
            }).catch(error => {
                console.error("Sign out error:", error);
            });
        }
    };

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader className="w-8 h-8 animate-spin text-red-500" />
                <span className="ml-3 text-lg text-gray-700">Application is authenticating and preparing...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <Navbar user={user} handleSignOut={handleSignOut} />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full flex-grow">
                <ChatbotSection />
            </main>
            {/* Display the User ID at the bottom for verification */}
            <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-xs p-2 text-center shadow-inner z-20">
                Authenticated User ID: <span className="font-mono text-red-300">{user?.uid || 'N/A'}</span>
            </footer>
        </div>
    );
};

export default App;
