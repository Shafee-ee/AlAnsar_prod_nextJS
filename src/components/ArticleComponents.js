// src/components/ArticleComponents.js
import React, { useMemo } from 'react';

// --- 0. STATIC CATEGORY DATA (Hardcoded) ---
export const CATEGORIES_DATA = [
    // ... CATEGORIES_DATA as provided in your original code
    { name: "Fiqh (Jurisprudence)", description: "Islamic legal theory and practice.", color: "border-blue-500", slug: "fiqh" },
    { name: "Hadith", description: "Sayings and actions of Prophet Muhammad (PBUH).", color: "border-green-500", slug: "hadees" },
    { name: "Islamic History", description: "Key events and figures in Islamic history.", color: "border-purple-500", slug: "islamic-history" },
    { name: "World of Wonder", description: "Articles about the wonders of the world.", color: "border-orange-500", slug: "vismaya-jagattu" },
    { name: "Analyses", description: "Critical reviews of contemporary issues.", color: "border-cyan-500", slug: "vishleshanegalu" },
    { name: "Scholars", description: "Biographies of notable figures in Islamic history.", color: "border-pink-500", slug: "smaniyaru" },
];

export const CATEGORY_NAME_MAP = {
    // ... CATEGORY_NAME_MAP as provided in your original code
    fiqh: "Fiqh (Jurisprudence)",
    hadees: "Hadith",
    'islamic-history': "Islamic History",
    'vismaya-jagattu': "World of Wonder",
    vishleshanegalu: "Analyses",
    smaniyaru: "Scholars",
};


// --- 1. ARTICLE CARD COMPONENT ---
export const ArticleCard = ({ article }) => {
    // ... (ArticleCard logic as provided, using 'article.image' if you implement the image fix, or keeping 'article.imageUrl' for now) ...

    const placeholderUrl = `https://placehold.co/400x200/4F46E5/ffffff?text=Read+More`;
    const formattedDate = article.date ? new Date(article.date).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Unknown Date';
    const categoryName = CATEGORY_NAME_MAP[article.category] || article.category;

    // NOTE: If you are using your live data structure (article.image), change article.imageUrl to article.image
    const imageUrl = article.image || article.imageUrl || placeholderUrl;


    return (
        <div className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200">
            <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-40 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }}
            />
            <div className="p-4">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{categoryName}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{article.summary}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mt-3 border-t pt-2">
                    <span>{formattedDate}</span>
                    <span>{article.readingTime || '5'} min read</span>
                </div>
            </div>
            <div className="p-4 pt-0">
                <button className="w-full text-center bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium">
                    Read More
                </button>
            </div>
        </div>
    );
};
ArticleCard.displayName = 'ArticleCard';

// --- 2. ARTICLE CAROUSEL COMPONENT ---
export const ArticleCarousel = ({ title, articles, variant, className }) => {
    const headerColor = variant === "gradient-carousel" ? "border-indigo-600" : "border-red-600";

    return (
        <section className={className}>
            <h2 className={`text-3xl font-bold text-gray-900 border-l-4 ${headerColor} pl-3 mb-6`}>
                {title}
            </h2>
            <div
                className={`flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-200`}
            >
                {articles.map((article, index) => (
                    <ArticleCard key={article._id || index} article={article} />
                ))}
            </div>
        </section>
    );
};
ArticleCarousel.displayName = 'ArticleCarousel';