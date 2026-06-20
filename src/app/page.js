"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { Loader } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ChatbotSection from "@/components/ChatbotSection";
// import ArticleCarousel from "@/components/ArticleCarousel";
// import { CATEGORIES_DATA } from "@/components/ArticleComponents";
import { useLanguage } from "@/context/LanguageContext";
import AskQuestionBox from "@/components/AskQuestionBox";
import HomeQuickAccess from "@/components/HomeQuickAccess";
import FeaturedArticles from "@/components/FeaturedArticles";

//banner QnA count
export default function Home() {
  const { user, isAdmin, loading } = useAuth();
  const [showAskBox, setShowAskBox] = useState(false);
  const [prefillQuestion, setPrefillQuestion] = useState("");

  const askRef = useRef(null);
  const { lang } = useLanguage();

  useEffect(() => {
    function handler(e) {
      setPrefillQuestion(e.detail.question);
      setShowAskBox(true);

      requestAnimationFrame(() => {
        askRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }

    window.addEventListener("trigger-ask-question", handler);
    return () => window.removeEventListener("trigger-ask-question", handler);
  }, []);

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
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
      <div className="w-full max-w-6xl mx-auto py-10 space-y-4">
        <section className="relative w-full h-[220px] md:h-[320px] mb-10 overflow-hidden">
          <img
            src="/BannerBG.png"
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* dark overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* logo text overlay later */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <img
              src={
                lang === "en"
                  ? "/Logo-Alansar-eng.gif"
                  : "/alansar-logo-text.gif"
              }
              alt="Al Ansar"
              className="max-h-[140px] md:max-h-[200px] object-contain"
            />
          </div>
        </section>

        <HomeQuickAccess />

        <Suspense fallback={null}>
          <ChatbotSection />
        </Suspense>

        <FeaturedArticles />
        <div ref={askRef} className="ask-wrapper">
          {showAskBox && (
            <AskQuestionBox
              initialQuestion={prefillQuestion}
              forceOpen={true}
              onClose={() => setShowAskBox(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

Home.displayName = "Home";
