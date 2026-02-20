// src/components/Footer.js

'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

const Footer = () => {


    return (
        <footer className="bg-[#0B4C8C] text-white mt-auto pt-12 pb-8">
            <div className="max-w-6xl mx-auto px-5">

                {/* Top Section */}
                <div className="grid md:grid-cols-3 gap-12 border-b border-blue-700 pb-10 text-center md:text-left">

                    {/* Column 1 — Organization */}
                    <div className="md:mx-auto md:max-w-xs">
                        <h3 className="text-2xl font-bold mb-4">
                            AL ANSAR WEEKLY
                        </h3>

                        <p className="text-blue-200 text-sm leading-relaxed">
                            Hassan Enclave Building<br />
                            Kuthar Padav, Kuthar<br />
                            Mangalore – 575017
                        </p>

                        <div className="mt-4 text-sm text-blue-200">
                            WhatsApp: 733 857 8560
                        </div>

                        <div className="mt-2 text-sm flex items-center justify-center md:justify-start gap-2">
                            <Mail className="w-4 h-4" />
                            <a
                                href="mailto:alansarmoilanji@gmail.com"
                                className="text-cyan-300 hover:underline"
                            >
                                alansarmoilanji@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Column 2 — Contact Categories */}
                    <div className="md:mx-auto md:max-w-xs">
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
                                    Fund the cause
                                </p>
                                <p>733 857 8560</p>
                            </div>

                        </div>
                    </div>

                    {/* Column 3 — Donate */}
                    <div className="md:mx-auto md:max-w-xs flex flex-col items-center">
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

                {/* Bottom */}
                <div className="pt-6 text-center text-sm text-blue-300">
                    © {new Date().getFullYear()} Al Ansar Weekly. All rights reserved.
                </div>

            </div>
        </footer>
    );
};

export default Footer;
