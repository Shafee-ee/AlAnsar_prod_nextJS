"use client";
import { useEffect, useState, useRef } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
export default function HomeQuickAccess() {
  const [total, setTotal] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth >= 1024) return;

    const container = scrollRef.current;
    if (!container) return;

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % 3;

      const cardWidth = container.children[0].offsetWidth + 16; // 16 = gap-4

      container.scrollTo({
        left: currentIndex * cardWidth,
        behavior: "smooth",
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setTotal(data.total))
      .catch(() => setTotal(1366));
  }, []);
  return (
    <section className="px-6 -mt-8 relative z-30 max-w-7xl mx-auto">
      <div
        ref={scrollRef}
        className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-4 snap-x snap-mandatory"
      >
        <div
          onClick={() => {
            document.getElementById("chatbot-section")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });

            setTimeout(() => {
              window.dispatchEvent(new Event("expand-chatbot"));
            }, 200);
          }}
          className="snap-center lg:min-w-0   min-w-[85%] h-[220px] rounded-[28px] overflow-hidden relative shadow-xl cursor-pointer"
        >
          {" "}
          {/* Background image */}
          <img
            src="/qna-card.png"
            alt="Questions and Answers"
            className="
      absolute
      -right-18
      bottom-0
      h-[240px]
      w-auto
      object-contain
      pointer-events-none
    "
          />
          {/* Blue tint overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5b82c7]/80 via-[#3d68b8]/80 to-[#284f9e]/95" />
          {/* Top gloss */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent" />
          {/* Bottom depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div>
              <div className="text-5xl font-bold">{total || "1366"}+</div>

              <div className="text-lg font-medium mt-1">Questions Answered</div>

              <p className="mt-1 mb-4 max-w-[180px] text-white/80">
                Search 35 years of Islamic scholarship.
              </p>
            </div>

            <button className="w-fit px-5 py-2 bg-white text-[#1d3f9a] rounded-full font-medium">
              Ask & Discover →
            </button>
          </div>
        </div>
        {/* DigiPaper */}
        <Link
          href="/digipaper"
          className="snap-center lg:min-w-0 min-w-[85%] h-[220px] rounded-[28px] overflow-hidden relative shadow-xl cursor-pointer block"
        >
          <img
            src="/digipaper-main.png"
            alt="Latest DigiPaper"
            className="absolute inset-12 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f4c97]/90 to-[#1d3f9a]/85" />
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />
          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs">
                Latest Edition
              </span>

              <h2 className="mt-4 text-3xl font-bold leading-tight">
                Latest DigiPaper
              </h2>

              <p className="mt-2 text-white/80">Weekly Islamic Publication</p>
            </div>

            <button className="w-fit px-5 py-2 bg-white text-[#1d3f9a] rounded-full font-medium">
              Read Now →
            </button>
          </div>
        </Link>
        {/* Articles */}
        <div
          onClick={() =>
            document.getElementById("articles-section")?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
          className="snap-center  lg:min-w-0 min-w-[85%] h-[220px] rounded-[28px] overflow-hidden relative shadow-xl cursor-pointer"
        >
          {/* Background image */}
          <img
            src="/articles-image.png"
            alt="Featured articles"
            className="absolute -right-6 -bottom-6 h-[280px] w-auto object-contain pointer-events-none"
          />
          {/* Blue tint overlay - this is what makes it behave like DigiPaper */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5b82c7]/70 via-[#3d68b8]/70 to-[#284f9e]/95" />
          {/* Top gloss */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />
          {/* Bottom depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
          {/* Content */}
          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs">
                Featured Content
              </span>

              <h2 className="mt-4 text-3xl font-bold leading-tight">
                Articles
              </h2>

              <p className=" text-white/80 max-w-[180px]">
                Guidance, reflections and contemporary Islamic topics.
              </p>
            </div>

            <button className="w-fit px-5 py-2 bg-white text-[#1d3f9a] rounded-full font-medium">
              Explore →
            </button>
          </div>
        </div>
        {/* Keli Nodi */}
      </div>
    </section>
  );
}
