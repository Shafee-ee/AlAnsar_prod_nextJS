"use client";
import { useState, useEffect } from "react";
import { MessageCircleQuestion } from "lucide-react";
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
        <div className="w-16 h-[2px] bg-blue-500 mx-auto rounded-full"></div>
        <p className="text-base sm:text-lg text-gray-900 ">
          {lang === "en"
            ? "Preserving Authentic Islamic Scholarship Since 1991"
            : "1991ರಿಂದ ಪ್ರಾಮಾಣಿಕ ಇಸ್ಲಾಮಿಕ್ ಪಂಡಿತೀಯ ಪರಂಪರೆಯನ್ನು ಸಂರಕ್ಷಿಸುತ್ತಿದೆ"}
        </p>
        <div className="pt-6 ">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md px-8 py-6 flex items-center justify-center gap-4 mx-auto w-fit">
            {/* Icon */}
            <IconBubble variant="soft">
              <MessageCircleQuestion className="w-7 h-7 text-blue-600" />
            </IconBubble>

            {/* Text */}
            <div className="text-left">
              <p className="text-3xl sm:text-4xl font-semibold text-gray-900">
                {total !== null ? `${total}+` : "..."}
              </p>
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
