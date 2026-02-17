"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ChatbotSection from "@/components/ChatbotSection";
// import ArticleCarousel from "@/components/ArticleCarousel";
// import { CATEGORIES_DATA } from "@/components/ArticleComponents";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const { user, isAdmin, loading } = useAuth();

  const searchParams = useSearchParams();

  const lang =
    searchParams.get("lang") === "en" ? "en" : "kn";


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
            {lang === "en" ? "Al Ansar Weekly" : "ಅಲ್ ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆ"}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
            {lang === "en"
              ? "Your trusted source for Islamic knowledge, insights, and contemporary analysis"
              : "ಇಸ್ಲಾಮಿಕ್ ಜ್ಞಾನ, ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸಮಕಾಲೀನ ಅಧ್ಯಯನಗಳ ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲ"
            }
          </p>

        </section>



        <div className="bg-white rounded-xl shadow-md p-6 md:p-10">
          <ChatbotSection />
        </div>


      </div>
    </div>
  );
}

Home.displayName = "Home";
