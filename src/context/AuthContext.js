"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Firebase client SDK imports
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

// Firebase app (client)
import { app } from "@/lib/firebaseClient";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const auth = getAuth(app);
const db = getFirestore(app);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // -----------------------
    //  Check Admin Role
    // -----------------------
    const checkAdminRole = async (uid) => {
        try {
            const ref = doc(db, "admins", uid);
            const snap = await getDoc(ref);
            return snap.exists();
        } catch (err) {
            console.error("Admin check error:", err);
            return false;
        }
    };

    // -----------------------
    //  Login Function
    // -----------------------
    const signIn = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    // -----------------------
    //  Logout
    // -----------------------
    const logout = () => {
        return signOut(auth);
    };

    // -----------------------
    //  Auth Listener
    // -----------------------
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const admin = await checkAdminRole(currentUser.uid);
                setIsAdmin(admin);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const value = {
        user,
        isAdmin,
        loading,
        signIn,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
