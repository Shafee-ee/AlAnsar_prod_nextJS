"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTransition } from "react";

const primaryBlue = "bg-[#0B4C8C]";

function LanguageSwitcher({ highlight }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang: currentLang } = useLanguage();

  const [localLang, setLocalLang] = React.useState(currentLang);

  React.useEffect(() => {
    setLocalLang(currentLang);
  }, [currentLang]);

  const [isPending, startTransition] = useTransition();

  const handleLangChange = (lang) => {
    if (lang === currentLang) return;

    setLocalLang(lang); // 🔥 THIS is the key line

    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", lang);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center bg-white/10 rounded-full p-[2px] scale-90 md:scale-100">
      <button
        onClick={() => handleLangChange("en")}
        className={`px-2 py-0.5 text-[11px] md:text-xs rounded-full transition ${
          localLang === "en" ? "bg-white text-[#0B4C8C]" : "text-white"
        } ${isPending ? "opacity-70" : ""}`}
      >
        EN
        {highlight && localLang === "en" && <span className="lang-underline" />}
      </button>

      <button
        onClick={() => handleLangChange("kn")}
        className={`px-2 py-0.5 text-[11px] md:text-xs rounded-full transition ${
          localLang === "kn" ? "bg-white text-[#0B4C8C]" : "text-white"
        } ${isPending ? "opacity-70" : ""}`}
      >
        KN
        {highlight && localLang === "kn" && <span className="lang-underline" />}
      </button>
    </div>
  );
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(true);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHighlight(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 ${primaryBlue} border-b border-white/10`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="ALANSARWEEKLY Logo"
              className="h-9 md:h-11 w-auto"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-white/80 hover:text-white text-sm font-medium transition"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-white/80 hover:text-white text-sm font-medium transition"
            >
              Pioneers
            </Link>
            <Link
              href="/digipaper"
              className="text-white/80 hover:text-white text-sm font-medium transition"
            >
              Digital paper
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Suspense fallback={null}>
              <LanguageSwitcher highlight={highlight} />
            </Suspense>

            {/* Mobile Burger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4 bg-[#0B4C8C] space-y-4">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="block text-white text-base font-medium hover:bg-white/10 rounded px-3 py-2"
          >
            Home
          </Link>

          <Link
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="block text-white text-base font-medium hover:bg-white/10 rounded px-3 py-2"
          >
            Pioneers
          </Link>
          <Link
            href="/digipaper"
            onClick={() => setIsMenuOpen(false)}
            className="block text-white text-base font-medium hover:bg-white/10 rounded px-3 py-2"
          >
            Digital Paper
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
