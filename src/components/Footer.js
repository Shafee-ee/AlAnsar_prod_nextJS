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
        <footer className="bg-[#0B4C8C] text-white mt-auto pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-5">

                {/* Top Section */}
                <div className="grid md:grid-cols-3 gap-10 border-b border-blue-700 pb-10">

                    {/* Column 1 — Organization */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4">AL ANSAR WEEKLY</h3>
                        <p className="text-blue-200 text-sm leading-relaxed">
                            Hassan Enclave Building<br />
                            Kuthar Padav, Kuthar<br />
                            Mangalore – 575017
                        </p>

                        <div className="mt-4 text-sm text-blue-200">
                            WhatsApp: 733 857 8560
                        </div>

                        <div className="mt-2 text-sm">
                            <a
                                href="mailto:alansarmoilanji@gmail.com"
                                className="text-cyan-300 hover:underline"
                            >
                                alansarmoilanji@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Column 2 — Contact Categories */}
                    <div>
                        <h4 className="text-lg font-semibold text-cyan-300 mb-4">
                            Contact Information
                        </h4>

                        <div className="space-y-4 text-sm text-blue-200">

                            <div>
                                <p className="font-medium text-white">
                                    Ask Questions (WhatsApp Only)
                                </p>
                                <p>733 857 8560</p>
                            </div>

                            <div>
                                <p className="font-medium text-white">
                                    Subscriptions
                                </p>
                                <p>948 207 5704</p>
                            </div>

                            <div>
                                <p className="font-medium text-white">
                                    Submit Articles (Kannada & English)
                                </p>
                                <p>733 857 8560</p>
                            </div>

                            <div>
                                <p className="font-medium text-white">
                                    Services for the Needy
                                </p>
                                <p>733 857 8560</p>
                            </div>

                        </div>
                    </div>

                    {/* Column 3 — Donate */}
                    <div>


                        <div className="flex flex-col items-center">

                            <h4 className="text-lg font-semibold text-cyan-300 mb-4">
                                Support Us
                            </h4>

                            <p className="text-sm text-blue-200 mb-4">
                                Scan or tap to donate.
                            </p>

                            <div className="bg-white rounded-xl inline-block p-2">
                                <img
                                    src="/donate-qr.png"
                                    alt="Donate QR"
                                    className="w-40 h-40 object-contain"
                                />
                            </div>

                            <a
                                href="upi://pay?pa=7338578560@okbizaxis&pn=AL%20ANSAR%20KANNADA%20WEEKLY&cu=INR"
                                className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                            >
                                Tap to Pay via UPI
                            </a>

                        </div>

                    </div>

                </div>

                {/* Bottom */}
                <div className="pt-6 text-center text-sm text-blue-300">
                    © {new Date().getFullYear()} Al Ansar Weekly. All rights reserved.
                </div>

            </div>
        </footer>

    );
};

export default Footer;