// src/components/Footer.js

"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import QRModal from "./QRModal";

const Footer = () => {
  const [showQR, setShowQR] = useState(false);
  return (
    <footer className="bg-[#0B4C8C] text-white mt-auto py-8">
      <div className="max-w-6xl mx-auto px-5">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-white/10 pb-4 text-left">
          {/* Column 1 — Organization */}
          <div>
            <h3 className="text-base font-semibold text-white/90 tracking-wide mb-4">
              AL ANSAR WEEKLY
            </h3>

            <p className="text-white/70 text-sm leading-relaxed">
              Hassan Enclave Building
              <br />
              Kuthar Padav, Kuthar
              <br />
              Mangalore – 575017
            </p>

            <div className="mt-4 text-sm text-blue-200">
              WhatsApp: 733 857 8560
            </div>

            <div className="mt-2 text-sm flex justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" />
              <a
                href="mailto:alansarmoilanji@gmail.com"
                className="text-white/80 hover:text-white hover:underline"
              >
                alansarmoilanji@gmail.com
              </a>
            </div>
          </div>

          <div className="block md:hidden border-t border-white/10 my-4"></div>

          {/* Column 2 — Contact Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 tracking-wide uppercase mb-4">
              Contact Information
            </h4>

            <div className="space-y-3 text-sm text-blue-200">
              <div>
                <p className="font-medium text-white">
                  Ask Questions (WhatsApp Only)
                </p>
                <p>733 857 8560</p>
              </div>

              <div>
                <p className="font-medium text-white">Subscriptions</p>
                <p>948 207 5704</p>
              </div>

              <div>
                <p className="font-medium text-white">
                  Submit Articles (Kannada & English)
                </p>
                <p>733 857 8560</p>
              </div>

              <div>
                <p className="font-medium text-white">Fund the cause</p>
                <p>733 857 8560</p>
              </div>
            </div>
          </div>

          <div className="block md:hidden border-t border-white/10 my-4"></div>

          {/* Column 3 — Donate */}
          <div className=" flex flex-col items-center text-xs tracking-wider text-white/70">
            <h4 className="text-sm font-semibold text-white/90 tracking-wide uppercase mb-4">
              Support Us
            </h4>

            <p className="text-sm text-white/70 mb-2">Scan to donate.</p>

            <div className="bg-white rounded-xl inline-block p-2">
              <img
                src="/donate-qr.png"
                alt="Donate QR"
                className="w-28 h-28 object-contain"
              />
            </div>

            <button
              onClick={() => setShowQR(true)}
              className="mt-3 px-4 py-1.5 border border-white/30 text-white/80 hover:text-white rounded-md text-sm"
            >
              scan to Pay
            </button>

            <QRModal isOpen={showQR} onClose={() => setShowQR(false)} />
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 text-center text-sm text-white/50 text-xs  border-white/10 pt-4 mt-6">
          © {new Date().getFullYear()} Al Ansar Weekly. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
