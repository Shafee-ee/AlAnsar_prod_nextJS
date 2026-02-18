// src/components/ClientAppWrapper.js
"use client";

import React, { Suspense } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthProviderWrapper from "./AuthProvider";
import Navbar from "./Navbar";
import Footer from "./Footer";


export default function ClientAppWrapper({ children }) {
    return (
        <Suspense fallback={null}>
            <LanguageProvider>
                <AuthProviderWrapper>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">{children}</main>
                        <Footer />
                    </div>
                </AuthProviderWrapper>
            </LanguageProvider>
        </Suspense>


    );
}
