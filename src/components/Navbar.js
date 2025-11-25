'use client';
import React from 'react';
import Link from 'next/link'; // Use Link for navigation
import { Menu, X, ChevronDown, Search, LogIn } from 'lucide-react';
import Image from 'next/image';

// ALANSAR Branding Colors (for easy adjustments)
const primaryBlue = 'bg-[#0B4C8C]'; // Deep Blue

// Static data structure for navigation (No translation hook needed yet)
const mainNavItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
];

const categories = [
    { name: 'Smaniyaru', href: '/categories/smaniyaru' },
    { name: 'Islamic History', href: '/categories/islamic-history' },
    { name: 'Hadees', href: '/categories/hadees' },
    { name: 'Fiqh', href: '/categories/fiqh' },
    { name: 'Vismaya Jagattu', href: '/categories/fiqh' },
    { name: 'Vishleshanegalu', href: '/categories/fiqh' },
];


const Navbar = () => {
    // State to handle mobile menu visibility only
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);

    return (
        // Desktop Navbar (fixed to top for better UX)
        <nav className={`sticky top-0 z-50 ${primaryBlue} shadow-lg`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 1. Logo/Branding Area */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
                            {/* Image component for the logo.png in the public folder */}
                            <Image
                                src="/logo.png"
                                alt="ALANSARWEEKLY Logo"
                                width={40}
                                height={40}
                                className="h-12 w-auto hover:rounded-sm border hover:border-white"
                            />
                            {/* Text branding (Kept for large screens) */}

                        </Link>
                    </div>

                    {/* 2. Desktop Navigation & Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Main Links */}
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="px-3 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-blue-700/50 rounded-lg transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* Categories Dropdown (No functionality, just static structure) */}
                        <div className="relative" onMouseLeave={() => setIsCategoryOpen(false)}>
                            <button
                                type="button"
                                className="flex items-center px-3 py-2 text-sm font-medium text-blue-200 hover:text-white hover:bg-blue-700/50 rounded-lg transition-colors duration-200"
                                onMouseEnter={() => setIsCategoryOpen(true)}
                            >
                                Categories
                                <ChevronDown className="w-4 h-4 ml-1" />
                            </button>
                            {isCategoryOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.name}
                                            href={cat.href}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsCategoryOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Search and Auth Area */}
                    <div className="flex items-center space-x-3">
                        {/* Search Input (Hidden on mobile for space) */}
                        <div className="hidden lg:block relative text-gray-400 focus-within:text-gray-600">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="py-1.5 pl-10 pr-4 text-sm rounded-full bg-blue-900 border border-blue-600 text-white placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 w-48 transition-all duration-200"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                        </div>

                        {/* Login Button (Static placeholder) */}
                        <button
                            className="flex items-center space-x-2 text-white bg-cyan-600 hover:bg-cyan-700 p-2 rounded-full transition-colors duration-200 text-sm font-semibold"
                            // Placeholder onClick, no Clerk functionality yet
                            onClick={() => console.log('Login clicked')}
                        >
                            <LogIn className="w-5 h-5" />
                            <span>Login</span>
                        </button>
                    </div>

                    {/* 4. Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <X className="block w-6 h-6" /> : <Menu className="block w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. Mobile Menu Panel */}
            {isMenuOpen && (
                <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800">
                    {/* Main Links */}
                    {mainNavItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}

                    {/* Categories (Mobile View - simple list) */}
                    <p className="block px-3 py-2 text-sm font-semibold text-blue-200">Categories:</p>
                    <div className='pl-4'>
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className="block px-3 py-1 ml-4 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700/70"
                                onClick={() => setIsMenuOpen(false)}
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