// src/components/Footer.js

'use client';

import React, { useState } from 'react'; // <-- Import useState
import { Facebook, Twitter, Instagram, Mail, ChevronRight, Upload } from 'lucide-react';
// Note: We added 'Upload' icon

const Footer = () => {
    // --- State for Upload Status ---
    const [uploadStatus, setUploadStatus] = useState(null); // null, 'loading', 'success', 'error'
    const [uploadMessage, setUploadMessage] = useState('');

    // ALANSAR Branding Colors
    const primaryBlue = 'bg-[#0B4C8C]'; // Deep Blue
    const accentCyan = 'text-cyan-300';
    const linkHover = 'hover:text-cyan-300';

    // --- BULK UPLOAD HANDLER FUNCTION ---
    const handleBulkUpload = async () => {
        setUploadStatus('loading');
        setUploadMessage('Initiating bulk upload of Q&A data...');

        // NOTE: We are using a relative path to the new API route
        try {
            const response = await fetch('/api/bulk-upload-qa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send an empty array or a simple flag; the API will contain the actual data payload for testing.
                // In a production scenario, you would upload a file or paste text here.
                body: JSON.stringify({ action: 'load_initial_data' }),
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('success');
                setUploadMessage(`✅ Success! Uploaded ${data.count} records. Reload page to test search.`);
            } else {
                setUploadStatus('error');
                setUploadMessage(`❌ Error: ${data.message || data.error || 'Failed to upload data.'}`);
                console.error('Bulk Upload Failed:', data);
            }
        } catch (error) {
            setUploadStatus('error');
            setUploadMessage(`❌ Network Error: Could not reach the server.`);
            console.error('Network error during bulk upload:', error);
        } finally {
            setTimeout(() => setUploadStatus(null), 8000); // Clear message after 8 seconds
        }
    };
    // ------------------------------------

    // ... (rest of the link data)

    const categoryLinks = [
        { name: 'Smaniyaru', href: '/smaniyaru' },
        { name: 'Islamic History', href: '/islamic-history' },
        { name: 'Hadees', href: '/hadees' },
        { name: 'Fiqh', href: '/fiqh' },
        { name: 'Vismaya Jagattu', href: '/vismaya-jagattu' },
        { name: 'Vishleshanegalu', href: '/vishleshanegalu' },
    ];


    return (
        <footer className={`${primaryBlue} text-white mt-auto pt-10 pb-6 shadow-2xl`}>
            <div className="max-w-7xl mx-auto px-5">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 border-b border-blue-700 pb-8">

                    {/* Column 1: Logo and Contact */}
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        {/* ... (Existing Logo and Contact) ... */}
                        <h3 className="text-3xl font-extrabold tracking-wider font-serif mb-4">
                            ALANSAR
                        </h3>
                        <p className="text-sm text-blue-200 mb-4 max-w-sm">
                            Hassan Enclave Building
                            Kuthar Padav, Kuthar
                            Mangalore – 575017 </p>

                        <div className="flex items-center space-x-2 text-sm text-blue-200">
                            <Mail className="w-4 h-4" />
                            <a href="mailto:alansarmoilanji@gmail.com" className={linkHover}>alansarmoilanji@gmail.com</a>
                        </div>

                        {/* --- NEW: Upload Status Message --- */}
                        {uploadStatus && (
                            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${uploadStatus === 'error' ? 'bg-red-500' : uploadStatus === 'success' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                                {uploadStatus === 'loading' && '⏳'} {uploadMessage}
                            </div>
                        )}
                        {/* ---------------------------------- */}
                    </div>

                    {/* Column 2: Quick Links (Modified to include the button) */}
                    <div className="col-span-1">
                        <h4 className={`text-lg font-semibold mb-4 ${accentCyan}`}>Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            {/* NEW: Upload Button/Link */}
                            <li>
                                <button
                                    onClick={handleBulkUpload}
                                    disabled={uploadStatus === 'loading'}
                                    className={`flex items-center text-red-400 ${linkHover} transition duration-150 font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Upload className="w-4 h-4 mr-1" />
                                    {uploadStatus === 'loading' ? 'Uploading...' : 'Bulk Upload Data'}
                                </button>
                            </li>
                            {/* Existing Links */}
                            {[
                                { name: 'Home (Q&A Assistant)', href: '/' },
                                { name: 'About Us', href: '/about' },
                                { name: 'Privacy Policy', href: '/privacy' },
                                { name: 'Terms of Service', href: '/terms' },
                            ].map((link) => ( // Removed 'Admin Upload' from the list as the button handles it
                                <li key={link.name}>
                                    <a href={link.href} className={`flex items-center text-blue-200 ${linkHover} transition duration-150`}>
                                        <ChevronRight className="w-3 h-3 mr-1" />
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* ... (Rest of Footer Columns 3 & 4) ... */}
                    <div className="col-span-1">
                        <h4 className={`text-lg font-semibold mb-4 ${accentCyan}`}>Categories</h4>
                        <ul className="space-y-2 text-sm">
                            {categoryLinks.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className={`flex items-center text-blue-200 ${linkHover} transition duration-150`}>
                                        <ChevronRight className="w-3 h-3 mr-1" />
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Socials */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-6">
                    <p className="text-sm text-blue-300 order-2 md:order-1 mt-4 md:mt-0">
                        &copy; {new Date().getFullYear()} ALANSAR. All rights reserved.
                    </p>
                    <div className="flex space-x-6 order-1 md:order-2">
                        <a href="#" aria-label="Facebook" className={`text-blue-300 ${linkHover} transition duration-150`}>
                            <Facebook className="w-6 h-6" />
                        </a>
                        <a href="#" aria-label="Twitter" className={`text-blue-300 ${linkHover} transition duration-150`}>
                            <Twitter className="w-6 h-6" />
                        </a>
                        <a href="#" aria-label="Instagram" className={`text-blue-300 ${linkHover} transition duration-150`}>
                            <Instagram className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;