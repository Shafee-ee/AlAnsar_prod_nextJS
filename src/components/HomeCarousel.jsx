"use client";
import { useState, useEffect } from "react";

export default function HomeCarousel({ lang }) {
    const [index, setIndex] = useState(0);
    const [total, setTotal] = useState(null);

    useEffect(() => {
        fetch("/api/stats")
            .then(res => res.json())
            .then(data => setTotal(data.total))
            .catch(() => setTotal(0));
    }, []);

    const next = () => {
        setIndex(prev => (prev + 1) % 3);
    };

    return (
        <section
            onClick={next}
            className="w-full relative text-center px-6 
min-h-[380px] sm:min-h-[420px] 
flex items-center justify-center
bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 
rounded-sm shadow-lg overflow-hidden cursor-pointer transition-all duration-300">
            <div className="absolute inset-0 bg-black/10"></div>

            <div className="relative z-10 max-w-4xl mx-auto">

                {/* SLIDE 1 */}
                {index === 0 && (
                    <>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-wide drop-shadow-lg mb-4">
                            {lang === "en" ? "Al Ansar Weekly" : "ಅಲ್ ಅನ್ಸಾರ್ ವಾರಪತ್ರಿಕೆ"}
                        </h1>

                        <div className="w-24 h-[2px] bg-white/60 mx-auto mb-6"></div>

                        <p className="text-lg sm:text-xl text-blue-100 font-medium">
                            {lang === "en"
                                ? "Preserving Authentic Islamic Scholarship Since 1991"
                                : "1991ರಿಂದ ಪ್ರಾಮಾಣಿಕ ಇಸ್ಲಾಮಿಕ್ ಪಂಡಿತೀಯ ಪರಂಪರೆಯನ್ನು ಸಂರಕ್ಷಿಸುತ್ತಿದೆ"}
                        </p>
                    </>
                )}

                {/* SLIDE 2 */}
                {/* SLIDE 2 */}
                {index === 1 && (
                    <div className="relative flex flex-col items-center text-center">

                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white  z-10">
                            Digital Paper
                        </h1>

                        <div className="relative -mt-16 sm:-mt-20">
                            <img
                                src="/car-image.png"
                                alt="DigiPaper Preview"
                                className="max-h-[240px] sm:max-h-[270px] md:max-h-[300px] 
                           object-contain drop-shadow-2xl"
                            />
                        </div>

                    </div>
                )}

                {/* SLIDE 3 */}
                {index === 2 && (
                    <>
                        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-3">
                            {total !== null ? `${total}+` : "..."}
                        </h1>
                        <p className="text-lg text-blue-100">
                            {lang === "en"
                                ? "Questions Answered"
                                : "ಉತ್ತರಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು"}
                        </p>
                    </>
                )}

                {/* Indicator dots */}
                <div className="mt-8 flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${index === i ? "bg-white" : "bg-white/40"
                                }`}
                        />
                    ))}
                </div>

            </div>
        </section>
    );
}