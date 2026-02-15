"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ChatbotSection from "@/components/ChatbotSection";
import ArticleCarousel from "@/components/ArticleCarousel";
import { CATEGORIES_DATA } from "@/components/ArticleComponents";

export default function Home() {
  const { user, isAdmin, loading } = useAuth();

  const [articles, setArticles] = useState([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);

  const featuredArticles = useMemo(() => {
    return articles.filter(a => a.isFeatured === true).slice(0, 10);
  }, [articles]);

  const latestArticles = useMemo(() => {
    return articles.slice(0, 10);
  }, [articles]);

  useEffect(() => {
    if (loading) return;

    const fetchArticles = async () => {
      setIsArticlesLoading(true);
      try {
        const response = await fetch("/api/articles", { cache: "no-store" });
        const { articles: fetched } = await response.json();

        const clean = Array.isArray(fetched)
          ? fetched.map(a => ({
            ...a,
            image: a.image ? `${a.image}` : null,
          }))
          : [];

        setArticles(clean);
      } catch (e) {
        console.error("Article fetch error:", e);
        setArticles([]);
      } finally {
        setIsArticlesLoading(false);
      }
    };

    fetchArticles();
  }, [loading, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F8FF]">
        <div className="text-center text-gray-700 text-lg">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          Checking credentials...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col font-sans p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto py-8 space-y-10">

        {/* Chatbot Section */}

        <section className="w-full text-center py-12 sm:py-16 px-4 
    bg-gradient-to-r from-blue-500 via-blue-400 to-blue-700 
    rounded-sm shadow-lg">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-md mb-4">
            Al Ansar Weekly
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
            "Your trusted source for Islamic knowledge, insights, and contemporary analysis"

          </p>
        </section>


        <div className="bg-white rounded-xl shadow-md p-6 md:p-10">
          <ChatbotSection />
        </div>

        <main className="w-full max-w-7xl mx-auto space-y-12">

          {isArticlesLoading ? (
            <div className="text-center text-gray-500 text-lg p-20">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading articles...
            </div>
          ) : (
            <>
              {/* Latest 
              {latestArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                  <ArticleCarousel
                    title="Latest Articles"
                    articles={latestArticles}
                    variant="gradient-carousel"
                  />
                </div>
              )}

              {featuredArticles.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                  <ArticleCarousel
                    title="Featured Reads"
                    articles={featuredArticles}
                    variant="carousel"
                  />
                </div>
              )}

              <section className="mt-6">
                <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-[#0B4C8C] pl-3 mb-8">
                  Explore Categories
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                  {CATEGORIES_DATA.map(category => (
                    <div
                      key={category.slug}
                      className="p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-lg border-t-4 border-[#0B4C8C] transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
                    >
                      <h3 className="text-lg font-bold text-blue-900">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 hidden md:block">
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>*/}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

Home.displayName = "Home";
