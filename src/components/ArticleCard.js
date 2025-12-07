import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

const ArticleCard = ({ article }) => {
    if (!article || !article._id) return null;

    const {
        _id,
        title,
        image,
        author,
        date,
        excerpt,
        category,
        isFeatured,
    } = article;

    const articleLink = `/article/${_id}`;
    const imageUrl = image || "/fallback-image.jpg";
    const imagePlaceholder =
        "https://placehold.co/600x400/0B4C8C/FFFFFF?text=No+Image";

    const formatDate = (dateString) => {
        if (!dateString) return "No Date";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return "No Date";
        }
    };

    return (
        <div className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 w-[320px] overflow-hidden group">
            {/* IMAGE SECTION (60%) */}
            <div className="relative h-[60%] min-h-[180px] max-h-[200px] overflow-hidden">
                <Link href={articleLink}>
                    <img
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                        onError={(e) => (e.target.src = imagePlaceholder)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* FEATURED STAR */}
                {isFeatured && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-white p-2 rounded-full shadow-md">
                        <Star className="w-4 h-4 fill-white" />
                    </div>
                )}

                {/* FLOATING BUTTON — RIGHT SIDE */}
                {/* FLOATING BUTTON — RIGHT SIDE */}
                {/* FLOATING BUTTON FIXED */}
                <div className="absolute bottom-3 right-3 z-20">
                    <Link href={articleLink} aria-label={`Read article ${title}`}>
                        <button
                            className="px-5 py-2 rounded-full bg-[#0B4C8C] text-white shadow-lg font-medium text-sm 
                       flex items-center gap-2 transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                        >
                            Read Article
                            <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                    </Link>
                </div>


            </div>

            {/* CONTENT SECTION (40%) */}
            <div className="p-5 pt-8">
                {/* Category */}
                {category && (
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold mb-2">
                        {category.replace("-", " ")}
                    </span>
                )}

                {/* Title */}
                <Link href={articleLink}>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 hover:text-[#0B4C8C] transition-colors cursor-pointer">
                        {title}
                    </h3>
                </Link>

                {/* Author + Date */}
                <p className="text-xs text-gray-500 mb-2">
                    By <span className="font-medium">{author}</span> •{" "}
                    {formatDate(date)}
                </p>

                {/* Excerpt */}
                <p className="text-sm text-gray-700 line-clamp-2">
                    {excerpt || "No summary available."}
                </p>
            </div>
        </div>
    );
};

export default ArticleCard;
