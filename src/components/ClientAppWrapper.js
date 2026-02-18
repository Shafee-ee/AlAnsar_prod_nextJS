// src/components/ClientAppWrapper.js
"use client";

import { usePathname } from "next/navigation";
import React, { Suspense } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthProviderWrapper from "./AuthProvider";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientAppWrapper({ children }) {
    const pathname = usePathname();
    const isReaderPage = /^\/digipaper\/[^/]+$/.test(pathname);

    return (
        <Suspense fallback={null}>
            <LanguageProvider>
                <AuthProviderWrapper>
                    <div className="flex flex-col min-h-screen">
                        {!isReaderPage && <Navbar />}
                        <main className="flex-grow">{children}</main>
                        {!isReaderPage && <Footer />}
                    </div>
                </AuthProviderWrapper>
            </LanguageProvider>
        </Suspense>
    );
}
