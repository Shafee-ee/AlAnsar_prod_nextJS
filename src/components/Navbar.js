'use client';
import React from 'react';
import Link from 'next/link'; // Use Link for navigation
import { Menu, X, ChevronDown, Search, LogIn, User, LogOut, LayoutDashboard } from 'lucide-react'; // Added User, LogOut, LayoutDashboard icons
import Image from 'next/image';
import { useAuth } from '../components/AuthProvider'; // <-- IMPORTED: Hook to check auth status

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
    { name: 'Vismaya Jagattu', href: '/categories/vismaya-jagattu' },
    { name: 'Vishleshanegalu', href: '/categories/vishleshanegalu' },
];


const Navbar = () => {
    const { isAuthenticated, user, handleLogout } = useAuth(); // <-- USED: Get auth state and logout function
    // State to handle mobile menu visibility
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    // State to handle desktop category dropdown visibility
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
    // <-- NEW STATE: State to handle user profile dropdown visibility
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

    // Determine the display name for the logged-in user
    const userDisplay = user?.email || user?.uid || 'Admin';

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

                        {/* Login Button / User Dropdown (DYNAMIC AREA) */}
                        {isAuthenticated ? (
                            <div className="relative z-30"> {/* Added z-index to ensure dropdown is above content */}
                                {/* Profile Button */}
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-white bg-cyan-600 hover:bg-cyan-700 p-2 rounded-full transition-colors duration-200 text-sm font-semibold ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0B4C8C] focus:outline-none"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden sm:inline truncate max-w-[100px]">{userDisplay}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-2xl py-1 z-50 border border-gray-100">

                                        {/* Dashboard Link (Admin) */}
                                        <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0B4C8C] transition duration-150">
                                                <LayoutDashboard className="w-4 h-4 mr-3" />
                                                Go to Dashboard
                                            </div>
                                        </Link>

                                        {/* Logout Button */}
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition duration-150 border-t mt-1"
                                        >
                                            <LogOut className="w-4 h-4 mr-3" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Existing Login Button (When not authenticated)
                            <Link href="/login">
                                <button
                                    className="flex items-center space-x-2 text-white bg-cyan-600 hover:bg-cyan-700 p-2 rounded-full transition-colors duration-200 text-sm font-semibold"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span>Login</span>
                                </button>
                            </Link>
                        )}
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
                    {/* DYNAMIC: Mobile Login/Logout/Profile Link */}
                    {isAuthenticated ? (
                        <div className="p-2 border-b border-blue-700 mb-2">
                            <p className="text-white font-semibold mb-1">Welcome, {userDisplay}</p>
                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                <div className="flex items-center text-blue-200 hover:text-white hover:bg-blue-700 py-2 px-3 rounded-md">
                                    <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                                </div>
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                className="w-full flex items-center text-left text-red-300 hover:text-white hover:bg-blue-700 py-2 px-3 rounded-md mt-1"
                            >
                                <LogOut className="w-5 h-5 mr-3" /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                            <div className="flex items-center text-white hover:bg-blue-700 py-2 px-3 rounded-md mb-2 border-b border-blue-700">
                                <LogIn className="w-5 h-5 mr-3" /> Login
                            </div>
                        </Link>
                    )}

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

