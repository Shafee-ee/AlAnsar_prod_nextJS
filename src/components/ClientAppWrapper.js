// src/components/ClientAppWrapper.js
"use client";

import React from "react";
import AuthProviderWrapper, { useAuth } from "./AuthProvider";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * ClientAppWrapper is a small client component that:
 * - Provides AuthProvider (client)
 * - Renders Navbar, children, Footer
 *
 * Use this inside your server layout so metadata stays server-side.
 */
export default function ClientAppWrapper({ children }) {
    return (
        <AuthProviderWrapper>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
            </div>
        </AuthProviderWrapper>
    );
}
