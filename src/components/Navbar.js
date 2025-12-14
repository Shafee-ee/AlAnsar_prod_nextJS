'use client';
import React from 'react';
import Link from 'next/link';
import {
    Menu,
    X,
    ChevronDown,
    Search,
    LogIn,
    User,
    LogOut,
    LayoutDashboard
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../components/AuthProvider';

const primaryBlue = 'bg-[#0B4C8C]';

const mainNavItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
];

const categories = [
    { name: 'Smaniyaru', href: '/categories/smaniyaru' },
    { name: 'Islamic History', href: '/categories/islamic-history' },
    { name: 'Hadees', href: '/categories/hadees' },
    { name: 'Fiqh', href: '/categories/fiqh' },
    { name: 'Vismaya Jagattu', href: '/categories/vismaya-jagattu' },
    { name: 'Vishleshanegalu', href: '/categories/vishleshanegalu' },
];

const headings = {
    en: {
        title: "Ask & See Bot",
        subtitle: "Ask your Islamic questions here",
    },
    kn: {
        title: "ಕೇಳಿ ನೋಡಿ ಬಾಟ್",
        subtitle: "ನಿಮ್ಮ ಇಸ್ಲಾಮಿಕ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಇಲ್ಲಿ ಕೇಳಿ",
    },
};

const Navbar = () => {
    const { user, loading, logout } = useAuth();
    const isAuthenticated = !!user;
    const handleLogout = logout;

    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

    const userDisplay = user?.email || user?.uid || 'Admin';

    // Prevent double menus at same time
    React.useEffect(() => {
        if (isMenuOpen) setIsUserMenuOpen(false);
    }, [isMenuOpen]);

    React.useEffect(() => {
        if (isUserMenuOpen) setIsMenuOpen(false);
    }, [isUserMenuOpen]);

    if (loading) {
        return (
            <nav className={`sticky top-0 z-50 ${primaryBlue} shadow`}>
                <div className="h-16 flex items-center justify-center text-white">
                    Loading...
                </div>
            </nav>
        );
    }

    return (
        <nav className={`sticky top-0 z-50 ${primaryBlue} shadow`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
                            <img
                                src="/logo.png"
                                alt="ALANSARWEEKLY Logo"
                                className="h-16 w-auto block"
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">

                        {mainNavItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-700/40 rounded-md transition"
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* FIXED CATEGORY DROPDOWN */}
                        {/* Categories Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsCategoryOpen(true)}
                            onMouseLeave={() => setIsCategoryOpen(false)}
                        >
                            <button
                                type="button"
                                className="flex items-center px-3 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-700/40 rounded-md transition"
                            >
                                Categories
                                <ChevronDown className="w-4 h-4 ml-1" />
                            </button>

                            {/* FIXED: dropdown touches the button */}
                            {isCategoryOpen && (
                                <div className="absolute left-0 top-full w-56 bg-white rounded-xl shadow-lg py-2 z-20">

                                    {categories.map((cat, index) => (
                                        <div key={cat.name}>
                                            <Link
                                                href={cat.href}
                                                className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-200 transition rounded-sm"
                                            >
                                                {cat.name}
                                            </Link>

                                            {index !== categories.length - 1 && (
                                                <div className="border-b border-gray-200 mx-2"></div>
                                            )}
                                        </div>
                                    ))}

                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-3 md:space-x-4">

                        {/* Desktop Search */}
                        <div className="hidden lg:block relative text-gray-300">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="py-1.5 pl-10 pr-4 text-sm rounded-full bg-blue-900/70 border border-blue-700 text-white placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 w-48 transition"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200" />
                        </div>

                        {/* Login / User */}
                        {isAuthenticated ? (
                            <div className="relative z-30">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-white bg-cyan-600 hover:bg-cyan-700 px-3 py-2 rounded-full transition text-sm font-semibold"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden sm:inline truncate max-w-[100px]">
                                        {userDisplay}
                                    </span>
                                    <ChevronDown
                                        className={`w-4 h-4 transition ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">

                                        <Link href="/admin">
                                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer">
                                                <LayoutDashboard className="w-4 h-4 mr-3" />
                                                Dashboard
                                            </div>
                                        </Link>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 border-t mt-1"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login">
                                <button className="flex items-center text-white bg-cyan-600 hover:bg-cyan-700 p-2 rounded-full">
                                    <LogIn className="w-5 h-5 md:mr-1" />
                                    <span className="hidden md:inline text-sm font-semibold">
                                        Login
                                    </span>
                                </button>
                            </Link>
                        )}

                        {/* Burger Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700/50"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="md:hidden px-3 pt-3 pb-4 space-y-3 bg-[#0A3C75] shadow-lg">

                    {/* Search Bar */}
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            className="w-full py-2 pl-10 pr-4 rounded-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none shadow"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>

                    {/* Top level nav */}
                    {mainNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Categories Label */}
                    <p className="block px-3 mt-2 text-sm font-bold text-blue-100">
                        Categories

                    </p>


                    {/* Category list */}
                    <div className="pl-4 space-y-1">
                        {categories.map((cat, index) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className="block px-4 py-2.5 text-sm text-white hover:bg-blue-700/60 transition"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
