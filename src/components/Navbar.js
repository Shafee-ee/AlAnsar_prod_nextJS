'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, X } from 'lucide-react';

const primaryBlue = 'bg-[#0B4C8C]';

const Navbar = () => {
    const { lang, setLang } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                            className="text-blue-100 hover:text-white text-sm font-medium transition"
                        >
                            Home
                        </Link>

                        <Link
                            href="/about"
                            className="text-blue-100 hover:text-white text-sm font-medium transition"
                        >
                            About
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-3">

                        {/* Language Pill */}
                        <div className="flex items-center bg-white/20 rounded-full p-1 scale-90 md:scale-100">
                            <button
                                onClick={() => setLang('en')}
                                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full transition ${lang === 'en'
                                    ? 'bg-white text-[#0B4C8C]'
                                    : 'text-white'
                                    }`}
                            >
                                EN
                            </button>

                            <button
                                onClick={() => setLang('kn')}
                                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full transition ${lang === 'kn'
                                    ? 'bg-white text-[#0B4C8C]'
                                    : 'text-white'
                                    }`}
                            >
                                KN
                            </button>
                        </div>

                        {/* Burger */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700/50 md:hidden"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
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
                        About
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
