// src/components/AuthProvider.js
"use client";

import React from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Re-export the hook and provider so existing imports keep working:
// import { useAuth } from '../components/AuthProvider'
// import { AuthProvider } from '../components/AuthProvider'

export { useAuth };
export function AuthProviderWrapper({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}

// Also export default AuthProviderWrapper to support default-style imports if any exist
export default AuthProviderWrapper;
