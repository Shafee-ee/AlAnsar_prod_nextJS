'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

import { useAuth } from '@/components/AuthProvider'; // Import the Auth hook
import ChatbotSection from '@/components/ChatbotSection';
import { ArticleCarousel, CATEGORIES_DATA } from '@/components/ArticleComponents';

export default function Home() {
  const { user, isAdmin, loading } = useAuth(); // Use the Auth hook
  const router = useRouter();

  const [articles, setArticles] = useState([]);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);

  // --- ADMIN REDIRECTION LOGIC ---
  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        // Redirect admin users to the dashboard
        console.log("Admin user detected, redirecting to /dashboard.");
        router.replace('/dashboard');
        // We return null below, but the redirect happens here first.
      }
    }
  }, [loading, isAdmin, router]);

  // --- ARTICLE FETCHING LOGIC (Remains the same) ---
  useEffect(() => {
    // Only run this effect if the user is not an admin, or after the auth check is complete
    if (loading || isAdmin) return;

    const fetchArticles = async () => {
      setIsArticlesLoading(true);
      try {
        const response = await fetch('/api/articles', { cache: 'no-store' });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { articles: fetchedArticles } = await response.json();

        if (!Array.isArray(fetchedArticles)) {
          console.error("API response structure incorrect. Expected { articles: [...] }");
          setArticles([]);
          return;
        }

        const articlesWithLocalPaths = fetchedArticles.map(article => ({
          ...article,
          image: article.image ? `${article.image}` : null,
        }));

        setArticles(articlesWithLocalPaths);

      } catch (error) {
        console.error("Failed to fetch articles from API or parse response.", error);
        setArticles([]);
      } finally {
        setIsArticlesLoading(false);
      }
    };
    fetchArticles();
  }, [isAdmin, loading]); // Added isAdmin and loading to dependency array

  // FILTERING LOGIC 
  const featuredArticles = useMemo(() => {
    // Filter for featured articles (using strict equality)
    return articles.filter(a => a.isFeatured === true).slice(0, 10);
  }, [articles]);

  const latestArticles = useMemo(() => {
    return articles.slice(0, 10);
  }, [articles]);

  // --- LOADING/REDIRECT SCREEN ---
  if (loading || isAdmin) {
    // Show a full-screen loader while checking auth state or if admin is about to redirect
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-gray-700 text-lg">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          Checking credentials...
        </div>
      </div>
    );
  }

  // --- STANDARD USER UI ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto py-8">

        {/* --------------------- 1. CHATBOT SECTION --------------------- */}
        <ChatbotSection />

        {/* --------------------- 2. ARTICLE AND CATEGORY SECTIONS --------------------- */}
        <main className="w-full max-w-7xl mx-auto pt-8">
          {isArticlesLoading ? (
            <div className="text-center text-gray-500 text-lg p-20">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading articles...
            </div>
          ) : (
            <>
              {latestArticles.length > 0 ? (
                <>
                  {/* LATEST ARTICLES CAROUSEL */}
                  <ArticleCarousel
                    title="Latest Articles"
                    articles={latestArticles}
                    variant="gradient-carousel"
                    className="mb-12"
                  />

                  {/* FEATURED ARTICLES CAROUSEL */}
                  {featuredArticles.length > 0 && (
                    <ArticleCarousel
                      title="Featured Reads"
                      articles={featuredArticles}
                      variant="carousel"
                      className="mb-16"
                    />
                  )}
                </>
              ) : (
                <div className="text-center text-gray-600 text-xl p-20 border border-dashed rounded-lg bg-white shadow-sm">
                  No articles found. Check your database connection and data.
                </div>
              )}

              {/* CATEGORIES GRID SECTION */}
              <section className="mt-16">
                <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-red-600 pl-3 mb-8">
                  Explore Categories
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                  {CATEGORIES_DATA.map((category) => (
                    <div
                      key={category.slug}
                      onClick={() => console.log(`Navigating to /category/${category.slug}`)}
                      className={`p-4 md:p-6 bg-white rounded-lg shadow-lg border-t-4 text-center hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col justify-center transform hover:scale-[1.02] active:scale-[0.98] border-${category.color.split('-')[1]}-500`}
                      title={category.name}
                    >
                      <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                      <p className="text-xs text-gray-600 mt-1 hidden md:block">{category.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

Home.displayName = 'Home';