"use client";
import { useState, useEffect } from "react";
import { MessageCircleQuestion, MoonStar } from "lucide-react";
import { IconBubble } from "@/components/IconBubble";

export default function HomeCarousel({ lang }) {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setTotal(data.total))
      .catch(() => setTotal(0));
  }, []);

  return (
    <section
      className="relative w-full px-6 
        min-h-[360px] sm:min-h-[420px] 
        flex items-center justify-center
        bg-[#f8fafc] overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/bg-mosque.gif"
          alt="background"
          className="absolute bottom-0 w-full object-cover opacity-90 "
        />
      </div>

      <div className="relative z-20 max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900">
          {lang === "en" ? "Al Ansar Weekly" : "ಅಲ್ ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆ"}
        </h1>
        <div className="flex items-center justify-center gap-4 my-4">
          <div className="h-[2px] w-16 bg-blue-500 rounded-full"></div>
          <MoonStar className="text-blue-500 w-8 h-8" />
          <div className="h-[2px] w-16 bg-blue-500 rounded-full"></div>
        </div>{" "}
        <p className="text-base sm:text-lg text-gray-900 ">
          {lang === "en"
            ? "Preserving Authentic Islamic Scholarship Since 1991"
            : "1991ರಿಂದ ಪ್ರಾಮಾಣಿಕ ಇಸ್ಲಾಮಿಕ್ ಪಂಡಿತೀಯ ಪರಂಪರೆಯನ್ನು ಸಂರಕ್ಷಿಸುತ್ತಿದೆ"}
        </p>
        <div className="pt-6 ">
          <div className="bg-white/10 backdrop-blur rounded-2xl shadow-md px-8 py-6 flex items-center justify-center gap-4 mx-auto w-fit">
            {/* Icon */}
            <IconBubble variant="soft">
              <MessageCircleQuestion className="w-7 h-7 text-blue-600" />
            </IconBubble>

            {/* Text */}
            <div className="text-left">
              {total !== null ? (
                <p className="text-3xl sm:text-4xl font-semibold text-gray-900">
                  {total}+
                </p>
              ) : (
                <div className="h-[36px] sm:h-[40px] w-[100px] flex items-center justify-center  gap-3">
                  <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}

              <p className="text-sm text-gray-600">
                {lang === "en" ? "Questions Answered" : "ಉತ್ತರಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
