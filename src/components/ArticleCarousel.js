import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ArticleCard from './ArticleCard';


const ArticleCarousel = ({ title, articles, variant = 'carousel', className = '' }) => {
    const scrollContainerRef = useRef(null);

    if (!articles || articles.length === 0) {
        return null;
    }
    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const containerWidth = scrollContainerRef.current.offsetWidth;
            const scrollAmount = direction === 'left' ? -containerWidth * 0.8 : containerWidth * 0.8;

            scrollContainerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className={`py-8 md:py-12 relative group ${className}`}>
            <div className="flex justify-between items-center mb-6 px-4 md:px-0">
                <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
                    {title}
                </h2>
                <span className="text-blue-600 font-medium text-sm flex items-center pr-4">
                    Scroll to Explore <ChevronRight className="w-5 h-5 ml-1" />
                </span>
            </div>

            <div className="relative">
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-scroll pb-10 px-4 md:px-0 hide-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // For Firefox/IE
                >
                    {articles.map((article) => (
                        <div
                            key={article._id.toString()}
                            className="flex-shrink-0 mr-6 last:mr-0"
                        >
                            <ArticleCard
                                article={article}
                                variant={variant}
                            />
                        </div>
                    ))}
                </div>


                <button
                    onClick={() => scroll('left')}
                    aria-label="Scroll Left"
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-xl hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition duration-300 z-20 hidden md:flex items-center justify-center -ml-2"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    aria-label="Scroll Right"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-xl hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition duration-300 z-20 hidden md:flex items-center justify-center -mr-2"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </section>
    );
};

export default ArticleCarousel;