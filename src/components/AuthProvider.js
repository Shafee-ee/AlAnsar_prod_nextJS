// src/components/AuthProvider.js
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    getIdTokenResult,
} from "firebase/auth";
import firebaseClientApp from "@/lib/firebaseClient"; // default import from src/lib/firebaseClient

const AuthContext = createContext();

function AuthProviderWrapper({ children }) {
    const auth = getAuth(firebaseClientApp);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // firebase auth state being read
    const [authReady, setAuthReady] = useState(false); // becomes true after admin check completes
    const [isAdmin, setIsAdmin] = useState(false);

    const checkAdmin = useCallback(async (currentUser) => {
        if (!currentUser) {
            setIsAdmin(false);
            return false;
        }

        try {
            // Preferred: read custom claims from token
            const tokenResult = await getIdTokenResult(currentUser, /* forceRefresh */ false);
            const claims = tokenResult?.claims || {};
            if (claims.admin === true || claims.isAdmin === true) {
                console.debug("[AuthProvider] admin from custom claims");
                setIsAdmin(true);
                return true;
            }

            // Fallback: call API (optional) - adapt /api/is-admin to your backend
            const idToken = await currentUser.getIdToken();
            const res = await fetch("/api/is-admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ uid: currentUser.uid }),
            });

            if (!res.ok) {
                console.debug("[AuthProvider] /api/is-admin returned", res.status);
                setIsAdmin(false);
                return false;
            }

            const data = await res.json();
            const adminFlag = !!(data && data.isAdmin);
            setIsAdmin(adminFlag);
            console.debug("[AuthProvider] admin from API:", adminFlag);
            return adminFlag;
        } catch (err) {
            console.error("[AuthProvider] admin check error:", err);
            setIsAdmin(false);
            return false;
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            console.debug("[AuthProvider] onAuthStateChanged:", !!currentUser);
            setUser(currentUser || null);


            // reset admin state while checking
            setAuthReady(false);
            setIsAdmin(false);

            if (currentUser) {
                await checkAdmin(currentUser);
            } else {
                setIsAdmin(false);
            }

            setAuthReady(true);
            setLoading(false);
        });

        return () => unsub();
    }, [auth, checkAdmin]);

    const login = useCallback(
        async (email, password) => {
            setLoading(true);
            try {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                return cred;
            } finally {
                setLoading(false);
            }
        },
        [auth]
    );

    const logout = useCallback(
        async () => {
            setLoading(true);
            try {
                await signOut(auth);
                setUser(null);
                setIsAdmin(false);
                setAuthReady(true);
            } finally {
                setLoading(false);
            }
        },
        [auth]
    );

    const value = {
        user,
        loading,
        authReady,
        isAdmin,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// default export expected by ClientAppWrapper
export default AuthProviderWrapper;

// named hook
export const useAuth = () => useContext(AuthContext);
