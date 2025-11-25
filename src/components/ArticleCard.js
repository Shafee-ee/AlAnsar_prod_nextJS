import React from 'react';
import Link from 'next/link';

export const CATEGORIES_DATA = [
    { slug: 'politics', name: 'Politics', description: 'National and international affairs.', color: 'red' },
    { slug: 'economy', name: 'Economy', description: 'Financial markets and business news.', color: 'green' },
    { slug: 'tech', name: 'Technology', description: 'Innovations and digital trends.', color: 'blue' },
    { slug: 'culture', name: 'Culture', description: 'Arts, media, and social trends.', color: 'purple' },
    { slug: 'sports', name: 'Sports', description: 'Latest scores and game highlights.', color: 'yellow' },
    { slug: 'opinion', name: 'Opinion', description: 'Editorials and guest columns.', color: 'indigo' },
];

const ArticleCard = ({ article, variant = 'default', onToggle }) => {
    if (!article || !article._id) return null;

    const { _id, title, image, author, date, excerpt, category } = article;
    const articleLink = `/article/${_id}`;
    const imageUrl = image || '/fallback-image.jpg';
    const imagePlaceholder = 'https://placehold.co/600x400/3B82F6/FFFFFF?text=No+Image';

    const formatDate = (dateString) => {
        if (!dateString) return 'No Date';
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('en-US', options);
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (variant === 'carousel') {
        return (
            <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 min-w-[350px] max-w-[350px] relative">
                <Link href={articleLink}>
                    <div className="overflow-hidden rounded-t-lg">
                        <img
                            src={imageUrl} // Uses the resolved image URL
                            alt={title}
                            loading="lazy"
                            onError={(e) => { e.target.src = imagePlaceholder; }} // Using better placeholder
                            className="w-full h-44 object-cover bg-blue-200 transform transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </Link>
                <div className="p-5">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold mb-2">
                        {category?.replace('-', ' ')}
                    </span>
                    <Link href={articleLink}>
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                            {title}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-3">By {author} • {formatDate(date)}</p>
                    <p className="text-gray-700 text-sm line-clamp-3 mb-4">{excerpt}</p>
                    <Link href={articleLink} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                        Read More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>
        );
    }

    if (variant === "gradient-carousel") {
        const displayCategory = category ? category.replace("-", " ") : 'Uncategorized';

        return (
            <div
                className="relative bg-gradient-to-br from-gray-400 to-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] flex-shrink-0"
                style={{ height: "320px", width: "280px" }}
            >
                <Link href={articleLink} className="relative h-[65%] w-full overflow-hidden flex items-center justify-center bg-white/10 group/img">
                    {image ? (
                        <img
                            src={imageUrl} // Uses the resolved image URL
                            alt={title}
                            loading="lazy"
                            onError={(e) => (e.target.src = imagePlaceholder)}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover/img:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">No Image</div>
                    )}
                </Link>
                <Link
                    href={articleLink}
                    className="absolute right-4 z-10"
                    style={{ top: "calc(65% - 24px)" }}
                    aria-label={`Read more about ${title}`}
                >
                    <button className="w-24 h-12 flex items-center justify-center rounded-lg bg-white text-blue-600 shadow-md hover:bg-blue-600 hover:text-white transition font-medium text-sm">
                        Read Article
                    </button>
                </Link>
                <div className="h-[35%] p-4 flex flex-col justify-between text-white">
                    <div>
                        <span className="inline-block bg-black/60 text-white text-xs px-2 py-1 rounded-lg uppercase tracking-wide font-semibold mb-2">
                            {displayCategory}
                        </span>
                        <Link href={articleLink}>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-1 hover:text-cyan-900 transition-colors cursor-pointer">
                                {title}
                            </h3>
                        </Link>
                        <p className="text-sm opacity-90 line-clamp-1 text-black">
                            By <span className="font-medium text-black">{author}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "card-top-image") {
        return (
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                <Link href={articleLink}>
                    <img
                        src={imageUrl} // Uses the resolved image URL
                        alt={title}
                        loading="lazy"
                        onError={(e) => (e.target.src = imagePlaceholder)}
                        className="w-full h-48 object-cover bg-blue-200 transition-transform duration-400 hover:scale-105"
                    />
                </Link>
                <div className="p-4 flex flex-col">
                    <Link href={articleLink}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors cursor-pointer">
                            {title}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-1">{category?.replace("-", " ")}</p>
                    <p className="text-sm text-gray-600">
                        By <span className="font-medium">{author}</span>
                    </p>
                    <p className="text-xs text-gray-400 mb-2">{formatDate(date)}</p>
                </div>
            </div>
        );
    }
    return (
        <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 mb-10">
            <div className="flex flex-col md:flex-row gap-6">
                <Link href={articleLink} className="md:w-2/5 overflow-hidden rounded-l-lg block">
                    <img
                        src={imageUrl} // Uses the resolved image URL
                        alt={title}
                        loading="lazy"
                        className="w-full h-48 object-cover transform transition-transform duration-300 hover:scale-105"
                        onError={(e) => { e.target.src = imagePlaceholder; }}
                    />
                </Link>
                <div className="md:w-3/5 flex flex-col justify-between p-4">
                    <div>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold mb-2">
                            {category?.replace('-', ' ')}
                        </span>
                        <Link href={articleLink}>
                            <h2 className="text-2xl font-bold mb-3 leading-tight hover:text-blue-600 transition-colors cursor-pointer">
                                {title}
                            </h2>
                        </Link>
                        <p className="text-sm text-gray-500 mb-4">By <span className="font-medium">{author}</span> • {formatDate(date)}</p>
                        <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">{excerpt}</p>
                    </div>
                    <Link href={articleLink} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors mt-2">
                        Read Full Article
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
            </div>
        </article>
    );
};

export const ArticleCarousel = ({ title, articles, variant, className }) => {
    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <section className={`py-6 ${className}`}>
            <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-red-600 pl-3 mb-8">
                {title}
            </h2>
            <div className="flex overflow-x-auto p-2 space-x-4 custom-scrollbar">
                {articles.map((article) => (
                    <ArticleCard key={article._id || article.title} article={article} variant={variant} />
                ))}
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </section>
    );
};

export { ArticleCard }; // Export ArticleCard along with ArticleCarousel and CATEGORIES_DATA