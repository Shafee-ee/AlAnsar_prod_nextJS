// src/components/ArticleCarousel.js
import React, { useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import ArticleCard from "./ArticleCard";

const ArticleCarousel = ({ title, articles, className = "" }) => {
    const scrollRef = useRef(null);

    if (!articles || articles.length === 0) return null;

    const scroll = (direction) => {
        if (!scrollRef.current) return;

        const width = scrollRef.current.offsetWidth;
        const amount = direction === "left" ? -width * 0.8 : width * 0.8;

        scrollRef.current.scrollBy({
            left: amount,
            behavior: "smooth",
        });
    };

    return (
        <section className={`py-10 relative group ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-4 md:px-0">
                <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-[#0B4C8C] pl-3">
                    {title}
                </h2>

                <span className="text-[#0B4C8C] font-medium text-sm flex items-center pr-4">
                    Scroll to Explore <ChevronRight className="w-5 h-5 ml-1" />
                </span>
            </div>

            {/* Carousel Wrapper */}
            <div className="relative">

                {/* Scrollable Cards */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-scroll pb-12 px-4 md:px-0 gap-6 hide-scrollbar"
                >
                    {articles.map((article) => (
                        <div key={article._id} className="flex-shrink-0">
                            <ArticleCard article={article} />
                        </div>
                    ))}
                </div>

                {/* LEFT BUTTON */}
                <button
                    onClick={() => scroll("left")}
                    aria-label="Scroll Left"
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-[#0B4C8C] text-white rounded-full shadow-lg hover:bg-[#093866] transition duration-300 hidden md:flex items-center justify-center z-40"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                {/* RIGHT BUTTON */}
                <button
                    onClick={() => scroll("right")}
                    aria-label="Scroll Right"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#0B4C8C] text-white rounded-full shadow-lg hover:bg-[#093866] transition duration-300 hidden md:flex items-center justify-center z-40"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Hide Scrollbar */}
            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default ArticleCarousel;
