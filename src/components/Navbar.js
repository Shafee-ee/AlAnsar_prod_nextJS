'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from "next/navigation";


const primaryBlue = 'bg-[#0B4C8C]';

function LanguageSwitcher({ highlight }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentLang = React.useMemo(() => {
        if (!searchParams) return "kn";
        const lang = searchParams.get("lang");
        return lang === "en" ? "en" : "kn";
    }, [searchParams]);

    return (
        <div className="flex items-center bg-white/20 rounded-full p-1 scale-90 md:scale-100">
            <button
                onClick={() => router.push(`${pathname}?lang=en`)}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full transition ${currentLang === 'en'
                    ? 'bg-white text-[#0B4C8C]'
                    : 'text-white'
                    }`}
            >
                EN
                {highlight && currentLang === 'en' && (
                    <span className="lang-underline" />
                )}
            </button>

            <button
                onClick={() => router.push(`${pathname}?lang=kn`)}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full transition ${currentLang === 'kn'
                    ? 'bg-white text-[#0B4C8C]'
                    : 'text-white'
                    }`}
            >
                KN
                {highlight && currentLang === 'kn' && (
                    <span className="lang-underline" />
                )}
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

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);


    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setHighlight(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 ${primaryBlue} shadow`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="ALANSARWEEKLY Logo"
                            className="h-14 md:h-16 w-auto"
                        />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-blue-100 hover:text-white text-lg font-large transition"
                        >
                            Home
                        </Link>

                        <Link
                            href="/about"
                            className="text-blue-100 hover:text-white text-lg font-medium transition"
                        >
                            Pioneers
                        </Link>

                        <Link
                            href="/about"
                            className="text-blue-100 hover:text-white text-lg font-medium transition"
                        >
                            Digital paper
                        </Link>
                    </div>

                    {/* Right Side */}
                    <Suspense fallback={null}>
                        <LanguageSwitcher highlight={highlight} />
                    </Suspense>

                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden px-4 pb-4 bg-[#0A3C75] space-y-4">
                    <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-white text-base font-medium hover:bg-blue-700 rounded px-3 py-2"
                    >
                        Home
                    </Link>

                    <Link
                        href="/about"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-white text-base font-medium hover:bg-blue-700 rounded px-3 py-2"
                    >
                        Pioneers
                    </Link>
                    <Link
                        href="/about"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-white text-base font-medium hover:bg-blue-700 rounded px-3 py-2"
                    >
                        Digital Paper
                    </Link>
                </div>
            )}


        </nav>
    );
};

export default Navbar;
