'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // <-- Import useRouter
// Updated imports: MessageSquare is used for Views
import { Loader2, ArrowLeft, Printer, Share2, Facebook, Linkedin, Twitter, MessageSquare, Save } from 'lucide-react';

import { useTranslation } from '@/app/context/LanguageContext';

const ArticleView = ({ articleId }) => {
    const router = useRouter();
    // ⚠️ NOTE: This relies on a custom LanguageContext that needs to be implemented.
    const { t } = useTranslation();

    const [article, setArticle] = useState(null);
    const [articlesList, setArticlesList] = useState([]);
    const [loading, setLoading] = useState(true);
    // 🛑 NEW STATE for Save status (frontend only)
    const [isSaved, setIsSaved] = useState(false);

    // Using the API route we defined earlier
    const API_BASE_URL = '/api/articles';

    const handleNavigate = (path, id) => {
        if (path === 'home') {
            router.push('/');
        } else if (path === 'article' && id) {
            // Force a full page refresh when navigating to a new article ID 
            // to re-fetch data, ensuring correct view state.
            router.push(`/article/${id}`, { scroll: true });
        }
    };

    // 🛑 NEW HANDLER for Save button
    const handleSaveArticle = () => {
        // This toggles the UI status immediately.
        // The actual API call to save/unsave the article would go here.
        setIsSaved(prev => !prev);
        // console.log("Save Toggled for ID:", articleId);
    };

    // --- Fetch Article List for Prev/Next Navigation ---
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // Fetch the list of articles for navigation purposes
                const res = await fetch(`${API_BASE_URL}?sort=-date`);
                if (!res.ok) throw new Error("Failed to fetch article list");
                const data = await res.json();
                setArticlesList(data);
            } catch (err) {
                console.error("Failed to fetch article list:", err);
            }
        };
        fetchArticles();
    }, []);

    // --- Single Article Fetch ---
    useEffect(() => {
        if (!articleId) return;

        const fetchArticle = async () => {
            setLoading(true);
            try {
                // Fetch the specific article by ID
                const res = await fetch(`${API_BASE_URL}?id=${articleId}`);
                if (!res.ok) throw new Error("Failed to fetch article");

                const data = await res.json();
                // Check if data is an array (API returns list if ID is missing)
                if (Array.isArray(data)) {
                    setArticle(null);
                    throw new Error("Article ID fetch failed, received list instead.");
                }

                setArticle(data);

                // 🛑 PLACEHOLDER for initial saved status fetch (e.g., from user settings)
                // setIsSaved(data.isSavedByUser || false); 

            } catch (err) {
                console.error("Failed to fetch article:", err);
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();

        // 🛑 PLACEHOLDER for incrementing views API call (server side implementation needed)
        // fetch(`/api/views/${articleId}`, { method: 'POST' }); 

    }, [articleId]);

    // Calculate Prev/Next articles based on the fetched list
    const { prevArticle, nextArticle } = useMemo(() => {
        if (!articleId || articlesList.length === 0) return { prevArticle: null, nextArticle: null };
        // Convert articleId to string for safe comparison with Mongoose IDs
        const currentIdString = articleId.toString();
        const currentIndex = articlesList.findIndex((a) => a._id.toString() === currentIdString);

        if (currentIndex === -1) return { prevArticle: null, nextArticle: null };
        const next = articlesList[currentIndex + 1];
        const prev = articlesList[currentIndex - 1];
        return { prevArticle: prev, nextArticle: next };
    }, [articleId, articlesList]);

    // Helper for date formatting
    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const handlePrint = () => window.print();

    // --- Loading State ---
    if (loading) {
        return (
            <div className="text-center py-20 text-blue-600 text-lg">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                {/* Fallback text if 't' (translation) is not yet available */}
                {t ? t('article_loading') : 'Loading Article...'}
            </div>
        );
    }

    // --- Not Found State ---
    if (!article) {
        return (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg m-4 max-w-lg mx-auto">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                    {t ? t('article_not_found_title') : 'Article Not Found'}
                </h1>
                <p className="text-gray-600 mb-6">
                    {t ? t('article_not_found_description') : 'The article you are looking for does not exist or an error occurred.'}
                </p>
                <button
                    onClick={() => handleNavigate('home')} // <-- Use handleNavigate
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t ? t('home') : 'Go Home'}
                </button>
            </div>
        );
    }

    const shareUrl = `https://yourdomain.com/article/${articleId}`;

    return (
        <article className="max-w-4xl mx-auto bg-white p-6 md:p-10 m-4 rounded-xl shadow-2xl">

            <nav className="mb-6">
                <button
                    onClick={() => handleNavigate('home')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t ? t('back_to_home') : 'Back to Home'}
                </button>
            </nav>

            <header className="mb-8 mx-auto border-b pb-6">
                <div className="mb-4">
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-sm px-4 py-1 rounded-full uppercase tracking-wide font-semibold shadow-md">
                        {article.category?.replace("-", " ")}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                    {article.title}
                </h1>

                <div className="flex items-center text-gray-600 mb-6 gap-4 text-sm">
                    <span className="font-medium text-gray-800">{article.author}</span>
                    <span className="text-lg">•</span>
                    <time dateTime={article.date}>{formatDate(article.date)}</time>

                    {/* 🛑 NEW: Views Counter Display */}
                    {/* Assuming the article object has a 'views' field */}
                    <span className="text-lg">•</span>
                    <div className="flex items-center text-gray-500">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {article.views !== undefined ? article.views : 0} {t ? t('views') : 'Views'}
                    </div>
                </div>

            </header>

            <div className="mb-10 rounded-lg overflow-hidden shadow-xl">
                {/* Image display */}
                <img
                    src={article.image || `https://placehold.co/800x400/1e293b/ffffff?text=${article.title.substring(0, 20)}`}
                    alt={article.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x400/1e293b/ffffff?text=Image+Unavailable'; }}
                />
            </div>

            <div className="prose max-w-none text-lg">
                <div className="text-gray-800 leading-relaxed space-y-6">
                    {/* Render content, splitting by double newlines for paragraphs */}
                    {article.content?.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="text-lg leading-8">
                            {paragraph}
                        </p>
                    ))}
                    {!article.content && (
                        <p className="text-red-500">Note: Article content field is empty. Showing fallback text for article ID: {articleId}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-4">
                    <span className="text-gray-600 font-semibold">{t ? t('share article') : 'Share Article'}:</span>

                    {/* Social Share Links (unchanged) */}
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full bg-blue-50 transition-colors"
                        title="Share on Facebook"
                    >
                        <Facebook className="w-5 h-5" />
                    </a>

                    <a
                        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(article.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-500 hover:text-cyan-700 p-2 rounded-full bg-cyan-50 transition-colors"
                        title="Share on Twitter"
                    >
                        <Twitter className="w-5 h-5" />
                    </a>

                    <a
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900 p-2 rounded-full bg-blue-100 transition-colors"
                        title="Share on LinkedIn"
                    >
                        <Linkedin className="w-5 h-5" />
                    </a>

                    <button onClick={handlePrint} className="text-gray-700 hover:text-gray-900 p-2 rounded-full bg-gray-100 transition-colors" title="Print Article">
                        <Printer className="w-5 h-5" />
                    </button>

                    {/* 🛑 UPDATED SAVE BUTTON (with conditional styling) */}
                    <button
                        onClick={handleSaveArticle}
                        className={`p-2 rounded-full transition-colors ${isSaved
                            ? 'text-red-700 hover:text-red-900 bg-red-100'
                            : 'text-gray-500 hover:text-gray-700 bg-gray-100'
                            }`}
                        title={isSaved ? "Unsave Article" : "Save Article"}
                    >
                        <Save className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                </div>

                {/* Prev/Next Navigation */}
                <div className="flex gap-4">
                    {prevArticle && (
                        <button
                            onClick={() => handleNavigate('article', prevArticle._id)}
                            className="flex items-center px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t ? t('previous') : 'Previous'}
                        </button>
                    )}

                    {nextArticle && (
                        <button
                            onClick={() => handleNavigate('article', nextArticle._id)}
                            className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {t ? t('next') : 'Next'}
                            <ArrowLeft className="w-4 h-4 ml-2 transform rotate-180" />
                        </button>
                    )}
                </div>
            </div>

            <footer className="mt-8 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
                {t ? t('published on') : 'Published on'} {formatDate(article.date)} {t ? t('by') : 'by'} {article.author}
            </footer>
        </article>
    );
};

export default ArticleView;